
//  
//  WebCC
//  Made by 1lann and GravityScore
//  


var canvas = document.getElementById("canvas");
var overlayCanvas = document.getElementById("overlay-canvas");

var context = canvas.getContext("2d");
var overlayContext = overlayCanvas.getContext("2d");

context.font = "16px 'minecraftia'";
overlayContext.font = "16px 'minecraftia'";

var blinkState = true;

var letterOffsets = {", ": 3, "l": 3, ".": 3, "i": 5, "t": 3, "f": 2, "I": 2, "!": 5};


drawChar = function(x, y, char, color, bg) {
	if (x >= 1 && y >= 1 && x <= config.width && y <= config.height) {
		var offset = 0;
		if (typeof(letterOffsets[char]) != "undefined") {
			offset = letterOffsets[char];
		}

		var realX = ((x - 1) * config.cellWidth + config.borderWidth);
		var realY = ((y - 1) * config.cellHeight + config.borderHeight);

		context.beginPath();
		context.rect(realX, realY, config.cellWidth, config.cellHeight)
		context.fillStyle = bg;
		context.fill();
		context.fillStyle = color;
		context.fillText(char, ((x - 1) * config.cellWidth) + config.borderWidth + 1 + offset, ((y - 1) * config.cellHeight) + 18);
	}
}

drawText = function(x, y, text, textColor, bgColor) {
	for (var i = 0; i <= text.length - 1; i++) {
		drawChar(x + i, y, text.charAt(i), textColor, bgColor)
	}
}

cursorBlinking = function() {
	if (cursorBlink && blinkState) {
		overlayContext.fillStyle = textColor;
		overlayContext.fillText("_", ((cursorPos[0] - 1) * config.cellWidth) + config.borderWidth + 1, ((cursorPos[1] - 1) * config.cellHeight) + 18);
		blinkState = false;
	} else {
		overlayContext.clearRect(0, 0, canvas.width, canvas.height);
		blinkState = true;
	}
}

render = function() {
	setInterval(cursorBlinking, 500);
}

var loaded = false;
var image = new Image();

image.src = "res/minecraftia-webfont.ttf";

image.onerror = function() {
	setTimeout(function() {
		loaded = true;

		document.getElementById("loading").setAttribute("style", "display: none;");

		render();
		if (typeof(main) != "undefined") {
			main();
		} else {
			drawText(1, 1, "An error occured while loading ComputerCraft!", "#CC4C4C", "#000000");
			drawText(1, 2, "Check the JavaScript console for more details", "#CC4C4C", "#000000");
		}
	}, 100);
}
