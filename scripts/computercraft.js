
//  
//  WebCC
//  Made by 1lann and GravityScore
//  


String.prototype.repeat = function(num) {
	return new Array(num + 1).join(this);
}


// Version
var version = "CraftOS 1.5 (Web Alpha)";


// Lua State
var C = Lua5_1.C;
var L = C.lua_open();


// Thread
var thread = {
	"main": null,
	"alive": false,
};


// Term variables
var term = {
	"width": 51,
	"height": 19,
	"cursorX": 1,
	"cursorY": 1,
	"textColor": "#ffffff",
	"backgroundColor": "#000000",
	"cursorBlink": false,
	"cursorFlash": true,
};


// OS
var computer = {
	"id": 0,
	"label": null,

	"eventStack": [],
	"lastTimerID": 0,
};

var startClock;



//  ----------------  Term API  ----------------  //


var termAPI = {

	"write": function(L) {
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

		render.text(term.cursorX, term.cursorY, str, term.textColor, term.backgroundColor);
		term.cursorX += str.length;
		render.cursorBlink();

		return 0;
	},

	"clear": function(L) {
		for (var i = 1; i <= term.height; i++) {
			render.text(1, i, " ".repeat(term.width), "#000000", term.backgroundColor);
		}
		return 0;
	},

	"clearLine": function(L) {
		render.text(1, term.cursorY, " ".repeat(term.width), "#000000", term.backgroundColor);
		return 0;
	},

	"setCursorPos": function(L) {
		var x = C.luaL_checkint(L, 1);
		var y = C.luaL_checkint(L, 2);

		term.cursorX = x;
		term.cursorY = y;
		if (term.cursorFlash) {
			render.cursorBlink();
		}

		return 0;
	},

	"getCursorPos": function(L) {
		C.lua_pushnumber(L, term.cursorX);
		C.lua_pushnumber(L, term.cursorY);
		return 2;
	},

	"setCursorBlink": function(L) {
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
	},

	"setTextColor": function(L) {
		// Not properly supported
		var color = C.luaL_checkint(L, 1);
		var hex = 15 - (Math.log(color) / Math.log(2));
		term.textColor = globals.colors[hex.toString(16)];
		return 0;
	},

	"setBackgroundColor": function(L) {
		// Not properly supported
		var color = C.luaL_checkint(L, 1);
		var hex = 15 - (Math.log(color) / Math.log(2));
		term.backgroundColor = globals.colors[hex.toString(16)];
		return 0;
	},

	"isColor": function(L) {
		// Black and white: Coming soon!
		C.lua_pushboolean(L, 1);
		return 1;
	},

	"getSize": function(L) {
		C.lua_pushnumber(L, term.width);
		C.lua_pushnumber(L, term.height);
		return 2;
	},

	"scroll": function(L) {
		var amount = C.luaL_checkint(L, 1);
		var imageData = context.getImageData(4, 4, canvas.width - 8, canvas.height - 8);

		context.clearRect(0, 0, canvas.width, canvas.height);
		context.putImageData(imageData, 4, config.cellHeight * amount * -1 + 4);
		return 0;
	},

};

termAPI["isColour"] = termAPI["isColor"];
termAPI["setTextColour"] = termAPI["setTextColor"];
termAPI["setBackgroundColour"] = termAPI["setBackgroundColor"];



//  ----------------  OS API  ----------------  //


var osAPI = {

	"setAlarm": function(L) {

	},

	"getComputerID": function(L) {
		C.lua_pushnumber(L, tempID);
		return 1;
	},

	"getComputerLabel": function(L) {
		if (label) {
			C.lua_pushstring(L, label);
			return 1;
		} else {
			return 0;
		}
	},

	"setComputerLabel": function(L) {
		var str = C.luaL_checkstring(L, 1);
		label = str;
		return 0;
	},

	"clock": function(L) {
		var diff = Date.now() - startClock;
		var retDiff = Math.round(diff * 0.1) / 100;
		C.lua_pushnumber(L, retDiff);
		return 1;
	},

	"time": function(L) {
		C.lua_pushstring(L, "Time not supported!");
		C.lua_error(L);
		return 0;
	},

	"day": function(L) {

	},

	"startTimer": function(L) {
		var time = C.luaL_checknumber(L, 1);
		computer.lastTimerID++;

		var timerID = computer.lastTimerID;
		setTimeout(function() {
			computer.eventStack.push(["timer", timerID]);
			resumeThread();
		}, time * 1000);
		C.lua_pushnumber(L, timerID);

		return 1;
	},

	"queueEvent": function(L) {
		var queueObject = [];
		queueObject.push(C.luaL_checkstring(L, 1));

		var top = C.lua_gettop(L);
		for (var i = 1; i <= top; i++) {
			var t = C.lua_type(L, i);
			if (t == C.LUA_TSTRING) {
				queueObject.push(C.lua_tostring(L, i));
			} else if (t == C.LUA_TBOOLEAN) {
				if (C.lua_toboolean(L, i)) {
					queueObject.push(true);
				} else {
					queueObject.push(false);
				}
			} else if (t == C.LUA_TNUMBER) {
				queueObject.push(C.lua_tonumber(L, i));
			} else {
				queueObject.push(null);
			}
		}

		computer.eventStack.push(queueObject);
		return 0;
	},

	"shutdown": function(L) {

	},

	"reboot": function(L) {

	},

};

