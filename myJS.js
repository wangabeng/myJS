//获取属性值函数
//说明 1 不可以获取复合样式的值。例如不要获取background的值 每个浏览器都不同 有兼容性问题。可以获取backgroundColor的值；2 获取的值不可以拿来做判断；3 获取的宽或高均不包含边框和padding 只是width or height的值；4 属性值书写的时候不要有空格;5 不要获取未设置后的样式（不兼容）
function getStyle(obj,attr){
	return obj.currentStyle?obj.currentStyle[attr]:getComputedStyle(obj,"FOR FF4.0")[attr];
}

//运动函数封装 leo domove
function doMove ( obj, attr, dir, target, endFn ) {
	dir = parseInt(getStyle( obj, attr )) < target ? dir : -dir;
	clearInterval( obj.timer );
	obj.timer = setInterval(function () {
		var speed = parseInt(getStyle( obj, attr )) + dir;			// 步长
		
		if ( speed > target && dir > 0 ||  speed < target && dir < 0  ) {//刚刚跑过目标点 就马上拉回来
			//这样判断实际上是每次可能超过目标点后再拉回来 。用绝对值方法会好一些。比如步长是3 当从90-93 -96-99走到99的时候 仍然继续 但是此时步长变为目标点100到99差的绝对值 这样就不存在偏离目标点再退回的情况（也许会是bug）
			speed = target;
		}
		
		obj.style[attr] = speed + 'px';
		
		if ( speed == target ) {
			clearInterval( obj.timer );
			endFn && endFn();
		}
		
	}, 30);
}
//运动函数封装 leo domove 结束

//更加科学的运动函数 设置好运动时间
function doMoveV2(obj,attr,target,duration,callback){
	var b = parseFloat(getComputedStyle(obj)[attr]);
	var c = target - b;
	var d = duration;
	var now = new Date().getTime();
	obj[attr] = setInterval(function(){
		var t = new Date().getTime() - now;
		var value = b + c / d * t;
		obj.style[attr] = value+"px";
		if(t >= d){
			clearInterval(obj[attr]);
			obj.style[attr] = target+"px";
			callback&&callback();//当到达目标值的时候执行回调函数
		}
	},30);
}

//兼顾透明度的运动函数V3.0 链式运动 有回调函数  不可以同时多值运动
function doMoveV3(obj,attr,iTarget,fnEnd){
	clearInterval(obj.timer);
	obj.timer=setInterval(function(){
		var iCur = parseFloat(getStyle(obj, attr));
		if (attr == "opacity"){
			iCur = parseInt(parseFloat(getStyle(obj,attr))*100)
		}else{
			iCur = parseInt(getStyle(obj, attr));	
		}
		var iSpeed = (iTarget - iCur) / 8;
		iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
		if (iTarget == iCur){
			clearInterval(obj.timer);
			fnEnd && fnEnd();	
		}else{
			if (attr == "opacity"){
				obj.style.filter = "alpha(opacity = " + (iCur + iSpeed) + ")";
				obj.style.opacity = (iCur + iSpeed)	/ 100;
			}else{
				obj.style[attr] = iCur + iSpeed + "px";	
			}
		}

	},30);
}

//完美运动框架 可以多个值同时运动 多个物体同时运动 有链式运动（回调函数）
function doMoveV4(obj,json,fnEnd){
	clearInterval(obj.timer);
	obj.timer=setInterval(function(){
		var bStop=true;

		for (var attr in json){
			//1 取当前值
			var iCur = parseFloat(getStyle(obj, attr));
			if (attr == "opacity"){
				iCur = parseInt(parseFloat(getStyle(obj,attr))*100)
			}else{
				iCur = parseInt(getStyle(obj, attr));	
			}

			//2 算速度
			var iSpeed = (json[attr] - iCur) / 8;
			iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);

			//3 停止检测
			if (iCur!=json[attr]){
				bStop=false;
			}

			if (attr == "opacity"){
				obj.style.filter = "alpha(opacity = " + (iCur + iSpeed) + ")";
				obj.style.opacity = (iCur + iSpeed)	/ 100;
			}else{
				obj.style[attr] = iCur + iSpeed + "px";	
			}
		}

		if (bStop)
		{
			clearInterval(obj.timer);
			fnEnd && fnEnd();	
		}

	},30);
}

