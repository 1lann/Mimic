String.prototype.repeat = function( num )
{
	return new Array( num + 1 ).join( this );
}

// Shared in rendering
var cursorPos;
var textColor;
var cursorBlink;

var callLua;

var computercraft = function() {
	var C = Lua5_1.C;

	var L = C.lua_open();
	C.luaL_openlibs(L);

	var resumeThread;

	// Term variables
	cursorPos = [1,1];
	textColor = "#FFF";
	cursorBlink = false;
	var bgColor = "#000";
	var width = 51;
	var height = 19;

	// OS variables
	var osVersion = "CraftOS 1.5 (Web Alpha)";
	var tempID = 1;
	var label = null;
	var startClock = null;

	// Coroutines and events!
	var eventStack = [];
	var latestID = 0;

	var functions = {
		"term": {
			"write": function(L) {
				var str = C.luaL_checkstring(L, 1);
				drawText(cursorPos[0],cursorPos[1],str,textColor,bgColor);
				cursorPos[0] += str.length;
				if (!blinkState) {
					oCtxt.clearRect(0,0,canvas.width,canvas.height);
					oCtxt.fillStyle = textColor;
					oCtxt.fillText("_",((cursorPos[0]-1)*textWidth)+5,((cursorPos[1]-1)*textHeight)+18);
				}
				return 0;
			},
			"clear": function(L) {
				for (i = 1; i <= height; i++) {
					drawText(1,i," ".repeat(width),"#000",bgColor);
				}
			},
			"clearLine": function(L) {
				drawText(1,cursorPos[1]," ".repeat(width),"#000",bgColor);
			},
			"setCursorPos": function(L) {
				var x = C.luaL_checkint(L, 1);
				var y = C.luaL_checkint(L, 2);
				cursorPos = [x,y];
				if (!blinkState) {
					oCtxt.clearRect(0,0,canvas.width,canvas.height);
					oCtxt.fillStyle = textColor;
					oCtxt.fillText("_",((x-1)*textWidth)+5,((y-1)*textHeight)+18);
				}
			},
			"getCursorPos": function(L) {
				C.lua_pushnumber(cursorPos[0]);
				C.lua_pushnumber(cursorPos[1]);
				return 1, 2;
			},
			"setCursorBlink": function(L) {
				if(C.lua_isboolean(L, 1)){
					cursorBlink = C.lua_toboolean(L, 1);
					if (!cursorBlink) {
						oCtxt.clearRect(0,0,620,350);
						blinkState = false;
					}
					return 0;
				} else {
					C.lua_pushstring(L, "Expected boolean");
					C.lua_error(L);
				}
			},
			"setTextColor": function(L) {
				// Not properly supported
				var color = C.luaL_checkstring(L, 1);
				textColor = color;
				return 0;
			},
			"setBackgroundColor": function(L) {
				// Not properly supported
				var color = C.luaL_checkstring(L, 1);
				bgColor = color;
				return 0;
			},
			"isColor": function(L) {
				// Black and white: Coming soon!
				C.lua_pushboolean(L, 1);
				return 1;
			},
			"getSize": function(L) {
				C.lua_pushnumber(L, width);
				C.lua_pushnumber(L, height);
				return 1, 2;
			},
			"scroll": function(L) {
				var amount = C.luaL_checkint(L, 1);
				// Extra rendering crap is handled here!
				var imgd = ctxt.getImageData(4, 4, canvas.width-8, canvas.height-8);
				ctxt.clearRect(0,0,canvas.width,canvas.height);
				ctxt.putImageData(imgd, 4, textHeight*amount*(-1)+4);
			},
			"redirect": function(L) {
				// Function not supported
				C.lua_pushstring(L, "redirect is not supported at this time!");
				C.lua_error(L);
			},
			"restore": function(L) {
				// Function not supported
				C.lua_pushstring(L, "restore is not supported at this time!");
				C.lua_error(L);
			}
		},
		"os": {
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
				var retDiff = Math.round(diff*0.1)/100;
				C.lua_pushnumber(L, retDiff);
				return 1;
			},
			"time": function(L) {
				C.lua_pushstring(L, "Time not supported!");
				C.lua_error(L);
			},
			"startTimer": function(L) {
				var time = C.luaL_checknumber(L, 1);
				latestID++;
				var timerID = latestID;
				setTimeout(function() { eventStack.push(["timer",latestID]); resumeThread(); }, time*1000);
				C.lua_pushnumber(timerID);
				return 1;
			},
			"queueEvent": function(L) {
				var queueObject = [];
				queueObject.push(C.luaL_checkstring(L, 1));
				var top = lua_gettop(L);
				for (i = 1; i <= top; i++) {
					var t = lua_type(L,i);
					if (t == C.LUA_TSTRING) {
						queueObject.push(C.lua_tostring(L,i));
					} else if (t == C.LUA_TBOOLEAN) {
						if (C.lua_toboolean(L,i)) {
							queueObject.push(true);
						} else {
							queueObject.push(false);
						}
					} else if (t == C.LUA_TNUMBER) {
						queueObject.push(C.lua_tonumber(L,i));
					} else {
						queueObject.push(null);
					}
				}
				eventStack.push(queueObject);
			},
			"shutdown": function(L) {

			},
			"reboot": function(L) {

			}
		}
	}

	functions["os"]["computerLabel"] = functions["os"]["getComputerLabel"];

	for (api in functions) {
		if (typeof(functions[api]) == "function") {
			C.lua_pushcfunction(
				L,
				Lua5_1.Runtime.addFunction(
					functions[api]
					)
				);
			C.lua_setfield(L, 1, api)
		} else {
			C.lua_newtable(L);
			for (key in functions[api]) {
				C.lua_pushcfunction(
					L,
					Lua5_1.Runtime.addFunction(
						functions[api][key]
						)
					);
				C.lua_setfield(L, 1, key)
			}
			C.lua_setglobal(L, api);
		}
	}

	callLua = function(data) {
		C.luaL_dostring(L,data);
	}
	
	// Initiate clock 0
	startClock = Date.now();

	var mainThread = C.lua_newthread(L);
	C.luaL_loadstring(mainThread, "term.write('hi') term.write(' '..coroutine.yield()) coroutine.yield() term.write(' passed!')");

	var threadAlive = true;
	var threadLoop;
	resumeThread = function() {
		if (threadAlive) {
			threadLoop = setInterval(function () {
				if (eventStack.length > 0) {
					var argumentsNumber = eventStack[0].length;

					for (var index in eventStack[0]) {
						C.lua_pushstring(mainThread,""+eventStack[0][index]);
					}
					eventStack.splice(0,1)

					var resp = C.lua_resume(mainThread,argumentsNumber);
					if (resp == C.LUA_YIELD) {

					} else if (resp == 0) {
						clearInterval(threadLoop);
						trheadAlive = false;
						console.log("Program complete")
						console.log("Thread closed")
					} else {
						console.log("Error: "+C.lua_tostring(mainThread,-1));
						clearInterval(threadLoop);
						threadALive = false;
						console.log("Thread closed")
					}
				} else {
					clearInterval(threadLoop);
					console.log("Thread suspended")
				}
			}, 10);
		}
	}
	
	var initialization = function() {
		var resp = C.lua_resume(mainThread,0);
		if ((resp != C.LUA_YIELD) && (resp != 0)) {
			var errorCode = C.lua_tostring(mainThread,-1);
			var trace = C.lua_tostring(mainThread,-3);
			console.log("Intialization Error: "+errorCode);
			threadAlive = false;
			console.log("Thread closed")
			for (i = 1; i <= height; i++) {
				drawText(1,i," ".repeat(width),"#000","#0000AA");
			}
			drawText(13,7,"WEBCC : FATAL : BIOS ERROR","#0000AA","#FFF");
			var startPos = Math.round(width/2 - ((7+errorCode.length)/2));
			drawText(startPos,9,"ERROR: "+errorCode,"#FFF","#0000AA");
			if (trace) {
				function wordWrap(str, maxWidth) {
					var white = new RegExp(/^\s$/);
					var newLineStr = "\n"; done = false; res = [];
					do {                    
						found = false;
					// Inserts new line at first whitespace of the line
					for (i = maxWidth - 1; i >= 0; i--) {
						if (white.test(str.charAt(i))) {
							res.push(str.slice(0, i));
							str = str.slice(i + 1);
							found = true;
							break;
						}
					}
					// Inserts new line at maxWidth position, the word is too long to wrap
					if (!found) {
						res.push(str.slice(0, maxWidth));
						str = str.slice(maxWidth);
					}

					if (str.length < maxWidth)
						done = true;
					} while (!done);

					return res;
				}
				var words = wordWrap(trace,40)
				drawText(17,11,"-- MORE DETAILS --","#FFF","#0000AA");
				var yIndex = 11;
				for (var index in words) {
					yIndex++;
					var startPos = Math.round(width/2 - ((words[index].length)/2));
					drawText(startPos,yIndex,words[index],"#FFF","#0000AA");
				}
			}
		}
	}
	initialization();
	eventStack.push(["test event"]);
	resumeThread();
	eventStack.push(["test event"]);
	resumeThread();
};