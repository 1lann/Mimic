
//
//  event.js
//  Event handling functions that are passed to the current computer
//
//  Mimic
//  1lann and GravityScore
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

	if (isTouchDevice()) {
		return;
	}

	var code = parseInt(globals.keyCodes[event.keyCode]);
	var character = globals.characters.noshift[event.keyCode];
	if (event.shiftKey) {
		character = globals.characters.shift[event.keyCode];
	}

	if ((event.ctrlKey || event.metaKey) && character && character.toLowerCase() == "v") {
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
		var x, y;
		var size = computer.getActualSize();
		var ratio = size.height / size.width;

		if ((window.innerWidth < size.width) || (window.innerWidth * ratio < size.height)) {
			x = Math.floor((event.pageX - config.borderWidth - loc.x) / (config.cellWidth * (window.innerWidth / size.width))) + 1;
			y = Math.floor((event.pageY - config.borderHeight - loc.y) / (config.cellHeight * (window.innerWidth * ratio / size.height))) + 1;
		} else {
			x = Math.floor((event.pageX - config.borderWidth - loc.x) / (config.cellWidth)) + 1;
			y = Math.floor((event.pageY - config.borderHeight - loc.y) / (config.cellHeight)) + 1;
		}

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
			events.prevMouseState.x = x;
			events.prevMouseState.y = y;
		}
	}
}



//  ------------------------
//    Mobile Input
//  ------------------------


$("#mobile-input").val(">");
$("#mobile-input").caret(-1);


isTouchDevice = function() {
	return !!('ontouchstart' in window);
}


$("#mobile-input").bind("input", function() {
	var mobileInput = $(this);

	if (!isTouchDevice()) {
		return;
	}

	var computer = core.getActiveComputer();

	if (mobileInput.val().length < 1) {
    	mobileInput.val(">");
		mobileInput.caret(-1);

		computer.eventStack.push(["key", 14]);
		computer.resume();
	} else if ($(this).val() != ">") {
		var textInput = mobileInput.val().substring(1);
		mobileInput.val(">");
		mobileInput.caret(-1);

		for (var i = 0; i < textInput.length; i++) {
			var letter = textInput[i];
			var keyCode = parseInt(globals.charCodes[letter]);
			var code = globals.keyCodes[keyCode];

			if (typeof(code) != "undefined") {
				computer.eventStack.push(["key", code]);
			}

			if (typeof(letter) != "undefined") {
				computer.eventStack.push(["char", letter]);
			}
		}

		computer.resume();
	}
});


$("#mobile-form").submit(function(event) {
	event.preventDefault();
	if (!isTouchDevice()) {
		return;
	}

	var computer = core.getActiveComputer();
	var mobileInput = $("#mobile-input");

	mobileInput.val(">");
	mobileInput.caret(-1);

	computer.eventStack.push(["key", 28]);
	computer.resume();
});



// ------------------------
//   Scrolling
// ------------------------


var compoundScroll = 0;


onmousewheel = function(e) {
	var e = window.event || e;
	var delta = e.wheelDelta || -e.detail * 10

	if (!delta) {
		return true;
	}

	var computer = core.getActiveComputer();

	if (computer) {
		var loc = computer.getLocation();
		var x = Math.floor((e.pageX - config.borderWidth - loc.x) / config.cellWidth) + 1;
		var y = Math.floor((e.pageY - config.borderHeight - loc.y) / config.cellHeight) + 1;

		if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
			compoundScroll += delta;

			if (Math.abs(Math.round(compoundScroll / 100)) != 0) {
				if (Math.ceil(compoundScroll / 100) < 0) {
					for (var i = 0; i <= Math.abs(Math.round(compoundScroll / 100)); i++) {
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
}


if (window.addEventListener) {
	window.addEventListener("mousewheel", onmousewheel, false);
	window.addEventListener("DOMMouseScroll", onmousewheel, false);
} else {
	window.attachEvent("onmousewheel", onmousewheel);
}
