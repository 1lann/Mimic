
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var prebios = '\n\
\n\
--  Some functions are taken from the ComputerCraft bios.lua,\n\
--  which was written by dan200\n\
\n\
--  I just cleaned up the code a bit\n\
\n\
\n\
xpcall = function(_fn, _fnErrorHandler)\n\
	assert(type(_fn) == "function", "bad argument #1 to xpcall (function expected, got " .. type(_fn) .. ")")\n\
\n\
	local co = coroutine.create(_fn)\n\
	local coroutineClock = os.clock()\n\
\n\
	debug.sethook(co, function()\n\
		if os.clock() >= coroutineClock + 2 then\n\
			print("Lua: Too long without yielding")\n\
			error("Too long without yielding", 2)\n\
		end\n\
	end, "", 10000)\n\
\n\
	local results = {coroutine.resume(co)}\n\
\n\
	debug.sethook(co)\n\
	while coroutine.status(co) ~= "dead" do\n\
		coroutineClock = os.clock()\n\
		debug.sethook(co, function()\n\
			if os.clock() >= coroutineClock + 2 then\n\
				print("Lua: Too long without yielding")\n\
				error("Too long without yielding", 2)\n\
			end\n\
		end, "", 10000)\n\
\n\
		results = {coroutine.resume(co, coroutine.yield())}\n\
		debug.sethook(co)\n\
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
local fsWrite = fs.write\n\
fs.write = nil\n\
\n\
local fsAppend = fs.append\n\
fs.append = nil\n\
\n\
local fsRead = fs.read\n\
fs.read = nil\n\
\n\
\n\
function fs.open(path, mode)\n\
	if mode == "w" then\n\
		local f = {\n\
			["_buffer"] = "",\n\
			["write"] = function(str)\n\
				f._buffer = f._buffer .. tostring(str)\n\
			end,\n\
			["close"] = function()\n\
				fsWrite(path, f._buffer)\n\
				f.write = nil\n\
			end,\n\
		}\n\
\n\
		return f\n\
	elseif mode == "r" then\n\
		local f = {\n\
			["readAll"] = function()\n\
				return fsRead(path)\n\
			end,\n\
			["close"] = function() end,\n\
		}\n\
\n\
		return f\n\
	else\n\
		error("mode not supported")\n\
	end\n\
end\n\
';


var bios = '\n\
local commandHistory = {}\n\
\n\
local function newLine()\n\
	local wid, hi = term.getSize()\n\
	local x, y = term.getCursorPos()\n\
	if y == hi then\n\
		term.scroll(1)\n\
		term.setCursorPos(1, y)\n\
	else\n\
		term.setCursorPos(1, y + 1)\n\
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
function read(replaceCharacter, history)\n\
	term.setCursorBlink(true)\n\
\n\
    local line = ""\n\
	local historyPos = nil\n\
	local pos = 0\n\
    if replaceCharacter then\n\
		replaceCharacter = string.sub(replaceCharacter, 1, 1)\n\
	end\n\
	\n\
	local w, h = term.getSize()\n\
	local sx, sy = term.getCursorPos()	\n\
	\n\
	local function redraw(replChar)\n\
		local scroll = 0\n\
		if sx + pos >= w then\n\
			scroll = (sx + pos) - w\n\
		end\n\
			\n\
		term.setCursorPos(sx, sy)\n\
		local replace = replChar or replaceCharacter\n\
		if replace then\n\
			term.write(string.rep(replace, string.len(line) - scroll))\n\
		else\n\
			term.write(string.sub(line, scroll + 1))\n\
		end\n\
		term.setCursorPos(sx + pos - scroll, sy)\n\
	end\n\
	\n\
	while true do\n\
		local sEvent, param = coroutine.yield()\n\
		if sEvent == "char" then\n\
			line = string.sub(line, 1, pos) .. param .. string.sub(line, pos + 1)\n\
			pos = pos + 1\n\
			redraw()\n\
		elseif sEvent == "key" then\n\
		    if param == 28 then\n\
				break\n\
			elseif param == 203 then\n\
				if pos > 0 then\n\
					pos = pos - 1\n\
					redraw()\n\
				end\n\
			elseif param == 205 then\n\
				if pos < string.len(line) then\n\
					redraw(" ")\n\
					pos = pos + 1\n\
					redraw()\n\
				end\n\
			elseif param == 200 or param == 208 then\n\
				if history then\n\
					redraw(" ")\n\
					if param == 200 then\n\
						if historyPos == nil then\n\
							if #history > 0 then\n\
								historyPos = #history\n\
							end\n\
						elseif historyPos > 1 then\n\
							historyPos = historyPos - 1\n\
						end\n\
					else\n\
						if historyPos == #history then\n\
							historyPos = nil\n\
						elseif historyPos ~= nil then\n\
							historyPos = historyPos + 1\n\
						end\n\
					end\n\
					if historyPos then\n\
                    	line = history[historyPos]\n\
                    	pos = string.len(line) \n\
                    else\n\
						line = ""\n\
						pos = 0\n\
					end\n\
					redraw()\n\
                end\n\
			elseif param == 14 then\n\
				if pos > 0 then\n\
					redraw(" ")\n\
					line = string.sub(line, 1, pos - 1) .. string.sub(line, pos + 1)\n\
					pos = pos - 1\n\
					redraw()\n\
				end\n\
			elseif param == 199 then\n\
				redraw(" ")\n\
				pos = 0\n\
				redraw()		\n\
			elseif param == 211 then\n\
				if pos < string.len(line) then\n\
					redraw(" ")\n\
					line = string.sub(line, 1, pos) .. string.sub(line, pos + 2)\n\
					redraw()\n\
				end\n\
			elseif param == 207 then\n\
				redraw(" ")\n\
				pos = string.len(line)\n\
				redraw()\n\
			end\n\
		end\n\
	end\n\
	\n\
	term.setCursorBlink(false)\n\
	term.setCursorPos(w + 1, sy)\n\
	newLine()\n\
	\n\
	return line\n\
