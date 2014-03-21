
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var fs;
var filesystem = {};
var computerFilesystem = {};
var fsAPI = {};



//  ----------------  Setup  ----------------  //


filesystem.setup = function(callback) {
	BrowserFS.install(window);

	var request = new XMLHttpRequest();
	request.open("GET", "lua/rom.zip", true);
	request.responseType = "arraybuffer";

	request.onload = function(evt) {
		if (!request.response) {
			console.log("Failed to load ComputerCraft rom!");
			console.log("Error: ", evt);
			return;
		}

		var buffer = new Buffer(request.response);
		var mfs = new BrowserFS.FileSystem.MountableFileSystem();
		mfs.mount("/computers", new BrowserFS.FileSystem.LocalStorage());
		mfs.mount("/rom", new BrowserFS.FileSystem.ZipFS(buffer));

		BrowserFS.initialize(mfs);
		fs = require("fs");

		callback();
	}

	request.send(null);
}



//  ----------------  Utilities  ----------------  //


filesystem.format = function(path) {
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


filesystem.sanitise = function(path) {
	path = filesystem.format(path);

	path = path.replace(/(\/(\.\/)+)|(\/\.$)/g, "/").replace(/\/{2,}/g, "/");

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

	path = leadingParents + path;
	return filesystem.format(path);
}


filesystem.getName = function(path) {
	path = filesystem.format(path);
	return path.substring(path.lastIndexOf("/") + 1);
}


filesystem.getContainingFolder = function(path) {
	path = filesystem.format(path);

	var folder = path.substring(0, path.lastIndexOf("/"));
	if (folder.length == 0) {
		folder = "/";
	}

	return folder;
}



//  ----------------  Raw Filesystem Wrappers  ----------------  //
//  These functions do not resolve the path to a particular computer
//  They operate on absolute file paths starting from the actual root
//  No concept of read only is present



//  -------  Query


filesystem.list = function(path) {
	path = filesystem.sanitise(path);

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
	path = filesystem.sanitise(path);
	return fs.existsSync(path);
}


filesystem.isDir = function(path) {
	path = filesystem.sanitise(path);

	var is = false;
	try {
		var stat = fs.statSync(path);
		is = stat.isDirectory();
	} catch (e) {
		is = false;
		if (e.code != "ENOENT") {
			throw e;
		}
	}

	return is;
}



//  -------  Modification


filesystem.read = function(path) {
	path = filesystem.sanitise(path);

	var contents = null;
	if (!filesystem.isDir(path)) {
		contents = fs.readFileSync(path).toString();
	}

	return contents;
}


filesystem.write = function(path, contents) {
	path = filesystem.sanitise(path);

	if (!filesystem.isDir(path)) {
		var folder = filesystem.getContainingFolder(path);
		if (!filesystem.exists(folder)) {
			filesystem.makeDir(folder);
		}

		fs.writeFileSync(path, contents);
	}
}


filesystem.append = function(path, contents) {
	path = filesystem.sanitise(path);

	if (!filesystem.isDir(path)) {
		var folder = filesystem.getContainingFolder(path);
		if (!filesystem.exists(folder)) {
			filesystem.makeDir(folder);
		}

		fs.appendFileSync(path, contents);
	}
}


filesystem.makeDir = function(path, mode, position) {
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
		filesystem.makeDir(path, mode, position + 1);
	} catch (e) {
		try {
			fs.mkdirSync(directory, mode);
			filesystem.makeDir(path, mode, position + 1);
		} catch (e) {
			if (e.code != "EEXIST") {
				throw e;
			}

			filesystem.makeDir(path, mode, position + 1);
		}
	}
}


filesystem.delete = function(path) {
	path = filesystem.sanitise(path);

	if (path != "/") {
		if (!filesystem.isDir(path)) {
			fs.unlinkSync(path);
		} else {
			throw new Error("Not implemented");
		}
	}
}



//  -------  File Manipulation


filesystem.move = function(from, to) {
	from = filesystem.sanitise(from);
	to = filesystem.sanitise(to);

	throw new Error("Not implemented");

	// try {
	// 	if (filesystem.isDir(to)) {
	// 		fs.renameSync(from, to + filesystem.getName(from));
	// 	} else {
	// 		fs.renameSync(from, to);
	// 	}

	// 	return true;
	// } catch (e) {}
}


filesystem.copy = function(from, to) {
	from = filesystem.sanitise(from);
	to = filesystem.sanitise(to);

	throw new Error("Not implemented");
}




//  ----------------  Computer File System  ----------------  //
//  These functions use the current computer ID to resolve paths for
//  a particular computer
//  - Mounts the rom folder
//  - Checks for read only


computerFilesystem.resolve = function(path) {
	if (path != "/") {
		computerFilesystem.createRoot();
	}

	var base = "/computers/" + computer.id.toString();
	var path = filesystem.format(base + filesystem.sanitise(path));

	if (path.indexOf(base + "/rom") == 0) {
		path = filesystem.format(path.substring(path.indexOf("/rom")));
	}

	return path;
}


