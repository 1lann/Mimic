
//
//  fs.js
//  GravityScore and 1lann
//


//  Purpose:
//  - Parse arguments from Lua runtime
//  - Format return values for the Lua runtime


var fsAPI = {};



//    Query


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


fsAPI.listAll = function(L) {
	var computer = core.getActiveComputer();
	var search = [
		filesystem.listRecursively("/computers/" + computer.id, true),
		filesystem.listRecursively("/rom", true),
	];

	C.lua_newtable(L);

	var fileIterator = 1
	for (var ii in search) {
		var files = search[ii];

		for (var i in files) {
			var name = files[i].toString().replace("/computers/" + computer.id, "");

			C.lua_pushnumber(L, fileIterator);
			C.lua_pushstring(L, name);
			C.lua_rawset(L, -3);
			fileIterator++;
		}
	}

	return 1;
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



//    Modification


fsAPI.read = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var contents = computerFilesystem.read(path);

	if (contents) {
		C.lua_pushstring(L, contents);
		return 1;
	} else {
		return 0;
	}
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
	if (!computerFilesystem.delete(path)) {
		C.lua_pushstring(L, "Access denied");
		C.lua_error(L);
	}

	return 0;
}



//    File Manipulation


fsAPI.combine = function(L) {
	var path1 = C.luaL_checkstring(L, 1);
	var path2 = C.luaL_checkstring(L, 2);
	var combined = filesystem.format(path1) + "/" + filesystem.format(path2);
	var result = filesystem.sanitise(combined);
	result = result.substring(1);
	C.lua_pushstring(L, result);

	return 1;
}


fsAPI.getName = function(L) {
	var path = C.luaL_checkstring(L, 1);
	var result = filesystem.getName(filesystem.format(path));
	C.lua_pushstring(L, result);

	return 1;
}


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
