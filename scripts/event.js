
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var mouseDown = false;
var prevMouseState = {
	"x": -1,
	"y": -1,
	"button": -1,
};
var pasting = false;



//  ------------------------
//    Key Events
//  ------------------------


window.onkeydown = function(event) {
	if (gui.selected != -1 || gui.popupOpen) {
		return;
	}

	var computer = core.getActiveComputer();
	if (computer.hasErrored) {
		if (event.keyCode == 13) {
			computer.reboot();
			return;
		}
	}

	var code = globals.keyCodes[event.keyCode];
	var character = globals.characters.noshift[event.keyCode];
	if (event.shiftKey) {
		character = globals.characters.shift[event.keyCode];
	}

	var pushedSomething = false;


	// Somewhat hacky paste capturing
	if (event.ctrlKey && (character == "v" || character == "V")) {

		pasting = true;

		var paste_capture = $("#paste-capture"); // an offscreen <textarea> to capture pastes
		paste_capture.focus();

		setTimeout(function() {
			var pasted = paste_capture.val();
			paste_capture.val("");

			// Push all characters in the pasted text
			for (var i=0; i<pasted.length; i++) {
				var keyCode = globals.charCodes[pasted[i]];
				var code 	= globals.keyCodes[keyCode];

				if (typeof(code) != "undefined") {
					computer.eventStack.push(["key", parseInt(code)]);
				}

				if (typeof(pasted[i]) != "undefined") {
					computer.eventStack.push(["char", pasted[i]]);
				}
			}
			
			if (pasted.length != 0) computer.resume();

			pasting = false;
		}, 5);

	} else {

		if (typeof(code) != "undefined") {
			computer.eventStack.push(["key", parseInt(code)]);
			pushedSomething = true;
		}

		if (typeof(character) != "undefined") {
			computer.eventStack.push(["char", character]);
			pushedSomething = true;
		}

		if (pushedSomething) {
			computer.resume();
		}

		if (!pasting) event.preventDefault();

	}
}


window.onkeyup = function(event) {

}



//  ------------------------
//    Mouse Events
//  ------------------------


window.onmousedown = function(event) {
	if (gui.selected != -1 || gui.popupOpen) {
		return;
	}

	mouseDown = true;

	var computer = core.getActiveComputer();

	var loc = getCanvasLocation();
	var button = globals.buttons["click " + event.button] + 1;
	var x = Math.floor((event.pageX - config.borderWidth - loc.x) / config.cellWidth) + 1;
	var y = Math.floor((event.pageY - config.borderHeight - loc.y) / config.cellHeight) + 1;
	if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
		computer.eventStack.push(["mouse_click", button, x, y]);
		computer.resume();
	}
}


window.onmouseup = function(event) {
	mouseDown = false;
}


window.onmousemove = function(event) {
	if (gui.selected != -1 || gui.popupOpen) {
		return;
	}

	var computer = core.getActiveComputer();

	var loc = getCanvasLocation();
	var x = Math.floor((event.pageX - config.borderWidth - loc.x) / config.cellWidth) + 1;
	var y = Math.floor((event.pageY - config.borderHeight - loc.y) / config.cellHeight) + 1;
	var button = globals.buttons["click " + event.button];

	if (mouseDown && (prevMouseState.button != button || prevMouseState.x != x || prevMouseState.y != y)) {
		if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
			computer.eventStack.push(["mouse_drag", button, x, y]);
			computer.resume();

			prevMouseState.button = button;
			prevMouseState.y = x;
			prevMouseState.x = y;
		}
	}
}
