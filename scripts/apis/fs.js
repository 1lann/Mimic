
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var fs;
var fsAPI = {};
var filesystem = {};

var readOnly = [
	"/*/rom",
];


triggerGUIUpdate = function() {

}



//  ----------------  Filesystem API  ----------------  //


filesystem.setup = function(callback) {
	BrowserFS.install(window);

	var lsfs = new BrowserFS.FileSystem.LocalStorage();
	BrowserFS.initialize(lsfs);
	fs = require("fs");

	callback(null);
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


filesystem.getName = function(path) {
	return path.substring(path.lastIndexOf("/") + 1);
}


filesystem.getContainingFolder = function(path) {
	return path.substring(0, path.lastIndexOf("/"));
}


filesystem.makeDirRecursive = function(path, mode, position) {
	path = filesystem.sanitise(path);
	mode = mode || 0777;
	position = position || 0;

	var parts = path.split("/");

	if (position >= parts.length) {
		return true;
	}

	var directory = parts.slice(0, position + 1).join("/") || "/";
	try {
		fs.statSync(directory);
		filesystem.makeDirRecursive(path, mode, position + 1);
	} catch (e) {
		try {
			fs.mkdirSync(directory, mode);
			filesystem.makeDirRecursive(path, mode, position + 1);
		} catch (e) {
			if (e.code != "EEXIST") {
				throw e;
			}

			filesystem.makeDirRecursive(path, mode, position + 1);
		}
	}
}



//  ----------------  Lua Functions  ----------------  //


fsAPI.list = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var files = fs.readdirSync(path);
	if (files) {
		C.lua_newtable(L);
		for (var i in files) {
			C.lua_pushnumber(L, i + 1);
			C.lua_pushstring(L, files[i]);
			C.lua_rawset(L, -3);
		}

		return 1;
	} else {
		console.log("fs.list error", files);
		return 0;
	}
}


fsAPI.getSize = function(L) {
	C.lua_pushnumber(L, config.maxStorageSize);
	return 1;
}


fsAPI.exists = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var exists = fs.existsSync(path);
	C.lua_pushnumber(L, exists ? 1 : 0);

	return 1;
}


fsAPI.isDir = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var stat = fs.statSync(path);
	if (stat.isDirectory()) {
		C.lua_pushnumber(L, 1);
	} else {
		C.lua_pushnumber(L, 0);
	}

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
	filesystem.makeDirRecursive(path);

	return 0;
}


fsAPI.move = function(L) {
	var from = filesystem.resolve(C.luaL_checkstring(L, 1));
	var to = filesystem.resolve(C.luaL_checkstring(L, 2));
	var toStat = fs.statSync(to);
	if (toStat.isDirectory()) {
		fs.renameSync(from, to + filesystem.getName(from));
	} else if (!toStat.isFile()) {
		fs.renameSync(from, to);
	}

	return 0;
}


fsAPI.copy = function(L) {
	var from = filesystem.resolve(C.luaL_checkstring(L, 1));
	var to = filesystem.resolve(C.luaL_checkstring(L, 2));
	var toStat = fs.statSync(to);
	if (toStat.isDirectory()) {
		fs.createReadStream(from).pipe(fs.createWriteStream(to + filesystem.getName(from)));
	} else if (!toStat.isFile()) {
		fs.createReadStream(from).pipe(fs.createWriteStream(to));
	}

	return 0;
}


fsAPI.delete = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	if (path != "/" + computer.id) {
		fs.unlinkSync(path);
	}

	return 0;
}


fsAPI.write = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);
	var stat = fs.statSync(path);
	if (!stat.isDirectory()) {
		fs.writeFileSync(path, contents);
	}

	return 0;
}


fsAPI.append = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);
	var stat = fs.statSync(path);
	if (!stat.isDirectory()) {
		fs.appendFileSync(path, contents);
	}

	return 0;
}


fsAPI.read = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var stat = fs.statSync(path);
	if (stat.isFile()) {
		var contents = fs.readFileSync(path);
		C.lua_pushstring(L, contents.toString());
		
		return 1;
	} else {
		return 0;
	}
}


fsAPI.getDrive = function(L) {
	return 0;
}


fsAPI.getFreeSpace = function(L) {
	return 0;
}
