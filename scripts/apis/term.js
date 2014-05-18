
//
//  term.js
//  GravityScore and 1lann
//



var termHelpers = {};
var termAPI = {};



//
//    Writing
//


termHelpers.luaValueToString = function(L) {
	var type = C.lua_type(L, 1);
	var str;

	if (type == C.LUA_TSTRING) {
		str = C.lua_tostring(L, 1);
	} else if (type == C.LUA_TBOOLEAN) {
		if (C.lua_toboolean(L, 1)) {
			str = "true";
		} else {
			str = "false";
		}
	} else if (type == C.LUA_TNUMBER) {
		str = C.lua_tonumber(L, 1) + "";
	} else {
		str = "";
	}

	str = str.replace("\n", " ");
	return str;
}


termAPI.write = function(L) {
	var computer = core.getActiveComputer();
	var str = termHelpers.luaValueToString(L);

	var x = computer.cursor.x;
	var y = computer.cursor.y;
	var fg = computer.colors.foreground;
	var bg = computer.colors.background;

	render.text(x, y, str, fg, bg);

	computer.cursor.x += str.length;
	render.cursorBlink();

	return 0;
}


termAPI.clear = function(L) {
	var computer = core.getActiveComputer();
	render.clear(computer.colors.foreground, computer.colors.background);

	return 0;
}


termAPI.clearLine = function(L) {
	var computer = core.getActiveComputer();
	var fg = computer.colors.foreground;
	var bg = computer.colors.background;
	render.text(1, computer.cursor.y, " ".repeat(computer.width), fg, bg);

	return 0;
}



//
//    Cursor
//


termAPI.setCursorPos = function(L) {
	var computer = core.getActiveComputer();
	var x = C.luaL_checkint(L, 1);
	var y = C.luaL_checkint(L, 2);

	computer.cursor.x = x;
	computer.cursor.y = y;
	if (core.cursorFlash) {
		render.cursorBlink();
	}

	return 0;
}


termAPI.getCursorPos = function(L) {
	var computer = core.getActiveComputer();
	C.lua_pushnumber(L, computer.cursor.x);
	C.lua_pushnumber(L, computer.cursor.y);
	return 2;
}


termAPI.setCursorBlink = function(L) {
	var computer = core.getActiveComputer();

	if (C.lua_isboolean(L, 1)){
		computer.cursor.blink = C.lua_toboolean(L, 1);
		if (!computer.cursor.blink) {
			overlayContext.clearRect(0, 0, overlayContext.width, overlayContext.height);
		}
	} else {
		C.lua_pushstring(L, "Expected boolean");
		C.lua_error(L);
	}

	return 0;
}



//
//    Colors
//


termAPI.setTextColor = function(L) {
	var computer = core.getActiveComputer();
	var color = C.luaL_checkint(L, 1);
	var hex = 15 - (Math.log(color) / Math.log(2));
	computer.colors.foreground = hex.toString(16);

	return 0;
}


termAPI.setBackgroundColor = function(L) {
	var computer = core.getActiveComputer();
	var color = C.luaL_checkint(L, 1);
	var hex = 15 - (Math.log(color) / Math.log(2));
	computer.colors.background = hex.toString(16);

	return 0;
}


termAPI.isColor = function(L) {
	var computer = core.getActiveComputer();
	C.lua_pushboolean(L, computer.advanced ? 1 : 0);

	return 1;
}


termAPI.isColour = termAPI.isColor;
termAPI.setTextColour = termAPI.setTextColor;
termAPI.setBackgroundColour = termAPI.setBackgroundColor;



//
//    Information
//


termAPI.getSize = function(L) {
	var computer = core.getActiveComputer();
	C.lua_pushnumber(L, computer.width);
	C.lua_pushnumber(L, computer.height);

	return 2;
}



//
//    Scrolling
//


termAPI.scroll = function(L) {
	var computer = core.getActiveComputer();
	var amount = C.luaL_checkint(L, 1);

	var imageData = context.getImageData(
		config.borderWidth,
		config.borderHeight,
		canvas.width - config.borderWidth * 2,
		canvas.height - config.borderHeight * 2
	);

	var offset = config.cellHeight * -amount + config.borderHeight;
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.putImageData(imageData, config.borderWidth, offset);

	var fg = computer.colors.foreground;
	var bg = computer.colors.background;

	if (amount < 0) {
		for (var i = amount; i < 0; i++) {
			render.clearLine(-i, fg, bg);
		}
	} else {
		for (var i = 0; i < amount; i++) {
			render.clearLine(computer.height - i, fg, bg);
		}
	}

	render.border();

	return 0;
}
