
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var httpAPI = {};


httpAPI.request = function(L) {
	var url = C.luaL_checkstring(L, 1);

	if (!navigator.onLine) {
		setTimeout(function() {
			computer.eventStack.push(["http_failure", url]);
			resumeThread();
		},10);
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
		reqeust.setURL(url).post(
			function(response) {
				// Replace the contents of id_of_element_in_page
				if (response.status == "200") {
					computer.eventStack.push(["http_success", url, response.html]);
					resumeThread();
				} else {
					computer.eventStack.push(["http_failure", url]);
					resumeThread();
				}
			}
		);
	 } else {
		request.setURL(url).get(
			function(response) {
				// Replace the contents of id_of_element_in_page
				if (response.status == "200") {
					computer.eventStack.push(["http_success", url, response.html]);
					resumeThread();
				} else {
					computer.eventStack.push(["http_failure", url]);
					resumeThread();
				}
			}
		);
	}

	return 0;
}
