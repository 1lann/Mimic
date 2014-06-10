/*

CapsLock.js

An object allowing the status of the caps lock key to be determined

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/

var CapsLock=(function(){
var _1=false;
var _2=[];
var _3=/Mac/.test(navigator.platform);
function _4(){
return _1;
};
function _5(_6){
_2.push(_6);
};
function _7(e){
if(!e){
e=window.event;
}
var _8=_1;
var _9=(e.charCode?e.charCode:e.keyCode);
if(_9>=97&&_9<=122){
_1=e.shiftKey;
}else{
if(_9>=65&&_9<=90&&!(e.shiftKey&&_3)){
_1=!e.shiftKey;
}
}
if(_1!=_8){
for(var _a=0;_a<_2.length;_a++){
_2[_a](_1);
}
}
};
if(window.addEventListener){
window.addEventListener("keypress",_7,false);
}else{
document.documentElement.attachEvent("onkeypress",_7);
}
return {isOn:_4,addListener:_5};
})();
