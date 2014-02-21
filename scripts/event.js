
//  
//  WebCC
//  Made by 1lann and GravityScore
//  


var mouseDown = false;
var previousMouseLocation = [-1, -1, -1];


window.onkeydown = function(event) {
	var code = globals.keyCodes[event.keyCode];
	var character = globals.characters.noshift[event.keyCode];
	if (event.shiftKey) {
		character = globals.characters.shift[event.keyCode];
	}

	eventStack.push(["key", code]);
	eventStack.push(["char", character]);
	resumeThread();
}


window.onkeyup = function(event) {

}



window.onmousedown = function(event) {
	mouseDown = true;

	var button = globals.buttons["click " + event.button];
	var x = Math.floor((event.pageX - config.borderWidth) / config.cellWidth) + 1;
	var y = Math.floor((event.pageY - config.borderHeight) / config.cellHeight) + 1;
	if (x >= 1 && y >= 1 && x <= config.width && y <= config.height) {
		eventStack.push(["mouse_click", button, x, y]);
		resumeThread();
	}
}


window.onmouseup = function(event) {
	mouseDown = false;
}


window.onmousemove = function(event) {
	var x = Math.floor((event.pageX - config.borderWidth) / config.cellWidth) + 1;
	var y = Math.floor((event.pageY - config.borderHeight) / config.cellHeight) + 1;
	var button = globals.buttons["click " + event.button];

	if (mouseDown && (previousMouseLocation[0] != button || previousMouseLocation[1] != x || previousMouseLocation[2] != y)) {
		if (x >= 1 && y >= 1 && x <= config.width && y <= config.height) {
			eventStack.push(["mouse_drag", button, x, y]);
			resumeThread();

			previousMouseLocation[0] = button;
			previousMouseLocation[1] = x;
			previousMouseLocation[2] = y;
		}
	}
}
