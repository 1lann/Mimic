
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var httpAPI = {};

httpAPI.request = function(L) {
	var computer = core.getActiveComputer();
	var url = C.luaL_checkstring(L, 1);

	if (!navigator.onLine) {
		setTimeout(function() {
			computer.eventStack.push(["http_failure", url]);
			resumeThread();
		}, 10);
		
		return 0;
	}

	var postData;

	var shouldUsePost = false;
	if (C.lua_type(L, 2) != -1 && C.lua_type(L, 2) != C.LUA_TNIL) {
		postData = C.luaL_checkstring(L, 2);
		shouldUsePost = true;
	}

	var request = new xdRequest;
	if (shouldUsePost) {
		request.post_body = postData;
		reqeust.setURL(url).post(function(response) {
			if (response.status == "200") {
				computer.eventStack.push(["http_bios_wrapper_success", url, response.html]);
				computer.resume();
			} else {
				computer.eventStack.push(["http_failure", url]);
				computer.resume();
			}
		});
	 } else {
		request.setURL(url).get(function(response) {
			if (response.status == "200") {
				computer.eventStack.push(["http_success", url, response.html]);
				computer.resume();
			} else {
				computer.eventStack.push(["http_failure", url]);
				computer.resume();
			}
		});
	}

	return 0;
}
