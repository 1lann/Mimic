
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var events = {
	"prevMouseState": {
		"x": -1,
		"y": -1,
		"button": -1,
	},

	"mouseDown": false,
	"pasting": false,
	"triggerKeyTimerID": null,
	"triggerKey": null,
};



//  ------------------------
//    Key Events
//  ------------------------


window.onkeydown = function(event) {
	if (!gui.computerSelected || gui.popupOpen) {
		return;
	}

	var computer = core.getActiveComputer();
	if (typeof(computer) == "undefined") {
		return;
	}

	if (computer.hasErrored && event.keyCode == 13) {
		computer.reboot();
		return;
	}

	var code = parseInt(globals.keyCodes[event.keyCode]);
	var character = globals.characters.noshift[event.keyCode];
	if (event.shiftKey) {
		character = globals.characters.shift[event.keyCode];
	}

	if ((event.ctrlKey || event.metaKey) && character && character.toLowerCase() == "v") {
		events.pasting = true;

		var captureField = $("#paste-capture");
		captureField.focus();

		setTimeout(function() {
			var pasted = captureField.val();
			captureField.val("");

			for (var i = 0; i < pasted.length; i++) {
				var letter = pasted[i];
				var keyCode = parseInt(globals.charCodes[letter]);
				var code = globals.keyCodes[keyCode];

				if (typeof(code) != "undefined") {
					computer.eventStack.push(["key", code]);
				}

				if (typeof(letter) != "undefined") {
					computer.eventStack.push(["char", letter]);
				}
			}
			
			if (pasted.length > 0) {
				computer.resume();
			}

			events.pasting = false;
		}, 10);
	} else if (event.ctrlKey && character && character == "r" && !events.triggerKeyTimerID) {
		events.triggerKeyTimerID = setTimeout(function() {
			computer.reboot();
			events.triggerKeyTimerID = null;
		}, 1000);

		events.triggerKey = "r";
	} else if (event.ctrlKey && character && character == "s" && !events.triggerKeyTimerID) {
		events.triggerKeyTimerID = setTimeout(function() {
			computer.shutdown();
			events.triggerKeyTimerID = null;
		}, 1000);

		events.triggerKey = "s";
	} else if (event.ctrlKey && character && character == "t" && !events.triggerKeyTimerID) {
		events.triggerKeyTimerID = setTimeout(function() {
			computer.terminate();
			events.triggerKeyTimerID = null;
		}, 1000);

		events.triggerKey = "t";
	} else if (!events.triggerKeyTimerID) {
		var pushedSomething = false;

		if (typeof(code) != "undefined") {
			computer.eventStack.push(["key", code]);
			pushedSomething = true;
		}

		if (typeof(character) != "undefined") {
			computer.eventStack.push(["char", character]);
			pushedSomething = true;
		}

		if (pushedSomething) {
			computer.resume();
		}
	}

	if (!events.pasting && (event.keyCode == 8 || event.keyCode == 86 || event.keyCode == 9)) {
		event.preventDefault();
	}
}


window.onkeyup = function(event) {
	var character = globals.characters.noshift[event.keyCode];

	if (events.triggerKeyTimerID && character == events.triggerKey) {
		clearTimeout(events.triggerKeyTimerID);
		events.triggerKeyTimerID = null;
	}
}



//  ------------------------
//    Mouse Events
//  ------------------------


window.onmousedown = function(event) {
	if (!gui.computerSelected || gui.popupOpen) {
		return;
	}

	events.mouseDown = true;

	var computer = core.getActiveComputer();

	if (typeof(computer) != "undefined") {
		var loc = computer.getLocation();
		var button = globals.buttons["click " + event.button] + 1;
		var x = Math.floor((event.pageX - config.borderWidth - loc.x) / config.cellWidth) + 1;
		var y = Math.floor((event.pageY - config.borderHeight - loc.y) / config.cellHeight) + 1;
		if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
			computer.eventStack.push(["mouse_click", button, x, y]);
			computer.resume();
		}
	}
}


window.onmouseup = function(event) {
	events.mouseDown = false;
}


window.onmousemove = function(event) {
	if (!gui.computerSelected || gui.popupOpen) {
		return;
	}

	var computer = core.getActiveComputer();

	if (typeof(computer) != "undefined") {
		var loc = computer.getLocation();
		var x = Math.floor((event.pageX - config.borderWidth - loc.x) / config.cellWidth) + 1;
		var y = Math.floor((event.pageY - config.borderHeight - loc.y) / config.cellHeight) + 1;
		var button = globals.buttons["click " + event.button];

		if (events.mouseDown
				&& (events.prevMouseState.button != button || events.prevMouseState.x != x || events.prevMouseState.y != y)
				&& (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height)) {
			computer.eventStack.push(["mouse_drag", button, x, y]);
			computer.resume();

			events.prevMouseState.button = button;
			events.prevMouseState.y = x;
			events.prevMouseState.x = y;
		}
	}
}
