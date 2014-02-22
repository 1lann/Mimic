
//  
//  WebCC
//  Made by 1lann and GravityScore
//  



var fsAPI = {};
var filer = null;

var filesystem = {};



//  ----------------  Filesystem API  ----------------  //


filesystem.setup = function(callback) {
	filer = new Filer();
	filer.init({"persistent": true, "size": 4 * 1024 * 1024}, function(fs) {
		callback(null);
	}, function(err) {
		console.log("Failed to load filesystem!");
		console.log("Unable to start WebCC!");
		console.log(err);

		callback(err);
	});
}


filesystem.serializeTable = function(arr) {
	var construct = "{";
	for (var index in arr) {
		var name = arr[index].replace("\"", "\\\"");
		var correctIndex = parseInt(index) + 1;
		construct = construct + "[" + correctIndex + "]=\"" + name + "\",";
	}
	construct = construct + "}";

	return construct;
}


filesystem.resolve = function(path) {
	path = path.replace("\\", "/");
	if (path.substring(0, 1) != "/") {
		path = "/" + path;
	}

	// Replace simple resolutions
	path = path.replace(/(\/(\.\/)+)|(\/\.$)/g, "/").replace(/\/{2,}/g, "/");

	// Replace all ../
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

	// Append computer ID
	path = "/" + computer.id + "/" + path;

	if (path.substring(path.length - 1) == "/") {
		path = path.substring(0, path.length - 1);
	}

	return path;
}


filesystem.exists = function(path, callback) {
	var dir = path.substring(0, path.lastIndexOf("/"));
	filer.ls(dir, function(items) {
		for (var i in items) {
			var item = items[i];
			if (item.fullPath == path) {
				callback(true);
				return;
			}
		}

		callback(false);
	}, function(err) {
		callback(false);
	});
}


filesystem.isDir = function(path, callback) {
	if (path == "/") {
		return true;
	}

	var dir = path.substring(0, path.lastIndexOf("/"));
	filer.ls(dir, function(items) {
		for (var i in items) {
			var item = items[i];
			if (item.fullPath == path && item.isDirectory) {
				callback(true);
				return;
			}
		}

		callback(false);
	}, function(err) {
		callback(false);
	});
}


filesystem.isReadOnly = function(path) {
	return false;
}


filesystem.list = function(path, callback) {
	filesystem.isDir(path, function(is) {
		if (!is) {
			callback([], null);
			return;
		}

		filer.ls(path, function(items) {
			var files = [];
			for (var i in items) {
				var item = items[i];
				files.push(item.name);
			}
			console.log(items);

			callback(files, null);
		}, function(err) {
			console.log(err);
			if (err.code == err.NOT_FOUND_ERR) {
				callback([], null);
			} else {
				callback(null, err);
			}
		});
	});
}


filesystem.move = function(from, to, callback) {
	filesystem.isDir(to, function(is) {
		var toDir = to.substring(0, to.lastIndexOf("/"));
		var toName = to.substring(to.lastIndexOf("/") + 1);
		if (is) {
			toDir = to;
			toName = from.substring(from.lastIndexOf("/") + 1);
		}

		filer.mv(from, toDir, toName, function(file) {
			callback(null);
		}, function(err) {
			if (err.code == err.NOT_FOUND_ERR) {
				callback(null);
			} else {
				callback(err);
			}
		});
	});
}


filesystem.copy = function(from, to, callback) {
	filesystem.isDir(to, function(is) {
		var toDir = to.substring(0, to.lastIndexOf("/"));
		var toName = to.substring(to.lastIndexOf("/") + 1);
		if (is) {
			toDir = to;
			toName = from.substring(from.lastIndexOf("/") + 1);
		}

		filer.cp(from, toDir, toName, function(file) {
			callback(null);
		}, function(err) {
			if (err.code == err.NOT_FOUND_ERR) {
				callback(null);
			} else {
				callback(err);
			}
		});
	});
}


filesystem.delete = function(path, callback) {
	filer.rm(path, function() {
		callback(null);
	}, function(err) {
		if (err.code == err.NOT_FOUND_ERR) {
			callback(null);
		} else {
			callback(err);
		}
	});
}


filesystem.read = function(path, callback) {
	filesystem.isDir(path, function(is) {
		if (is) {
			callback(null, "dir");
			return;
		}

		filer.open(path, function(file) {
			var reader = new FileReader();
			reader.onload = function(e) {
				console.log(reader);
				console.log(e);

				callback(true, null);
			}
			console.log("reading...");
		}, function(err) {
			callback(null, err);
		});
	});
}


filesystem.write = function(path, contents, append, callback) {
	filesystem.isDir(path, function(is) {
		if (is) {
			callback("dir");
			return;
		}

		var dir = path.substring(0, path.lastIndexOf("/"));
		filer.mkdir(dir, false, function() {
			filer.write(path, {"data": contents, "append": append}, function(entry, writer) {
				callback(null);
			}, function(err) {
				callback(err);
			})
		}, function(err) {
			callback(err);
		});
	});
}


filesystem.makeDir = function(path, callback) {
	filer.mkdir(path, false, function(dir) {
		callback(null);
	}, function(err) {
		callback(err);
	});
}



//  ----------------  Lua Wrappers  ----------------  //


fsAPI.list = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	return 0;
}


fsAPI.getSize = function(L) {
	C.lua_pushnumber(L, config.maxStorageSize);
	return 1;
}


fsAPI.exists = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	filesystem.exists(path, function(exists) {
		computer.eventStack.push(["fs_exists", exists]);
		resumeThread();
	});

	return 0;
}


fsAPI.isDir = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	filesystem.isDir(path, function(is) {
		computer.eventStack.push(["fs_isDir", is]);
		resumeThread();
	});

	return 0;
}


fsAPI.isReadOnly = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));

	return 1;
}


fsAPI.makeDir = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	
	return 0;
}


fsAPI.move = function(L) {
	var from = resolve(C.luaL_checkstring(L, 1));
	var to = resolve(C.luaL_checkstring(L, 2));
	
	return 0;
}


fsAPI.copy = function(L) {
	var from = resolve(C.luaL_checkstring(L, 1));
	var to = resolve(C.luaL_checkstring(L, 2));
	
	return 0;
}


fsAPI.delete = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));

	return 0;
}


fsAPI.write = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);

	return 0;
}


fsAPI.append = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);
	
	return 0;
}


fsAPI.read = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	
	return 0;
}


fsAPI.getDrive = function(L) {
	return 0;
}


fsAPI.getFreeSpace = function(L) {
	return 0;
}