//抖动函数封装
function shake ( obj, attr, endFn ) {
	var pos = parseInt( getStyle(obj, attr) );//有bug 每次重开定时器回不到原点 解决办法：
	//在函数体外把原始的attr值储存起来 每次点击 都把原始值付给该对象。比如是left 
	//和top方向抖动 首先把初始的left和top值储存起来 然后每次点击事件发生 都把原始的
	//left和top值付给被点击对象
	var arr = [];			// 20, -20, 18, -18 ..... 0
	var num = 0;
	var timer = null;
		
	for ( var i=20; i>0; i-=2 ) {
		arr.push( i, -i );
	}
	arr.push(0);
		
	clearInterval( obj.shake );
	obj.shake = setInterval(function (){
		obj.style[attr] = pos + arr[num] + 'px';
		num++;
		if ( num === arr.length ) {
			clearInterval( obj.shake );
			endFn && endFn();
		}
	}, 50);
}
//抖动函数封装结束

//透明度函数
function changeOpacity(obj,target){ 
	var opa; 
	var speed; 
	if(obj.currentStyle){ 
		  //判断浏览器类型，此类型为IE浏览器，即使IE不支持opacity属性，但是仍然可以获取值 
		 opa = obj.currentStyle['opacity']*100; 
	} 
	else{//其他浏览器 
		opa = getComputedStyle(obj,false)['opacity']*100; 
	} 
	//透明度每次变化的值（步长），根据目标值和当前值的差来决定步长的正负 
	target-opa>=0?speed=1:speed=-1; 
	clearInterval(obj.timer); 
	obj.timer = setInterval(function (){ 
	//目标值和当前值差值的绝对值大于等于步长的绝对值，设置透明度为当前值加步长 
	if(Math.abs(target-opa)>=Math.abs(speed)){ 
		obj.style.opacity=(opa+speed)/100; 
		obj.style.filter='alpha(opacity:'+(opa+speed)+')'; 
	} 
	//目标值和当前值差值的绝对值小于步长的绝对值，剩余的距离一步到位， 
	//设置透明度直接为目标值，同时清除定时器 
	else{ 
	   obj.style.opacity=target/100; 
	   obj.style.filter='alpha(opacity:'+target+')'; 
	   clearInterval(obj.timer); 
	} 
	//直接对透明度参数进行加步长的运算，避免每次都要获取当前透明度 
	opa=opa+speed; 
	},30); 
} 

//数组去重
function delRepeat(arr){
	for (var i=0;i<arr.length ;i++ )
	{
		for (var j=i+1;j<arr.length;j++  )
		{
			if (arr[i]==arr[j])
			{
				arr.splice(j,1);
				j--;
			}
		}
	}
	return arr;
}

