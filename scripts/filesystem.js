
//  
//  Mimic
//  Made by 1lann and GravityScore
//  


var fs;

var filesystem = {};
var computerFilesystem = {};



//  ------------------------
//    Setup
//  ------------------------


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



//  ------------------------
//    GUI Interface
//  ------------------------


filesystem.triggerGUIUpdate = function() {
	var computer = core.getActiveComputer();
	var computerPath = computerFilesystem.resolve("/");
	var list = filesystem.listRecursively(computerPath);
	var base = "/computers/" + computer.id.toString();

	var files = [];
	for (var i in list) {
		var path = list[i];
		files.push({
			"path": path.substring(base.length),
			"contents": filesystem.read(list[i]),
		});
	}

	gui.onFilesystemChange(files);
}


filesystem.saveFiles = function(files) {
	var computer = core.getActiveComputer();
	if (typeof(computer) == "undefined") {
		return;
	}

	var base = "/computers/" + computer.id.toString();
	for (var i in files) {
		var file = files[i];
		var actualPath = filesystem.sanitise(base + "/" + file.path);
		filesystem.write(actualPath, file.contents);
	}
}



//  ------------------------
//    Basic Utilities
//  ------------------------


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



//  ------------------------
//    Raw Filesystem
//  ------------------------

//  These functions do not resolve the path to a particular computer
//  They operate on absolute file paths starting from the actual root
//  No concept of "read only files" is present



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


filesystem.listRecursively = function(path, includeDirectories) {
	path = filesystem.sanitise(path);

	var files = [];
	var inDir = filesystem.list(path);
	for (var i in inDir) {
		var filePath = path + "/" + inDir[i];
		if (filesystem.isDir(filePath)) {
			if (includeDirectories) {
				files.push(filePath);
			}

			var dirFiles = filesystem.listRecursively(filePath, includeDirectories);
			for (var i in dirFiles) {
				files.push(dirFiles[i]);
			}
		} else {
			files.push(filePath);
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

	try {
		var contents = null;
		if (!filesystem.isDir(path)) {
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
		if (filesystem.isDir(path)) {
			var fileList = filesystem.listRecursively(path, true);
			var directoryList = [];
			for (var i in fileList) {
				if (filesystem.isDir(fileList[i])) {
					directoryList.push(fileList[i]);
				} else {
					fs.unlinkSync(fileList[i]);
				}
			}
			for (var i in directoryList) {
				if (filesystem.exists(directoryList[i])) {
					fs.rmdirSync(directoryList[i]);
				}
			}
			fs.rmdirSync(path);
			return true;
		} else if (filesystem.exists(path)) {
			fs.unlinkSync(path);
			return true;
		} else {
			console.log("File does not exist, ignoring deletion")
			return true;
		}
	} else {
		return false;
	}
}



//  -------  File Manipulation

filesystem.copy = function(from, to) {
	from = filesystem.sanitise(from);
	to = filesystem.sanitise(to);

	if (!filesystem.exists(from)) {
		return false;
	}

	if (filesystem.isDir(to)) {
		// Place it inside
		if ((to == from) && filesystem.exists(computerFilesystem.resolve("/"+filesystem.getName(from)))) {
			console.log("File/folder exists in current directory!")
			return false;
		} else if (filesystem.isDir(from)) {
			if (filesystem.exists(to+"/"+filesystem.getName(from))) {
				console.log("Folder exists")
				return false;
			} else if ((to == "/") && filesystem.exists("/"+filesystem.getName(from))) {
				console.log("Exists in root")
				return false;
			}
			console.log("Placing folder in folder")
			var fileList = filesystem.listRecursively(from, true);
			for (var i in fileList) {
				if (!filesystem.isDir(fileList[i])) {
					var fileName = filesystem.getName(from)+"/"+fileList[i].substring(from.length);
					console.log(fileName);
					filesystem.write(to+"/"+fileName,filesystem.read(fileList[i]));
				}
			}
			return true;
		} else {
			console.log("Place file inside directory")
			if (filesystem.exists(to+"/"+filesystem.getName(from))) {
				console.log("File already eixsts!")
				return false;
			} else {
				console.log("File placed")
				filesystem.write(to+"/"+filesystem.getName(from), filesystem.read(from));
				return true;
			}
		}
	} else if (filesystem.exists(to)) {
		// A file already exists here
		console.log("File exists")
		return false;
	} else {
		// Doesn't exist, create it
		if (filesystem.isDir(from)) {
			var fileList = filesystem.listRecursively(from, true);
			console.log("Creating folder")
			for (var i in fileList) {
				if (!filesystem.isDir(fileList[i])) {
					var fileName = fileList[i].substring(from.length);
					console.log(fileName);
					filesystem.write(to+"/"+fileName,filesystem.read(fileList[i]));
				}
			}
			return true;
		} else {
			console.log("File doesn't exist, pasting")
			filesystem.write(to, filesystem.read(from));
			return true;
		}
	}
	console.log("Derp")
}




//  ------------------------
//    Computer Specific Filesystem
//  ------------------------

//  These functions use the current computer ID to resolve paths for
//  a particular computer
//  - Mounts the rom folder
//  - Checks for read only


//  -------  Utilities


computerFilesystem.resolve = function(path) {
	if (path != "/") {
		computerFilesystem.createRoot();
	}

	var computer = core.getActiveComputer();
	var base = "/computers/" + computer.id.toString();
	var path = filesystem.format(base + filesystem.sanitise(path));

	if (path.indexOf(base + "/rom") == 0) {
		path = filesystem.format(path.substring(path.indexOf("/rom")));
	}

	return path;
}


computerFilesystem.isReadOnly = function(path) {
	var computer = core.getActiveComputer();
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

	var success = true;
	if (!computerFilesystem.isReadOnly(path)) {
		filesystem.write(path, contents);
	} else {
		success = false;
	}

	filesystem.triggerGUIUpdate();
	return success;
}


computerFilesystem.append = function(path, contents) {
	path = computerFilesystem.resolve(path);

	var success = true;
	if (!computerFilesystem.isReadOnly(path)) {
		filesystem.append(path, contents);
	} else {
		success = false;
	}

	return success;
}


computerFilesystem.makeDir = function(path) {
	path = computerFilesystem.resolve(path);

	var success = true;
	if (!computerFilesystem.isReadOnly(path)) {
		filesystem.makeDir(path);
	} else {
		success = false;
	}

	filesystem.triggerGUIUpdate();
	return success;
}


computerFilesystem.delete = function(path) {
	path = computerFilesystem.resolve(path);

	var success = true;
	if (!computerFilesystem.isReadOnly(path)) {
		success = filesystem.delete(path);
	} else {
		success = false;
	}

	filesystem.triggerGUIUpdate();
	return success;
}



//  -------  File Manipulation


computerFilesystem.move = function(from, to) {
	from = computerFilesystem.resolve(from);
	to = computerFilesystem.resolve(to);

	if (filesystem.copy(from, to)) {
		if(filesystem.delete(from)) {
			filesystem.triggerGUIUpdate();
			return true;
		} else {
			filesystem.delete(to);
			return false;
		}
	} else {
		return false;
	}
}


computerFilesystem.copy = function(from, to) {
	from = computerFilesystem.resolve(from);
	to = computerFilesystem.resolve(to);

	if (filesystem.copy(from, to)) {
		filesystem.triggerGUIUpdate();
		return true;
	} else {
		return false;
	}
}
