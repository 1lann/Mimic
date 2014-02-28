
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
	// if (typeof(onFilesystemChange) == "function") {
	// 	filesystem.allFiles("/" + computer.id, function(files) {
	// 		onFilesystemChange(files);
	// 	});
	// }
}



//  ----------------  Filesystem API  ----------------  //


filesystem.setup = function(callback) {
	filer = new Filer();
	filer.init({"persistent": true, "size": 4 * 1024 * 1024}, function(fs) {
		triggerGUIUpdate();
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


filesystem.exists = function(path, callback) {
	path = filesystem.sanitise(path);

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
	path = filesystem.sanitise(path);
	if (path == "/") {
		callback(true);
		return;
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
	path = filesystem.sanitise(path);
	
	filer.ls(path, function(items) {
		var files = [];
		for (var i in items) {
			var item = items[i];
			files.push(item.name);
		}

		callback(files, null);
	}, function(err) {
		if (err.code == err.NOT_FOUND_ERR) {
			callback([], null);
		} else {
			callback(null, err);
		}
	});
}


filesystem.allFiles = function(path, callback) {
	path = filesystem.sanitise(path);

	var files = [];
	var error = null;
	var addFiles = function(dir) {
		filer.ls(dir, function(items) {
			for (var i in items) {
				var item = items[i];
				if (item.isDirectory) {
					addFiles(item.fullPath);
				} else {
					var it = {};
					for (var ii in item) {
						if (item[ii].hasOwnProperty(ii)) {
							it[ii] = item[ii];
						}
					}

					filesystem.read(path, function(contents, err) {
						if (err) {
							error = err;
							return;
						}

						files.push({
							"path": it.fullPath,
							"contents": contents,
						});
					});
				}
			}
		}, function(err) {
			if (err.code == err.NOT_FOUND_ERR) {
				error = true;
			} else {
				error = err;
			}
		});
	}

	addFiles(path);
	setTimeout(function() {
		if (error) {
			callback(null, error);
		} else {
			callback(files, null);
		}
	}, 10);
}


filesystem.move = function(from, to, callback) {
	from = filesystem.sanitise(from);
	to = filesystem.sanitise(to);
	
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
	from = filesystem.sanitise(from);
	to = filesystem.sanitise(to);
	
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
	path = filesystem.sanitise(path);
	
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
	path = filesystem.sanitise(path);
	
	filesystem.isDir(path, function(is) {
		if (is) {
			callback(null, "dir");
			return;
		}

		filer.open(path, function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				callback(e.target.result, null);
			}

			reader.onerror = function(err) {
				callback(null, err);
			}

			reader.onabort = function(err) {
				callback(null, err);
			}

			reader.readAsText(file);
		}, function(err) {
			callback(null, err);
		});
	});
}


filesystem.write = function(path, contents, append, callback) {
	path = filesystem.sanitise(path);
	
	filesystem.isDir(path, function(is) {
		if (is) {
			callback("dir");
			return;
		}

		var complete = function() {
			filer.write(path, {"data": contents, "append": append}, function(entry, writer) {
				callback(null);
			}, function(err) {
				callback(err);
			});
		}

		var dir = path.substring(0, path.lastIndexOf("/"));
		if (dir.length > 0) {
			filesystem.makeDir(dir, function(err) {
				if (err) {
					callback(err);
				} else {
					complete();
				}
			});
		} else {
			complete();
		}
	});
}


filesystem.makeDir = function(path, callback) {
	path = filesystem.sanitise(path) + "/";
	console.log(path)
	if (path == "/") {
		callback(null);
		return;
	}

	var dir = path.substring(0,path.length-1);
	console.log("sub: "+dir)
	for (var i = 0; i < path.length; i++) {
		if (dir.indexOf("/",i) == -1) {
			currentDir = dir.substring(0,i)
			dir = dir.substring(i)
			console.log("cur: "+currentDir)
			break;
		}
	}
	console.log("end: "+dir)
	var make = function() {
		filer.mkdir(currentDir, true, function(){console.log("success")},function(err) {
			if (err.code != err.INVALID_MODIFICATION_ERR) {
				console.log("fail")
				callback(err);
			}
		});
	}

	make();
}



//  ----------------  Lua Wrappers  ----------------  //


fsAPI.list = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.list(path, function(files, err) {
		if (err) {
			console.log("fs_list error", err);
			return;
		}

		console.log("list", files);
		computer.eventStack.push(["fs_list", currentCallID, files]);
		resumeThread();
	});

	return 1;
}


fsAPI.getSize = function(L) {
	C.lua_pushnumber(L, config.maxStorageSize);
	return 1;
}


fsAPI.exists = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.exists(path, function(exists) {
		computer.eventStack.push(["fs_exists", currentCallID, exists]);
		resumeThread();
	});

	return 1;
}


fsAPI.isDir = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.isDir(path, function(is) {
		computer.eventStack.push(["fs_isDir", currentCallID, is]);
		resumeThread();
	});

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

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.makeDir(path, function(err) {
		if (err) {
			console.log("fs_makeDir error", err);
		}

		computer.eventStack.push(["fs_makeDir", currentCallID]);
		resumeThread();

		triggerGUIUpdate();
	});

	return 1;
}


fsAPI.move = function(L) {
	var from = filesystem.resolve(C.luaL_checkstring(L, 1));
	var to = filesystem.resolve(C.luaL_checkstring(L, 2));

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.move(from, to, function(err) {
		if (err) {
			console.log("fs_move error", err);
		}

		computer.eventStack.push(["fs_move", currentCallID]);
		resumeThread();

		triggerGUIUpdate();
	});
	
	return 1;
}


fsAPI.copy = function(L) {
	var from = filesystem.resolve(C.luaL_checkstring(L, 1));
	var to = filesystem.resolve(C.luaL_checkstring(L, 2));

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.copy(from, to, function(err) {
		if (err) {
			console.log("fs_copy error", err);
		}

		computer.eventStack.push(["fs_copy", currentCallID]);
		resumeThread();

		triggerGUIUpdate();
	});
	
	return 1;
}


fsAPI.delete = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.delete(path, function(err) {
		if (err) {
			console.log("fs_delete error", err);
		}

		computer.eventStack.push(["fs_delete", currentCallID]);
		resumeThread();

		triggerGUIUpdate();
	});

	return 1;
}


fsAPI.write = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.write(path, contents, false, function(err) {
		if (err) {
			console.log("fs_write error", err);
		}

		computer.eventStack.push(["fs_write", currentCallID]);
		resumeThread();

		triggerGUIUpdate();
	});

	return 1;
}


fsAPI.append = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));
	var contents = C.luaL_checkstring(L, 2);

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.write(path, contents, true, function(err) {
		if (err) {
			console.log("fs_write error", err);
			return;
		}

		computer.eventStack.push(["fs_append", currentCallID]);
		resumeThread();

		triggerGUIUpdate();
	});
	
	return 1;
}


fsAPI.read = function(L) {
	var path = filesystem.resolve(C.luaL_checkstring(L, 1));

	var currentCallID = callID;
	C.lua_pushnumber(L, currentCallID);
	callID += 1;

	filesystem.read(path, function(contents, err) {
		if (err) {
			console.log("fs_read error", err);
			return;
		}

		computer.eventStack.push(["fs_read", currentCallID, contents]);
		resumeThread();
	});
	
	return 1;
}


fsAPI.getDrive = function(L) {
	return 0;
}


fsAPI.getFreeSpace = function(L) {
	return 0;
}