//获取一个元素的绝对位置值 需要清除padding margin值 body.offsetTop为0 
function getPos(obj) {
	
	var pos = {left:0, top:0};
	
	while (obj) {
		pos.left += obj.offsetLeft;
		pos.top += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return pos;
}

//根据className获取元素、
function getByClass(oParent, sClass){
	var aEle=oParent.getElementsByTagName('*');
	var aResult=[];
	var re=new RegExp('\\b'+sClass+'\\b', 'i');//\b 匹配单词的开始或结束 
	var i=0;

	for(i=0;i<aEle.length;i++)
	{
		//if(aEle[i].className==sClass)
		//if(aEle[i].className.search(sClass)!=-1)
		if(re.test(aEle[i].className))
		{
		aResult.push(aEle[i]);
		}
	}
	return aResult;
}

//第二种事件绑定函数的封装
function bind(obj, evname, fn) {
	if (obj.addEventListener) {
		obj.addEventListener(evname, fn, false);
	} else {
		obj.attachEvent('on' + evname, function() {
			fn.call(obj);
		});
	}
}//用法举例：bind(document, 'click', fn1);bind(document, 'click', fn2);

//拖拽函数封装
function drag(obj) {
		obj.onmousedown = function(ev) {
		var ev = ev || event;
		
		var disX = ev.clientX - this.offsetLeft;
		var disY = ev.clientY - this.offsetTop;
		
		if ( obj.setCapture ) {
			obj.setCapture();
		}
		
		document.onmousemove = function(ev) {
			var ev = ev || event;
			
			obj.style.left = ev.clientX - disX + 'px';
			obj.style.top = ev.clientY - disY + 'px';
		}
		
		document.onmouseup = function() {
			document.onmousemove = document.onmouseup = null;
			//释放全局捕获 releaseCapture();
			if ( obj.releaseCapture ) {
				obj.releaseCapture();
			}
		}
		return false;//阻止标准浏览器默认行为
	}
}//使用示例 drag(oDiv);

//限制范围的拖拽
function dragInArea(obj) {
	
	obj.onmousedown = function(ev) {
		var ev = ev || event;
		var disX = ev.clientX - this.offsetLeft;
		var disY = ev.clientY - this.offsetTop;
		if ( obj.setCapture ) {
			obj.setCapture();
		}
		document.onmousemove = function(ev) {
			var ev = ev || event;
			
			var L = ev.clientX - disX;
			var T = ev.clientY - disY;
			
			if ( L < 0 ) {//磁性吸附 可以把判断条件改为L <100
				L = 0;
			} else if ( L > document.documentElement.clientWidth - obj.offsetWidth ) {
				L = document.documentElement.clientWidth - obj.offsetWidth;
			}
			
			if ( T < 0 ) {//磁性吸附 可以把判断条件改为T < 100
				T = 0;
			} else if ( T > document.documentElement.clientHeight - obj.offsetHeight ) {
				T = document.documentElement.clientHeight - obj.offsetHeight;
			}
			obj.style.left = L + 'px';
			obj.style.top = T + 'px';
		}
		
		document.onmouseup = function() {
			document.onmousemove = document.onmouseup = null;
			if ( obj.releaseCapture ) {
				obj.releaseCapture();
			}
		}
		return false;
	}
}

//鼠标滚动函数封装//fnUp fnDown分别为鼠标向上和向下滚动的回调函数
function mouseWheel(obj,fnUp,fnDown){	
	obj.onmousewheel = fn;
	
	if (obj.addEventListener) {
		obj.addEventListener('DOMMouseScroll', fn, false);
	}

	function fn(ev) {
		var ev = ev || event;
		var b = true;
		
		if (ev.wheelDelta) {
			b = ev.wheelDelta > 0 ? true : false;
		} else {
			b = ev.detail < 0 ? true : false;
		}

		if ( b ) {
			fnUp&&fnUp();
		} else {
			fnDown&&fnDown();
		}
		if (ev.preventDefault) {
			ev.preventDefault();
		}
		return false;
	}
}/*使用示例 mouseWheel(oDiv,endUp,endDown);或mouseWheel(oDiv,function(){},function(){});*/

//ajax封装
function ajax(method, url, data, success) {//get or post, 请求地址，data如果没有数据 就是""
	var xhr = null;
	try {
		xhr = new XMLHttpRequest();
	} catch (e) {
		xhr = new ActiveXObject('Microsoft.XMLHTTP');
	}
	
	if (method == 'get' && data) {
		//url += '?' + data;
		url += '?' + data+"&_t="+new Date().getTime();//加入时间戳
	}
	
	xhr.open(method,url,true);
	if (method == 'get') {
		xhr.send();
	} else {
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		xhr.send(data);
	}
	
	//当状态值发生改变的时候触发
	xhr.onreadystatechange = function() {
		
		if ( xhr.readyState == 4 ) {
			if ( xhr.status == 200 ) {
				success && success(xhr.responseText);//处理数据
			} else {
				alert('出错了,Err：' + xhr.status);//可以重新定义
			}
		}
		
	}
}

//对象拷贝
function extending(obj1,obj2){
	for (var attr in obj2) {
		obj1[attr]=obj2[attr];
	}
}

//绑定自定义事件或系统自带事件
function bindEvent(obj,events,fn){
	obj.listeners=obj.listeners||{};
	obj.listeners[events]=obj.listeners[events]||[];

	obj.listeners[events].push(fn);

	//绑定常规事件
	if (!!obj.nodeType) {
		obj.addEventListener?obj.addEventListener(events,fn,false):obj.attachEvent('on'+events,fn);
	}

}
//自动触发以上封装的事件 主要在自定义事件时会主动触发 而系统自带事件在系统事件时候会自动触发 而不需要手工触发了
function fireEvent(obj,events){
	if (obj.listeners&&obj.listeners[events]) {
		for (var i = 0; i < obj.listeners[events].length; i++) {
			obj.listeners[events][i]();
		}		
	}
}

// url地址的查询字符串转成对象存放在数组中
// 例如 'http://xinwen.eastday.com/a/171230070500839.html?qid=news.baidu.com&a=abeng&d=#ddddq' 转成
// [ { qid: 'news.baidu.com' }, { a: 'abeng' }, { d: undefined } ]
function urlToObj (url) {
  // 以问号开始但是不包含问号的问号后的位置 
  // var reg = /\?.*(?=#)/;
  // 获取问号到井号之间的字符
  // var result = str.match(reg)[0].slice(1);
  var reg = /\?.*#/;
  var matchResult = url.match(reg)[0];
  // 去掉头尾 问号和井号
  matchResult = matchResult.substring(1, matchResult.length - 1);
  // 分割&符号
  matchResult = matchResult.split('&'); // [ 'qid=news.baidu.com', 'a=abeng' ]
  // 遍历数组值 把值转成对象
  var result = [];
  for (var i=0; i < matchResult.length; i++) {
    var arr = matchResult[i].split('=');
    var obj = {};
    obj[arr[0]] = arr[1] === ''? undefined: arr[1];
    result.push(obj);
  }
  return result;
}

// 原生绑定事件 解绑事件兼容写法 handler为绑定的执行函数
function addHandler (element,type,handler) {
    if (element.addEventListener) {
        element.addEventListener(type, handler, false);
    }else if (element.attachEvent){
        element.attachEvent('on' + type, handler);
    }else{
        element['on' + type] = handler;
    }
}
// 原生解绑事件 解绑事件兼容写法 handler为绑定的执行函数
function removeHandler (element,type,handler) {
    if(element.removeEventListener){
        element.removeEventListener(type,handler,false);
    }else if(element.detachEvent){
        element.detachEvent('on' + type,handler);
    }else{
        element['on' + type] = null;
    }
}

// 根据手机客户端浏览器跳转不同的页面
function locationDiffUrl () {
    var browser = {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {//移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }
    if (!browser.versions.mobile && !browser.versions.ios && !browser.versions.android) {
        window.location.href = "pchome.html";
    } else {
        window.location.href = "mbhome.html";
    }
}

// 获取元素滚动条的位置 （可用于下拉刷新）
function getScrollTop() { 
var scrollTop = 0; 
if (document.documentElement && document.documentElement.scrollTop) { 
    scrollTop = document.documentElement.scrollTop; 
} else if (document.body) { 
    scrollTop = document.body.scrollTop; 
} 
return scrollTop; 
}

// 获取当前可视范围的高度 （可用于下拉刷新）
function getClientHeight() { 
    var clientHeight = 0; 
    if (document.body.clientHeight && document.documentElement.clientHeight) { 
	clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight); 
    } 
    else { 
	clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight); 
    } 
    return clientHeight; 
}

// 获取文档完整的高度 （可用于下拉刷新）
function getScrollHeight() { 
	return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight); 
}

// 复制dom文档 dom为需要复制的节点元素
function copyDom (dom) {
	var range = document.createRange();
	range.selectNode(dom);

	var selection = window.getSelection();
	if(selection.rangeCount > 0) selection.removeAllRanges();
	selection.addRange(range);
	document.execCommand('copy');
	// alert("复制成功！" + dom.innerHTML);
	});
};
