
//  
//  WebCC
//  Made by 1lann and GravityScore
//  


var textWidth = 12;
var textHeight = 18;

var canvas = document.getElementById("canvas");
var overlayCanvas = document.getElementById("overlay-canvas");
var ctxt = canvas.getContext("2d");
var oCtxt = overlayCanvas.getContext("2d")

ctxt.font = "16px 'minecraftia'"
oCtxt.font = "16px 'minecraftia'"
var drawText;
var drawChar;

var blinkState = true;

renderMain = function() {
	drawChar = function(x,y,char,color,bg) {
		if (!((x < 1) || (y < 1))) {
			var spacing = {",":3, "l":3, ".":3, "i":5, "t":3,
				"f":2, "I":2, "!":5}
			var offset = 0;
			if (spacing[char]) {
				offset = spacing[char];
			}
			ctxt.beginPath();
			ctxt.rect(((x-1)*textWidth+4),((y-1)*textHeight+4),textWidth,textHeight)
			ctxt.fillStyle = bg;
			ctxt.fill();
			ctxt.fillStyle = color;
			ctxt.fillText(char,((x-1)*textWidth)+5+offset,((y-1)*textHeight)+18);
		}
	}
	drawText = function(x,y,text,textColor,bgColor) {
		for (var i = 0; i <= text.length-1; i++) {
			drawChar(x+i,y,text.charAt(i),textColor,bgColor)
		}
	}
	cursorBlinking = function() {
		if (cursorBlink && blinkState) {
			if (blinkState) {
				oCtxt.fillStyle = textColor;
				oCtxt.fillText("_",((cursorPos[0]-1)*textWidth)+5,((cursorPos[1]-1)*textHeight)+18);
				blinkState = false;
			}
		} else {
			oCtxt.clearRect(0,0,canvas.width,canvas.height);
			blinkState = true;
		}
	}
	setInterval(cursorBlinking,500)

	// for (var x = 0; x <= 51; x++) {
	// 	ctxt.beginPath();
	// 	ctxt.moveTo(x*textWidth+4,4);
	// 	ctxt.lineTo(x*textWidth+4,350);
	// 	ctxt.strokeStyle = "#FFF";
	// 	ctxt.stroke();
	// }
	// for (var y = 0; y <= 19; y++) {
	// 	ctxt.beginPath();
	// 	ctxt.moveTo(4,y*textHeight+4);
	// 	ctxt.lineTo(620,y*textHeight+4);
	// 	ctxt.strokeStyle = "#FFF";
	// 	ctxt.stroke();
	// }
}

var link = document.createElement('link');
var loaded = false;

// Trick from http://stackoverflow.com/questions/2635814/
var image = new Image;
image.src = "res/minecraftia-webfont.ttf";
image.onerror = function() {
	setTimeout(function() {
		loaded = true;
		document.getElementById("loading").style.display = "none";
		renderMain();
		if (typeof(main) != "undefined") {
			main();
		} else {
			drawText(1,1,"An error occured while loading ComputerCraft!","#CC4C4C","#000");
			drawText(1,2,"Check the JavaScript console for more details","#CC4C4C","#000");
		}
	}, 100);
}

