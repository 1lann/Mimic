
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var httpAPI = {};


httpAPI.request = function(L) {
	var url = C.luaL_checkstring(L, 1);
	var postData;

	// var shouldUsePost = false;
	// if (C.lua_type(L, 2) != -1 || C.lua_type(L, 2) != C.LUA_TNIL) {
	// 	postData = C.luaL_checkstring(L, 2);
	// 	shouldUsePost = true;
	// }

	// var request = new XMLHttpRequest();
	// if (shouldUsePost) {
	// 	request.open("POST", url, true);
	// } else {
	// 	request.open("GET", url, true);
	// }

	// request.onload = function(evt) {
	// 	computer.eventStack.push(["http_success", url, request.responseText]);
	// 	resumeThread();
	// }

	// request.onerror = function(err) {
	// 	computer.eventStack.push(["http_failure", url]);
	// 	resumeThread();
	// }

	// if (shouldUsePost) {
	// 	request.send(postData);
	// } else {
	// 	request.send(null);
	// }

	return 0;
}
