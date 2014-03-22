
//  
//  Mimic
//  Made by 1lann and GravityScore
//  


var mouseDown = false;
var previousMouseLocation = [-1, -1, -1];


window.onkeydown = function(event) {
	if (gui.selected != -1) {
		return;
	}

	var code = globals.keyCodes[event.keyCode];
	var character = globals.characters.noshift[event.keyCode];
	if (event.shiftKey) {
		character = globals.characters.shift[event.keyCode];
	}

	var pushedSomething = false;

	if (typeof(code) != "undefined") {
		computer.eventStack.push(["key", parseInt(code)]);
		pushedSomething = true;
	}

	if (typeof(character) != "undefined") {
		computer.eventStack.push(["char", character]);
		pushedSomething = true;
	}

	if (pushedSomething) {
		resumeThread();
	}

	event.preventDefault();
}


window.onkeyup = function(event) {

}



window.onmousedown = function(event) {
	if (gui.selected != -1) {
		return;
	}

	mouseDown = true;

	var loc = getCanvasLocation();
	var button = globals.buttons["click " + event.button] + 1;
	var x = Math.floor((event.pageX - config.borderWidth - loc.x) / config.cellWidth) + 1;
	var y = Math.floor((event.pageY - config.borderHeight - loc.y) / config.cellHeight) + 1;
	if (x >= 1 && y >= 1 && x <= config.width && y <= config.height) {
		computer.eventStack.push(["mouse_click", button, x, y]);
		resumeThread();
	}
}


window.onmouseup = function(event) {
	mouseDown = false;
}


window.onmousemove = function(event) {
	if (gui.selected != -1) {
		return;
	}

	var loc = getCanvasLocation();
	var x = Math.floor((event.pageX - config.borderWidth - loc.x) / config.cellWidth) + 1;
	var y = Math.floor((event.pageY - config.borderHeight - loc.y) / config.cellHeight) + 1;
	var button = globals.buttons["click " + event.button];

	if (mouseDown && (previousMouseLocation[0] != button || previousMouseLocation[1] != x || previousMouseLocation[2] != y)) {
		if (x >= 1 && y >= 1 && x <= config.width && y <= config.height) {
			computer.eventStack.push(["mouse_drag", button, x, y]);
			resumeThread();

			previousMouseLocation[0] = button;
			previousMouseLocation[1] = x;
			previousMouseLocation[2] = y;
		}
	}
}