end\n\
\n\
while true do\n\
	term.setTextColor(1)\n\
	term.setBackgroundColor(32768)\n\
	term.write("lua> ")\n\
	local command = read(nil, commandHistory)\n\
	table.insert(commandHistory, command)\n\
	local toRun, cError = loadstring(command, "error")\n\
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



var rom = {
	"help/": undefined,
	"apis/": undefined,
	"autorun/": undefined,

	"programs/": undefined,
	"programs/color/": undefined,
	"programs/computer/": undefined,
	"programs/http/": undefined,
}


rom["startup"] = '\n\
\n\
local sPath = ".:/rom/programs"\n\
if turtle then\n\
	sPath = sPath..":/rom/programs/turtle"\n\
else\n\
	sPath = sPath..":/rom/programs/computer"\n\
end\n\
if http then\n\
	sPath = sPath..":/rom/programs/http"\n\
end\n\
if term.isColor() then\n\
	sPath = sPath..":/rom/programs/color"\n\
end\n\
\n\
shell.setPath( sPath )\n\
help.setPath( "/rom/help" )\n\
\n\
shell.setAlias( "ls", "list" )\n\
shell.setAlias( "dir", "list" )\n\
shell.setAlias( "cp", "copy" )\n\
shell.setAlias( "mv", "move" )\n\
shell.setAlias( "rm", "delete" )\n\
shell.setAlias( "preview", "edit" )\n\
\n\
if fs.exists( "/rom/autorun" ) and fs.isDir( "/rom/autorun" ) then\n\
	local tFiles = fs.list( "/rom/autorun" )\n\
	table.sort( tFiles )\n\
	for n, sFile in ipairs( tFiles ) do\n\
		if string.sub( sFile, 1, 1 ) ~= "." then\n\
			local sPath = "/rom/autorun/"..sFile\n\
			if not fs.isDir( sPath ) then\n\
				shell.run( sPath )\n\
			end\n\
		end\n\
	end\n\
end\n\
';


rom["programs/alias"] = '\n\
\n\
local tArgs = { ... }\n\
if #tArgs > 2 then\n\
	print( "Usage: alias <alias> <program>" )\n\
	return\n\
end\n\
\n\
local sAlias = tArgs[1]\n\
local sProgram = tArgs[2]\n\
\n\
if sAlias and sProgram then\n\
	-- Set alias\n\
	shell.setAlias( sAlias, sProgram )\n\
elseif sAlias then\n\
	-- Clear alias\n\
	shell.clearAlias( sAlias )\n\
else\n\
	-- List aliases\n\
	local tAliases = shell.aliases()\n\
	local tList = {}\n\
	for sAlias, sCommand in pairs( tAliases ) do\n\
		table.insert( tList, sAlias )\n\
	end\n\
	table.sort( tList )\n\
	textutils.pagedTabulate( tList )\n\
end\n\
';


rom["programs/apis"] = '\n\
\n\
local tApis = {}\n\
for k,v in pairs( _G ) do\n\
	if type(k) == "string" and type(v) == "table" and k ~= "_G" then\n\
		table.insert( tApis, k )\n\
	end\n\
end\n\
table.insert( tApis, "shell" )\n\
table.sort( tApis )\n\
\n\
textutils.pagedTabulate( tApis )\n\
';


rom["programs/cd"] = '\n\
local tArgs = { ... }\n\
if #tArgs < 1 then\n\
	print( "Usage: cd <path>" )\n\
	return\n\
end\n\
\n\
local sNewDir = shell.resolve( tArgs[1] )\n\
if fs.isDir( sNewDir ) then\n\
	shell.setDir( sNewDir )\n\
else\n\
  	print( "Not a directory" )\n\
  	return\n\
end\n\
';


rom["programs/clear"] = '\n\
term.clear()\n\
term.setCursorPos( 1, 1 )\n\
';


getCode = function() {
	return prebios + "\n\n" + bios;
}
