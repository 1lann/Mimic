
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
	if (x >= 1 && y >= 1) {
		var offset = 0;
		if (typeof(letterOffsets[char]) != "undefined") {
			offset = letterOffsets[char];
		}

		context.beginPath();
		context.rect(((x - 1) * config.cellWidth + 4), ((y - 1) * config.cellHeight + 4), config.cellWidth, config.cellHeight)
		context.fillStyle = bg;
		context.fill();
		context.fillStyle = color;
		context.fillText(char, ((x - 1) * config.cellWidth) + 5 + offset, ((y - 1) * config.cellHeight) + 18);
	}
}

drawText = function(x, y, text, textColor, bgColor) {
	for (var i = 0; i <= text.length - 1; i++) {
		drawChar(x + i, y, text.charAt(i), textColor, bgColor)
	}
}

cursorBlinking = function() {
	if (cursorBlink && blinkState) {
		if (blinkState) {
			overlayContext.fillStyle = textColor;
			overlayContext.fillText("_", ((cursorPos[0] - 1) * config.cellWidth) + 5, ((cursorPos[1] - 1) * config.cellHeight) + 18);
			blinkState = false;
		}
	} else {
		overlayContext.clearRect(0, 0, canvas.width, canvas.height);
		blinkState = true;
	}
}

renderMain = function() {
	setInterval(cursorBlinking, 500);
}

var link = document.createElement('link');
var loaded = false;

var image = new Image();
image.src = "res/minecraftia - webfont.ttf";

image.onerror = function() {
	setTimeout(function() {
		loaded = true;
		document.getElementById("loading").style.display = "none";
		renderMain();
		if (typeof(main) != "undefined") {
			main();
		} else {
			drawText(1, 1, "An error occured while loading ComputerCraft!", "#CC4C4C", "#000");
			drawText(1, 2, "Check the JavaScript console for more details", "#CC4C4C", "#000");
		}
	}, 100);
}

