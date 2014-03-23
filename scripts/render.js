
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



//  ------------------------
//    Setup
//  ------------------------


render.setup = function(callback) {
	font = new Image();
	font.src = "fonts/font.png";
	font.onload = function() {
		callback();
	}
}



//  ------------------------
//    Characters
//  ------------------------


render.characterBackground = function(x, y, color, ctx) {
	if (typeof(ctx) == "undefined") {
		ctx = context;
	}

	var computer = core.getActiveComputer();
	if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
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

	if (text == " ") {
		return;
	}

	var computer = core.getActiveComputer();
	if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
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

	var computer = core.getActiveComputer();
	if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
		if (typeof(background) != "undefined") {
			render.characterBackground(x, y, background, ctx);
		}

		if (typeof(foreground) != "undefined") {
			render.characterText(x, y, text, foreground, ctx);
		}
	}
}



//  ------------------------
//    Rendering
//  ------------------------


render.clear = function(foreground, background) {
	background = background || "0";
	foreground = foreground || "f";

	var computer = core.getActiveComputer();
	for (var i = 1; i <= computer.height; i++) {
		render.text(1, i, " ".repeat(computer.width), foreground, background);
	}
}


render.text = function(x, y, text, foreground, background, ctx) {
	var computer = core.getActiveComputer();
	if (x >= 1 && y >= 1 && x <= computer.width && y <= computer.height) {
		for (var i = 0; i < text.length; i++) {
			render.character(x + i, y, text.charAt(i), foreground, background, ctx);
		}
	}
}


render.textCentred = function(y, text, foreground, background, ctx) {
	var computer = core.getActiveComputer();
	var x = Math.floor(computer.width / 2 - text.length / 2);
	render.text(x, y, text, foreground, background, ctx);
}



//  ------------------------
//    Cursor
//  ------------------------


render.cursorBlink = function() {
	var computer = core.getActiveComputer();

	if (computer.cursor.blink && core.cursorFlash) {
		overlayContext.clearRect(0, 0, canvas.width, canvas.height);
		render.text(computer.cursor.x, computer.cursor.y, "_", computer.colors.foreground, undefined, overlayContext);
	} else {
		overlayContext.clearRect(0, 0, canvas.width, canvas.height);
	}
}



//  ------------------------
//    Displays
//  ------------------------


render.bsod = function(title, lines) {
	render.clear("f", "4");

	var computer = core.getActiveComputer();
	computer.cursor.blink = false;
	render.cursorBlink();

	render.textCentred(5, title, "f", "4");

	console.log(lines);

	for (var i in lines) {
		var line = lines[i];
		render.textCentred(9 + parseInt(i), line, "f", "4");
	}
}
