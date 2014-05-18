
//
//  core.js
//  GravityScore and 1lann
//



var core = {};
var C = Lua5_1.C;



//
//    Utilities
//


String.prototype.repeat = function(num) {
	return new Array(num + 1).join(this);
}


core.serializeTable = function(table) {
	var construct = "{";

	for (var i in table) {
		var name = table[i].replace("\"", "\\\"");
		var index = (parseInt(i) + 1).toString;

		construct += "[" + index + "]=\"" + name + "\",";
	}

	construct = construct + "}";

	return construct;
}



//
//    Computers
//


core.createComputer = function(id, advanced) {
	var computer = new Computer(id, advanced);
	core.computers.push(computer);
}


core.getActiveComputer = function() {
	if (core.computers) {
		return core.computers[0];
	} else {
		return undefined;
	}
}



//
//    Startup Script
//


core.fetchStartupScriptURL = function() {
	var paste = $.url().param("pastebin");
	var file = $.url().param("url");

	var url;

	if (typeof(paste) != "undefined") {
		url = "http://pastebin.com/raw.php?i=" + paste;
	} else if (typeof(file) != "undefined") {
		url = file;
	}

	return url;
}


core.loadStartupScript = function(callback) {
	var url = core.fetchStartupScriptURL();

	if (url && url.length > 0) {
		var request = new xdRequest();
		request.setURL(url);
		request.get(function(response) {
			if (response.status == "200") {
				if (filesystem.exists("/computers/0/startup")) {
					filesystem.move("/computers/0/startup", "/computers/0/startup_old");
				}

				filesystem.write("/computers/0/startup", response.html);
			} else {
				console.log("Failed to load startup script");
				console.log("From URL: ", url);
				alert("Failed to fetch statup script!");
			}

			callback();
		});
	} else {
		callback();
	}
}



//
//    Main
//


core.setupCursorFlash = function() {
	core.cursorFlash = false;
	setInterval(function() {
		core.cursorFlash = !core.cursorFlash;
		render.cursorBlink();
	}, 500);
}


core.afterSetup = function() {
	ui.onLoad();

	core.setupCursorFlash();

	core.computers = [];
	core.createComputer(0, true);
	ui.afterLoad();

	core.computers[0].launch();
}


core.run = function() {
	// Load:
	//  1. Filesystem
	//  2. Startup script
	//  3. Rendering
	//  4. Cursor flash
	//  5. Computer

	filesystem.setup(function() {
		core.loadStartupScript(function() {
			render.setup(core.afterSetup);
		});
	});
}