osAPI["computerLabel"] = osAPI["getComputerLabel"];
osAPI["computerID"] = osAPI["getComputerID"];



//  ----------------  HTTP API  ----------------  //


var httpAPI = {

	"request": function(L) {

	},

};



//  ----------------  FS API  ----------------  //


var fsAPI = {

	"list": function(L) {

	},

	"combine": function(L) {

	},

	"getName": function(L) {

	},

	"getSize": function(L) {

	},

	"exists": function(L) {

	},

	"isDir": function(L) {

	},

	"isReadOnly": function(L) {

	},

	"makeDir": function(L) {

	},

	"move": function(L) {

	},

	"copy": function(L) {

	},

	"delete": function(L) {

	},

	"open": function(L) {

	},

	"getDrive": function(L) {

	},

	"getFreeSpace": function(L) {

	},

};



//  ----------------  Bit API  ----------------  //


var bitAPI = {

	"bnot": function(L) {

	},

	"band": function(L) {

	},

	"bor": function(L) {

	},

	"bxor": function(L) {

	},

	"brshift": function(L) {

	},

	"blshift": function(L) {

	},

	"blogic_rshift": function(L) {

	},

};



//  ----------------  Peripheral API  ----------------  //


var peripheralAPI = {

	"isPresent": function(L) {

	},

	"getType": function(L) {

	},

	"getMethods": function(L) {

	},

	"call": function(L) {

	},

};

var coroutineAPI = {
	"yield": function() {
		return C.lua_yield(thread.main);
	}
}


//  ----------------  APIs  ----------------  //


var apis = {
	"bit": bitAPI,
	"fs": fsAPI,
	"http": httpAPI,
	"os": osAPI,
	"peripheral": peripheralAPI,
	"term": termAPI,
	"boroutine": coroutineAPI
};


var loadAPIs = function() {
	C.luaL_openlibs(L);

	for (var api in apis) {
		if (typeof(apis[api]) == "function") {
			C.lua_pushcfunction(L, Lua5_1.Runtime.addFunction(apis[api]));
			C.lua_setfield(L, 1, api)
		} else {
			C.lua_newtable(L);
			for (var key in apis[api]) {
				C.lua_pushcfunction(L, Lua5_1.Runtime.addFunction(apis[api][key]));
				C.lua_setfield(L, 1, key)
			}
			C.lua_setglobal(L, api);
		}
	}
}



//  ----------------  Main  ----------------  //


