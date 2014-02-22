
//  
//  WebCC
//  Made by 1lann and GravityScore
//  



var fsAPI = {};
var filer = null;


onFSError = function(err) {
	console.log(err);
}


setupFSAPI = function() {
	filer = new Filer();
	filer.init({"persistent": true, "size": 4 * 1024 * 1024}, function(fs) {
		console.log(fs);
	}, onFSError);
}


resolve = function(path) {
	if (path.substring(0, 1) != "/") {
		path = "/" + path;
	}
	path = "/" + computer.id + path;
	return path;
}


exists = function(path, callback) {
	filer.open(path, function(file) {
		callback(true);
	}, function(err) {
		if (err.message.indexOf("does not exist")) {
			callback(false);
		} else {
			onFSError(err);
		}
	});
}


fsAPI.list = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	filer.ls(path, function(items) {
		computer.eventStack.push(["fs_list", items]);
		resumeThread();
	}, onFSError);
}


fsAPI.getSize = function(L) {
	C.lua_pushnumber(L, config.maxStorageSize);
	return 1;
}


fsAPI.exists = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	exists(path, function(exists) {
		computer.eventStack.push(["fs_exists", exists]);
		resumeThread();
	});
}


fsAPI.isDir = function(L) {

}


fsAPI.isReadOnly = function(L) {

}


fsAPI.makeDir = function(L) {

}


fsAPI.move = function(L) {

}


fsAPI.copy = function(L) {

}


fsAPI.delete = function(L) {

}


fsAPI.open = function(L) {

}


fsAPI.getDrive = function(L) {

}


fsAPI.getFreeSpace = function(L) {

}
