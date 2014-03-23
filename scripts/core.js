
//  
//  Mimic
//  Made by 1lann and GravityScore
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
		construct = construct + "[" + correctIndex.toString() + "]=\"" + name + "\",";
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

	gui.updateComputerSidebar();
	filesystem.triggerGUIUpdate();

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


core.unhideHTMLElements = function() {
	$("#loading").attr("style", "display: none;");
	$("#canvas").attr("style", "");
	$("#overlay-canvas").attr("style", "");
	window.onresize();
}


core.setup = function(callback) {
	filesystem.setup(function() {
		render.setup(function() {
			core.unhideHTMLElements();

			core.computers = [];

			core.cursorFlash = false;
			setInterval(function() {
				core.cursorFlash = !core.cursorFlash;
				render.cursorBlink();
			}, 500);

			callback();
		});
	});
}


core.main = function() {
	core.setup(function() {
		core.run();
	});
}
