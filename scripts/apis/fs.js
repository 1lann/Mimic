
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var fs;
var fsAPI = {};
var filesystem = {};

var readOnly = [
	// Must be absolute paths
	"/*/rom",
];


triggerGUIUpdate = function() {

}



//  ----------------  Filesystem API Setup  ----------------  //


filesystem.getGlobalMounts = function() {
	// Must be absolute paths
	return {
		"/rom": rom,
	};
}


filesystem.setup = function(callback) {
	BrowserFS.install(window);

	var lsfs = new BrowserFS.FileSystem.LocalStorage();
	BrowserFS.initialize(lsfs);
	fs = require("fs");

	filesystem.loadGlobalMounts();

	callback();
}


filesystem.loadGlobalMounts = function() {
	var globalMounts = filesystem.getGlobalMounts();
	for (var mountPath in globalMounts) {
		filesystem.makeDirRaw("/" + computer.id + mountPath);

		for (var localPath in globalMounts[mountPath]) {
			var path = mountPath + "/" + localPath;
			var isDir = path.substring(path.length - 1) == "/";
			if (isDir) {
				filesystem.makeDirRaw("/" + computer.id + path);
			} else {
				filesystem.writeRaw("/" + computer.id + path, rom[path]);
			}
		}
	}
}



//  ----------------  Filesystem API Utilities  ----------------  //


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


filesystem.getName = function(path) {
	path = filesystem.sanitise(path);
	return path.substring(path.lastIndexOf("/") + 1);
}


filesystem.getContainingFolder = function(path) {
	path = filesystem.sanitise(path);

	var folder = path.substring(0, path.lastIndexOf("/"));
	if (folder.length == 0) {
		folder = "/";
	}

	return folder;
}


filesystem.makeDirRaw = function(path, mode, position) {
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
		filesystem.makeDirRaw(path, mode, position + 1);
	} catch (e) {
		try {
			fs.mkdirSync(directory, mode);
			filesystem.makeDirRaw(path, mode, position + 1);
		} catch (e) {
			if (e.code != "EEXIST") {
				throw e;
			}

			filesystem.makeDirRaw(path, mode, position + 1);
		}
	}
}


filesystem.writeRaw = function(path, contents) {
	path = filesystem.resolve(path).substring(1 + computer.id.toString().length);

	try {
		if (!filesystem.isDirRaw(path)) {
			var folder = filesystem.getContainingFolder(path).substring(1 + computer.id.toString().length);
			if (!filesystem.exists(folder)) {
				filesystem.makeDir(folder);
			}

			fs.writeFileSync(path, contents);
			return true;
		}
	} catch (e) {}

	return false;
}


filesystem.checkForRootDirectory = function() {
	if (!filesystem.isDirRaw("/" + computer.id)) {
		filesystem.makeDirRaw("/" + computer.id);
		console.log("meh")
	}
}



//  ----------------  Filesystem Wrapper  ----------------  //


filesystem.list = function(path) {
	filesystem.checkForRootDirectory();
	path = filesystem.resolve(path);

	var files;
	try {
		files = fs.readdirSync(path);
	} catch (e) {
		if (e.code == "ENOENT") {
			files = [];
		} else {
			throw e;
		}
	}

	return files;
}


filesystem.exists = function(path) {
	path = filesystem.resolve(path);
	if (path != "/" + computer.id) {
		filesystem.checkForRootDirectory();
	}

	return fs.existsSync(path);
}


filesystem.isDirRaw = function(path) {
	path = filesystem.resolve(path).substring(1 + computer.id.toString().length);

	var pathIsDir = false;
	try {
		var stat = fs.statSync(path);
		pathIsDir = stat.isDirectory();
	} catch (e) {
		if (e.code != "ENOENT") {
			throw e;
		}
	}

	return pathIsDir;
}


filesystem.isDir = function(path) {
	return filesystem.isDirRaw(filesystem.resolve(path));
}



filesystem.write = function(path, contents) {
	filesystem.checkForRootDirectory();
	path = filesystem.resolve(path);
	
	if (filesystem.isReadOnly(path)) {
		return;
	}

	return filesystem.writeRaw(path, contents);
}


filesystem.append = function(path, contents) {
	filesystem.checkForRootDirectory();
	path = filesystem.resolve(path);
	
	if (filesystem.isReadOnly(path)) {
		return;
	}

	try {
		if (!filesystem.isDirRaw(path)) {
			var folder = filesystem.getContainingFolder(path);
			if (!filesystem.exists(folder)) {
				filesystem.makeDir(folder);
			}

			fs.appendFileSync(path, contents);
			return true;
		}
	} catch (e) {}

	return false;
}


filesystem.read = function(path) {
	filesystem.checkForRootDirectory();
	path = filesystem.resolve(path);

	var contents;
	try {
		var stat = fs.statSync(path);
		if (stat.isFile()) {
			contents = fs.readFileSync(path).toString();
		}
	} catch (e) {
		if (e.code == "ENOENT") {
			return null;
		} else {
			throw e;
		}
	}

	return contents;
}


