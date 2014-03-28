
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



//  ------------------------
//    Initialization
//  ------------------------


var Computer = function(id, advanced) {
	id = id || 0;
	advanced = advanced || true;

	this.id = id;
	this.advanced = advanced;

	this.L = C.lua_open();

	this.width = config.width;
	this.height = config.height;

	this.reset();
	this.installAPIs();
}


Computer.prototype.reset = function() {
	this.eventStack = [];
	this.lastTimerID = 0;

	this.startClock = null;
	this.coroutineClock = null;

	this.thread = null;
	this.alive = false;
	this.hasErrored = false;

	this.cursor = {};
	this.cursor.x = 1;
	this.cursor.y = 1;
	this.cursor.blink = false;

	this.colors = {};
	this.colors.background = "0";
	this.colors.foreground = "f";

	this.shouldShutdown = false;
	this.shouldReboot = false;
}



//  ------------------------
//    APIs
//  ------------------------


Computer.prototype.installAPIs = function() {
	var apis = {
		"bit": bitAPI,
		"fs": fsAPI,
		"http": httpAPI,
		"os": osAPI,
		"peripheral": peripheralAPI,
		"rs": redstoneAPI,
		"redstone": redstoneAPI,
		"term": termAPI,
	};

	Lua5_1.Runtime.functionPointers = [];
	for (var i = 1; i <= 512; i++) {
		Lua5_1.Runtime.functionPointers.push(null);
	}

	C.luaL_openlibs(this.L);

	for (var api in apis) {
		if (typeof(apis[api]) == "function") {
			C.lua_pushcfunction(this.L, Lua5_1.Runtime.addFunction(apis[api]));
			C.lua_setfield(this.L, 1, api)
		} else {
			C.lua_newtable(this.L);
			for (var key in apis[api]) {
				C.lua_pushcfunction(this.L, Lua5_1.Runtime.addFunction(apis[api][key]));
				C.lua_setfield(this.L, 1, key)
			}
			C.lua_setglobal(this.L, api);
		}
	}
}



//  ------------------------
//    Lua Thread
//  ------------------------


Computer.prototype.launch = function() {
	var executableCode = code.getAll();

	this.thread = C.lua_newthread(this.L);
	C.luaL_loadbuffer(this.thread, executableCode, executableCode.length, "bios.lua");

	this.alive = true;
	this.startClock = Date.now();
	this.coroutineClock = Date.now();

	var result = C.lua_resume(this.thread, 0);

	if (result != C.LUA_YIELD && result != 0) {
		var errorCode = C.lua_tostring(this.thread, -1);
		var trace = C.lua_tostring(this.thread, -3);

		console.log("Intialization Error: ", errorCode);
		console.log("Trace: ", trace);
		console.log("Thread closed");
		thread.alive = false;

		render.bsod("FATAL : BIOS ERROR", ["Error: " + errorCode, "Check the console for more details"]);
		this.hasErrored = true;
	}
}


Computer.prototype.resume = function() {
	var computer = this;

	var threadLoopID = setInterval(function() {
		if (!computer.alive) {
			return;
		}

		if (computer.eventStack.length > 0) {
			var argumentsNumber = computer.eventStack[0].length;

			for (var index in computer.eventStack[0]) {
				var argument = computer.eventStack[0][index];
				if (typeof(argument) == "string") {
					C.lua_pushstring(computer.thread, argument);
				} else if (typeof(argument) == "number") {
					C.lua_pushnumber(computer.thread, argument);
				} else if (typeof(argument) == "boolean") {
					C.lua_pushboolean(computer.thread, argument ? 1 : 0);
				} else if (typeof(argument) == "object") {
					C.lua_pushstring(computer.thread, core.serializeTable(argument));
				} else {
					C.lua_pushstring(computer.thread, argument.toString());
				}
			}

			computer.eventStack.splice(0, 1);
			computer.coroutineClock = Date.now();

			var result;
			try {
				result = C.lua_resume(computer.thread, argumentsNumber);
			} catch (e) {
				clearInterval(threadLoopID);
				computer.alive = false;
				if (!computer.hasErrored) {
					console.log("Javascript error", e);
					render.bsod("FATAL : JAVASCRIPT ERROR", 
						["A fatal Javascript error has occured.", 
						"Check the console for more details."]);
					computer.hasErrored = true;
					return;
				}
			}

			if (result == C.LUA_YIELD) {
				if (computer.shouldShutdown) {
					computer.shutdown();
				} else if (computer.shouldReboot) {
					computer.reboot();
				}
			} else if (result == 0) {
				clearInterval(threadLoopID);
				computer.alive = false;

				console.log("Program ended");
			} else {
				clearInterval(threadLoopID);
				computer.alive = false;
				if (!computer.hasErrored) {
					render.bsod("FATAL : THREAD CRASH", 
						["The Lua thread has crashed!", "Check the console for more details"]);
					computer.hasErrored = true;
				}
				console.log("Error: ", C.lua_tostring(computer.thread, -1));
			}
		} else {
			clearInterval(threadLoopID);
		}
	}, 10);
}



//  ------------------------
//    Termination
//  ------------------------


Computer.prototype.shutdown = function() {
	render.clear();

	this.cursor.blink = false;
	render.cursorBlink();

	this.coroutineClock = Date.now();
	if (this.L) {
		C.lua_close(this.L);
		this.L = null;
	}
 
	this.reset();
}


Computer.prototype.reboot = function() {
	this.shutdown();

	render.clear();
	this.reset();
	this.coroutineClock = Date.now();
	this.L = C.lua_open();

	this.installAPIs();
	this.launch();
}


Computer.prototype.turnOn = function() {
	if (!this.alive || !this.L) {
		if (this.L) {
			C.lua_close(this.L);
		}

		render.clear();
		this.reset();
		this.coroutineClock = Date.now();
		this.L = C.lua_open();

		this.installAPIs();
		this.launch();
	}
}


Computer.prototype.terminate = function() {
	if (this.alive && (this.L != null)) {
		this.eventStack.unshift(["terminate"]);
		this.resume();
	}
}



//  ------------------------
//    GUI
//  ------------------------


Computer.prototype.getActualSize = function() {
	var width = this.width * config.cellWidth + 2 * config.borderWidth;
	var height = this.height * config.cellHeight + 2 * config.borderHeight;

	return {"width": width, "height": height};
}


Computer.prototype.getLocation = function() {
	var minX = 275;
	var minY = 0;

	if (gui.isFullscreen) {
		minX = 0;
	}

	var size = this.getActualSize();
	var x = (window.innerWidth - minX) / 2 - size.width / 2 + minX;
	var y = (window.innerHeight - minY) / 2 - size.height / 2 + minY;

	x = Math.max(x, minX);
	y = Math.max(y, minY);

	return {"x": x, "y": y};
}