var code = "\
xpcall = function( _fn, _fnErrorHandler ) \n\
	local typeT = type( _fn ) \n\
	assert( typeT == 'function', 'bad argument #1 to xpcall (function expected, got '..typeT..')' ) \n\
	local co = coroutine.create( _fn ) \n\
	local tResults = { coroutine.resume( co ) } \n\
	while coroutine.status( co ) ~= 'dead' do \n\
		tResults = { coroutine.resume( co, coroutine.yield() ) } \n\
	end \n\
	if tResults[1] == true then \n\
		return true, unpack( tResults, 2 ) \n\
	else \n\
		return false, _fnErrorHandler( tResults[2] ) \n\
	end \n\
end \n\
pcall = function( _fn, ... ) \n\
	local typeT = type( _fn ) \n\
	assert( typeT == 'function', 'bad argument #1 to pcall (function expected, got '..typeT..')' ) \n\
	local tArgs = { ... } \n\
	return xpcall(  \n\
		function() \n\
			return _fn( unpack( tArgs ) ) \n\
		end, \n\
		function( _error ) \n\
			return _error \n\
		end \n\
	) \n\
end \n\
local function newLine() \n\
local wid, hi = term.getSize() \n\
local x, y = term.getCursorPos() \n\
if y == hi then \n\
  term.scroll(1) \n\
  term.setCursorPos(1, y) \n\
else \n\
  term.setCursorPos(1, y+1) \n\
end \n\
end \n\
local nativeShutdown = os.shutdown \n\
function os.shutdown() \n\
nativeShutdown() \n\
while true do \n\
  coroutine.yield() \n\
end \n\
end \n\
local nativeReboot = os.reboot \n\
function os.reboot() \n\
nativeReboot() \n\
while true do \n\
  coroutine.yield() \n\
end \n\
end \n\
local function reader() \n\
local data = '' \n\
local visibleData = '' \n\
local startX, startY = term.getCursorPos() \n\
local wid, hi = term.getSize() \n\
while true do \n\
  term.setCursorBlink(true) \n\
  local e, p1 = coroutine.yield() \n\
  if e == 'key' and p1 == 14 then \n\
   data = data:sub(1, -2) \n\
  elseif e == 'key' and p1 == 28 then \n\
   newLine() \n\
   return data \n\
  elseif e == 'char' then \n\
   data = data .. p1 \n\
  end \n\
  term.setCursorPos(startX, startY) \n\
  if #data+startX+1 > wid then \n\
   visibleData = data:sub(-1*(wid-startX-1)) \n\
  else \n\
   visibleData = data \n\
  end \n\
  term.write(visibleData .. ' ') \n\
  local curX, curY = term.getCursorPos() \n\
  term.setCursorPos(curX-1, curY) \n\
end \n\
end \n\
while true do \n\
term.setTextColor(1) \n\
term.setBackgroundColor(32768) \n\
term.write('lua> ') \n\
local toRun, cError = loadstring(reader(), 'error') \n\
if toRun then \n\
  setfenv(toRun, getfenv(1)) \n\
  local results = {pcall(toRun)} \n\
  term.setBackgroundColor(32768) \n\
  if results[1] then \n\
    table.remove(results,1) \n\
    term.write('-- Return values --') \n\
    for k,v in pairs(results) do \n\
      newLine() \n\
      term.write(tostring(v)) \n\
    end \n\
  else \n\
   if term.isColor() then \n\
    term.setTextColor(16384) \n\
   end \n\
   term.write(results[2]) \n\
  end \n\
else \n\
  if term.isColor() then \n\
   term.setTextColor(16384) \n\
  end \n\
  term.write(cError) \n\
end \n\
newLine() \n\
end \n\
";


callLua = function(data) {
	C.luaL_dostring(L, data);
}


resumeThread = function() {
	if (!thread.alive) {
		return;
	}

	var threadLoop = setInterval(function() {
		if (computer.eventStack.length > 0) {
			var argumentsNumber = computer.eventStack[0].length;

			for (var index in computer.eventStack[0]) {
				var argument = computer.eventStack[0][index];
				if (typeof(argument) == "string") {
					C.lua_pushstring(thread.main, computer.eventStack[0][index]);
				} else if (typeof(argument) == "number") {
					C.lua_pushnumber(thread.main, computer.eventStack[0][index]);
				} else {
					C.lua_pushstring(thread.main, computer.eventStack[0][index].toString());
				}
			}

			computer.eventStack.splice(0, 1);

			var resp = C.lua_resume(thread.main, argumentsNumber);
			if (resp == C.LUA_YIELD) {

			} else if (resp == 0) {
				clearInterval(threadLoop);
				thread.alive = false;
				console.log("Program ended. Closing thread.");
			} else {
				console.log("Error occurred. Closing thread.")
				console.log("Error: " + C.lua_tostring(thread.main, -1));
				clearInterval(threadLoop);
				thread.alive = false;
			}
		} else {
			clearInterval(threadLoop);
		}
	}, 10);
}


var initialization = function() {
	termAPI.clear();

	var resp = C.lua_resume(thread.main, 0);
	if (resp != C.LUA_YIELD && resp != 0) {
		var errorCode = C.lua_tostring(thread.main, -1);
		var trace = C.lua_tostring(thread.main, -3);

		console.log("Intialization Error: " + errorCode);
		thread.alive = false;
		console.log("Thread closed");

		for (var i = 1; i <= term.height; i++) {
			render.text(1, i, " ".repeat(term.width), "#000000", "#0000aa");
		}

		var startPos = Math.round((term.width / 2) - ((7 + errorCode.length) / 2));
		render.text(16, 7, "FATAL : BIOS ERROR", "#0000aa", "#ffffff");
		render.text(startPos, 9, "ERROR: " + errorCode, "#ffffff", "#0000aa");

		if (trace) {
			console.log("Trace: " + trace);
			render.text(9, 11, "-- SEE CONSOLE FOR MORE DETAILS --", "#ffffff", "#0000aa");
		}
	}
}


var main = function() {
	loadAPIs();

	setInterval(function() {
		term.cursorFlash = !term.cursorFlash;
		render.cursorBlink();
	}, 500);

	startClock = Date.now();

	thread.main = C.lua_newthread(L);
	C.luaL_loadstring(thread.main, code);
	thread.alive = true;

	initialization();
};
