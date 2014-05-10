
//
//  core.js
//  Contains functions managing computers and setup
//
//  Mimic
//  By 1lann and GravityScore
//



var core = {
	"computers": [],
};


var C = Lua5_1.C;



//  ------------------------
//    Utilities
//  ------------------------


String.prototype.repeat = function(num) {
	return new Array(num + 1).join(this);
}


core.serializeTable = function(arr) {
	var construct = "{";
	for (var index in arr) {
		var name = arr[index].replace("\"", "\\\"");
		var correctIndex = parseInt(index) + 1;
		construct = construct + "[" + correctIndex.toString() +
			"]=\"" + name + "\",";
	}
	construct = construct + "}";

	return construct;
}



//  ------------------------
//    Computer Management
//  ------------------------


core.createComputer = function(id, advanced) {
	var computer = new Computer(id, advanced);
	core.computers.push(computer);

	sidebar.update();

	if (core.onRunCallback) {
		core.onRunCallback();
		core.onRunCallback = undefined;
	}

	computer.launch();
}


core.getActiveComputer = function() {
	return core.computers[0];
}



//  ------------------------
//    Main
//  ------------------------


core.run = function() {
	core.createComputer(0, true);
}


core.loadStartupScript = function(callback) {
	var pastebinID = $.url().param("pastebin");
	var urlFile = $.url().param("url");
	var url = "";

	if (typeof(pastebinID) != "undefined") {
		url = "http://pastebin.com/raw.php?i=" + pastebinID;
	} else if (typeof(urlFile) != "undefined") {
		url = urlFile;
	}

	if (url.length > 0) {
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


core.setup = function(onLoadCallback, completeCallback) {
	filesystem.setup(function() {
		core.loadStartupScript(function() {
			render.setup(function() {
				onLoadCallback();

				core.computers = [];

				core.cursorFlash = false;
				setInterval(function() {
					core.cursorFlash = !core.cursorFlash;
					render.cursorBlink();
				}, 500);

				completeCallback();
			});
		});
	});
}


core.main = function(options) {
	var onLoadCallback = options.onLoad || function() {};
	core.onRunCallback = options.onRun || function() {};

	core.setup(onLoadCallback, function() {
		core.run();
	});
}
