
//
//  os.js
//  GravityScore and 1lann
//



var osAPI = {};



//
//    Computer Information
//


osAPI.getComputerID = function(L) {
	var computer = core.getActiveComputer();
	C.lua_pushnumber(L, computer.id);
	return 1;
}


osAPI.getComputerLabel = function(L) {
	var computer = core.getActiveComputer();
	if (computer.label) {
		C.lua_pushstring(L, computer.label);
		return 1;
	} else {
		return 0;
	}
}


osAPI.computerLabel = osAPI.getComputerLabel;
osAPI.computerID = osAPI.getComputerID;


osAPI.setComputerLabel = function(L) {
	var computer = core.getActiveComputer();
	var str = C.luaL_checkstring(L, 1);
	computer.label = str.trim();

	return 0;
}



//
//    Time
//


osAPI.clock = function(L) {
	var computer = core.getActiveComputer();
	var diff = Date.now() - computer.startClock;
	var retDiff = Math.round(diff * 0.1) / 100;
	C.lua_pushnumber(L, retDiff);

	return 1;
}


osAPI.time = function(L) {
	var computer = core.getActiveComputer();
	var ticks = (Date.now() - computer.startClock) / 50;
	C.lua_pushnumber(L, ticks % 24000 / 1000);

	return 1;
}


osAPI.day = function(L) {
	var computer = core.getActiveComputer();
	var ticks = (Date.now() - computer.startClock) / 50;
	C.lua_pushnumber(L, 1 + Math.floor(ticks / 24000));

	return 1;
}


osAPI.startTimer = function(L) {
	var computer = core.getActiveComputer();
	var time = C.luaL_checknumber(L, 1);
	var targetTime = Date.now()+(time*990);

	computer.lastTimerID++;

	var timerID = computer.lastTimerID;
	setTimeout(function() {
		var tester = setInterval(function() {
			if (Date.now() >= targetTime) {
				clearInterval(tester);
				computer.eventStack.push(["timer", timerID]);
				computer.resume();
			}
		}, 5);
	}, time * 970);

	C.lua_pushnumber(L, timerID);

	return 1;
}


osAPI.setAlarm = function(L) {

}



//
//    Event Handling
//


osAPI.queueEvent = function(L) {
	var computer = core.getActiveComputer();
	var queueObject = [];
	queueObject.push(C.luaL_checkstring(L, 1));

	var top = C.lua_gettop(L);
	for (var i = 1; i <= top; i++) {
		var t = C.lua_type(L, i);
		if (t == C.LUA_TSTRING) {
			queueObject.push(C.lua_tostring(L, i));
		} else if (t == C.LUA_TBOOLEAN) {
			queueObject.push(C.lua_toboolean(L, i) ? true : false);
		} else if (t == C.LUA_TNUMBER) {
			queueObject.push(C.lua_tonumber(L, i));
		} else {
			queueObject.push(null);
		}
	}

	computer.eventStack.push(queueObject);
	return 0;
}


osAPI.shutdown = function(L) {
	var computer = core.getActiveComputer();
	computer.shouldShutdown = true;
	return 0;
}


osAPI.reboot = function(L) {
	var computer = core.getActiveComputer();
	computer.shouldReboot = true;
	return 0;
}
