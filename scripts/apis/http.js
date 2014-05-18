
//
//  http.js
//  GravityScore and 1lann
//



var httpAPI = {};


httpAPI.request = function(L) {
	var computer = core.getActiveComputer();
	var url = C.luaL_checkstring(L, 1);

	if (!navigator.onLine) {
		setTimeout(function() {
			console.log("Not online!")
			computer.eventStack.push(["http_failure", url]);
			computer.resume();
		}, 10);

		return 0;
	}

	var postData;

	var shouldUsePost = false;
	if (C.lua_type(L, 2) != -1 && C.lua_type(L, 2) != C.LUA_TNIL) {
		postData = C.luaL_checkstring(L, 2);
		shouldUsePost = true;
	}

	onHttpCompletion = function(response) {
		if (response.status == "200") {
			computer.eventStack.push(["http_bios_wrapper_success", url, response.html]);
			computer.resume();
		} else {
			console.log("HTTP Failure: ",response)
			computer.eventStack.push(["http_failure", url]);
			computer.resume();
		}
	}

	var request = new xdRequest();
	if (shouldUsePost) {
		request.post_body = postData;
		request.setURL(url).post(onHttpCompletion);
	 } else {
		request.setURL(url).get(onHttpCompletion);
	}

	return 0;
}
