
//  
//  WebCC
//  Made by 1lann and GravityScore
//  



var prebios = '
xpcall = function(_fn, _fnErrorHandler)\n\
	assert(type(_fn) == "function", "bad argument #1 to xpcall (function expected, got " .. type(_fn) .. ")")\n\
\n\
	local co = coroutine.create(_fn)\n\
	local results = {coroutine.resume(co)}\n\
	while coroutine.status(co) ~= "dead" do\n\
		results = {coroutine.resume(co, coroutine.yield())}\n\
	end\n\
\n\
	if results[1] == true then\n\
		return true, unpack(results, 2)\n\
	else\n\
		return false, _fnErrorHandler(results[2])\n\
	end\n\
end\n\
\n\
\n\
pcall = function(_fn, ...)\n\
	assert(type(_fn) == "function", "bad argument #1 to pcall (function expected, got " .. type(_fn) .. ")")\n\
\n\
	local args = {...}\n\
	return xpcall(\n\
		function()\n\
			return _fn(unpack(args))\n\
		end,\n\
		function(_error)\n\
			return _error\n\
		end\n\
	)\n\
end\n\
\n\
\n\
local protectedEvents = {\n\
	"fs_list",\n\
	"fs_exists",\n\
	"fs_isDir",\n\
	"fs_makeDir",\n\
	"fs_move",\n\
	"fs_copy",\n\
	"fs_read",\n\
	"fs_write",\n\
	"fs_append",\n\
	"fs_delete",\n\
}\n\
\n\
local isProtected = function(evt)\n\
	for k, v in pairs(protectedEvents) do\n\
		if v == evt then\n\
			return true\n\
		end\n\
	end\n\
	return false\n\
end\n\
\n\
\n\
local queueEvents = function(evts)\n\
	for k, v in pairs(evts) do\n\
		os.queueEvent(unpack(v))\n\
	end\n\
end\n\
\n\
\n\
local waitFor = function(evtName, evtID)\n\
	local events = {}\n\
	local timeout = os.startTimer(1)\n\
	while true do\n\
		local e = {coroutine.yield()}\n\
		if e[1] == evtName and e[2] == evtID then\n\
			queueEvents(events)\n\
			return e\n\
		elseif e[1] == "timer" and e[2] == timeout then\n\
			queueEvents(events)\n\
			return nil\n\
		elseif not isProtected(e[1]) then\n\
			table.insert(events, e)\n\
		end\n\
	end\n\
end\n\
\n\
\n\
local fs_list = fs.list\n\
fs.list = function(path)\n\
	local id = fs_list(path)\n\
	local e = waitFor("fs_list", id)\n\
	if e then\n\
		return e[3]\n\
	end\n\
	return nil\n\
end\n\
\n\
\n\
local fs_exists = fs.exists\n\
fs.exists = function(path)\n\
	local id = fs_exists(path)\n\
	local e = waitFor("fs_exists", id)\n\
	if e then\n\
		return e[3]\n\
	end\n\
	return false\n\
end\n\
';

var bios = '
local function newLine()\n\
	local wid, hi = term.getSize()\n\
	local x, y = term.getCursorPos()\n\
	if y == hi then\n\
		term.scroll(1)\n\
		term.setCursorPos(1, y)\n\
	else\n\
		term.setCursorPos(1, y+1)\n\
	end\n\
end\n\
\n\
local nativeShutdown = os.shutdown\n\
function os.shutdown()\n\
	nativeShutdown()\n\
	while true do\n\
		coroutine.yield()\n\
	end\n\
end\n\
\n\
local nativeReboot = os.reboot\n\
function os.reboot()\n\
	nativeReboot()\n\
	while true do\n\
		coroutine.yield()\n\
	end\n\
end\n\
\n\
local function reader()\n\
	local data = ""\n\
	local visibleData = ""\n\
	local startX, startY = term.getCursorPos()\n\
	local wid, hi = term.getSize()\n\
	while true do\n\
		term.setCursorBlink(true)\n\
		local e, p1 = coroutine.yield()\n\
		if e == "key" and p1 == 14 then\n\
			data = data:sub(1, -2)\n\
		elseif e == "key" and p1 == 28 then\n\
			newLine()\n\
			return data\n\
		elseif e == "char" then\n\
			data = data .. p1\n\
		end\n\
\n\
		term.setCursorPos(startX, startY)\n\
		if #data+startX+1 > wid then\n\
			visibleData = data:sub(-1*(wid-startX-1))\n\
		else\n\
			visibleData = data\n\
		end\n\
\n\
		term.write(visibleData .. " ")\n\
		local curX, curY = term.getCursorPos()\n\
		term.setCursorPos(curX-1, curY)\n\
	end\n\
end\n\
\n\
while true do\n\
	term.setTextColor(1)\n\
	term.setBackgroundColor(32768)\n\
	term.write("lua> ")\n\
	local toRun, cError = loadstring(reader(), "error")\n\
	if toRun then\n\
		setfenv(toRun, getfenv(1))\n\
		local results = {pcall(toRun)}\n\
		term.setBackgroundColor(32768)\n\
		if results[1] then\n\
			table.remove(results,1)\n\
			for k,v in pairs(results) do\n\
				newLine()\n\
				term.write(tostring(v))\n\
			end\n\
		else\n\
			if term.isColor() then\n\
				term.setTextColor(16384)\n\
			end\n\
			term.write(results[2])\n\
		end\n\
	else\n\
		if term.isColor() then\n\
			term.setTextColor(16384)\n\
		end\n\
		term.write(cError)\n\
	end\n\
	newLine()\n\
end\n\
';


getCode = function() {
	return prebios + "\n\n" + bios;
}