filesystem.isReadOnly = function(path) {
	path = filesystem.sanitise(path).substring(1);

	var parts = path.split("/");
	var pathIsReadOnly = false;

	for (var i in readOnly) {
		var readOnlyPath = filesystem.sanitise(readOnly[i]).substring(1).split("/");

		if (parts.length >= readOnlyPath.length) {
			pathIsReadOnly = true;

			for (var i2 in readOnlyPath) {
				if (readOnlyPath[i2] == "*") {
					continue;
				}

				if (readOnlyPath[i2] != parts[i2]) {
					pathIsReadOnly = false;
					break;
				}
			}

			if (readOnly) {
				pathIsReadOnly = true;
			}
		}
	}

	return pathIsReadOnly;
}


filesystem.makeDir = function(path) {
	path = filesystem.resolve(path);
	if (path != "/" + computer.id) {
		filesystem.checkForRootDirectory();
	}

	if (filesystem.isReadOnly(path)) {
		return;
	}

	filesystem.makeDirRaw(path);
}


filesystem.move = function(from, to) {
	filesystem.checkForRootDirectory();
	from = filesystem.resolve(from);
	to = filesystem.resolve(to);

	throw new Error("Move doesn't properly work for some weird reason");

	try {
		if (filesystem.isDirRaw(to)) {
			fs.renameSync(from, to + filesystem.getName(from));
		} else {
			fs.renameSync(from, to);
		}

		return true;
	} catch (e) {}

	return false;
}


filesystem.copy = function(from, to) {
	filesystem.checkForRootDirectory();
	from = filesystem.resolve(from);
	to = filesystem.resolve(to);

	// TODO: Too lazy to implement
	// CHUIE COMPLETE PLZ TY
	throw new Error("Too lazy to implement, sorry");

	return false;
}


filesystem.delete = function(path) {
	filesystem.checkForRootDirectory();
	path = filesystem.resolve(path);

	if (filesystem.isReadOnly(path)) {
		return;
	}

	try {
		if (path != "/" + computer.id) {
			if (!filesystem.isDirRaw(path)) {
				fs.unlinkSync(path);
			} else {
				// TODO: Too lazy to implement recursive directory deletion
				// CHUIE COMPLETE PLZ TY
				throw new Error("Too lazy to implement, sorry");
			}

			return true;
		}
	} catch (e) {}

	return false;
}


filesystem.getDrive = function() {
	throw new Error("Too lazy to implement, sorry");
	return 0;
}


filesystem.getFreeSpace = function() {
	throw new Error("Too lazy to implement, sorry");
	return 0;
}



//  ----------------  Lua  ----------------  //


fsAPI.list = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var files = filesystem.list(path);

	if (files) {
		C.lua_newtable(L);
		for (var i in files) {
			C.lua_pushnumber(L, parseInt(i) + 1);
			C.lua_pushstring(L, files[i].toString());
			C.lua_rawset(L, -3);
		}

		return 1;
	} else {
		return 0;
	}
}


fsAPI.getSize = function(L) {
	C.lua_pushnumber(L, config.maxStorageSize);
	return 1;
}


fsAPI.exists = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var exists = filesystem.exists(path);
	C.lua_pushboolean(L, exists ? 1 : 0);

	return 1;
}


fsAPI.isDir = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var isDir = filesystem.isDir(path);
	C.lua_pushboolean(L, isDir ? 1 : 0);

	return 1;
}


fsAPI.isReadOnly = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var isReadOnly = filesystem.isReadOnly(path);
	C.lua_pushboolean(L, isReadOnly ? 1 : 0);

	return 1;
}


fsAPI.makeDir = function(L) {
	var path = C.luaL_checkstring(L, 1);
	filesystem.makeDir(path);

	return 0;
}


fsAPI.move = function(L) {
	var from = C.luaL_checkstring(L, 1);
	var to = C.luaL_checkstring(L, 2);

	return 0;
}


fsAPI.copy = function(L) {
	var from = C.luaL_checkstring(L, 1);
	var to = C.luaL_checkstring(L, 2);

	return 0;
}


fsAPI.delete = function(L) {
	var path = C.luaL_checkstring(L, 1);
	filesystem.delete(path);

	return 0;
}


fsAPI.write = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var contents = C.luaL_checkstring(L, 2);
	filesystem.write(path, contents);

	return 0;
}


fsAPI.append = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var contents = C.luaL_checkstring(L, 2);
	filesystem.append(path, contents);

	return 0;
}


fsAPI.read = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var contents = filesystem.read(path);

	if (contents) {
		C.lua_pushstring(L, contents);
		return 1;
	}

	return 0;
}


fsAPI.getDrive = function(L) {
	return 0;
}


fsAPI.getFreeSpace = function(L) {
	return 0;
}
