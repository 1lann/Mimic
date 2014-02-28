
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var fsAPI = {};
var filer = null;

var filesystem = {};
var callID = 0;

var readOnly = [
	"/*/rom",
];


triggerGUIUpdate = function() {
	
}



//  ----------------  Filesystem API  ----------------  //


filesystem.setup = function(callback) {

}


filesystem.serializeTable = function(arr) {
	var construct = "{";
	for (var index in arr) {
		var name = arr[index].replace("\"", "\\\"");
		var correctIndex = parseInt(index) + 1;
		construct = construct + "[" + correctIndex.toString() + "]=\"" + name + "\",";
	}
	construct = construct + "}";

	return construct;
}


filesystem.resolve = function(path) {
	path = filesystem.sanitise(path);

	// Replace simple resolutions
	path = path.replace(/(\/(\.\/)+)|(\/\.$)/g, "/").replace(/\/{2,}/g, "/");

	// Replace ../
	var leadingParents = path.substring(1).match(/^(\.\.\/)+/) || '';
	if (leadingParents) {
		leadingParents = leadingParents[0];
	}

	while (true) {
		var parent = path.indexOf("/..");
		if (parent == -1) {
			break;
		} else if (parent == 0) {
			path = path.substring(3);
			continue;
		}

		var pos = path.substring(0, parent).lastIndexOf("/");
		if (pos == -1) {
			pos = parent;
		}
		path = path.substring(0, pos) + path.substring(parent + 3);
	}

	path = leadingParents + path.substring(1);
	return filesystem.sanitise("/" + computer.id + "/" + path);
}


filesystem.sanitise = function(path) {
	path = path.replace("\\", "/");
	if (path.substring(0, 1) != "/") {
		path = "/" + path;
	}

	if (path.substring(path.length - 1) == "/") {
		path = path.substring(0, path.length - 1);
	}

	if (path.length == 0) {
		path = "/";
	}

	return path;
}


filesystem.isReadOnly = function(path) {
	path = filesystem.sanitise(path).substring(1);
	var parts = path.split("/");
	
	for (var i in readOnly) {
		var readOnlyPath = filesystem.sanitise(readOnly[i]).substring(1).split("/");
		if (parts.length >= readOnlyPath.length) {
			var isReadOnly = true;
			for (var ii in readOnlyPath) {
				if (readOnlyPath[ii] == "*") {
					continue;
				}

				if (readOnlyPath[ii] != parts[ii]) {
					isReadOnly = false;
					break;
				}
			}

			if (isReadOnly) {
				return true;
			}
		}
	}

	return false;
}


filesystem.list = function(path, callback) {
	
}


filesystem.allFiles = function(path, callback) {
	
}


filesystem.move = function(from, to, callback) {
	
}


filesystem.copy = function(from, to, callback) {
	
}


filesystem.delete = function(path, callback) {
	
}


filesystem.read = function(path, callback) {
	
}


filesystem.write = function(path, contents, append, callback) {
	
}


filesystem.makeDir = function(path, callback) {
	
}



//  ----------------  Lua Wrappers  ----------------  //


fsAPI.list = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));

	return 1;
}


fsAPI.getSize = function(L) {
	C.lua_pushnumber(L, config.maxStorageSize);
	return 1;
}


fsAPI.exists = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));

	return 1;
}


fsAPI.isDir = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));

	return 1;
}


fsAPI.isReadOnly = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var isReadOnly = filesystem.isReadOnly(path);
	C.lua_pushnumber(L, isReadOnly ? 1 : 0);
	return 1;
}


fsAPI.makeDir = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	return 1;
}


fsAPI.move = function(L) {
	var from = filesystem.resolve(C.luaL_checkstring(L, 1));
	var to = filesystem.resolve(C.luaL_checkstring(L, 2));
	return 1;
}


fsAPI.copy = function(L) {
	var from = filesystem.resolve(C.luaL_checkstring(L, 1));
	var to = filesystem.resolve(C.luaL_checkstring(L, 2));
	return 1;
}


fsAPI.delete = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	return 1;
}


fsAPI.write = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);
	return 1;
}


fsAPI.append = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);
	return 1;
}


fsAPI.read = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	
	return 1;
}


fsAPI.getDrive = function(L) {
	return 0;
}


fsAPI.getFreeSpace = function(L) {
	return 0;
}
