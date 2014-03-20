
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var termAPI = {};


termAPI.write = function(L) {
	var str = "";

	var t = C.lua_type(L, 1);
	if (t == C.LUA_TSTRING) {
		str = C.lua_tostring(L, 1);
	} else if (t == C.LUA_TBOOLEAN) {
		if (C.lua_toboolean(L, 1)) {
			str = "true";
		} else {
			str = "false";
		}
	} else if (t == C.LUA_TNUMBER) {
		str = C.lua_tonumber(L, 1)+"";
	} else {
		str = "";
	}

	str.replace("\n", " ");
	render.text(term.cursorX, term.cursorY, str, term.textColor, term.backgroundColor);
	term.cursorX += str.length;
	render.cursorBlink();

	return 0;
}


termAPI.clear = function(L) {
	for (var i = 1; i <= term.height; i++) {
		render.text(1, i, " ".repeat(term.width), "0", term.backgroundColor);
	}
	return 0;
}


termAPI.clearLine = function(L) {
	render.text(1, term.cursorY, " ".repeat(term.width), "0", term.backgroundColor);
	return 0;
}


termAPI.setCursorPos = function(L) {
	var x = C.luaL_checkint(L, 1);
	var y = C.luaL_checkint(L, 2);

	term.cursorX = x;
	term.cursorY = y;
	if (term.cursorFlash) {
		render.cursorBlink();
	}

	return 0;
}


termAPI.getCursorPos = function(L) {
	C.lua_pushnumber(L, term.cursorX);
	C.lua_pushnumber(L, term.cursorY);
	return 2;
}


termAPI.setCursorBlink = function(L) {
	if (C.lua_isboolean(L, 1)){
		term.cursorBlink = C.lua_toboolean(L, 1);
		if (!term.cursorBlink) {
			overlayContext.clearRect(0, 0, overlayContext.width, overlayContext.height);
		}
	} else {
		C.lua_pushstring(L, "Expected boolean");
		C.lua_error(L);
	}
	return 0;
}


termAPI.setTextColor = function(L) {
	var color = C.luaL_checkint(L, 1);
	var hex = 15 - (Math.log(color) / Math.log(2));
	term.textColor = hex.toString(16);
	return 0;
}


termAPI.setBackgroundColor = function(L) {
	var color = C.luaL_checkint(L, 1);
	var hex = 15 - (Math.log(color) / Math.log(2));
	term.backgroundColor = hex.toString(16);
	return 0;
}


termAPI.isColor = function(L) {
	// Black and white: Coming soon!
	C.lua_pushboolean(L, 1);
	return 1;
}


termAPI.getSize = function(L) {
	C.lua_pushnumber(L, term.width);
	C.lua_pushnumber(L, term.height);
	return 2;
}


termAPI.scroll = function(L) {
	var amount = C.luaL_checkint(L, 1);
	var imageData = context.getImageData(config.borderWidth, config.borderHeight, 
		canvas.width - config.borderWidth * 2, 
		canvas.height - config.borderHeight * 2);

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.putImageData(imageData, config.borderWidth, config.cellHeight * (amount - 1) * -1 + config.borderHeight);

	context.beginPath();
	context.rect(0, 0, canvas.width, config.borderHeight);
	context.fillStyle = "#000000";
	context.fill();

	return 0;
}


termAPI["isColour"] = termAPI["isColor"];
termAPI["setTextColour"] = termAPI["setTextColor"];
termAPI["setBackgroundColour"] = termAPI["setBackgroundColor"];
