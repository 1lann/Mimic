
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
		var str = C.luaL_checkstring(L, 1);

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
		if (!term.cursorFlash) {
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

		var top = lua_gettop(L);
		for (var i = 1; i <= top; i++) {
			var t = lua_type(L, i);
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



//  ----------------  APIs  ----------------  //


var apis = {
	"bit": bitAPI,
	"fs": fsAPI,
	"http": httpAPI,
	"os": osAPI,
	"peripheral": peripheralAPI,
	"term": termAPI,
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
local function newLine() \
local wid, hi = term.getSize() \
local x, y = term.getCursorPos() \
if y == hi then \
  term.scroll(1) \
  term.setCursorPos(1, y) \
else \
  term.setCursorPos(1, y+1) \
end \
end \
local nativeShutdown = os.shutdown \
function os.shutdown() \
nativeShutdown() \
while true do \
  coroutine.yield() \
end \
end \
local nativeReboot = os.reboot \
function os.reboot() \
nativeReboot() \
while true do \
  coroutine.yield() \
end \
end \
local function reader() \
local data = '' \
local visibleData = '' \
local startX, startY = term.getCursorPos() \
local wid, hi = term.getSize() \
while true do \
  term.setCursorBlink(true) \
  local e, p1 = coroutine.yield() \
  if e == 'key' and p1 == 14 then \
   data = data:sub(1, -2) \
  elseif e == 'key' and p1 == 28 then \
   newLine() \
   return data \
  elseif e == 'char' then \
   data = data .. p1 \
  end \
  term.setCursorPos(startX, startY) \
  if #data+startX+1 > wid then \
   visibleData = data:sub(-1*(wid-startX-1)) \
  else \
   visibleData = data \
  end \
  term.write(visibleData .. ' ') \
  local curX, curY = term.getCursorPos() \
  term.setCursorPos(curX-1, curY) \
end \
end \
while true do \
term.setTextColor(1) \
term.setBackgroundColor(32768) \
term.write('lua> ') \
local toRun, cError = loadstring(reader(), 'error') \
if toRun then \
  setfenv(toRun, getfenv(1)) \
  local results = {pcall(toRun)} \
  term.setBackgroundColor(32768) \
  if results[1] then \
    table.remove(results,1) \
    term.write('-- Return values --') \
    for k,v in pairs(results) do \
      newLine() \
      term.write(tostring(v)) \
    end \
  else \
   if term.isColor() then \
    term.setTextColor(16384) \
   end \
   term.write(results[2]) \
  end \
else \
  if term.isColor() then \
   term.setTextColor(16384) \
  end \
  term.write(cError) \
end \
newLine() \
end \
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
