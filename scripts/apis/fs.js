
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


exists = function(path, callback) {
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


isDir = function(path, callback) {
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


fsAPI.list = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	filer.ls(path, function(items) {
		var files = [];
		for (var i in items) {
			var item = items[i];
			files.push(item.name);
		}

		computer.eventStack.push(["fs_list", files]);
		resumeThread();
	}, function(err) {
		if (err.code == err.NOT_FOUND_ERR) {
			computer.eventStack.push(["fs_list", []]);
			resumeThread();
		} else {
			computer.eventStack.push(["fs_list_failure"]);
			resumeThread();
			onFSError(err);
		}
	});

	return 0;
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

	return 0;
}


fsAPI.isDir = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	isDir(path, function(is) {
		computer.eventStack.push(["fs_isDir", is]);
		resumeThread();
	});

	return 0;
}


fsAPI.isReadOnly = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	if (path.substring(0, 4) == "/rom") {
		C.lua_pushboolean(L, 1);
	} else {
		C.lua_pushboolean(L, 0);
	}

	return 1;
}


fsAPI.makeDir = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	filer.mkdir(path, false, function(dir) {

	}, function(err) {
		onFSError(err);
	});

	return 0;
}


fsAPI.move = function(L) {
	var from = resolve(C.luaL_checkstring(L, 1));
	var to = resolve(C.luaL_checkstring(L, 2));
	isDir(to, function(is) {
		var toDir = to.substring(0, to.lastIndexOf("/"));
		var toName = to.substring(to.lastIndexOf("/") + 1);
		if (is) {
			toDir = to;
			toName = from.substring(from.lastIndexOf("/") + 1);
		}

		filer.mv(from, toDir, toName, function(file) {

		}, function(err) {
			if (err.code != err.NOT_FOUND_ERR) {
				onFSError(err);
			}
		});
	});

	return 0;
}


fsAPI.copy = function(L) {
	var from = resolve(C.luaL_checkstring(L, 1));
	var to = resolve(C.luaL_checkstring(L, 2));
	isDir(to, function(is) {
		var toDir = to.substring(0, to.lastIndexOf("/"));
		var toName = to.substring(to.lastIndexOf("/") + 1);
		if (is) {
			toDir = to;
			toName = from.substring(from.lastIndexOf("/") + 1);
		}

		filer.cp(from, toDir, toName, function(file) {

		}, function(err) {
			if (err.code != err.NOT_FOUND_ERR) {
				onFSError(err);
			}
		});
	});

	return 0;
}


fsAPI.delete = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	filer.rm(path, function() {

	}, function(err) {
		if (err.code != err.NOT_FOUND_ERR) {
			onFSError(err);
		}
	})
}


fsAPI.write = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);
	filer.write(path, {"data": contents}, function(entry, writer) {

	}, function(err) {
		onFSError(err);
	});
}


fsAPI.append = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);
	filer.write(path, {"data": contents, "append": true}, function(entry, writer) {

	}, function(err) {
		onFSError(err);
	});
}


fsAPI.read = function(L) {
	var path = resolve(C.luaL_checkstring(L, 1));
	filer.open(path, function(file) {
		var reader = new FileReader();
		reader.onload = function(e) {
			console.log(reader);
			console.log(e);
		}
	}, function(err) {
		if (err.code == err.NOT_FOUND_ERR) {
			computer.eventStack.push(["fs_read", ""]);
			resumeThread();
		} else {
			computer.eventStack.push(["fs_read_failure"]);
			resumeThread();
		}
	})
}


fsAPI.getDrive = function(L) {

}


fsAPI.getFreeSpace = function(L) {

}
