
//
//  event.js
//  GravityScore and 1lann
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



//
//    Key Events
//


events.paste = function(computer) {
	events.pasting = true;

	var captureField = $("#mobile-input");
	captureField.val("");
	captureField.focus();

	setTimeout(function() {
		var pasted = captureField.val();
		captureField.val(">");

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

		captureField.blur();

		if (pasted.length > 0) {
			computer.resume();
		}

		events.pasting = false;
	}, 20);
}


events.activateTrigger = function(computer, character) {
	var triggerDuration = 1000;
	var triggers = {
		"r": computer.reboot,
		"s": computer.shutdown,
		"t": computer.terminate,
	};

	for (var triggerKey in triggers) {
		if (character == triggerKey) {
			var func = triggers[triggerKey];

			events.triggerKey = character;
			events.triggerKeyTimerID = setTimeout(function() {
				func.call(computer);
				events.triggerKeyTimerID = null;
			}, triggerDuration);
		}
	}
}


events.pushKey = function(computer, character, code) {
	if (typeof(code) != "undefined") {
		computer.eventStack.push(["key", code]);
	} if (typeof(character) != "undefined") {
		computer.eventStack.push(["char", character]);
	}

	if (computer.eventStack.length > 0) {
		computer.resume();
	}
}


window.onkeydown = function(event) {
	if (sidebar.typeOfSelected() != "computer" || isTouchDevice()) {
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
	if (event.shiftKey || CapsLock.isOn()) {
		character = globals.characters.shift[event.keyCode];
	}

	var shouldActivateTrigger = event.ctrlKey && character && !events.triggerKeyTimerID;
	var shouldPaste =
		(event.ctrlKey || event.metaKey) &&
		character &&
		character.toLowerCase() == "v";

	if (shouldPaste) {
		events.paste(computer);
	} else if (shouldActivateTrigger) {
		events.activateTrigger(computer, character);
	} else if (!events.triggerKeyTimerID) {
		events.pushKey(computer, character, code);
	}

	var shouldCancelKey =
		event.keyCode == 8 ||
		event.keyCode == 86 ||
		event.keyCode == 9;

	if (!events.pasting && shouldCancelKey) {
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



//
//    Mouse Events
//


window.onmousedown = function(event) {
	if (sidebar.typeOfSelected() != "computer") {
		return;
	}

	events.mouseDown = true;

	var computer = core.getActiveComputer();

	if (typeof(computer) != "undefined") {
		var loc = computer.getLocation();
		var button = globals.buttons[event.button];
		var x, y;
		var size = computer.getActualSize();
		var ratio = size.height / size.width;

		var localised = {
			"x": (event.pageX - config.borderWidth - loc.x),
			"y": (event.pageY - config.borderHeight - loc.y),
			"w": (config.cellWidth * (window.innerWidth / size.width)),
			"h": (config.cellHeight * (window.innerWidth * ratio / size.height)),
		}

		if ((window.innerWidth < size.width) || (window.innerWidth * ratio < size.height)) {
			x = Math.floor(localised.x / localised.w) + 1;
			y = Math.floor(localised.y / localised.h) + 1;
		} else {
			x = Math.floor(localised.x / (config.cellWidth)) + 1;
			y = Math.floor(localised.y / (config.cellHeight)) + 1;
		}

		if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
			computer.eventStack.push(["mouse_click", button, x, y]);
			computer.resume();
		}

		event.preventDefault();
	}
}


window.onmouseup = function(event) {
	events.mouseDown = false;
}


window.onmousemove = function(event) {
	if (sidebar.typeOfSelected() != "computer") {
		return;
	}

	var computer = core.getActiveComputer();

	if (typeof(computer) != "undefined") {
		var loc = computer.getLocation();

		var localised = {
			"x": (event.pageX - config.borderWidth - loc.x),
			"y": (event.pageY - config.borderHeight - loc.y),
		}

		var x = Math.floor(localised.x / config.cellWidth) + 1;
		var y = Math.floor(localised.y / config.cellHeight) + 1;
		var button = globals.buttons[event.button];

		var withinBounds = (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height);
		var differentFromPrevious =
			events.prevMouseState.button != button ||
			events.prevMouseState.x != x ||
			events.prevMouseState.y != y;

		if (events.mouseDown && differentFromPrevious && withinBounds) {
			computer.eventStack.push(["mouse_drag", button, x, y]);
			computer.resume();

			events.prevMouseState.button = button;
			events.prevMouseState.x = x;
			events.prevMouseState.y = y;
		}
	}
}



//
//    Mobile Input
//


isTouchDevice = function() {
	return !!('ontouchstart' in window);
}


events.onMobileInput = function() {
	if (!isTouchDevice()) {
		return;
	}

	var input = $("#mobile-input");
	var computer = core.getActiveComputer();

	if (typeof(computer) != "undefined") {
		if (input.val().length < 1) {
			input.val(">");

			computer.eventStack.push(["key", 14]);
			computer.resume();
		} else {
			var text = input.val().substring(1);
			input.val(">");

			var pushedSomething = false;
			for (var i = 0; i < text.length; i++) {
				var letter = text[i];
				var code = globals.keyCodes[parseInt(globals.charCodes[letter])];

				if (typeof(code) != "undefined") {
					computer.eventStack.push(["key", code]);
					pushedSomething = true;
				}

				if (typeof(letter) != "undefined") {
					computer.eventStack.push(["char", letter]);
					pushedSomething = true;
				}
			}

			if (pushedSomething) {
				computer.resume();
			}
		}
	}
}


events.onMobileSubmit = function(event) {
	if (!isTouchDevice()) {
		return;
	}

	event.preventDefault();

	var input = $("#mobile-input");
	input.val(">");

	var computer = core.getActiveComputer();
	if (typeof(computer) != "undefined") {
		computer.eventStack.push(["key", 28]);
		computer.resume();
	}
}


$("#overlay-canvas").click(function() {
	if (!isTouchDevice()) {
		return;
	}

	$("#mobile-input").focus();
});


var input = $("#mobile-input");
input.val(">");
input.bind("input", events.onMobileInput);

var form = $("#mobile-form");
form.submit(events.onMobileSubmit);



//
//   Scrolling
//


var compoundScroll = 0;


events.onmousewheel = function(e) {
	var e = window.event || e;
	var delta = e.wheelDelta || -e.detail * 10

	if (!delta) {
		return true;
	}

	var computer = core.getActiveComputer();
	if (!computer) {
		return;
	}

	var loc = computer.getLocation();
	var x = Math.floor((e.pageX - config.borderWidth - loc.x) / config.cellWidth) + 1;
	var y = Math.floor((e.pageY - config.borderHeight - loc.y) / config.cellHeight) + 1;

	if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
		compoundScroll += delta;

		var amount = Math.abs(Math.round(compoundScroll / 100));
		if (amount != 0) {
			if (Math.ceil(compoundScroll / 100) < 0) {
				for (var i = 0; i <= amount; i++) {
					computer.eventStack.push(["mouse_scroll", 1, x, y]);
				}
			} else {
				for (var i = 0; i <= Math.round(compoundScroll / 100); i++) {
					computer.eventStack.push(["mouse_scroll", -1, x, y]);
				}
			}
		}

		compoundScroll = compoundScroll % 100;
		computer.resume();

		e.preventDefault();
	}
}


if (window.addEventListener) {
	window.addEventListener("mousewheel", events.onmousewheel, false);
	window.addEventListener("DOMMouseScroll", events.onmousewheel, false);
} else {
	window.attachEvent("onmousewheel", events.onmousewheel);
}