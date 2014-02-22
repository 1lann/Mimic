
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
	filer.init({"persistent": true, "size": 8 * 1024 * 1024}, function(fs) {
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

}


fsAPI.list = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));

}


fsAPI.getSize = function(L) {

}


fsAPI.exists = function(L) {

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
