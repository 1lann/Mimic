
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var canvas = document.getElementById("canvas");
var overlayCanvas = document.getElementById("overlay-canvas");

var context = canvas.getContext("2d");
var overlayContext = overlayCanvas.getContext("2d");

var render = {};
var font;

var characters = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
var charactersPerLine = 16;
var lineYOffset = 2;



//  ----------------  Loading  ----------------  //


render.setup = function(callback) {
	font = new Image();
	font.src = "fonts/font.png";
	font.onload = callback;
}



//  ----------------  Rendering  ----------------  //


render.characterBackground = function(x, y, color, ctx) {
	if (typeof(ctx) == "undefined") {
		ctx = context;
	}

	if (x >= 1 && y >= 1 && x <= term.width && y <= term.height) {
		var cellX = ((x - 1) * config.cellWidth + config.borderWidth);
		var cellY = ((y - 1) * config.cellHeight + config.borderHeight);

		ctx.beginPath();
		ctx.rect(cellX, cellY, config.cellWidth, config.cellHeight);
		ctx.fillStyle = globals.colors[color];
		ctx.fill();
	}
}


render.characterText = function(x, y, text, color, ctx) {
	if (typeof(ctx) == "undefined") {
		ctx = context;
	}

	if (x >= 1 && y >= 1 && x <= term.width && y <= term.height) {
		var loc = characters.indexOf(text);
		if (loc != -1) {
			var imgW = font.width / 16;
			var imgH = font.height / 16 / 16;
			var startY = parseInt(color, 16) * (font.height / 16);

			var imgX = loc % charactersPerLine;
			var imgY = (loc - imgX) / charactersPerLine + lineYOffset;
			imgX *= imgW;
			imgY *= imgH;
			imgY += startY;

			var offset = imgW / 2 - globals.characterWidths[loc] / 2 - 1;

			var textX = (x - 1) * config.cellWidth + config.borderWidth + offset;
			var textY = (y - 1) * config.cellHeight + config.borderHeight + 1;

			ctx.drawImage(font, imgX, imgY, imgW, imgH, textX, textY, imgW, imgH);
		}
	}
}


render.character = function(x, y, text, foreground, background, ctx) {
	if (typeof(ctx) == "undefined") {
		ctx = context;
	}

	if (x >= 1 && y >= 1 && x <= term.width && y <= term.height) {
		if (typeof(background) != "undefined") {
			render.characterBackground(x, y, background, ctx);
		}

		if (typeof(foreground) != "undefined") {
			render.characterText(x, y, text, foreground, ctx);
		}
	}
}


render.text = function(x, y, text, foreground, background, ctx) {
	if (x >= 1 && y >= 1 && x <= term.width && y <= term.height) {
		for (var i = 0; i < text.length; i++) {
			render.character(x + i, y, text.charAt(i), foreground, background, ctx);
		}
	}
}


render.cursorBlink = function() {
	if (term.cursorBlink && term.cursorFlash) {
		overlayContext.clearRect(0, 0, canvas.width, canvas.height);
		render.text(term.cursorX, term.cursorY, "_", term.textColor, undefined, overlayContext);
	} else {
		overlayContext.clearRect(0, 0, canvas.width, canvas.height);
	}
}