computerFilesystem.isReadOnly = function(path) {
	var base = "/computers/" + computer.id.toString();
	var is = true;

	if (path.indexOf(base) == 0) {
		return false;
	}

	return is;
}


computerFilesystem.createRoot = function() {
	var rootPath = computerFilesystem.resolve("/");
	if (!filesystem.isDir(rootPath)) {
		filesystem.makeDir(rootPath);
	}
}



//  -------  Query


computerFilesystem.list = function(path) {
	path = computerFilesystem.resolve(path);

	var files = filesystem.list(path);

	if (path == computerFilesystem.resolve("/")) {
		files.push("rom");
	}

	return files;
}


computerFilesystem.exists = function(path) {
	path = computerFilesystem.resolve(path);
	return filesystem.exists(path);
}


computerFilesystem.isDir = function(path) {
	path = computerFilesystem.resolve(path);
	return filesystem.isDir(path);
}



//  -------  Modification


computerFilesystem.read = function(path) {
	path = computerFilesystem.resolve(path);
	return filesystem.read(path);
}


computerFilesystem.write = function(path, contents) {
	path = computerFilesystem.resolve(path);

	if (!computerFilesystem.isReadOnly(path)) {
		filesystem.write(path, contents);
		return true;
	} else {
		return false;
	}
}


computerFilesystem.append = function(path, contents) {
	path = computerFilesystem.resolve(path);

	if (!computerFilesystem.isReadOnly(path)) {
		filesystem.append(path, contents);
		return true;
	} else {
		return false;
	}
}


computerFilesystem.makeDir = function(path) {
	path = computerFilesystem.resolve(path);

	if (!computerFilesystem.isReadOnly(path)) {
		filesystem.makeDir(path);
		return true;
	} else {
		return false;
	}
}


computerFilesystem.delete = function(path) {
	path = computerFilesystem.resolve(path);

	if (!computerFilesystem.isReadOnly(path)) {
		filesystem.delete(path);
		return true;
	} else {
		return false;
	}
}



//  -------  File Manipulation


filesystem.move = function(from, to) {
	from = computerFilesystem.resolve(from);
	to = computerFilesystem.resolve(to);

	throw new Error("Not implemented");

	// try {
	// 	if (filesystem.isDir(to)) {
	// 		fs.renameSync(from, to + filesystem.getName(from));
	// 	} else {
	// 		fs.renameSync(from, to);
	// 	}

	// 	return true;
	// } catch (e) {}
}


filesystem.copy = function(from, to) {
	from = computerFilesystem.resolve(from);
	to = computerFilesystem.resolve(to);

	throw new Error("Not implemented");
}



//  ----------------  Lua Wrappers  ----------------  //
//  These functions interface with the Lua runtime
//  - Parse arguments from Lua runtime
//  - Format return values for the Lua runtime


//  -------  Query


fsAPI.list = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var files = computerFilesystem.list(path);

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


fsAPI.exists = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var exists = computerFilesystem.exists(path);
	C.lua_pushboolean(L, exists ? 1 : 0);
	return 1;
}


fsAPI.isDir = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var isDir = computerFilesystem.isDir(path);
	C.lua_pushboolean(L, isDir ? 1 : 0);
	return 1;
}


fsAPI.isReadOnly = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var is = computerFilesystem.isReadOnly(computerFilesystem.resolve(path));
	C.lua_pushboolean(L, is ? 1 : 0);
	return 1;
}


fsAPI.getSize = function(L) {
	C.lua_pushnumber(L, config.maxStorageSize);
	return 1;
}


fsAPI.getDrive = function(L) {
	return 0;
}


fsAPI.getFreeSpace = function(L) {
	return 0;
}



//  -------  Modification


fsAPI.read = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var contents = computerFilesystem.read(path);

	if (contents) {
		C.lua_pushstring(L, contents);
		return 1;
	}

	return 0;
}


fsAPI.write = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var contents = C.luaL_checkstring(L, 2);
	computerFilesystem.write(path, contents);
	return 0;
}


fsAPI.append = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var contents = C.luaL_checkstring(L, 2);
	computerFilesystem.append(path, contents);
	return 0;
}


fsAPI.makeDir = function(L) {
	var path = C.luaL_checkstring(L, 1);
	computerFilesystem.makeDir(path);
	return 0;
}


fsAPI.delete = function(L) {
	var path = C.luaL_checkstring(L, 1);
	computerFilesystem.delete(path);
	return 0;
}



//  -------  File Manipulation


fsAPI.move = function(L) {
	var from = C.luaL_checkstring(L, 1);
	var to = C.luaL_checkstring(L, 2);
	computerFilesystem.move(from, to);
	return 0;
}


fsAPI.copy = function(L) {
	var from = C.luaL_checkstring(L, 1);
	var to = C.luaL_checkstring(L, 2);
	computerFilesystem.copy(from, to);
	return 0;
}
