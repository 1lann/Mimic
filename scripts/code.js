
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
			["flush"] = function()\n\
				fsWrite(path, f._buffer)\n\
			end,\n\
			["close"] = function()\n\
				fsWrite(path, f._buffer)\n\
				f.write = nil\n\
				f.flush = nil\n\
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
\n\
--  Almost all functions are taken from the ComputerCraft bios.lua, \n\
--  which was written by dan200\n\
\n\
--  I just cleaned up the code a bit\n\
\n\
\n\
local jsConsolePrint = print\n\
\n\
\n\
function os.version()\n\
	return "CraftOS 1.5"\n\
end\n\
\n\
\n\
function os.pullEventRaw(filter)\n\
	return coroutine.yield(filter)\n\
end\n\
\n\
\n\
function os.pullEvent(filter)\n\
	local eventData = {os.pullEventRaw(filter)}\n\
	if eventData[1] == "terminate" then\n\
		error("Terminated", 0)\n\
	end\n\
\n\
	return unpack(eventData)\n\
end\n\
\n\
\n\
function sleep(time)\n\
	local timer = os.startTimer(time)\n\
	while true do\n\
		local event, id = os.pullEvent("timer")\n\
		if timer == id then\n\
			break\n\
		end\n\
	end\n\
end\n\
\n\
\n\
function write(text)\n\
	local w, h = term.getSize()		\n\
	local x, y = term.getCursorPos()\n\
	\n\
	local linesPrinted = 0\n\
	local function newLine()\n\
		if y + 1 <= h then\n\
			term.setCursorPos(1, y + 1)\n\
		else\n\
			term.setCursorPos(1, h)\n\
			term.scroll(1)\n\
		end\n\
		x, y = term.getCursorPos()\n\
		linesPrinted = linesPrinted + 1\n\
	end\n\
	\n\
	while string.len(text) > 0 do\n\
		local whitespace = string.match(text, "^[ \t]+")\n\
		if whitespace then\n\
			term.write(whitespace)\n\
			x, y = term.getCursorPos()\n\
			text = string.sub(text, string.len(whitespace) + 1)\n\
		end\n\
		\n\
		local newline = string.match(text, "^\n")\n\
		if newline then\n\
			newLine()\n\
			text = string.sub(text, 2)\n\
		end\n\
		\n\
		local text = string.match(text, "^[^ \t\n]+")\n\
		if text then\n\
			text = string.sub(text, string.len(text) + 1)\n\
			if string.len(text) > w then\n\
				while string.len(text) > 0 do\n\
					if x > w then\n\
						newLine()\n\
					end\n\
					term.write(text)\n\
					text = string.sub(text, (w - x) + 2)\n\
					x, y = term.getCursorPos()\n\
				end\n\
			else\n\
				if x + string.len(text) - 1 > w then\n\
					newLine()\n\
				end\n\
				term.write(text)\n\
				x, y = term.getCursorPos()\n\
			end\n\
		end\n\
	end\n\
	\n\
	return linesPrinted\n\
end\n\
\n\
\n\
function print(...)\n\
	local args = {...}\n\
	local linesPrinted = 0\n\
	for k, v in pairs(args) do\n\
		write(tostring(k) .. ": " .. tostring(v) .. "\n")\n\
		linesPrinted = linesPrinted + 1\n\
	end\n\
\n\
	return linesPrinted\n\
end\n\
\n\
\n\
function printError(...)\n\
	if term.isColour() then\n\
		term.setTextColour(colors.red)\n\
	end\n\
\n\
	print(...)\n\
	term.setTextColour(colors.white)\n\
end\n\
\n\
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
\n\
loadfile = function(path)\n\
	local file = fs.open(path, "r")\n\
	if file then\n\
		local func, err = loadstring(file.readAll(), fs.getName(path))\n\
		file.close()\n\
		return func, err\n\
	end\n\
	return nil, "File not found"\n\
end\n\
\n\
\n\
dofile = function(path)\n\
	local fnFile, e = loadfile(path)\n\
	if fnFile then\n\
		setfenv(fnFile, getfenv(2))\n\
		return fnFile()\n\
	else\n\
		error(e, 2)\n\
	end\n\
end\n\
\n\
\n\
function os.run(_tEnv, _sPath, ...)\n\
    local tArgs = { ... }\n\
    local fnFile, err = loadfile(_sPath)\n\
    if fnFile then\n\
        local tEnv = _tEnv\n\
		setmetatable(tEnv, { __index = _G })\n\
        setfenv(fnFile, tEnv)\n\
\n\
        local ok, err = pcall(function()\n\
        	fnFile(unpack(tArgs))\n\
        end)\n\
\n\
        if not ok then\n\
        	if err and err ~= "" then\n\
	        	printError(err)\n\
	        end\n\
        	return false\n\
        end\n\
        return true\n\
    end\n\
\n\
    if err and err ~= "" then\n\
		printError(err)\n\
	end\n\
\n\
    return false\n\
end\n\
\n\
\n\
local nativegetmetatable = getmetatable\n\
local nativetype = type\n\
local nativeerror = error\n\
\n\
function getmetatable(_t)\n\
	if nativetype(_t) == "string" then\n\
		nativeerror("Attempt to access string metatable", 2)\n\
		return nil\n\
	end\n\
	return nativegetmetatable(_t)\n\
end\n\
\n\
\n\
local tAPIsLoading = {}\n\
\n\
function os.loadAPI(_sPath)\n\
	local sName = fs.getName(_sPath)\n\
	if tAPIsLoading[sName] == true then\n\
		printError("API "..sName.." is already being loaded")\n\
		return false\n\
	end\n\
	tAPIsLoading[sName] = true\n\
		\n\
	local tEnv = {}\n\
	setmetatable(tEnv, { __index = _G })\n\
	local fnAPI, err = loadfile(_sPath)\n\
	if fnAPI then\n\
		setfenv(fnAPI, tEnv)\n\
		fnAPI()\n\
	else\n\
		printError(err)\n\
        tAPIsLoading[sName] = nil\n\
		return false\n\
	end\n\
	\n\
	local tAPI = {}\n\
	for k, v in pairs(tEnv) do\n\
		tAPI[k] =  v\n\
	end\n\
	\n\
	_G[sName] = tAPI	\n\
	tAPIsLoading[sName] = nil\n\
	return true\n\
end\n\
\n\
\n\
function os.unloadAPI(_sName)\n\
	if _sName ~= "_G" and type(_G[_sName]) == "table" then\n\
		_G[_sName] = nil\n\
	end\n\
end\n\
\n\
\n\
function os.sleep(_nTime)\n\
	sleep(_nTime)\n\
end\n\
\n\
\n\
local nativeShutdown = os.shutdown\n\
local nativeReboot = os.reboot\n\
\n\
function os.shutdown()\n\
	nativeShutdown()\n\
	while true do\n\
		coroutine.yield()\n\
	end\n\
end\n\
\n\
\n\
function os.reboot()\n\
	nativeReboot()\n\
	while true do\n\
		coroutine.yield()\n\
	end\n\
end\n\
\n\
\n\
if http then\n\
	local function wrapRequest(_url, _post)\n\
		local requestID = http.request(_url, _post)\n\
		while true do\n\
			local event, param1, param2 = os.pullEvent()\n\
			if event == "http_success" and param1 == _url then\n\
				return param2\n\
			elseif event == "http_failure" and param1 == _url then\n\
				return nil\n\
			end\n\
		end		\n\
	end\n\
	\n\
	http.get = function(_url)\n\
		return wrapRequest(_url, nil)\n\
	end\n\
\n\
	http.post = function(_url, _post)\n\
		return wrapRequest(_url, _post or "")\n\
	end\n\
end\n\
\n\
\n\
local tApis = fs.list("rom/apis")\n\
for n, sFile in ipairs(tApis) do\n\
	if string.sub(sFile, 1, 1) ~= "." then\n\
		local sPath = fs.combine("rom/apis", sFile)\n\
		if not fs.isDir(sPath) then\n\
			os.loadAPI(sPath)\n\
		end\n\
	end\n\
end\n\
\n\
\n\
if turtle then\n\
	local tApis = fs.list("rom/apis/turtle")\n\
	for n, sFile in ipairs(tApis) do\n\
		if string.sub(sFile, 1, 1) ~= "." then\n\
			local sPath = fs.combine("rom/apis/turtle", sFile)\n\
			if not fs.isDir(sPath) then\n\
				os.loadAPI(sPath)\n\
			end\n\
		end\n\
	end\n\
end\n\
\n\
\n\
local ok, err = pcall(function()\n\
	parallel.waitForAny(\n\
		function()\n\
			os.run({}, "rom/programs/shell")\n\
		end, \n\
		function()\n\
			rednet.run()\n\
		end)\n\
end)\n\
\n\
\n\
if not ok then\n\
	printError(err)\n\
end\n\
\n\
\n\
pcall(function()\n\
	term.setCursorBlink(false)\n\
	print("Press any key to continue")\n\
	os.pullEvent("key") \n\
end)\n\
\n\
os.shutdown()\n\
\n\
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



//  ----------------  ROM Programs  ----------------  //


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


rom["programs/color/paint"] = '\n\
-- Paint created by nitrogenfingers (edited by dan200)\n\
-- http://www.youtube.com/user/NitrogenFingers\n\
\n\
------------\n\
-- Fields --\n\
------------\n\
\n\
-- The width and height of the terminal\n\
local w,h = term.getSize()\n\
\n\
-- The selected colours on the left and right mouse button, and the colour of the canvas\n\
local leftColour, rightColour = colours.black, colours.white\n\
local canvasColour = colours.white\n\
\n\
-- The values stored in the canvas\n\
local canvas = {}\n\
\n\
-- The menu options\n\
local mChoices = { "Save","Exit" }\n\
\n\
-- The message displayed in the footer bar\n\
local fMessage = "Press Ctrl to access menu"\n\
\n\
-------------------------\n\
-- Initialisation --\n\
-------------------------\n\
\n\
-- Determine if we can even run this\n\
if not term.isColour() then\n\
	print("Requires an Advanced Computer")\n\
	return\n\
end\n\
\n\
-- Determines if the file exists, and can be edited on this computer\n\
local tArgs = {...}\n\
if #tArgs == 0 then\n\
	print("Usage: paint <path>")\n\
	return\n\
end\n\
local sPath = shell.resolve(tArgs[1])\n\
local bReadOnly = fs.isReadOnly(sPath)\n\
if fs.exists(sPath) and fs.isDir(sPath) then\n\
	print("Cannot edit a directory.")\n\
	return\n\
end\n\
\n\
---------------\n\
-- Functions --\n\
---------------\n\
\n\
--[[\n\
	Converts a colour value to a text character\n\
	params: colour = the number to convert to a hex value\n\
	returns: a string representing the chosen colour\n\
]]\n\
local function getCharOf( colour )\n\
	-- Incorrect values always convert to nil\n\
	if type(colour) == "number" then\n\
		local value = math.floor( math.log(colour) / math.log(2) ) + 1\n\
		if value >= 1 and value <= 16 then\n\
			return string.sub( "0123456789abcdef", value, value )\n\
		end\n\
	end\n\
	return " "\n\
end	\n\
\n\
--[[\n\
	Converts a text character to colour value\n\
	params: char = the char (from string.byte) to convert to number\n\
	returns: the colour number of the hex value\n\
]]\n\
local tColourLookup = {}\n\
for n=1,16 do\n\
	tColourLookup[ string.byte( "0123456789abcdef",n,n ) ] = 2^(n-1)\n\
end\n\
local function getColourOf( char )\n\
	-- Values not in the hex table are transparent (canvas coloured)\n\
	return tColourLookup[char]\n\
end\n\
\n\
--[[ \n\
	Loads the file into the canvas\n\
	params: path = the path of the file to open\n\
	returns: nil\n\
]]\n\
local function load(path)\n\
	-- Load the file\n\
	if fs.exists(path) then\n\
		local file = io.open(sPath, "r" )\n\
		local sLine = file:read()\n\
		while sLine do\n\
			local line = {}\n\
			for x=1,w-2 do\n\
				line[x] = getColourOf( string.byte(sLine,x,x) )\n\
			end\n\
			table.insert( canvas, line )\n\
			sLine = file:read()\n\
		end\n\
		file:close()\n\
	end\n\
	\n\
	-- Any extra space is filled in here\n\
	local lineCount = #canvas\n\
	for i=lineCount+1, h-1 do\n\
		table.insert( canvas, {} )\n\
	end\n\
end\n\
\n\
--[[  \n\
	Saves the current canvas to file  \n\
	params: path = the path of the file to save\n\
	returns: true if save was successful, false otherwise\n\
]]\n\
local function save(path)\n\
	local sDir = string.sub(sPath, 1, #sPath - #fs.getName(sPath))\n\
	if not fs.exists(sDir) then\n\
		fs.makeDir(sDir)\n\
	end\n\
\n\
	local file = io.open(path, "w")\n\
	if not file then return false end\n\
	for y=1,h-1 do\n\
		for x=1,w-2 do\n\
			file:write( getCharOf( canvas[y][x] ) )\n\
		end\n\
		file:write( "\n" )\n\
	end\n\
	file:close()\n\
	return true\n\
end\n\
\n\
--[[  \n\
	Draws colour picker sidebar, the pallette and the footer\n\
	returns: nil\n\
]]\n\
local function drawInterface()\n\
	-- Footer\n\
	term.setCursorPos(1, h)\n\
	term.setBackgroundColour(colours.lightGrey)\n\
	term.setTextColour(colours.white)\n\
	term.clearLine()\n\
	term.write(fMessage)\n\
	\n\
	-- Colour Picker\n\
	for i=1,16 do\n\
		term.setCursorPos(w-1, i)\n\
		term.setBackgroundColour( 2^(i-1) )\n\
		term.write("  ")\n\
	end\n\
\n\
	term.setCursorPos(w-1, 17)\n\
	term.setBackgroundColour( canvasColour )\n\
	term.setTextColour( colours.lightGrey )\n\
	term.write("XX")\n\
			\n\
	-- Left and Right Selected Colours\n\
	for i=18,18 do\n\
		term.setCursorPos(w-1, i)\n\
		if leftColour ~= nil then\n\
			term.setBackgroundColour( leftColour )\n\
			term.write(" ")\n\
		else\n\
			term.setBackgroundColour( canvasColour )\n\
			term.setTextColour( colours.lightGrey )\n\
			term.write("X")\n\
		end\n\
		if rightColour ~= nil then\n\
			term.setBackgroundColour( rightColour )\n\
			term.write(" ")\n\
		else\n\
			term.setBackgroundColour( canvasColour )\n\
			term.setTextColour( colours.lightGrey )\n\
			term.write("X")\n\
		end\n\
	end\n\
\n\
	-- Padding\n\
	term.setBackgroundColour(colours.lightGrey)\n\
	for i=20,h-1 do\n\
		term.setCursorPos(w-1, i)\n\
		term.write("  ")\n\
	end\n\
end\n\
\n\
--[[  \n\
	Converts a single pixel of a single line of the canvas and draws it\n\
	returns: nil\n\
]]\n\
local function drawCanvasPixel( x, y )\n\
	local pixel = canvas[y][x]\n\
	if pixel then\n\
		term.setBackgroundColour( pixel or canvasColour )\n\
		term.setCursorPos(x, y)\n\
		term.write(" ")\n\
	else\n\
		term.setBackgroundColour( canvasColour )\n\
		term.setTextColour( colours.lightGrey )\n\
		term.setCursorPos(x, y)\n\
		if leftColour == nil or rightColour == nil then\n\
			term.write("-")\n\
		else\n\
			term.write(" ")\n\
		end\n\
	end\n\
end\n\
\n\
--[[  \n\
	Converts each colour in a single line of the canvas and draws it\n\
	returns: nil\n\
]]\n\
local function drawCanvasLine( y )\n\
	local line = canvas[y]\n\
	for x = 1, w-2 do\n\
		drawCanvasPixel( x, y )\n\
	end\n\
end\n\
\n\
--[[  \n\
	Converts each colour in the canvas and draws it\n\
	returns: nil\n\
]]\n\
local function drawCanvas()\n\
	for y = 1, #canvas do\n\
		drawCanvasLine( y )\n\
	end\n\
end\n\
\n\
--[[\n\
	Draws menu options and handles input from within the menu.\n\
	returns: true if the program is to be exited; false otherwise\n\
]]\n\
local function accessMenu()\n\
	-- Selected menu option\n\
	local selection = 1\n\
	\n\
	term.setBackgroundColour(colours.lightGrey)\n\
	while true do\n\
		-- Draw the menu\n\
		term.setCursorPos(1,h)\n\
		term.clearLine()\n\
		term.setTextColour(colours.white)\n\
		for k,v in pairs(mChoices) do\n\
			if selection==k then \n\
				term.setTextColour(colours.yellow)\n\
				local ox,_ = term.getCursorPos()\n\
				term.write("["..string.rep(" ",#v).."]")\n\
				term.setCursorPos(ox+1,h)\n\
				term.setTextColour(colours.white)\n\
				term.write(v)\n\
				term.setCursorPos(term.getCursorPos()+1,h)\n\
			else\n\
				term.write(" "..v.." ")\n\
			end\n\
		end\n\
		\n\
		-- Handle input in the menu\n\
		local id,key = os.pullEvent("key")\n\
		if id == "key" then\n\
			-- S and E are shortcuts\n\
			if key == keys.s then\n\
				selection = 1\n\
				key = keys.enter\n\
			elseif key == keys.e then\n\
				selection = 2\n\
				key = keys.enter\n\
			end\n\
		\n\
			if key == keys.right then\n\
				-- Move right\n\
				selection = selection + 1\n\
				if selection > #mChoices then\n\
					selection = 1\n\
				end\n\
				\n\
			elseif key == keys.left and selection > 1 then\n\
				-- Move left\n\
				selection = selection - 1\n\
				if selection < 1 then\n\
					selection = #mChoices\n\
				end\n\
				\n\
			elseif key == keys.enter then\n\
				-- Select an option\n\
				if mChoices[selection]=="Save" then \n\
					if bReadOnly then \n\
						fMessage = "Access Denied"\n\
						return false\n\
					end\n\
					local success = save(sPath)\n\
					if success then\n\
						fMessage = "Saved to "..sPath\n\
					else\n\
						fMessage = "Error saving to "..sPath\n\
					end\n\
					return false\n\
				elseif mChoices[selection]=="Exit" then \n\
					return true\n\
				end\n\
			elseif key == keys.leftCtrl or keys == keys.rightCtrl then\n\
				-- Cancel the menu\n\
				return false \n\
			end\n\
		end\n\
	end\n\
end\n\
\n\
--[[  \n\
	Runs the main thread of execution. Draws the canvas and interface, and handles\n\
	mouse and key events.\n\
	returns: nil\n\
]]\n\
local function handleEvents()\n\
	local programActive = true\n\
	while programActive do\n\
		local id,p1,p2,p3 = os.pullEvent()\n\
		if id=="mouse_click" or id=="mouse_drag" then\n\
			if p2 >= w-1 and p3 >= 1 and p3 <= 17 then\n\
				if id ~= "mouse_drag" then\n\
					-- Selecting an items in the colour picker\n\
					if p3 <= 16 then\n\
						if p1==1 then\n\
							leftColour = 2^(p3-1)\n\
						else\n\
							rightColour = 2^(p3-1)\n\
						end\n\
					else\n\
						if p1==1 then\n\
							leftColour = nil\n\
						else\n\
							rightColour = nil\n\
						end\n\
					end\n\
					drawCanvas()\n\
					drawInterface()\n\
				end\n\
			elseif p2 < w-1 and p3 <= h-1 then\n\
				-- Clicking on the canvas\n\
				local paintColour = nil\n\
				if p1==1 then\n\
					paintColour = leftColour\n\
				elseif p1==2 then\n\
					paintColour = rightColour\n\
				end\n\
				\n\
				canvas[p3][p2] = paintColour\n\
				drawCanvasPixel( p2, p3 )\n\
			end\n\
		elseif id=="key" then\n\
			if p1==keys.leftCtrl or p1==keys.rightCtrl then\n\
				programActive = not accessMenu()\n\
				drawInterface()\n\
			end\n\
		end\n\
	end\n\
end\n\
\n\
-- Init\n\
load(sPath)\n\
drawCanvas()\n\
drawInterface()\n\
\n\
-- Main loop\n\
handleEvents()\n\
\n\
-- Shutdown\n\
term.setBackgroundColour(colours.black)\n\
term.setTextColour(colours.white)\n\
term.clear()\n\
term.setCursorPos(1,1)\n\
';


rom["programs/computer/adventure"] = '\n\
\n\
local tBiomes = {\n\
	"in a forest",\n\
	"in a pine forest",\n\
	"knee deep in a swamp",\n\
	\n\
	"in a mountain range",\n\
	"in a desert",\n\
	"in a grassy plain",\n\
	"in frozen tundra",\n\
	\n\
	--"in the ocean",\n\
}\n\
\n\
local function hasTrees( _nBiome )\n\
	return _nBiome <= 3\n\
end\n\
\n\
local function hasStone( _nBiome )\n\
	return _nBiome == 4\n\
end\n\
\n\
local function hasRivers( _nBiome )\n\
	return _nBiome ~= 3 and _nBiome ~= 5\n\
end\n\
\n\
local items = {\n\
	["no tea"] = {\n\
		droppable = false,\n\
		desc = "Pull yourself together man.",\n\
	},\n\
	["a pig"] = {\n\
		heavy = true,\n\
		creature = true,\n\
		drops = { "some pork" },\n\
		aliases = { "pig" },\n\
		desc = "The pig has a square nose.",\n\
	},\n\
	["a cow"] = {\n\
		heavy = true,\n\
		creature = true,\n\
		aliases = { "cow" },\n\
		desc = "The cow stares at you blankly.",\n\
	},\n\
	["a sheep"] = {\n\
		heavy = true,\n\
		creature = true,\n\
		hitDrops = { "some wool" },\n\
		aliases = { "sheep" },\n\
		desc = "The sheep is fluffy.",\n\
	},\n\
	["a chicken"] = {\n\
		heavy = true,\n\
		creature = true,\n\
		drops = { "some chicken" },\n\
		aliases = { "chicken" },\n\
		desc = "The chicken looks delicious.",\n\
	},\n\
	["a creeper"] = {\n\
		heavy = true,\n\
		creature = true,\n\
		monster = true,\n\
		aliases = { "creeper" },\n\
		desc = "The creeper needs a hug.",\n\
	},\n\
	["a skeleton"] = {\n\
		heavy = true,\n\
		creature = true,\n\
		monster = true,\n\
		aliases = { "skeleton" },\n\
		nocturnal = true,\n\
		desc = "The head bone\'s connected to the neck bone, the neck bones connected to the chest bone, the chest bones connected to the arm bone, the arm bones connected to the bow, and the bow is pointed at you.",\n\
	},\n\
	["a zombie"] = {\n\
		heavy = true,\n\
		creature = true,\n\
		monster = true,\n\
		aliases = { "zombie" },\n\
		nocturnal = true,\n\
		desc = "All he wants to do is eat your brains.",\n\
	},\n\
	["a spider"] = {\n\
		heavy = true,\n\
		creature = true,\n\
		monster = true,\n\
		aliases = { "spider" },\n\
		desc = "Dozens of eyes stare back at you.",\n\
	},\n\
	["a cave entrance"] = {\n\
		heavy = true,\n\
		aliases = { "cave entance", "cave", "entrance" },\n\
		desc = "The entrance to the cave is dark, but it looks like you can climb down.",\n\
	},\n\
	["an exit to the surface"] = {\n\
		heavy = true,\n\
		aliases = { "exit to the surface", "exit", "opening" },\n\
		desc = "You can just see the sky through the opening.",\n\
	},\n\
	["a river"] = {\n\
		heavy = true,\n\
		aliases = { "river" },\n\
		desc = "The river flows majestically towards the horizon.",\n\
	},\n\
	["some wood"] = {\n\
		aliases = { "wood" },\n\
		material = true,\n\
		desc = "You could easilly craft this wood into planks.",\n\
	},\n\
	["some planks"] = {\n\
		aliases = { "planks", "wooden planks", "wood planks" },\n\
		desc = "You could easilly craft these planks into sticks.",\n\
	},\n\
	["some sticks"] = {\n\
		aliases = { "sticks", "wooden sticks", "wood sticks" },\n\
		desc = "A perfect handle for torches or a pickaxe.",\n\
	},\n\
	["a crafting table"] = {\n\
		aliases = { "crafting table", "craft table", "work bench", "workbench", "crafting bench", "table", },\n\
		desc = "It\'s a crafting table. I shouldn\'t tell you this, but these don\'t actually do anything in this game, you can craft tools whenever you like.",\n\
	},\n\
	["a furnace"] = {\n\
		aliases = { "furnace" },\n\
		desc = "It\'s a furnace. Between you and me, these don\'t actually do anything in this game.",\n\
	},\n\
	["a wooden pickaxe"] = {\n\
		aliases = { "pickaxe", "pick", "wooden pick", "wooden pickaxe", "wood pick", "wood pickaxe" },\n\
		tool = true,\n\
		toolLevel = 1,\n\
		toolType = "pick",\n\
		desc = "The pickaxe looks good for breaking stone and coal.",\n\
	},\n\
	["a stone pickaxe"] = {\n\
		aliases = { "pickaxe", "pick", "stone pick", "stone pickaxe" },\n\
		tool = true,\n\
		toolLevel = 2,\n\
		toolType = "pick",\n\
		desc = "The pickaxe looks good for breaking iron.",\n\
	},\n\
	["an iron pickaxe"] = {\n\
		aliases = { "pickaxe", "pick", "iron pick", "iron pickaxe" },\n\
		tool = true,\n\
		toolLevel = 3,\n\
		toolType = "pick",\n\
		desc = "The pickaxe looks strong enough to break diamond.",\n\
	},\n\
	["a diamond pickaxe"] = {\n\
		aliases = { "pickaxe", "pick", "diamond pick", "diamond pickaxe" },\n\
		tool = true,\n\
		toolLevel = 4,\n\
		toolType = "pick",\n\
		desc = "Best. Pickaxe. Ever.",\n\
	},\n\
	["a wooden sword"] = {\n\
		aliases = { "sword", "wooden sword", "wood sword" },\n\
		tool = true,\n\
		toolLevel = 1,\n\
		toolType = "sword",\n\
		desc = "Flimsy, but better than nothing.",\n\
	},\n\
	["a stone sword"] = {\n\
		aliases = { "sword", "stone sword" },\n\
		tool = true,\n\
		toolLevel = 2,\n\
		toolType = "sword",\n\
		desc = "A pretty good sword.",\n\
	},\n\
	["an iron sword"] = {\n\
		aliases = { "sword", "iron sword" },\n\
		tool = true,\n\
		toolLevel = 3,\n\
		toolType = "sword",\n\
		desc = "This sword can slay any enemy.",\n\
	},\n\
	["a diamond sword"] = {\n\
		aliases = { "sword", "diamond sword" },\n\
		tool = true,\n\
		toolLevel = 4,\n\
		toolType = "sword",\n\
		desc = "Best. Sword. Ever.",\n\
	},\n\
	["a wooden shovel"] = {\n\
		aliases = { "shovel", "wooden shovel", "wood shovel" },\n\
		tool = true,\n\
		toolLevel = 1,\n\
		toolType = "shovel",\n\
		desc = "Good for digging holes.",\n\
	},\n\
	["a stone shovel"] = {\n\
		aliases = { "shovel", "stone shovel" },\n\
		tool = true,\n\
		toolLevel = 2,\n\
		toolType = "shovel",\n\
		desc = "Good for digging holes.",\n\
	},\n\
	["an iron shovel"] = {\n\
		aliases = { "shovel", "iron shovel" },\n\
		tool = true,\n\
		toolLevel = 3,\n\
		toolType = "shovel",\n\
		desc = "Good for digging holes.",\n\
	},\n\
	["a diamond shovel"] = {\n\
		aliases = { "shovel", "diamond shovel" },\n\
		tool = true,\n\
		toolLevel = 4,\n\
		toolType = "shovel",\n\
		desc = "Good for digging holes.",\n\
	},\n\
	["some coal"] = {\n\
		aliases = { "coal" },\n\
		ore = true,\n\
		toolLevel = 1,\n\
		toolType = "pick",\n\
		desc = "That coal looks useful for building torches, if only you had a pickaxe to mine it.",\n\
	},\n\
	["some dirt"] = {\n\
		aliases = { "dirt" },\n\
		material = true,\n\
		desc = "Why not build a mudhut?",\n\
	},\n\
	["some stone"] = {\n\
		aliases = { "stone", "cobblestone" },\n\
		material = true,\n\
		ore = true,\n\
		infinite = true,\n\
		toolLevel = 1,\n\
		toolType = "pick",\n\
		desc = "Stone is useful for building things, and making stone pickaxes.",\n\
	},\n\
	["some iron"] = {\n\
		aliases = { "iron" },\n\
		material = true,\n\
		ore = true,\n\
		toolLevel = 2,\n\
		toolType = "pick",\n\
		desc = "That iron looks mighty strong, you\'ll need a stone pickaxe to mine it.",\n\
	},\n\
	["some diamond"] = {\n\
		aliases = { "diamond", "diamonds" },\n\
		material = true,\n\
		ore = true,\n\
		toolLevel = 3,\n\
		toolType = "pick",\n\
		desc = "Sparkly, rare, and impossible to mine without an iron pickaxe.",\n\
	},\n\
	["some torches"] = {\n\
		aliases = { "torches", "torch" },\n\
		desc = "These won\'t run out for a while.",\n\
	},\n\
	["a torch"] = {\n\
		aliases = { "torch" },\n\
		desc = "Fire, fire, burn so bright, won\'t you light my cave tonight?",\n\
	},\n\
	["some wool"] = {\n\
		aliases = { "wool" },\n\
		material = true,\n\
		desc = "Soft and good for building.",\n\
	},\n\
	["some pork"] = {\n\
		aliases = { "pork", "porkchops" },\n\
		food = true,\n\
		desc = "Delicious and nutricious.",\n\
	},\n\
	["some chicken"] = {\n\
		aliases = { "chicken" },\n\
		food = true,\n\
		desc = "Finger licking good.",\n\
	},\n\
}\n\
\n\
local tAnimals = {\n\
	"a pig", "a cow", "a sheep", "a chicken",\n\
}\n\
\n\
local tMonsters = {\n\
	"a creeper", "a skeleton", "a zombie", "a spider"\n\
}\n\
\n\
local tRecipes = {\n\
	["some planks"] = { "some wood" },\n\
	["some sticks"] = { "some planks" },\n\
	["some sticks"] = { "some planks" },\n\
	["a crafting table"] = { "some planks" },\n\
	["a furnace"] = { "some stone" },\n\
	["some torches"] = { "some sticks", "some coal" },\n\
	\n\
	["a wooden pickaxe"] = { "some planks", "some sticks" },\n\
	["a stone pickaxe"] = { "some stone", "some sticks" },\n\
	["an iron pickaxe"] = { "some iron", "some sticks" },\n\
	["a diamond pickaxe"] = { "some diamond", "some sticks" },\n\
\n\
	["a wooden sword"] = { "some planks", "some sticks" },\n\
	["a stone sword"] = { "some stone", "some sticks" },\n\
	["an iron sword"] = { "some iron", "some sticks" },\n\
	["a diamond sword"] = { "some diamond", "some sticks" },\n\
\n\
	["a wooden shovel"] = { "some planks", "some sticks" },\n\
	["a stone shovel"] = { "some stone", "some sticks" },\n\
	["an iron shovel"] = { "some iron", "some sticks" },\n\
	["a diamond shovel"] = { "some diamond", "some sticks" },\n\
}\n\
\n\
local tGoWest = {\n\
	"(life is peaceful there)",\n\
	"(lots of open air)",\n\
	"(to begin life anew)",\n\
	"(this is what we\'ll do)",\n\
	"(sun in winter time)",\n\
	"(we will do just fine)",\n\
	"(where the skies are blue)",\n\
	"(this and more we\'ll do)",\n\
}\n\
local nGoWest = 0\n\
\n\
local bRunning = true\n\
local tMap = { { {}, }, }\n\
local x,y,z = 0,0,0\n\
local inventory = {\n\
	["no tea"] = items["no tea"],\n\
}\n\
\n\
local nTurn = 0\n\
local nTimeInRoom = 0\n\
local bInjured = false\n\
\n\
local tDayCycle = {\n\
	"It is daytime.",\n\
	"It is daytime.",\n\
	"It is daytime.",\n\
	"It is daytime.",\n\
	"It is daytime.",\n\
	"It is daytime.",\n\
	"It is daytime.",\n\
	"It is daytime.",\n\
	"The sun is setting.",\n\
	"It is night.",\n\
	"It is night.",\n\
	"It is night.",\n\
	"It is night.",\n\
	"It is night.",\n\
	"The sun is rising.",\n\
}\n\
\n\
local function getTimeOfDay()\n\
	return math.fmod( math.floor(nTurn/3), #tDayCycle ) + 1\n\
end\n\
\n\
local function isSunny()\n\
	return (getTimeOfDay() < 10)\n\
end\n\
\n\
local function getRoom( x, y, z, dontCreate )\n\
	tMap[x] = tMap[x] or {}\n\
	tMap[x][y] = tMap[x][y] or {}\n\
	if not tMap[x][y][z] and dontCreate ~= true then\n\
 		local room = {\n\
 			items = {},\n\
 			exits = {},\n\
 			nMonsters = 0,\n\
 		}\n\
		tMap[x][y][z] = room\n\
		\n\
		if y == 0 then\n\
			-- Room is above ground\n\
\n\
			-- Pick biome\n\
			room.nBiome = math.random( 1, #tBiomes )\n\
			room.trees = hasTrees( room.nBiome )\n\
		\n\
			-- Add animals\n\
			if math.random(1,3) == 1 then\n\
				for n = 1,math.random(1,2) do\n\
					local sAnimal = tAnimals[ math.random( 1, #tAnimals ) ]\n\
					room.items[ sAnimal ] = items[ sAnimal ]\n\
				end\n\
			end\n\
			\n\
			-- Add surface ore\n\
			if math.random(1,5) == 1 or hasStone( room.nBiome ) then\n\
				room.items[ "some stone" ] = items[ "some stone" ]\n\
			end\n\
			if math.random(1,8) == 1 then\n\
				room.items[ "some coal" ] = items[ "some coal" ]\n\
			end\n\
			if math.random(1,8) == 1 and hasRivers( room.nBiome ) then\n\
				room.items[ "a river" ] = items[ "a river" ]\n\
			end\n\
		\n\
			-- Add exits\n\
			room.exits = {\n\
				["north"] = true,\n\
				["south"] = true,\n\
				["east"] = true,\n\
				["west"] = true,\n\
			}\n\
			if math.random(1,8) == 1 then\n\
				room.exits["down"] = true\n\
				room.items["a cave entrance"] = items["a cave entrance"]\n\
			end\n\
						\n\
		else\n\
			-- Room is underground\n\
			-- Add exits\n\
			local function tryExit( sDir, sOpp, x, y, z )\n\
				local adj = getRoom( x, y, z, true )\n\
				if adj then\n\
					if adj.exits[sOpp] then\n\
						room.exits[sDir] = true\n\
					end\n\
				else\n\
					if math.random(1,3) == 1 then\n\
						room.exits[sDir] = true\n\
					end\n\
				end\n\
			end\n\
			\n\
			if y == -1 then\n\
				local above = getRoom( x, y + 1, z )\n\
				if above.exits["down"] then\n\
					room.exits["up"] = true\n\
					room.items["an exit to the surface"] = items["an exit to the surface"]\n\
				end\n\
			else\n\
				tryExit( "up", "down", x, y + 1, z )\n\
			end\n\
			\n\
			if y > -3 then\n\
				tryExit( "down", "up", x, y - 1, z )\n\
			end\n\
			\n\
			tryExit( "east", "west", x - 1, y, z )\n\
			tryExit( "west", "east", x + 1, y, z )\n\
			tryExit( "north", "south", x, y, z + 1 )\n\
			tryExit( "south", "north", x, y, z - 1 )	\n\
			\n\
			-- Add ores\n\
			room.items[ "some stone" ] = items[ "some stone" ]\n\
			if math.random(1,3) == 1 then\n\
				room.items[ "some coal" ] = items[ "some coal" ]\n\
			end\n\
			if math.random(1,8) == 1 then\n\
				room.items[ "some iron" ] = items[ "some iron" ]\n\
			end\n\
			if y == -3 and math.random(1,15) == 1 then\n\
				room.items[ "some diamond" ] = items[ "some diamond" ]\n\
			end\n\
			\n\
			-- Turn out the lights\n\
			room.dark = true\n\
		end\n\
	end\n\
	return tMap[x][y][z]\n\
end\n\
\n\
local function itemize( t )\n\
	local item = next( t )\n\
	if item == nil then\n\
		return "nothing"\n\
	end\n\
	\n\
	local text = ""\n\
	while item do\n\
		text = text .. item\n\
		\n\
		local nextItem = next( t, item )\n\
		if nextItem ~= nil then\n\
			local nextNextItem = next( t, nextItem )\n\
			if nextNextItem == nil then\n\
				text = text .. " and "\n\
			else\n\
				text = text .. ", "\n\
			end\n\
		end\n\
		item = nextItem\n\
	end\n\
	return text\n\
end\n\
\n\
function findItem( _tList, _sQuery )\n\
	for sItem, tItem in pairs( _tList ) do\n\
		if sItem == _sQuery then\n\
			return sItem\n\
		end\n\
		if tItem.aliases ~= nil then\n\
			for n, sAlias in pairs( tItem.aliases ) do\n\
				if sAlias == _sQuery then\n\
					return sItem\n\
				end\n\
			end\n\
		end\n\
	end\n\
	return nil\n\
end\n\
\n\
local tMatches = {\n\
	["wait"] = {\n\
		"wait",\n\
	},\n\
	["look"] = {\n\
		"look at the ([%a ]+)",\n\
		"look at ([%a ]+)",\n\
		"look",\n\
		"inspect ([%a ]+)",\n\
		"inspect the ([%a ]+)",\n\
		"inspect",\n\
	},\n\
	["inventory"] = {\n\
		"check self",\n\
		"check inventory",\n\
		"inventory",\n\
		"i",\n\
	},\n\
	["go"] = {\n\
		"go (%a+)",\n\
		"travel (%a+)",\n\
		"walk (%a+)",\n\
		"run (%a+)",\n\
		"go",\n\
	},\n\
	["dig"] = {\n\
		"dig (%a+) using ([%a ]+)",\n\
		"dig (%a+) with ([%a ]+)",\n\
		"dig (%a+)",\n\
		"dig",\n\
	},\n\
	["take"] = {\n\
		"pick up the ([%a ]+)",\n\
		"pick up ([%a ]+)",\n\
		"pickup ([%a ]+)",\n\
		"take the ([%a ]+)",\n\
		"take ([%a ]+)",\n\
		"take",\n\
	},\n\
	["drop"] = {\n\
		"put down the ([%a ]+)",\n\
		"put down ([%a ]+)",\n\
		"drop the ([%a ]+)",\n\
		"drop ([%a ]+)",\n\
		"drop",\n\
	},\n\
	["place"] = {\n\
		"place the ([%a ]+)",\n\
		"place ([%a ]+)",\n\
		"place",\n\
	},\n\
	["cbreak"] = {\n\
		"punch the ([%a ]+)",\n\
		"punch ([%a ]+)",\n\
		"punch",\n\
		"break the ([%a ]+) with the ([%a ]+)",\n\
		"break ([%a ]+) with ([%a ]+) ",\n\
		"break the ([%a ]+)",\n\
		"break ([%a ]+)",\n\
		"break",\n\
	},\n\
	["mine"] = {\n\
		"mine the ([%a ]+) with the ([%a ]+)",\n\
		"mine ([%a ]+) with ([%a ]+)",\n\
		"mine ([%a ]+)",\n\
		"mine",\n\
	},\n\
	["attack"] = {\n\
		"attack the ([%a ]+) with the ([%a ]+)",\n\
		"attack ([%a ]+) with ([%a ]+)",\n\
		"attack ([%a ]+)",\n\
		"attack",\n\
		"kill the ([%a ]+) with the ([%a ]+)",\n\
		"kill ([%a ]+) with ([%a ]+)",\n\
		"kill ([%a ]+)",\n\
		"kill",\n\
		"hit the ([%a ]+) with the ([%a ]+)",\n\
		"hit ([%a ]+) with ([%a ]+)",\n\
		"hit ([%a ]+)",\n\
		"hit",\n\
	},\n\
	["craft"] = {\n\
		"craft a ([%a ]+)",\n\
		"craft some ([%a ]+)",\n\
		"craft ([%a ]+)",\n\
		"craft",\n\
		"make a ([%a ]+)",\n\
		"make some ([%a ]+)",\n\
		"make ([%a ]+)",\n\
		"make",\n\
	},\n\
	["build"] = {\n\
		"build ([%a ]+) out of ([%a ]+)",\n\
		"build ([%a ]+) from ([%a ]+)",\n\
		"build ([%a ]+)",\n\
		"build",\n\
	},\n\
	["eat"] = {\n\
		"eat a ([%a ]+)",\n\
		"eat the ([%a ]+)",\n\
		"eat ([%a ]+)",\n\
		"eat",\n\
	},\n\
	["help"] = {\n\
		"help me",\n\
		"help",\n\
	},\n\
	["exit"] = {\n\
		"exit",\n\
		"quit",\n\
		"goodbye",\n\
		"good bye",\n\
		"bye",\n\
		"farewell",\n\
	},\n\
}\n\
\n\
local commands = {}\n\
function doCommand( text )\n\
	if text == "" then\n\
		commands[ "noinput" ]()\n\
		return\n\
	end\n\
	\n\
	for sCommand, t in pairs( tMatches ) do\n\
		for n, sMatch in pairs( t ) do\n\
			local tCaptures = { string.match( text, "^" .. sMatch .. "$" ) }\n\
			if #tCaptures ~= 0 then\n\
				local fnCommand = commands[ sCommand ]\n\
				if #tCaptures == 1 and tCaptures[1] == sMatch then\n\
					fnCommand()\n\
				else\n\
					fnCommand( unpack( tCaptures ) )\n\
				end\n\
				return\n\
			end\n\
		end\n\
	end\n\
	commands[ "badinput" ]()\n\
end\n\
\n\
function commands.wait()\n\
	print( "Time passes..." )\n\
end\n\
\n\
function commands.look( _sTarget )\n\
	local room = getRoom( x,y,z )\n\
	if room.dark then\n\
		print( "It is pitch dark." )\n\
		return\n\
	end\n\
\n\
	if _sTarget == nil then\n\
		-- Look at the world\n\
		if y == 0 then\n\
			io.write( "You are standing " .. tBiomes[room.nBiome] .. ". " )\n\
			print( tDayCycle[ getTimeOfDay() ] )\n\
		else\n\
			io.write( "You are underground. " )\n\
			if next( room.exits ) ~= nil then\n\
				print( "You can travel "..itemize( room.exits ).."." )\n\
			else\n\
				print()\n\
			end\n\
		end\n\
		if next( room.items ) ~= nil then\n\
			print( "There is " .. itemize( room.items ) .. " here." )\n\
		end\n\
		if room.trees then\n\
			print( "There are trees here." )\n\
		end\n\
		\n\
	else\n\
		-- Look at stuff\n\
		if room.trees and (_sTarget == "tree" or _sTarget == "trees") then\n\
			print( "The trees look easy to break." )\n\
		elseif _sTarget == "self" or _sTarget == "myself" then\n\
			print( "Very handsome." )\n\
		else\n\
			local tItem = nil\n\
			local sItem = findItem( room.items, _sTarget )\n\
			if sItem then\n\
				tItem = room.items[sItem]\n\
			else\n\
				sItem = findItem( inventory, _sTarget )\n\
				if sItem then\n\
					tItem = inventory[sItem]\n\
				end\n\
			end\n\
			\n\
			if tItem then\n\
				print( tItem.desc or ("You see nothing special about "..sItem..".") )\n\
			else\n\
				print( "You don\'t see any ".._sTarget.." here." )\n\
			end\n\
		end\n\
	end\n\
end\n\
\n\
function commands.go( _sDir )\n\
	local room = getRoom( x,y,z )\n\
	if _sDir == nil then\n\
		print( "Go where?" )\n\
		return\n\
	end\n\
	\n\
	if nGoWest ~= nil then\n\
		if _sDir == "west" then\n\
			nGoWest = nGoWest + 1\n\
			if nGoWest > #tGoWest then\n\
				nGoWest = 1\n\
			end\n\
			print( tGoWest[ nGoWest ] )\n\
		else\n\
			if nGoWest > 0 or nTurn > 6 then\n\
				nGoWest = nil\n\
			end\n\
		end\n\
	end\n\
	\n\
	if room.exits[_sDir] == nil then\n\
		print( "You can\'t go that way." )\n\
		return\n\
	end\n\
	\n\
	if _sDir == "north" then\n\
		z = z + 1\n\
	elseif _sDir == "south" then\n\
		z = z - 1\n\
	elseif _sDir == "east" then\n\
		x = x - 1\n\
	elseif _sDir == "west" then\n\
		x = x + 1\n\
	elseif _sDir == "up" then\n\
		y = y + 1\n\
	elseif _sDir == "down" then\n\
		y = y - 1\n\
	else\n\
		print( "I don\'t understand that direction." )\n\
		return\n\
	end\n\
	\n\
	nTimeInRoom = 0\n\
	doCommand( "look" )\n\
end\n\
\n\
function commands.dig( _sDir, _sTool )\n\
	local room = getRoom( x,y,z )\n\
	if _sDir == nil then\n\
		print( "Dig where?" )\n\
		return\n\
	end\n\
	\n\
	local sTool = nil\n\
	local tTool = nil\n\
	if _sTool ~= nil then\n\
		sTool = findItem( inventory, _sTool )\n\
		if not sTool then\n\
			print( "You\'re not carrying a ".._sTool.."." )\n\
			return\n\
		end\n\
		tTool = inventory[ sTool ]\n\
	end\n\
	\n\
	local room = getRoom( x, y, z )\n\
	local bActuallyDigging = (room.exits[ _sDir ] ~= true)\n\
	if bActuallyDigging then\n\
		if sTool == nil or tTool.toolType ~= "pick" then\n\
			print( "You need to use a pickaxe to dig through stone." )\n\
			return\n\
		end\n\
	end\n\
	\n\
	if _sDir == "north" then\n\
		room.exits["north"] = true\n\
		z = z + 1\n\
		getRoom( x, y, z ).exits["south"] = true\n\
\n\
	elseif _sDir == "south" then\n\
		room.exits["south"] = true\n\
		z = z - 1\n\
		getRoom( x, y, z ).exits["north"] = true\n\
		\n\
	elseif _sDir == "east" then\n\
		room.exits["east"] = true\n\
		x = x - 1\n\
		getRoom( x, y, z ).exits["west"] = true\n\
		\n\
	elseif _sDir == "west" then\n\
		room.exits["west"] = true\n\
		x = x + 1\n\
		getRoom( x, y, z ).exits["east"] = true\n\
		\n\
	elseif _sDir == "up" then\n\
		if y == 0 then\n\
			print( "You can\'t dig that way." )\n\
			return\n\
		end\n\
\n\
		room.exits["up"] = true\n\
		if y == -1 then\n\
			room.items[ "an exit to the surface" ] = items[ "an exit to the surface" ]\n\
		end\n\
		y = y + 1\n\
		\n\
		room = getRoom( x, y, z )\n\
		room.exits["down"] = true\n\
		if y == 0 then\n\
			room.items[ "a cave entrance" ] = items[ "a cave entrance" ]\n\
		end\n\
		\n\
	elseif _sDir == "down" then\n\
		if y <= -3 then\n\
			print( "You hit bedrock." )\n\
			return\n\
		end\n\
\n\
		room.exits["down"] = true\n\
		if y == 0 then\n\
			room.items[ "a cave entrance" ] = items[ "a cave entrance" ]\n\
		end\n\
		y = y - 1\n\
		\n\
		room = getRoom( x, y, z )\n\
		room.exits["up"] = true\n\
		if y == -1 then\n\
			room.items[ "an exit to the surface" ] = items[ "an exit to the surface" ]\n\
		end\n\
		\n\
	else\n\
		print( "I don\'t understand that direction." )\n\
		return\n\
	end\n\
	\n\
	--\n\
	if bActuallyDigging then\n\
		if _sDir == "down" and y == -1 or\n\
		   _sDir == "up" and y == 0 then\n\
			inventory[ "some dirt" ] = items[ "some dirt" ]\n\
			inventory[ "some stone" ] = items[ "some stone" ]\n\
			print( "You dig ".._sDir.." using "..sTool.." and collect some dirt and stone." )\n\
		else\n\
			inventory[ "some stone" ] = items[ "some stone" ]\n\
			print( "You dig ".._sDir.." using "..sTool.." and collect some stone." )\n\
		end\n\
	end\n\
	\n\
	nTimeInRoom = 0\n\
	doCommand( "look" )\n\
end\n\
\n\
function commands.inventory()\n\
	print( "You are carrying " .. itemize( inventory ) .. "." )\n\
end\n\
\n\
function commands.drop( _sItem )\n\
	if _sItem == nil then\n\
		print( "Drop what?" )\n\
		return\n\
	end\n\
	\n\
	local room = getRoom( x,y,z )\n\
	local sItem = findItem( inventory, _sItem )\n\
	if sItem then\n\
		local tItem = inventory[ sItem ]\n\
		if tItem.droppable == false then\n\
			print( "You can\'t drop that." )\n\
		else\n\
			room.items[ sItem ] = tItem\n\
			inventory[ sItem ] = nil\n\
			print( "Dropped." )\n\
		end\n\
	else\n\
		print( "You don\'t have a ".._sItem.."." )\n\
	end\n\
end\n\
\n\
function commands.place( _sItem )\n\
	if _sItem == nil then\n\
		print( "Place what?" )\n\
		return\n\
	end\n\
	\n\
	if _sItem == "torch" or _sItem == "a torch" then\n\
		local room = getRoom( x,y,z )\n\
		if inventory["some torches"] or inventory["a torch"] then\n\
			inventory["a torch"] = nil\n\
			room.items["a torch"] = items["a torch"]\n\
			if room.dark then\n\
				print( "The cave lights up under the torchflame." )\n\
				room.dark = false\n\
			elseif y == 0 and not isSunny() then\n\
				print( "The night gets a little brighter." )\n\
			else\n\
				print( "Placed." )\n\
			end\n\
		else\n\
			print( "You don\'t have torches." )\n\
		end\n\
		return\n\
	end\n\
	\n\
	commands.drop( _sItem )\n\
end\n\
\n\
function commands.take( _sItem )\n\
	if _sItem == nil then\n\
		print( "Take what?" )\n\
		return\n\
	end\n\
\n\
	local room = getRoom( x,y,z )\n\
	local sItem = findItem( room.items, _sItem )\n\
	if sItem then\n\
		local tItem = room.items[ sItem ]\n\
		if tItem.heavy == true then\n\
			print( "You can\'t carry "..sItem.."." )\n\
		elseif tItem.ore == true then\n\
			print( "You need to mine this ore." )\n\
		else\n\
			if tItem.infinite ~= true then\n\
				room.items[ sItem ] = nil\n\
			end\n\
			inventory[ sItem ] = tItem\n\
			\n\
			if inventory["some torches"] and inventory["a torch"] then\n\
				inventory["a torch"] = nil\n\
			end\n\
			if sItem == "a torch" and y < 0 then\n\
				room.dark = true\n\
				print( "The cave plunges into darkness." )\n\
			else\n\
				print( "Taken." )\n\
			end\n\
		end\n\
	else\n\
		print( "You don\'t see a ".._sItem.." here." )\n\
	end\n\
end\n\
\n\
function commands.mine( _sItem, _sTool )\n\
	if _sItem == nil then\n\
		print( "Mine what?" )\n\
		return\n\
	end\n\
	if _sTool == nil then\n\
		print( "Mine ".._sItem.." with what?" )\n\
		return\n\
	end	\n\
	commands.cbreak( _sItem, _sTool )\n\
end\n\
\n\
function commands.attack( _sItem, _sTool )\n\
	if _sItem == nil then\n\
		print( "Attack what?" )\n\
		return\n\
	end\n\
	commands.cbreak( _sItem, _sTool )\n\
end\n\
\n\
function commands.cbreak( _sItem, _sTool )\n\
	if _sItem == nil then\n\
		print( "Break what?" )\n\
		return\n\
	end\n\
	\n\
	local sTool = nil\n\
	if _sTool ~= nil then\n\
		sTool = findItem( inventory, _sTool )\n\
		if sTool == nil then\n\
			print( "You\'re not carrying a ".._sTool.."." )\n\
			return\n\
		end\n\
	end\n\
\n\
	local room = getRoom( x,y,z )\n\
	if _sItem == "tree" or _sItem == "trees" or _sItem == "a tree" then\n\
		print( "The tree breaks into blocks of wood, which you pick up." )\n\
		inventory[ "some wood" ] = items[ "some wood" ]\n\
		return\n\
	elseif _sItem == "self" or _sItem == "myself" then\n\
		if term.isColour() then\n\
			term.setTextColour( colours.red )\n\
		end\n\
		print( "You have died." )\n\
		print( "Score: &e0" )\n\
		term.setTextColour( colours.white )\n\
		bRunning = false\n\
		return\n\
	end\n\
	\n\
	local sItem = findItem( room.items, _sItem )\n\
	if sItem then\n\
		local tItem = room.items[ sItem ]\n\
		if tItem.ore == true then\n\
			-- Breaking ore\n\
			if not sTool then\n\
				print( "You need a tool to break this ore." )\n\
				return\n\
			end\n\
			local tTool = inventory[ sTool ]\n\
			if tTool.tool then\n\
				if tTool.toolLevel < tItem.toolLevel then\n\
					print( sTool .." is not strong enough to break this ore." )\n\
				elseif tTool.toolType ~= tItem.toolType then\n\
					print( "You need a different kind of tool to break this ore." )\n\
				else\n\
					print( "The ore breaks, dropping "..sItem..", which you pick up." )\n\
					inventory[ sItem ] = items[ sItem ]\n\
					if tItem.infinite ~= true then\n\
						room.items[ sItem ] = nil\n\
					end\n\
				end\n\
			else\n\
				print( "You can\'t break "..sItem.." with "..sTool..".")\n\
			end\n\
			\n\
		elseif tItem.creature == true then\n\
			-- Fighting monsters (or pigs)\n\
			local toolLevel = 0\n\
			local tTool = nil\n\
			if sTool then\n\
				tTool = inventory[ sTool ]\n\
				if tTool.toolType == "sword" then\n\
					toolLevel = tTool.toolLevel\n\
				end\n\
			end\n\
						\n\
			local tChances = { 0.2, 0.4, 0.55, 0.8, 1 }\n\
			if math.random() <= tChances[ toolLevel + 1 ] then\n\
				room.items[ sItem ] = nil\n\
				print( "The "..tItem.aliases[1].." dies." )\n\
	\n\
				if tItem.drops then\n\
					for n, sDrop in pairs( tItem.drops ) do\n\
						if not room.items[sDrop] then\n\
							print( "The "..tItem.aliases[1].." dropped "..sDrop.."." )\n\
							room.items[sDrop] = items[sDrop]\n\
						end\n\
					end\n\
				end\n\
				\n\
				if tItem.monster then\n\
					room.nMonsters = room.nMonsters - 1\n\
				end\n\
			else\n\
				print( "The "..tItem.aliases[1].." is injured by your blow." )\n\
			end\n\
			\n\
			if tItem.hitDrops then\n\
				for n, sDrop in pairs( tItem.hitDrops ) do\n\
					if not room.items[sDrop] then\n\
						print( "The "..tItem.aliases[1].." dropped "..sDrop.."." )\n\
						room.items[sDrop] = items[sDrop]\n\
					end\n\
				end\n\
			end\n\
		\n\
		else\n\
			print( "You can\'t break "..sItem.."." )\n\
		end\n\
	else\n\
		print( "You don\'t see a ".._sItem.." here." )\n\
	end\n\
end\n\
\n\
function commands.craft( _sItem )\n\
	if _sItem == nil then\n\
		print( "Craft what?" )\n\
		return\n\
	end\n\
	\n\
	if _sItem == "computer" or _sItem == "a computer" then\n\
		print( "By creating a computer in a computer in a computer, you tear a hole in the spacetime continuum from which no mortal being can escape." )\n\
		if term.isColour() then\n\
			term.setTextColour( colours.red )\n\
		end\n\
		print( "You have died." )\n\
		print( "Score: &e0" )\n\
		term.setTextColour( colours.white )\n\
		bRunning = false\n\
		return\n\
	end\n\
	\n\
	local room = getRoom( x,y,z )\n\
	local sItem = findItem( items, _sItem )\n\
	local tRecipe = (sItem and tRecipes[ sItem ]) or nil\n\
	if tRecipe then\n\
		for n,sReq in ipairs( tRecipe ) do\n\
			if inventory[sReq] == nil then\n\
				print( "You don\'t have the items you need to craft "..sItem.."." )\n\
				return\n\
			end\n\
		end\n\
		\n\
		for n,sReq in ipairs( tRecipe ) do\n\
			inventory[sReq] = nil\n\
		end\n\
		inventory[ sItem ] = items[ sItem ]\n\
		if inventory["some torches"] and inventory["a torch"] then\n\
			inventory["a torch"] = nil\n\
		end\n\
		print( "Crafted." )\n\
	else\n\
		print( "You don\'t know how to make "..(sItem or _sItem).."." )\n\
	end	\n\
end\n\
\n\
function commands.build( _sThing, _sMaterial )\n\
	if _sThing == nil then\n\
		print( "Build what?" )\n\
		return\n\
	end\n\
		\n\
	local sMaterial = nil\n\
	if _sMaterial == nil then\n\
		for sItem, tItem in pairs( inventory ) do\n\
			if tItem.material then\n\
				sMaterial = sItem\n\
				break\n\
			end\n\
		end\n\
		if sMaterial == nil then\n\
			print( "You don\'t have any building materials." )\n\
			return\n\
		end\n\
	else\n\
		sMaterial = findItem( inventory, _sMaterial )\n\
		if not sMaterial then\n\
			print( "You don\'t have any ".._sMaterial )\n\
			return\n\
		end\n\
		\n\
		if inventory[sMaterial].material ~= true then\n\
			print( sMaterial.." is not a good building material." )\n\
			return\n\
		end\n\
	end\n\
	\n\
	local alias = nil\n\
	if string.sub(_sThing, 1, 1) == "a" then\n\
		alias = string.match( _sThing, "a ([%a ]+)" )\n\
	end\n\
	\n\
	local room = getRoom( x,y,z )\n\
	inventory[sMaterial] = nil\n\
	room.items[ _sThing ] = {\n\
		heavy = true,\n\
		aliases = { alias },\n\
		desc = "As you look at your creation (made from "..sMaterial.."), you feel a swelling sense of pride.",\n\
	}\n\
\n\
	print( "Your construction is complete." )\n\
end\n\
\n\
function commands.help()\n\
	local sText = \n\
		"Welcome to adventure, the greatest text adventure game on CraftOS. " ..\n\
		"To get around the world, type actions, and the adventure will " ..\n\
		"be read back to you. The actions availiable to you are go, look, inspect, inventory, " ..\n\
		"take, drop, place, punch, attack, mine, dig, craft, build, eat and exit."\n\
	print( sText )\n\
end\n\
\n\
function commands.eat( _sItem )\n\
	if _sItem == nil then\n\
		print( "Eat what?" )\n\
		return\n\
	end\n\
\n\
	local sItem = findItem( inventory, _sItem )\n\
	if not sItem then\n\
		print( "You don\'t have any ".._sItem.."." )\n\
		return\n\
	end\n\
	\n\
	local tItem = inventory[sItem]\n\
	if tItem.food then\n\
		print( "That was delicious!" )\n\
		inventory[sItem] = nil\n\
		\n\
		if bInjured then\n\
			print( "You are no longer injured." )\n\
			bInjured = false\n\
		end\n\
	else\n\
		print( "You can\'t eat "..sItem.."." )\n\
	end\n\
end\n\
\n\
function commands.exit()\n\
	bRunning = false\n\
end\n\
\n\
function commands.badinput()\n\
	local tResponses = {\n\
		"I don\'t understand.",\n\
		"I don\'t understand you.",\n\
		"You can\'t do that.",\n\
		"Nope.",\n\
		"Huh?",\n\
		"Say again?",\n\
		"That\'s crazy talk.",\n\
		"Speak clearly.",\n\
		"I\'ll think about it.",\n\
		"Let me get back to you on that one.",\n\
		"That doesn\'t make any sense.",\n\
		"What?",\n\
	}\n\
	print( tResponses[ math.random(1,#tResponses) ] )\n\
end\n\
\n\
function commands.noinput()\n\
	local tResponses = {\n\
		"Speak up.",\n\
		"Enunciate.",\n\
		"Project your voice.",\n\
		"Don\'t be shy.",\n\
		"Use your words.",\n\
	}\n\
	print( tResponses[ math.random(1,#tResponses) ] )\n\
end\n\
\n\
local function simulate()\n\
	local bNewMonstersThisRoom = false\n\
	\n\
	-- Spawn monsters in nearby rooms\n\
	for sx = -2,2 do\n\
		for sy = -1,1 do\n\
			for sz = -2,2 do\n\
				local h = y + sy\n\
				if h >= -3 and h <= 0 then\n\
					local room = getRoom( x + sx, h, z + sz )\n\
					\n\
					-- Spawn monsters\n\
					if room.nMonsters < 2 and\n\
					   ((h == 0 and not isSunny() and not room.items["a torch"]) or room.dark) and\n\
					   math.random(1,6) == 1 then\n\
					   \n\
						local sMonster = tMonsters[ math.random(1,#tMonsters) ]\n\
						if room.items[ sMonster ] == nil then\n\
					   		room.items[ sMonster ] = items[ sMonster ]\n\
					   		room.nMonsters = room.nMonsters + 1\n\
					   		\n\
					   		if sx == 0 and sy == 0 and sz == 0 and not room.dark then\n\
					   			print( "From the shadows, "..sMonster.." appears." )\n\
					   			bNewMonstersThisRoom = true\n\
					   		end\n\
						end	\n\
					end\n\
					\n\
					-- Burn monsters\n\
					if h == 0 and isSunny() then\n\
						for n,sMonster in ipairs( tMonsters ) do\n\
							if room.items[sMonster] and items[sMonster].nocturnal then\n\
								room.items[sMonster] = nil\n\
						   		if sx == 0 and sy == 0 and sz == 0 and not room.dark then\n\
						   			print( "With the sun high in the sky, the "..items[sMonster].aliases[1].." bursts into flame and dies." )\n\
						   		end\n\
						   		room.nMonsters = room.nMonsters - 1\n\
						   	end\n\
						end\n\
					end	\n\
				end\n\
			end\n\
		end\n\
	end\n\
\n\
	-- Make monsters attack\n\
	local room = getRoom( x, y, z )\n\
	if nTimeInRoom >= 2 and not bNewMonstersThisRoom then\n\
		for n,sMonster in ipairs( tMonsters ) do\n\
			if room.items[sMonster] then\n\
				if math.random(1,4) == 1 and\n\
				   not (y == 0 and isSunny() and (sMonster == "a spider")) then\n\
					if sMonster == "a creeper" then\n\
						if room.dark then\n\
							print( "A creeper explodes." )\n\
						else\n\
							print( "The creeper explodes." )\n\
						end\n\
						room.items[sMonster] = nil\n\
						room.nMonsters = room.nMonsters - 1\n\
					else\n\
						if room.dark then\n\
							print( "A "..items[sMonster].aliases[1].." attacks you." )\n\
						else\n\
							print( "The "..items[sMonster].aliases[1].." attacks you." )\n\
						end\n\
					end\n\
					\n\
					if bInjured then\n\
						if term.isColour() then\n\
							term.setTextColour( colours.red )\n\
						end\n\
						print( "You have died." )\n\
						print( "Score: &e0" )\n\
						term.setTextColour( colours.white )\n\
						bRunning = false\n\
						return\n\
					else\n\
						bInjured = true\n\
					end\n\
					\n\
					break\n\
				end\n\
			end\n\
		end\n\
	end\n\
	\n\
	-- Always print this\n\
	if bInjured then\n\
		if term.isColour() then\n\
			term.setTextColour( colours.red )\n\
		end\n\
		print( "You are injured." )\n\
		term.setTextColour( colours.white )\n\
	end\n\
	\n\
	-- Advance time\n\
	nTurn = nTurn + 1\n\
	nTimeInRoom = nTimeInRoom + 1\n\
end\n\
\n\
doCommand( "look" )\n\
simulate()\n\
\n\
local tCommandHistory = {}\n\
while bRunning do\n\
	if term.isColour() then\n\
		term.setTextColour( colours.yellow )\n\
	end\n\
    write( "? " )\n\
	term.setTextColour( colours.white )\n\
		\n\
    local sRawLine = read( nil, tCommandHistory )\n\
    table.insert( tCommandHistory, sRawLine )\n\
    \n\
    local sLine = nil\n\
	for match in string.gmatch(sRawLine, "%a+") do\n\
		if sLine then\n\
			sLine = sLine .. " " .. string.lower(match)\n\
		else\n\
			sLine = string.lower(match)\n\
		end\n\
	end\n\
	\n\
	doCommand( sLine or "" )\n\
    if bRunning then\n\
	    simulate()\n\
	end\n\
end\n\
';


rom["programs/computer/hello"] = '\n\
if term.isColour() then\n\
	term.setTextColour( 2^math.random(0,15) )\n\
end\n\
textutils.slowPrint( "Hello World!" )\n\
term.setTextColour( colours.white )\n\
';

rom["programs/computer/worm"] = '\n\
\n\
-- Display the start screen\n\
local w,h = term.getSize()\n\
\n\
local headingColour, textColour, wormColour, fruitColour\n\
if term.isColour() then\n\
	headingColour = colours.yellow\n\
	textColour = colours.white\n\
	wormColour = colours.green\n\
	fruitColour = colours.red\n\
else\n\
	headingColour = colours.white\n\
	textColour = colours.white\n\
	wormColour = colours.white\n\
	fruitColour = colours.white\n\
end\n\
\n\
function printCentred( y, s )\n\
	local x = math.floor((w - string.len(s)) / 2)\n\
	term.setCursorPos(x,y)\n\
	--term.clearLine()\n\
	term.write( s )\n\
end\n\
\n\
local xVel,yVel = 1,0\n\
local xPos, yPos = math.floor(w/2), math.floor(h/2)\n\
local pxVel, pyVel = nil, nil\n\
\n\
local nLength = 1\n\
local nExtraLength = 6\n\
local bRunning = true\n\
\n\
local tailX,tailY = xPos,yPos\n\
local nScore = 0\n\
local nDifficulty = 2\n\
local nSpeed, nInterval\n\
\n\
-- Setup the screen\n\
local screen = {}\n\
for x=1,w do\n\
	screen[x] = {}\n\
	for y=1,h do\n\
		screen[x][y] = {}\n\
	end\n\
end\n\
screen[xPos][yPos] = { snake = true }\n\
\n\
local nFruit = 1\n\
local tFruits = {\n\
	"A", "B", "C", "D", "E", "F", "G", "H",\n\
	"I", "J", "K", "L", "M", "N", "O", "P",\n\
	"Q", "R", "S", "T", "U", "V", "W", "X",\n\
	"Y", "Z",\n\
	"a", "b", "c", "d", "e", "f", "g", "h",\n\
	"i", "j", "k", "l", "m", "n", "o", "p",\n\
	"q", "r", "s", "t", "u", "v", "w", "x",\n\
	"y", "z",\n\
	"1", "2", "3", "4", "5", "6", "7", "8", "9", "0",\n\
	"@", "$", "%", "#", "&", "!", "?", "+", "*", "~"\n\
}\n\
\n\
local function addFruit()\n\
	while true do\n\
		local x = math.random(1,w)\n\
		local y = math.random(2,h)\n\
		local fruit = screen[x][y]\n\
		if fruit.snake == nil and fruit.wall == nil and fruit.fruit == nil then\n\
			screen[x][y] = { fruit = true }\n\
			term.setCursorPos(x,y)\n\
			term.setBackgroundColour( fruitColour )\n\
			term.write(" ")\n\
			term.setBackgroundColour( colours.black )\n\
			break\n\
		end\n\
	end\n\
	\n\
	nFruit = nFruit + 1\n\
	if nFruit > #tFruits then\n\
		nFruit = 1\n\
	end\n\
end\n\
\n\
local function drawMenu()\n\
	term.setTextColour( headingColour )\n\
	term.setCursorPos(1,1)\n\
	term.write( "SCORE " )\n\
	\n\
	term.setTextColour( textColour )\n\
	term.setCursorPos(7,1)\n\
	term.write( tostring(nScore) )\n\
\n\
	term.setTextColour( headingColour )\n\
	term.setCursorPos(w-11,1)\n\
	term.write( "DIFFICULTY ")\n\
\n\
	term.setTextColour( textColour )\n\
	term.setCursorPos(w,1)\n\
	term.write( tostring(nDifficulty or "?") ) \n\
\n\
	term.setTextColour( colours.white )\n\
end\n\
\n\
local function update( )\n\
	local x,y = xPos,yPos\n\
	if pxVel and pyVel then\n\
		xVel, yVel = pxVel, pyVel\n\
		pxVel, pyVel = nil, nil\n\
	end\n\
\n\
	-- Remove the tail\n\
	if nExtraLength == 0 then\n\
		local tail = screen[tailX][tailY]\n\
		screen[tailX][tailY] = {}\n\
		term.setCursorPos(tailX,tailY)\n\
		term.write(" ")\n\
		tailX = tail.nextX\n\
		tailY = tail.nextY\n\
	else\n\
		nExtraLength = nExtraLength - 1\n\
	end\n\
	\n\
	-- Update the head\n\
	local head = screen[xPos][yPos]\n\
	local newXPos = xPos + xVel\n\
	local newYPos = yPos + yVel\n\
	if newXPos < 1 then\n\
		newXPos = w\n\
	elseif newXPos > w then\n\
		newXPos = 1\n\
	end\n\
	if newYPos < 2 then\n\
		newYPos = h\n\
	elseif newYPos > h then\n\
		newYPos = 2\n\
	end\n\
	\n\
	local newHead = screen[newXPos][newYPos]\n\
	term.setCursorPos(1,1);\n\
	print( newHead.snake )\n\
	if newHead.snake == true or newHead.wall == true then\n\
		bRunning = false\n\
		\n\
	else\n\
		if newHead.fruit == true then\n\
			nScore = nScore + 10\n\
			nExtraLength = nExtraLength + 1\n\
			addFruit()\n\
		end\n\
		xPos = newXPos\n\
		yPos = newYPos\n\
		head.nextX = newXPos\n\
		head.nextY = newYPos\n\
		screen[newXPos][newYPos] = { snake = true }\n\
		\n\
	end\n\
	\n\
	term.setCursorPos(xPos,yPos)\n\
	term.setBackgroundColour( wormColour )\n\
	term.write(" ")\n\
	term.setBackgroundColour( colours.black )\n\
\n\
	drawMenu()\n\
end\n\
\n\
-- Display the frontend\n\
term.clear()\n\
local function drawFrontend()\n\
	term.setTextColour( headingColour )\n\
	printCentred( math.floor(h/2) - 3, "" )\n\
	printCentred( math.floor(h/2) - 2, " SELECT DIFFICULTY " )\n\
	printCentred( math.floor(h/2) - 1, "" )\n\
	\n\
	printCentred( math.floor(h/2) + 0, "            " )\n\
	printCentred( math.floor(h/2) + 1, "            " )\n\
	printCentred( math.floor(h/2) + 2, "            " )\n\
	printCentred( math.floor(h/2) - 1 + nDifficulty, " [        ] " )\n\
\n\
	term.setTextColour( textColour )\n\
	printCentred( math.floor(h/2) + 0, "EASY" )\n\
	printCentred( math.floor(h/2) + 1, "MEDIUM" )\n\
	printCentred( math.floor(h/2) + 2, "HARD" )\n\
	printCentred( math.floor(h/2) + 3, "" )\n\
\n\
	term.setTextColour( colours.white )\n\
end\n\
\n\
drawMenu()\n\
drawFrontend()\n\
while true do\n\
	local e,key = os.pullEvent( "key" )\n\
	if key == keys.up or key == keys.w then\n\
		-- Up\n\
		if nDifficulty > 1 then\n\
			nDifficulty = nDifficulty - 1\n\
			drawMenu()\n\
			drawFrontend()\n\
		end\n\
	elseif key == keys.down or key == keys.s then\n\
		-- Down\n\
		if nDifficulty < 3 then\n\
			nDifficulty = nDifficulty + 1\n\
			drawMenu()\n\
			drawFrontend()\n\
		end\n\
	elseif key == keys.enter then\n\
		-- Enter\n\
		break\n\
	end\n\
end\n\
\n\
local tSpeeds = { 5, 10, 25 }\n\
nSpeed = tSpeeds[nDifficulty]\n\
nInterval = 1 / nSpeed\n\
\n\
-- Grow the snake to its intended size\n\
term.clear()\n\
drawMenu()\n\
screen[tailX][tailY].snake = true\n\
while nExtraLength > 0 do\n\
	update()\n\
end\n\
addFruit()\n\
addFruit()\n\
\n\
-- Play the game\n\
local timer = os.startTimer(0)\n\
while bRunning do\n\
	local event, p1, p2 = os.pullEvent()\n\
	if event == "timer" and p1 == timer then\n\
		timer = os.startTimer(nInterval)\n\
		update( false )\n\
	\n\
	elseif event == "key" then\n\
		local key = p1\n\
		if key == keys.up or key == keys.w then\n\
			-- Up\n\
			if yVel == 0 then\n\
				pxVel,pyVel = 0,-1\n\
			end\n\
		elseif key == keys.down or key == keys.s then\n\
			-- Down\n\
			if yVel == 0 then\n\
				pxVel,pyVel = 0,1\n\
			end\n\
		elseif key == keys.left or key == keys.a then\n\
			-- Left\n\
			if xVel == 0 then\n\
				pxVel,pyVel = -1,0\n\
			end\n\
		\n\
		elseif key == keys.right or key == keys.d then\n\
			-- Right\n\
			if xVel == 0 then\n\
				pxVel,pyVel = 1,0\n\
			end\n\
		\n\
		end	\n\
	end\n\
end\n\
\n\
-- Display the gameover screen\n\
term.setTextColour( headingColour )\n\
printCentred( math.floor(h/2) - 2, "                   " )\n\
printCentred( math.floor(h/2) - 1, " G A M E   O V E R " )\n\
\n\
term.setTextColour( textColour )\n\
printCentred( math.floor(h/2) + 0, "                 " )\n\
printCentred( math.floor(h/2) + 1, " FINAL SCORE "..nScore.." " )\n\
printCentred( math.floor(h/2) + 2, "                 " )\n\
term.setTextColour( colours.white )\n\
\n\
local timer = os.startTimer(2.5)\n\
repeat\n\
	local e,p = os.pullEvent()\n\
	if e == "timer" and p == timer then\n\
		term.setTextColour( textColour )\n\
		printCentred( math.floor(h/2) + 2, " PRESS ANY KEY " )\n\
		printCentred( math.floor(h/2) + 3, "               " )\n\
		term.setTextColour( colours.white )\n\
	end\n\
until e == "char"\n\
\n\
term.clear()\n\
term.setCursorPos(1,1)\n\
';


rom["programs/copy"] = '\n\
\n\
local tArgs = { ... }\n\
if #tArgs < 2 then\n\
	print( "Usage: cp <source> <destination>" )\n\
	return\n\
end\n\
\n\
local sSource = shell.resolve( tArgs[1] )\n\
local sDest = shell.resolve( tArgs[2] )\n\
if fs.exists( sDest ) and fs.isDir( sDest ) then\n\
	sDest = fs.combine( sDest, fs.getName(sSource) )\n\
end\n\
fs.copy( sSource, sDest )\n\
';


rom["programs/delete"] = '\n\
\n\
local tArgs = { ... }\n\
if #tArgs < 1 then\n\
	print( "Usage: rm <path>" )\n\
	return\n\
end\n\
\n\
local sNewPath = shell.resolve( tArgs[1] )\n\
fs.delete( sNewPath )\n\
';


rom["programs/dj"] = '\n\
local tArgs = { ... }\n\
\n\
local function printUsage()\n\
	print( "Usages:")\n\
	print( "dj play" )\n\
	print( "dj play <side>" )\n\
	print( "dj stop" )\n\
end\n\
\n\
if #tArgs > 2 then\n\
	printUsage()\n\
	return\n\
end\n\
\n\
local sCommand = tArgs[1]\n\
if sCommand == "stop" then\n\
	-- Stop audio\n\
	disk.stopAudio()\n\
\n\
elseif sCommand == "play" or sCommand == nil then\n\
	-- Play audio\n\
	local sSide = tArgs[2]\n\
	if sSide == nil then\n\
		-- No disc specified, pick one at random\n\
		local tSides = {}\n\
		for n,sSide in ipairs( peripheral.getNames() ) do\n\
			if disk.isPresent( sSide ) and disk.hasAudio( sSide ) then\n\
				table.insert( tSides, sSide )\n\
			end\n\
		end\n\
		if #tSides == 0 then\n\
			print( "No Music Discs in attached disk drives" )\n\
			return\n\
		end\n\
		sSide = tSides[ math.random(1,#tSides) ]\n\
	end\n\
\n\
	-- Play the disc\n\
	if disk.isPresent( sSide ) and disk.hasAudio( sSide ) then\n\
		print( "Playing "..disk.getAudioTitle( sSide ) )\n\
		disk.playAudio( sSide )\n\
	else\n\
		print( "No Music Disc in "..sSide.." disk drive" )\n\
		return\n\
	end\n\
	\n\
else\n\
	printUsage()\n\
	\n\
end\n\
';


rom["programs/drive"] = '\n\
local tArgs = { ... }\n\
\n\
-- Get where a directory is mounted\n\
local sPath = shell.dir()\n\
if tArgs[1] ~= nil then\n\
	sPath = shell.resolve( tArgs[1] )\n\
end\n\
\n\
if fs.exists( sPath ) then\n\
	write( fs.getDrive( sPath ) .. " (" )\n\
	local nSpace = fs.getFreeSpace( sPath )\n\
	if nSpace > 1024 * 1024 then\n\
		print( (math.floor( nSpace / (100 * 1000) ) / 10) .. "MB remaining)" )\n\
	elseif nSpace > 1024 then\n\
		print( math.floor( nSpace / 1000 ) .. "KB remaining)" )\n\
	else\n\
		print ( nSpace .. "B remaining)" )\n\
	end\n\
else\n\
	print( "No such path" )\n\
end\n\
';


rom["programs/edit"] = '\n\
-- Get file to edit\n\
local tArgs = { ... }\n\
if #tArgs == 0 then\n\
	print( "Usage: edit <path>" )\n\
	return\n\
end\n\
\n\
-- Error checking\n\
local sPath = shell.resolve( tArgs[1] )\n\
local bReadOnly = fs.isReadOnly( sPath )\n\
if fs.exists( sPath ) and fs.isDir( sPath ) then\n\
	print( "Cannot edit a directory." )\n\
	return\n\
end\n\
\n\
local x,y = 1,1\n\
local w,h = term.getSize()\n\
local scrollX, scrollY = 0,0\n\
\n\
local tLines = {}\n\
local bRunning = true\n\
\n\
-- Colours\n\
local highlightColour, keywordColour, commentColour, textColour, bgColour\n\
if term.isColour() then\n\
	bgColour = colours.black\n\
	textColour = colours.white\n\
	highlightColour = colours.yellow\n\
	keywordColour = colours.yellow\n\
	commentColour = colours.green\n\
	stringColour = colours.red\n\
else\n\
	bgColour = colours.black\n\
	textColour = colours.white\n\
	highlightColour = colours.white\n\
	keywordColour = colours.white\n\
	commentColour = colours.white\n\
	stringColour = colours.white\n\
end\n\
\n\
-- Menus\n\
local bMenu = false\n\
local nMenuItem = 1\n\
\n\
local tMenuItems\n\
if bReadOnly then\n\
	tMenuItems = { "Exit", "Print" }\n\
else\n\
	tMenuItems = { "Save", "Exit", "Print" }\n\
end\n\
	\n\
local sStatus = "Press Ctrl to access menu"\n\
\n\
local function load( _sPath )\n\
	tLines = {}\n\
	if fs.exists( _sPath ) then\n\
		local file = io.open( _sPath, "r" )\n\
		local sLine = file:read()\n\
		while sLine do\n\
			table.insert( tLines, sLine )\n\
			sLine = file:read()\n\
		end\n\
		file:close()\n\
	end\n\
	\n\
	if #tLines == 0 then\n\
		table.insert( tLines, "" )\n\
	end\n\
end\n\
\n\
local function save( _sPath )\n\
	-- Create intervening folder\n\
	local sDir = sPath:sub(1, sPath:len() - fs.getName(sPath):len() )\n\
	if not fs.exists( sDir ) then\n\
		fs.makeDir( sDir )\n\
	end\n\
\n\
	-- Save\n\
	local file = nil\n\
	local function innerSave()\n\
		file = fs.open( _sPath, "w" )\n\
		if file then\n\
			for n, sLine in ipairs( tLines ) do\n\
				file.write( sLine .. "\n" )\n\
			end\n\
		else\n\
			error( "Failed to open ".._sPath )\n\
		end\n\
	end\n\
	\n\
	local ok = pcall( innerSave )\n\
	if file then \n\
		file.close()\n\
	end\n\
	return ok\n\
end\n\
\n\
local tKeywords = {\n\
	["and"] = true,\n\
	["break"] = true,\n\
	["do"] = true,\n\
	["else"] = true,\n\
	["elseif"] = true,\n\
	["end"] = true,\n\
	["false"] = true,\n\
	["for"] = true,\n\
	["function"] = true,\n\
	["if"] = true,\n\
	["in"] = true,\n\
	["local"] = true,\n\
	["nil"] = true,\n\
	["not"] = true,\n\
	["or"] = true,\n\
	["repeat"] = true,\n\
	["return"] = true,\n\
	["then"] = true,\n\
	["true"] = true,\n\
	["until"]= true,\n\
	["while"] = true,\n\
}\n\
\n\
local function tryWrite( sLine, regex, colour )\n\
	local match = string.match( sLine, regex )\n\
	if match then\n\
		if type(colour) == "number" then\n\
			term.setTextColour( colour )\n\
		else\n\
			term.setTextColour( colour(match) )\n\
		end\n\
		term.write( match )\n\
		term.setTextColour( textColour )\n\
		return string.sub( sLine, string.len(match) + 1 )\n\
	end\n\
	return nil\n\
end\n\
\n\
local function writeHighlighted( sLine )\n\
	while string.len(sLine) > 0 do	\n\
		sLine = \n\
			tryWrite( sLine, "^%-%-%[%[.-%]%]", commentColour ) or\n\
			tryWrite( sLine, "^%-%-.*", commentColour ) or\n\
			tryWrite( sLine, "^\".-[^\\]\"", stringColour ) or\n\
			tryWrite( sLine, "^\'.-[^\\]\'", stringColour ) or\n\
			tryWrite( sLine, "^%[%[.-%]%]", stringColour ) or\n\
			tryWrite( sLine, "^[%w_]+", function( match )\n\
				if tKeywords[ match ] then\n\
					return keywordColour\n\
				end\n\
				return textColour\n\
			end ) or\n\
			tryWrite( sLine, "^[^%w_]", textColour )\n\
	end\n\
end\n\
\n\
local function redrawText()\n\
	for y=1,h-1 do\n\
		term.setCursorPos( 1 - scrollX, y )\n\
		term.clearLine()\n\
\n\
		local sLine = tLines[ y + scrollY ]\n\
		if sLine ~= nil then\n\
			writeHighlighted( sLine )\n\
		end\n\
	end\n\
	term.setCursorPos( x - scrollX, y - scrollY )\n\
end\n\
\n\
local function redrawLine(_nY)\n\
	local sLine = tLines[_nY]\n\
	term.setCursorPos( 1 - scrollX, _nY - scrollY )\n\
	term.clearLine()\n\
	writeHighlighted( sLine )\n\
	term.setCursorPos( x - scrollX, _nY - scrollY )\n\
end\n\
\n\
local function redrawMenu()\n\
    term.setCursorPos( 1, h )\n\
	term.clearLine()\n\
\n\
	local sLeft, sRight\n\
	local nLeftColour, nLeftHighlight1, nLeftHighlight2\n\
	if bMenu then\n\
		local sMenu = ""\n\
		for n,sItem in ipairs( tMenuItems ) do\n\
			if n == nMenuItem then\n\
				nLeftHighlight1 = sMenu:len() + 1\n\
				nLeftHighlight2 = sMenu:len() + sItem:len() + 2\n\
			end\n\
			sMenu = sMenu.." "..sItem.." "\n\
		end\n\
		sLeft = sMenu\n\
		nLeftColour = textColour\n\
	else\n\
		sLeft = sStatus\n\
		nLeftColour = highlightColour\n\
	end\n\
	\n\
	-- Left goes last so that it can overwrite the line numbers.\n\
	sRight = "Ln "..y\n\
	term.setTextColour( highlightColour )\n\
	term.setCursorPos( w-sRight:len() + 1, h )\n\
	term.write(sRight)\n\
\n\
	sRight = tostring(y)\n\
	term.setTextColour( textColour )\n\
	term.setCursorPos( w-sRight:len() + 1, h )\n\
	term.write(sRight)\n\
\n\
	if sLeft then\n\
		term.setCursorPos( 1, h )\n\
		term.setTextColour( nLeftColour )\n\
		term.write(sLeft)		\n\
		if nLeftHighlight1 then\n\
			term.setTextColour( highlightColour )\n\
			term.setCursorPos( nLeftHighlight1, h )\n\
			term.write( "[" )\n\
			term.setCursorPos( nLeftHighlight2, h )\n\
			term.write( "]" )\n\
		end\n\
		term.setTextColour( textColour )\n\
	end\n\
	\n\
	-- Cursor highlights selection\n\
	term.setCursorPos( x - scrollX, y - scrollY )\n\
end\n\
\n\
local tMenuFuncs = { \n\
	Save=function()\n\
		if bReadOnly then\n\
			sStatus = "Access denied"\n\
		else\n\
			local ok, err = save( sPath )\n\
			if ok then\n\
				sStatus="Saved to "..sPath\n\
			else\n\
				sStatus="Error saving to "..sPath\n\
			end\n\
		end\n\
		redrawMenu()\n\
	end,\n\
	Print=function()\n\
		local sPrinterSide = nil\n\
		for n,sName in ipairs(peripheral.getNames()) do\n\
			if peripheral.isPresent(sName) and peripheral.getType(sName) == "printer" then\n\
				sPrinterSide = sName\n\
				break\n\
			end\n\
		end\n\
		\n\
		if not sPrinterSide then\n\
			sStatus = "No printer attached"\n\
			return\n\
		end\n\
\n\
		local nPage = 0\n\
		local sName = fs.getName( sPath )\n\
		local printer = peripheral.wrap(sPrinterSide)\n\
		if printer.getInkLevel() < 1 then\n\
			sStatus = "Printer out of ink"\n\
			return\n\
		elseif printer.getPaperLevel() < 1 then\n\
			sStatus = "Printer out of paper"\n\
			return\n\
		end\n\
		\n\
		local terminal = {\n\
			getCursorPos = printer.getCursorPos,\n\
			setCursorPos = printer.setCursorPos,\n\
			getSize = printer.getPageSize,\n\
			write = printer.write,\n\
		}\n\
		terminal.scroll = function()\n\
			if nPage == 1 then\n\
				printer.setPageTitle( sName.." (page "..nPage..")" )			\n\
			end\n\
			\n\
			while not printer.newPage()	do\n\
				if printer.getInkLevel() < 1 then\n\
					sStatus = "Printer out of ink, please refill"\n\
				elseif printer.getPaperLevel() < 1 then\n\
					sStatus = "Printer out of paper, please refill"\n\
				else\n\
					sStatus = "Printer output tray full, please empty"\n\
				end\n\
	\n\
				term.restore()\n\
				redrawMenu()\n\
				term.redirect( terminal )\n\
				\n\
				local timer = os.startTimer(0.5)\n\
				sleep(0.5)\n\
			end\n\
\n\
			nPage = nPage + 1\n\
			if nPage == 1 then\n\
				printer.setPageTitle( sName )\n\
			else\n\
				printer.setPageTitle( sName.." (page "..nPage..")" )\n\
			end\n\
		end\n\
		\n\
		bMenu = false\n\
		term.redirect( terminal )\n\
		local ok, error = pcall( function()\n\
			term.scroll()\n\
			for n, sLine in ipairs( tLines ) do\n\
				print( sLine )\n\
			end\n\
		end )\n\
		term.restore()\n\
		if not ok then\n\
			print( error )\n\
		end\n\
		\n\
		while not printer.endPage() do\n\
			sStatus = "Printer output tray full, please empty"\n\
			redrawMenu()\n\
			sleep( 0.5 )\n\
		end\n\
		bMenu = true\n\
			\n\
		if nPage > 1 then\n\
			sStatus = "Printed "..nPage.." Pages"\n\
		else\n\
			sStatus = "Printed 1 Page"\n\
		end\n\
		redrawMenu()\n\
	end,\n\
	Exit=function()\n\
		bRunning = false\n\
	end\n\
}\n\
\n\
local function doMenuItem( _n )\n\
	tMenuFuncs[tMenuItems[_n]]()\n\
	if bMenu then\n\
		bMenu = false\n\
		term.setCursorBlink( true )\n\
	end\n\
	redrawMenu()\n\
end\n\
\n\
local function setCursor( x, y )\n\
	local screenX = x - scrollX\n\
	local screenY = y - scrollY\n\
	\n\
	local bRedraw = false\n\
	if screenX < 1 then\n\
		scrollX = x - 1\n\
		screenX = 1\n\
		bRedraw = true\n\
	elseif screenX > w then\n\
		scrollX = x - w\n\
		screenX = w\n\
		bRedraw = true\n\
	end\n\
	\n\
	if screenY < 1 then\n\
		scrollY = y - 1\n\
		screenY = 1\n\
		bRedraw = true\n\
	elseif screenY > h-1 then\n\
		scrollY = y - (h-1)\n\
		screenY = h-1\n\
		bRedraw = true\n\
	end\n\
	\n\
	if bRedraw then\n\
		redrawText()\n\
	end\n\
	term.setCursorPos( screenX, screenY )\n\
	\n\
	-- Statusbar now pertains to menu, it would probably be safe to redraw the menu on every key event.\n\
	redrawMenu()\n\
end\n\
\n\
-- Actual program functionality begins\n\
load(sPath)\n\
\n\
term.setBackgroundColour( bgColour )\n\
term.clear()\n\
term.setCursorPos(x,y)\n\
term.setCursorBlink( true )\n\
\n\
redrawText()\n\
redrawMenu()\n\
\n\
-- Handle input\n\
while bRunning do\n\
	local sEvent, param, param2, param3 = os.pullEvent()\n\
	if sEvent == "key" then\n\
		if param == keys.up then\n\
			-- Up\n\
			if not bMenu then\n\
				if y > 1 then\n\
					-- Move cursor up\n\
					y = y - 1\n\
					x = math.min( x, string.len( tLines[y] ) + 1 )\n\
					setCursor( x, y )\n\
				end\n\
			end\n\
		elseif param == keys.down then\n\
			-- Down\n\
			if not bMenu then\n\
				-- Move cursor down\n\
				if y < #tLines then\n\
					y = y + 1\n\
					x = math.min( x, string.len( tLines[y] ) + 1 )\n\
					setCursor( x, y )\n\
				end\n\
			end\n\
		elseif param == keys.tab then\n\
			-- Tab\n\
			if not bMenu and not bReadOnly then\n\
				-- Indent line\n\
				tLines[y]="  "..tLines[y]\n\
				x = x + 2\n\
				setCursor( x, y )\n\
				redrawLine(y)\n\
			end\n\
		elseif param == keys.pageUp then\n\
			-- Page Up\n\
			if not bMenu then\n\
				-- Move up a page\n\
				local sx,sy=term.getSize()\n\
				y=y-sy-1\n\
				if y<1 then	y=1 end\n\
				x = math.min( x, string.len( tLines[y] ) + 1 )\n\
				setCursor( x, y )\n\
			end\n\
		elseif param == keys.pageDown then\n\
			-- Page Down\n\
			if not bMenu then\n\
				-- Move down a page\n\
				local sx,sy=term.getSize()\n\
				if y<#tLines-sy-1 then\n\
					y = y+sy-1\n\
				else\n\
					y = #tLines\n\
				end\n\
				x = math.min( x, string.len( tLines[y] ) + 1 )\n\
				setCursor( x, y )\n\
			end\n\
		elseif param == keys.home then\n\
			-- Home\n\
			if not bMenu then\n\
				-- Move cursor to the beginning\n\
				x=1\n\
				setCursor(x,y)\n\
			end\n\
		elseif param == keys["end"] then\n\
			-- End\n\
			if not bMenu then\n\
				-- Move cursor to the end\n\
				x = string.len( tLines[y] ) + 1\n\
				setCursor(x,y)\n\
			end\n\
		elseif param == keys.left then\n\
			-- Left\n\
			if not bMenu then\n\
				if x > 1 then\n\
					-- Move cursor left\n\
					x = x - 1\n\
				elseif x==1 and y>1 then\n\
					x = string.len( tLines[y-1] ) + 1\n\
					y = y - 1\n\
				end\n\
				setCursor( x, y )\n\
			else\n\
				-- Move menu left\n\
				nMenuItem = nMenuItem - 1\n\
				if nMenuItem < 1 then\n\
					nMenuItem = #tMenuItems\n\
				end\n\
				redrawMenu()\n\
			end\n\
		elseif param == keys.right then\n\
			-- Right\n\
			if not bMenu then\n\
				if x < string.len( tLines[y] ) + 1 then\n\
					-- Move cursor right\n\
					x = x + 1\n\
				elseif x==string.len( tLines[y] ) + 1 and y<#tLines then\n\
					x = 1\n\
					y = y + 1\n\
				end\n\
				setCursor( x, y )\n\
			else\n\
				-- Move menu right\n\
				nMenuItem = nMenuItem + 1\n\
				if nMenuItem > #tMenuItems then\n\
					nMenuItem = 1\n\
				end\n\
				redrawMenu()\n\
			end\n\
		elseif param == keys.delete then\n\
			-- Delete\n\
			if not bMenu and not bReadOnly then\n\
				if  x < string.len( tLines[y] ) + 1 then\n\
					local sLine = tLines[y]\n\
					tLines[y] = string.sub(sLine,1,x-1) .. string.sub(sLine,x+1)\n\
					redrawLine(y)\n\
				elseif y<#tLines then\n\
					tLines[y] = tLines[y] .. tLines[y+1]\n\
					table.remove( tLines, y+1 )\n\
					redrawText()\n\
					redrawMenu()\n\
				end\n\
			end\n\
		elseif param == keys.backspace then\n\
			-- Backspace\n\
			if not bMenu and not bReadOnly then\n\
				if x > 1 then\n\
					-- Remove character\n\
					local sLine = tLines[y]\n\
					tLines[y] = string.sub(sLine,1,x-2) .. string.sub(sLine,x)\n\
					redrawLine(y)\n\
			\n\
					x = x - 1\n\
					setCursor( x, y )\n\
				elseif y > 1 then\n\
					-- Remove newline\n\
					local sPrevLen = string.len( tLines[y-1] )\n\
					tLines[y-1] = tLines[y-1] .. tLines[y]\n\
					table.remove( tLines, y )\n\
					redrawText()\n\
				\n\
					x = sPrevLen + 1\n\
					y = y - 1\n\
					setCursor( x, y )\n\
				end\n\
			end\n\
		elseif param == keys.enter then\n\
			-- Enter\n\
			if not bMenu and not bReadOnly then\n\
				-- Newline\n\
				local sLine = tLines[y]\n\
				local _,spaces=string.find(sLine,"^[ ]+")\n\
				if not spaces then\n\
					spaces=0\n\
				end\n\
				tLines[y] = string.sub(sLine,1,x-1)\n\
				table.insert( tLines, y+1, string.rep(\' \',spaces)..string.sub(sLine,x) )\n\
				redrawText()\n\
			\n\
				x = spaces+1\n\
				y = y + 1\n\
				setCursor( x, y )\n\
			elseif bMenu then\n\
				-- Menu selection\n\
				doMenuItem( nMenuItem )\n\
			end\n\
		elseif param == keys.leftCtrl or param == keys.rightCtrl then\n\
			-- Menu toggle\n\
			bMenu = not bMenu\n\
			if bMenu then\n\
				term.setCursorBlink( false )\n\
				nMenuItem = 1\n\
			else\n\
				term.setCursorBlink( true )\n\
			end\n\
			redrawMenu()\n\
		end\n\
		\n\
	elseif sEvent == "char" then\n\
		if not bMenu and not bReadOnly then\n\
			-- Input text\n\
			local sLine = tLines[y]\n\
			tLines[y] = string.sub(sLine,1,x-1) .. param .. string.sub(sLine,x)\n\
			redrawLine(y)\n\
		\n\
			x = x + string.len( param )\n\
			setCursor( x, y )\n\
		elseif bMenu then\n\
			-- Select menu items\n\
			for n,sMenuItem in ipairs( tMenuItems ) do\n\
				if string.lower(string.sub(sMenuItem,1,1)) == string.lower(param) then\n\
					doMenuItem( n )\n\
					break\n\
				end\n\
			end\n\
		end\n\
		\n\
	elseif sEvent == "mouse_click" then\n\
		if not bMenu then\n\
			if param == 1 then\n\
				-- Left click\n\
				local cx,cy = param2, param3\n\
				if cy < h then\n\
					y = math.min( math.max( scrollY + cy, 1 ), #tLines )\n\
					x = math.min( math.max( scrollX + cx, 1 ), string.len( tLines[y] ) + 1 )\n\
					setCursor( x, y )\n\
				end\n\
			end\n\
		end\n\
		\n\
	elseif sEvent == "mouse_scroll" then\n\
		if not bMenu then\n\
			if param == -1 then\n\
				-- Scroll up\n\
				if scrollY > 0 then\n\
					-- Move cursor up\n\
					scrollY = scrollY - 1\n\
					redrawText()\n\
				end\n\
			\n\
			elseif param == 1 then\n\
				-- Scroll down\n\
				local nMaxScroll = #tLines - (h-1)\n\
				if scrollY < nMaxScroll then\n\
					-- Move cursor down\n\
					scrollY = scrollY + 1\n\
					redrawText()\n\
				end\n\
				\n\
			end\n\
		end\n\
	end\n\
end\n\
\n\
-- Cleanup\n\
term.clear()\n\
term.setCursorBlink( false )\n\
term.setCursorPos( 1, 1 )\n\
';


rom["programs/eject"] = '\n\
\n\
-- Get arguments\n\
local tArgs = { ... }\n\
if #tArgs == 0 then\n\
	print( "Usage: eject <drive>" )\n\
	return\n\
end\n\
\n\
local sDrive = tArgs[1]\n\
\n\
-- Check the disk exists\n\
local bPresent = disk.isPresent( sDrive )\n\
if not bPresent then\n\
	print( "Nothing in "..sDrive.." drive" )\n\
	return\n\
end\n\
\n\
disk.eject( sDrive )\n\
';


rom["programs/exit"] = '\n\
shell.exit()\n\
';


rom["programs/gps"] = '\n\
\n\
local function printUsage()\n\
	print( "Usages:" )\n\
	print( "gps host" )\n\
	print( "gps host <x> <y> <z>" )\n\
	print( "gps locate" )\n\
end\n\
\n\
local tArgs = { ... }\n\
if #tArgs < 1 then\n\
	printUsage()\n\
	return\n\
end\n\
	\n\
local sCommand = tArgs[1]\n\
if sCommand == "locate" then\n\
	-- "gps locate"\n\
	-- Just locate this computer (this will print the results)\n\
	gps.locate( 2, true )\n\
	\n\
elseif sCommand == "host" then\n\
	-- "gps host"\n\
	-- Act as a GPS host\n\
	\n\
	-- Find a modem\n\
	local sModemSide = nil\n\
	for n,sSide in ipairs( rs.getSides() ) do\n\
		if peripheral.getType( sSide ) == "modem" and peripheral.call( sSide, "isWireless" ) then	\n\
			sModemSide = sSide\n\
			break\n\
		end\n\
	end\n\
\n\
	if sModemSide == nil then\n\
		print( "No wireless modem attached" )\n\
		return\n\
	end\n\
	\n\
	-- Open a channel\n\
	local modem = peripheral.wrap( sModemSide )\n\
	local bCloseChannel = false\n\
	if not modem.isOpen( gps.CHANNEL_GPS ) then\n\
		print( "Opening GPS channel on "..sModemSide.." modem" )\n\
		modem.open( gps.CHANNEL_GPS )\n\
		bCloseChannel = true\n\
	end\n\
\n\
	-- Determine position\n\
	local x,y,z\n\
	if #tArgs >= 4 then\n\
		-- Position is manually specified\n\
		x = tonumber(tArgs[2])\n\
		y = tonumber(tArgs[3])\n\
		z = tonumber(tArgs[4])\n\
		if x == nil or y == nil or z == nil then\n\
			printUsage()\n\
			return\n\
		end\n\
		print( "Position is "..x..","..y..","..z )\n\
	else\n\
		-- Position is to be determined using locate		\n\
		x,y,z = gps.locate( 2, true )\n\
		if x == nil then\n\
			print( "Run \"gps host <x> <y> <z>\" to set position manually" )\n\
			if bCloseChannel then\n\
				print( "Closing GPS channel" )\n\
				modem.close( gps.CHANNEL_GPS )\n\
			end\n\
			return\n\
		end\n\
	end\n\
	\n\
	-- Serve requests indefinately\n\
	print( "Serving GPS requests. Press Q to quit" )\n\
	\n\
	local nServed = 0\n\
	while true do\n\
		local e, p1, p2, p3, p4, p5 = os.pullEvent()\n\
		if e == "modem_message" then\n\
			-- We received a message from a modem\n\
			local sSide, sChannel, sReplyChannel, sMessage, nDistance = p1, p2, p3, p4, p5\n\
			if sSide == sModemSide and sChannel == gps.CHANNEL_GPS and sMessage == "PING" then\n\
				-- We received a ping message on the GPS channel, send a response\n\
				modem.transmit( sReplyChannel, gps.CHANNEL_GPS, textutils.serialize({x,y,z}) )\n\
			\n\
				-- Print the number of requests handled\n\
				nServed = nServed + 1\n\
				if nServed > 1 then\n\
					local x,y = term.getCursorPos()\n\
					term.setCursorPos(1,y-1)\n\
				end\n\
				print( nServed.." GPS Requests served" )\n\
			end\n\
			\n\
		elseif e == "key" then\n\
			-- We received a key press, quit\n\
			local key = p1\n\
			if key == keys.q then\n\
				os.pullEvent("char")\n\
				break\n\
			end\n\
			\n\
		end\n\
	end\n\
	\n\
	if bCloseChannel then\n\
		print( "Closing GPS channel" )\n\
		modem.close( gps.CHANNEL_GPS )\n\
	end\n\
	\n\
else\n\
	-- "gps somethingelse"\n\
	-- Error\n\
	printUsage()\n\
	\n\
end\n\
';


rom["programs/help"] = '\n\
tArgs = { ... }\n\
if #tArgs > 0 then\n\
	sTopic = tArgs[1]\n\
else\n\
	sTopic = "intro"\n\
end\n\
\n\
if sTopic == "index" then\n\
	print( "Help topics availiable:" )\n\
	local tTopics = help.topics()\n\
	textutils.pagedTabulate( tTopics )\n\
	return\n\
end\n\
	\n\
local w,h = term.getSize()\n\
local sFile = help.lookup( sTopic )\n\
local file = ((sFile ~= nil) and io.open( sFile )) or nil\n\
local nLinesPrinted = 0\n\
if file then\n\
	local sLine = file:read()\n\
	local nLines = 0\n\
	while sLine do\n\
		nLines = nLines + textutils.pagedPrint( sLine, (h-3) - nLines )\n\
    	sLine = file:read()\n\
    end\n\
	file:close()\n\
else\n\
	print( "No help available" )\n\
end\n\
';


rom["programs/http/pastebin"] = '\n\
\n\
local function printUsage()\n\
    print( "Usages:" )\n\
    print( "pastebin put <filename>" )\n\
    print( "pastebin get <code> <filename>" )\n\
    print( "pastebin run <code> <arguments>" )\n\
end\n\
 \n\
local tArgs = { ... }\n\
if #tArgs < 2 then\n\
    printUsage()\n\
    return\n\
end\n\
 \n\
if not http then\n\
    printError( "Pastebin requires http API" )\n\
    printError( "Set enableAPI_http to true in ComputerCraft.cfg" )\n\
    return\n\
end\n\
 \n\
local function get(paste)\n\
    write( "Connecting to pastebin.com... " )\n\
    local response = http.get(\n\
        "http://pastebin.com/raw.php?i="..textutils.urlEncode( paste )\n\
    )\n\
        \n\
    if response then\n\
        print( "Success." )\n\
        \n\
        local sResponse = response.readAll()\n\
        response.close()\n\
        return sResponse\n\
    else\n\
        printError( "Failed." )\n\
    end\n\
end\n\
 \n\
local sCommand = tArgs[1]\n\
if sCommand == "put" then\n\
    -- Upload a file to pastebin.com\n\
    -- Determine file to upload\n\
    local sFile = tArgs[2]\n\
    local sPath = shell.resolve( sFile )\n\
    if not fs.exists( sPath ) or fs.isDir( sPath ) then\n\
        print( "No such file" )\n\
        return\n\
    end\n\
    \n\
    -- Read in the file\n\
    local sName = fs.getName( sPath )\n\
    local file = fs.open( sPath, "r" )\n\
    local sText = file.readAll()\n\
    file.close()\n\
    \n\
    -- POST the contents to pastebin\n\
    write( "Connecting to pastebin.com... " )\n\
    local key = "0ec2eb25b6166c0c27a394ae118ad829"\n\
    local response = http.post(\n\
        "http://pastebin.com/api/api_post.php", \n\
        "api_option=paste&"..\n\
        "api_dev_key="..key.."&"..\n\
        "api_paste_format=lua&"..\n\
        "api_paste_name="..textutils.urlEncode(sName).."&"..\n\
        "api_paste_code="..textutils.urlEncode(sText)\n\
    )\n\
        \n\
    if response then\n\
        print( "Success." )\n\
        \n\
        local sResponse = response.readAll()\n\
        response.close()\n\
                \n\
        local sCode = string.match( sResponse, "[^/]+$" )\n\
        print( "Uploaded as "..sResponse )\n\
        print( "Run \"pastebin get "..sCode.."\" to download anywhere" )\n\
 \n\
    else\n\
        print( "Failed." )\n\
    end\n\
    \n\
elseif sCommand == "get" then\n\
    -- Download a file from pastebin.com\n\
    if #tArgs < 3 then\n\
        printUsage()\n\
        return\n\
    end\n\
 \n\
    -- Determine file to download\n\
    local sCode = tArgs[2]\n\
    local sFile = tArgs[3]\n\
    local sPath = shell.resolve( sFile )\n\
    if fs.exists( sPath ) then\n\
        print( "File already exists" )\n\
        return\n\
    end\n\
    \n\
    -- GET the contents from pastebin\n\
    local res = get(sCode)\n\
    if res then        \n\
        local file = fs.open( sPath, "w" )\n\
        file.write( res )\n\
        file.close()\n\
        \n\
        print( "Downloaded as "..sFile )\n\
    end \n\
elseif sCommand == "run" then\n\
    local sCode = tArgs[2]\n\
 \n\
    local res = get(sCode)\n\
    if res then\n\
        local func, err = loadstring(res)\n\
        if not func then\n\
            printError( err )\n\
            return\n\
        end\n\
        setfenv(func, getfenv())\n\
        local success, msg = pcall(func, unpack(tArgs, 3))\n\
        if not success then\n\
            printError( msg )\n\
        end\n\
    end\n\
else\n\
    printUsage()\n\
    return\n\
end\n\
';


rom["programs/id"] = '\n\
\n\
local sSide = nil\n\
local tArgs = { ... }\n\
if #tArgs > 0 then\n\
	sSide = tostring( tArgs[1] )\n\
end\n\
\n\
if sSide == nil then\n\
	print( "This is computer #"..os.getComputerID() )\n\
	\n\
	local label = os.getComputerLabel()\n\
	if label then\n\
		print( "This computer is labelled \""..label.."\"" )\n\
	end\n\
\n\
else\n\
	local bData = disk.hasData( sSide )\n\
	if not bData then\n\
		print( "No disk in "..sSide.." disk drive" )\n\
		return\n\
	end\n\
	\n\
	print( "The disk is #"..disk.getID( sSide ) )\n\
\n\
	local label = disk.getLabel( sSide )\n\
	if label then\n\
		print( "The disk is labelled \""..label.."\"" )\n\
	end\n\
end\n\
\n\
';


rom["programs/label"] = '\n\
\n\
local function printUsage()\n\
	print( "Usages:" )\n\
	print( "label get" )\n\
	print( "label set <text>" )\n\
	print( "label clear" )\n\
	print( "label get <drive>" )\n\
	print( "label set <drive> <text>" )\n\
	print( "label clear <drive>" )\n\
end\n\
\n\
-- Get arguments\n\
local tArgs = { ... }\n\
if #tArgs == 0 then\n\
	printUsage()\n\
	return\n\
end\n\
\n\
local sCommand = nil\n\
local sDrive = nil\n\
if #tArgs == 1 then\n\
	sCommand = tArgs[1]\n\
	sDrive = nil\n\
else\n\
	sCommand = tArgs[1]\n\
	local tSides = peripheral.getNames()\n\
	for n,sSide in ipairs( tSides ) do\n\
		if sSide == tArgs[2] then\n\
			sDrive = sSide\n\
			break\n\
		end\n\
	end\n\
end\n\
\n\
if sDrive ~= nil then\n\
	-- Check the disk exists\n\
	local bData = disk.hasData( sDrive )\n\
	if not bData then\n\
		print( "No disk in "..sDrive.." drive" )\n\
		return\n\
	end\n\
end\n\
\n\
-- Do commands\n\
if sCommand == "get" then\n\
	-- Get the label\n\
	local sLabel\n\
	if sDrive ~= nil then\n\
		sLabel = disk.getLabel( sDrive )\n\
		if sLabel then\n\
			print( "Disk label is \""..sLabel.."\"" )\n\
		else\n\
			print( "No Disk label" )\n\
		end\n\
	else\n\
		sLabel = os.getComputerLabel()\n\
		if sLabel then\n\
			print( "Computer label is \""..sLabel.."\"" )\n\
		else\n\
			print( "No Computer label" )\n\
		end\n\
	end\n\
		\n\
elseif sCommand == "set" or sCommand == "clear" then\n\
	-- Set the label\n\
	local sText = nil\n\
	local nFirstArg = 2\n\
	if sDrive ~= nil then\n\
		nFirstArg = 3\n\
	end\n\
	\n\
	if sCommand == "set" and #tArgs >= nFirstArg then\n\
		-- Build the label from input\n\
		sText = ""\n\
		for n = nFirstArg, #tArgs do\n\
			sText = sText..tArgs[n].." "\n\
		end\n\
	end\n\
	\n\
	local sLabel = nil\n\
	if sDrive ~= nil then\n\
		disk.setLabel( sDrive, sText )\n\
		sLabel = disk.getLabel( sDrive )\n\
		if sLabel then\n\
			print( "Disk label set to \""..sLabel.."\"" )\n\
		else\n\
			print( "Disk label cleared" )\n\
		end\n\
	else\n\
		os.setComputerLabel( sText )\n\
		sLabel = os.getComputerLabel()\n\
		if sLabel then\n\
			print( "Computer label set to \""..sLabel.."\"" )\n\
		else\n\
			print( "Computer label cleared" )\n\
		end\n\
	end\n\
\n\
else\n\
	-- Unknown command\n\
	printUsage()\n\
	return\n\
	\n\
end\n\
';


rom["programs/list"] = '\n\
\n\
local tArgs = { ... }\n\
\n\
-- Get all the files in the directory\n\
local sDir = shell.dir()\n\
if tArgs[1] ~= nil then\n\
	sDir = shell.resolve( tArgs[1] )\n\
end\n\
\n\
-- Sort into dirs/files, and calculate column count\n\
local tAll = fs.list( sDir )\n\
local tFiles = {}\n\
local tDirs = {}\n\
\n\
for n, sItem in pairs( tAll ) do\n\
	if string.sub( sItem, 1, 1 ) ~= "." then\n\
		local sPath = fs.combine( sDir, sItem )\n\
		if fs.isDir( sPath ) then\n\
			table.insert( tDirs, sItem )\n\
		else\n\
			table.insert( tFiles, sItem )\n\
		end\n\
	end\n\
end\n\
table.sort( tDirs )\n\
table.sort( tFiles )\n\
\n\
if term.isColour() then\n\
	textutils.pagedTabulate( colors.green, tDirs, colours.white, tFiles )\n\
else\n\
	textutils.pagedTabulate( tDirs, tFiles )\n\
end\n\
';


rom["programs/lua"] = '\n\
\n\
local tArgs = { ... }\n\
if #tArgs > 0 then\n\
	print( "This is an interactive Lua prompt." )\n\
	print( "To run a lua program, just type its name." )\n\
	return\n\
end\n\
\n\
local bRunning = true\n\
local tCommandHistory = {}\n\
local tEnv = {\n\
	["exit"] = function()\n\
		bRunning = false\n\
	end,\n\
}\n\
setmetatable( tEnv, { __index = getfenv() } )\n\
\n\
if term.isColour() then\n\
	term.setTextColour( colours.yellow )\n\
end\n\
print( "Interactive Lua prompt." )\n\
print( "Call exit() to exit." )\n\
term.setTextColour( colours.white )\n\
\n\
while bRunning do\n\
	--if term.isColour() then\n\
	--	term.setTextColour( colours.yellow )\n\
	--end\n\
	write( "lua> " )\n\
	--term.setTextColour( colours.white )\n\
	\n\
	local s = read( nil, tCommandHistory )\n\
	table.insert( tCommandHistory, s )\n\
	\n\
	local nForcePrint = 0\n\
	local func, e = loadstring( s, "lua" )\n\
	local func2, e2 = loadstring( "return "..s, "lua" )\n\
	if not func then\n\
		if func2 then\n\
			func = func2\n\
			e = nil\n\
			nForcePrint = 1\n\
		end\n\
	else\n\
		if func2 then\n\
			func = func2\n\
		end\n\
	end\n\
	\n\
	if func then\n\
        setfenv( func, tEnv )\n\
        local tResults = { pcall( function() return func() end ) }\n\
        if tResults[1] then\n\
        	local n = 1\n\
        	while (tResults[n + 1] ~= nil) or (n <= nForcePrint) do\n\
        		print( tostring( tResults[n + 1] ) )\n\
        		n = n + 1\n\
        	end\n\
        else\n\
        	printError( tResults[2] )\n\
        end\n\
    else\n\
    	printError( e )\n\
    end\n\
    \n\
end\n\
';


rom["programs/mkdir"] = '\n\
local tArgs = { ... }\n\
if #tArgs < 1 then\n\
	print( "Usage: mkdir <path>" )\n\
	return\n\
end\n\
\n\
local sNewDir = shell.resolve( tArgs[1] )\n\
fs.makeDir( sNewDir )\n\
\n\
';


rom["programs/monitor"] = '\n\
\n\
function printUsage()\n\
	print( "Usage: monitor <side> <program> <arguments>" )\n\
	return\n\
end\n\
\n\
local tArgs = { ... }\n\
if #tArgs < 2 then\n\
	printUsage()\n\
	return\n\
end\n\
\n\
local sSide = tArgs[1]\n\
if peripheral.getType( sSide ) ~= "monitor" then\n\
	print( "No monitor on "..sSide.." side" )\n\
	return\n\
end\n\
\n\
local sProgram = tArgs[2]\n\
local sPath = shell.resolveProgram( sProgram )\n\
if sPath == nil then\n\
	print( "No such program: "..sProgram )\n\
	return\n\
end\n\
\n\
print( "Running "..sProgram.." on "..sSide.." monitor" )\n\
\n\
local monitor = peripheral.wrap( sSide )\n\
term.redirect( monitor )\n\
\n\
local co = coroutine.create( function()\n\
    shell.run( sProgram, unpack( tArgs, 3 ) )\n\
end )\n\
\n\
local function resume( ... )\n\
    local ok, param = coroutine.resume( co, ... )\n\
    if not ok then\n\
    	printError( param )\n\
    end\n\
    return param\n\
end\n\
\n\
local ok, param = pcall( function()\n\
	local sFilter = resume()\n\
	while coroutine.status( co ) ~= "dead" do\n\
		local tEvent = { os.pullEventRaw() }\n\
		if sFilter == nil or tEvent[1] == sFilter or tEvent[1] == "terminate" then\n\
			sFilter = resume( unpack( tEvent ) )\n\
		end\n\
		if coroutine.status( co ) ~= "dead" and (sFilter == nil or sFilter == "mouse_click") then\n\
			if tEvent[1] == "monitor_touch" and tEvent[2] == sSide then\n\
				sFilter = resume( "mouse_click", 1, unpack( tEvent, 3 ) )\n\
			end\n\
		end\n\
	end\n\
end )\n\
\n\
term.restore()\n\
if not ok then\n\
	printError( param )\n\
end\n\
\n\
';


rom["programs/move"] = '\n\
\n\
local tArgs = { ... }\n\
if #tArgs < 2 then\n\
	print( "Usage: mv <source> <destination>" )\n\
	return\n\
end\n\
\n\
local sSource = shell.resolve( tArgs[1] )\n\
local sDest = shell.resolve( tArgs[2] )\n\
if fs.exists( sDest ) and fs.isDir( sDest ) then\n\
	sDest = fs.combine( sDest, fs.getName(sSource) )\n\
end\n\
fs.move( sSource, sDest )\n\
';


rom["programs/programs"] = '\n\
\n\
local bAll = false\n\
local tArgs = { ... }\n\
if #tArgs > 0 and tArgs[1] == "all" then\n\
	bAll = true\n\
end\n\
\n\
local tPrograms = shell.programs( bAll )\n\
textutils.pagedTabulate( tPrograms )\n\
';


rom["programs/reboot"] = '\n\
if term.isColour() then\n\
	term.setTextColour( colours.yellow )\n\
end\n\
print( "Goodbye" )\n\
term.setTextColour( colours.white )\n\
\n\
sleep( 1 )\n\
os.reboot()\n\
';


rom["programs/redprobe"] = '\n\
\n\
-- Regular input\n\
print( "Redstone inputs: " )\n\
\n\
local count = 0\n\
local bundledCount = 0\n\
for n,sSide in ipairs( redstone.getSides() ) do\n\
	if redstone.getBundledInput( sSide ) > 0 then\n\
		bundledCount = bundledCount + 1\n\
	end\n\
	if redstone.getInput( sSide ) then\n\
		if count > 0 then\n\
			io.write( ", " )\n\
		end\n\
		io.write( sSide )\n\
		count = count + 1\n\
	end\n\
end\n\
\n\
if count > 0 then\n\
	print( "." )\n\
else\n\
	print( "None." )\n\
end\n\
\n\
-- Bundled input\n\
if bundledCount > 0 then\n\
	print()\n\
	print( "Bundled inputs:" )\n\
	for i,sSide in ipairs( redstone.getSides() ) do\n\
		if redstone.getBundledInput( sSide ) > 0 then\n\
			write( sSide.." = "..redstone.getBundledInput( sSide ).." (" )\n\
\n\
			local count = 0\n\
			for sColour,nColour in pairs( colors ) do\n\
				if type( nColour ) == "number" and \n\
				   redstone.testBundledInput( sSide, nColour ) then\n\
					if count > 0 then\n\
						write( " + " )\n\
					end\n\
					if term.isColour() then\n\
						term.setTextColour( nColour )\n\
					end\n\
					write( sColour )\n\
					if term.isColour() then\n\
						term.setTextColour( colours.white )\n\
					end\n\
					count = count + 1\n\
				end\n\
			end\n\
			print( ")" )\n\
		end\n\
	end\n\
end\n\
';


rom["programs/redpulse"] = '\n\
\n\
local tArgs = { ... }\n\
local sSide = tArgs[1]\n\
if not sSide then\n\
	print("Usage: redpulse <side> <count> <period>")\n\
	return\n\
end\n\
\n\
local nCount = tonumber(tArgs[2]) or 1\n\
local nPeriod = tonumber(tArgs[3]) or 0.5\n\
\n\
for n=1,nCount do\n\
	redstone.setOutput( sSide, true )\n\
	sleep( nPeriod / 2 )\n\
	redstone.setOutput( sSide, false )\n\
	sleep( nPeriod / 2 )\n\
end\n\
';


rom["programs/redset"] = '\n\
\n\
local tArgs = { ... }\n\
if #tArgs == 0 or #tArgs > 3 then\n\
  print("Usages:")\n\
  print("redset <side> <true/false>")\n\
  print("redset <side> <number>")\n\
  print("redset <side> <color> <true/false>")\n\
  return\n\
end\n\
\n\
local sSide = tArgs[1]\n\
if #tArgs == 2 then\n\
	local value = tArgs[2]\n\
	if tonumber(value) ~= nil then\n\
		redstone.setBundledOutput( sSide, tonumber(value) )\n\
	elseif value == "true" or value == "false" then\n\
		redstone.setOutput( sSide, value == "true" )\n\
	else\n\
		print( "Value must be a number or true/false" )\n\
		return\n\
	end\n\
	\n\
else\n\
	local sColour = tArgs[2]\n\
	local nColour = colors[sColour] or colours[sColour]\n\
	if type(nColour) ~= "number" then\n\
		print( "No such color" )\n\
		return\n\
	end\n\
	\n\
	local sValue = tArgs[3]\n\
	if sValue == "true" then\n\
		rs.setBundledOutput( sSide, colors.combine( rs.getBundledOutput( sSide ), nColour ) )\n\
	elseif sValue == "false" then\n\
		rs.setBundledOutput( sSide, colors.subtract( rs.getBundledOutput( sSide ), nColour ) )\n\
	else\n\
		print( "Value must be true/false" )\n\
		return\n\
	end\n\
end\n\
';


rom["programs/rename"] = '\n\
shell.run( "move", ... )\n\
';


rom["programs/shell"] = '\n\
\n\
local parentShell = shell\n\
\n\
local bExit = false\n\
local sDir = (parentShell and parentShell.dir()) or ""\n\
local sPath = (parentShell and parentShell.path()) or ".:/rom/programs"\n\
local tAliases = (parentShell and parentShell.aliases()) or {}\n\
local tProgramStack = {}\n\
\n\
local shell = {}\n\
local tEnv = {\n\
	["shell"] = shell,\n\
}\n\
\n\
-- Colours\n\
local promptColour, textColour, bgColour\n\
if term.isColour() then\n\
	promptColour = colours.yellow\n\
	textColour = colours.white\n\
	bgColour = colours.black\n\
else\n\
	promptColour = colours.white\n\
	textColour = colours.white\n\
	bgColour = colours.black\n\
end\n\
\n\
\n\
local function run( _sCommand, ... )\n\
	local sPath = shell.resolveProgram( _sCommand )\n\
	if sPath ~= nil then\n\
		tProgramStack[#tProgramStack + 1] = sPath\n\
   		local result = os.run( tEnv, sPath, ... )\n\
		tProgramStack[#tProgramStack] = nil\n\
		return result\n\
   	else\n\
    	printError( "No such program" )\n\
    	return false\n\
    end\n\
end\n\
\n\
local function runLine( _sLine )\n\
	local tWords = {}\n\
	for match in string.gmatch( _sLine, "[^ \t]+" ) do\n\
		table.insert( tWords, match )\n\
	end\n\
\n\
	local sCommand = tWords[1]\n\
	if sCommand then\n\
		return run( sCommand, unpack( tWords, 2 ) )\n\
	end\n\
	return false\n\
end\n\
\n\
-- Install shell API\n\
function shell.run( ... )\n\
	return runLine( table.concat( { ... }, " " ) )\n\
end\n\
\n\
function shell.exit()\n\
    bExit = true\n\
end\n\
\n\
function shell.dir()\n\
	return sDir\n\
end\n\
\n\
function shell.setDir( _sDir )\n\
	sDir = _sDir\n\
end\n\
\n\
function shell.path()\n\
	return sPath\n\
end\n\
\n\
function shell.setPath( _sPath )\n\
	sPath = _sPath\n\
end\n\
\n\
function shell.resolve( _sPath )\n\
	local sStartChar = string.sub( _sPath, 1, 1 )\n\
	if sStartChar == "/" or sStartChar == "\\" then\n\
		return fs.combine( "", _sPath )\n\
	else\n\
		return fs.combine( sDir, _sPath )\n\
	end\n\
end\n\
\n\
function shell.resolveProgram( _sCommand )\n\
	-- Substitute aliases firsts\n\
	if tAliases[ _sCommand ] ~= nil then\n\
		_sCommand = tAliases[ _sCommand ]\n\
	end\n\
\n\
    -- If the path is a global path, use it directly\n\
    local sStartChar = string.sub( _sCommand, 1, 1 )\n\
    if sStartChar == "/" or sStartChar == "\\" then\n\
    	local sPath = fs.combine( "", _sCommand )\n\
    	if fs.exists( sPath ) and not fs.isDir( sPath ) then\n\
			return sPath\n\
    	end\n\
		return nil\n\
    end\n\
    \n\
 	-- Otherwise, look on the path variable\n\
    for sPath in string.gmatch(sPath, "[^:]+") do\n\
    	sPath = fs.combine( shell.resolve( sPath ), _sCommand )\n\
    	if fs.exists( sPath ) and not fs.isDir( sPath ) then\n\
			return sPath\n\
    	end\n\
    end\n\
	\n\
	-- Not found\n\
	return nil\n\
end\n\
\n\
function shell.programs( _bIncludeHidden )\n\
	local tItems = {}\n\
	\n\
	-- Add programs from the path\n\
    for sPath in string.gmatch(sPath, "[^:]+") do\n\
    	sPath = shell.resolve( sPath )\n\
		if fs.isDir( sPath ) then\n\
			local tList = fs.list( sPath )\n\
			for n,sFile in pairs( tList ) do\n\
				if not fs.isDir( fs.combine( sPath, sFile ) ) and\n\
				   (_bIncludeHidden or string.sub( sFile, 1, 1 ) ~= ".") then\n\
					tItems[ sFile ] = true\n\
				end\n\
			end\n\
		end\n\
    end	\n\
\n\
	-- Sort and return\n\
	local tItemList = {}\n\
	for sItem, b in pairs( tItems ) do\n\
		table.insert( tItemList, sItem )\n\
	end\n\
	table.sort( tItemList )\n\
	return tItemList\n\
end\n\
\n\
function shell.getRunningProgram()\n\
	if #tProgramStack > 0 then\n\
		return tProgramStack[#tProgramStack]\n\
	end\n\
	return nil\n\
end\n\
\n\
function shell.setAlias( _sCommand, _sProgram )\n\
	tAliases[ _sCommand ] = _sProgram\n\
end\n\
\n\
function shell.clearAlias( _sCommand )\n\
	tAliases[ _sCommand ] = nil\n\
end\n\
\n\
function shell.aliases()\n\
	-- Add aliases\n\
	local tCopy = {}\n\
	for sAlias, sCommand in pairs( tAliases ) do\n\
		tCopy[sAlias] = sCommand\n\
	end\n\
	return tCopy\n\
end\n\
	\n\
term.setBackgroundColor( bgColour )\n\
term.setTextColour( promptColour )\n\
print( os.version() )\n\
term.setTextColour( textColour )\n\
\n\
-- If this is the toplevel shell, run the startup programs\n\
if parentShell == nil then\n\
	-- Run the startup from the ROM first\n\
	local sRomStartup = shell.resolveProgram( "/rom/startup" )\n\
	if sRomStartup then\n\
		shell.run( sRomStartup )\n\
	end\n\
	\n\
	-- Then run the user created startup, from the disks or the root\n\
	local sUserStartup = shell.resolveProgram( "/startup" )\n\
	for n,sSide in pairs( peripheral.getNames() ) do\n\
		if disk.isPresent( sSide ) and disk.hasData( sSide ) then\n\
			local sDiskStartup = shell.resolveProgram( fs.combine(disk.getMountPath( sSide ), "startup") )\n\
			if sDiskStartup then\n\
				sUserStartup = sDiskStartup\n\
				break\n\
			end\n\
		end\n\
	end\n\
	\n\
	if sUserStartup then\n\
		shell.run( sUserStartup )\n\
	end\n\
end\n\
\n\
-- Run any programs passed in as arguments\n\
local tArgs = { ... }\n\
if #tArgs > 0 then\n\
	shell.run( ... )\n\
end\n\
\n\
-- Read commands and execute them\n\
local tCommandHistory = {}\n\
while not bExit do\n\
	term.setBackgroundColor( bgColour )\n\
	term.setTextColour( promptColour )\n\
	write( shell.dir() .. "> " )\n\
	term.setTextColour( textColour )\n\
\n\
	local sLine = read( nil, tCommandHistory )\n\
	table.insert( tCommandHistory, sLine )\n\
	runLine( sLine )\n\
end\n\
\n\
-- If this is the toplevel shell, run the shutdown program\n\
if parentShell == nil then\n\
	if shell.resolveProgram( "shutdown" ) then\n\
		shell.run( "shutdown" )\n\
	end\n\
	os.shutdown() -- just in case\n\
end\n\
';


rom["programs/shutdown"] = '\n\
if term.isColour() then\n\
	term.setTextColour( colours.yellow )\n\
end\n\
print( "Goodbye" )\n\
term.setTextColour( colours.white )\n\
\n\
sleep( 1 )\n\
os.shutdown()\n\
';


rom["programs/time"] = '\n\
local nTime = os.time()\n\
local nDay = os.day()\n\
print( "The time is "..textutils.formatTime( nTime, false ).." on Day "..nDay )\n\
';


rom["programs/type"] = '\n\
\n\
local tArgs = { ... }\n\
if #tArgs < 1 then\n\
	print( "Usage: type <path>" )\n\
  	return\n\
end\n\
\n\
local sPath = shell.resolve( tArgs[1] )\n\
if fs.exists( sPath ) then\n\
	if fs.isDir( sPath ) then\n\
		print( "directory" )\n\
	else\n\
		print( "file" )\n\
	end\n\
else\n\
	print( "No such path" )\n\
end\n\
\n\
';



//  ----------------  ROM APIs  ----------------  //


rom["apis/colors"] = '\n\
-- Colors\n\
white = 1\n\
orange = 2\n\
magenta = 4\n\
lightBlue = 8\n\
yellow = 16\n\
lime = 32\n\
pink = 64\n\
gray = 128\n\
lightGray = 256\n\
cyan = 512\n\
purple = 1024\n\
blue = 2048\n\
brown = 4096\n\
green = 8192\n\
red = 16384\n\
black = 32768\n\
\n\
function combine( ... )\n\
  local r = 0\n\
  for n,c in ipairs( { ... } ) do\n\
    r = bit.bor(r,c)\n\
  end\n\
  return r\n\
end\n\
\n\
function subtract( colors, ... )\n\
	local r = colors\n\
	for n,c in ipairs( { ... } ) do\n\
		r = bit.band(r, bit.bnot(c))\n\
	end\n\
	return r\n\
end\n\
\n\
function test( colors, color )\n\
  return ((bit.band(colors, color)) == color)\n\
end\n\
';


rom["apis/colours"] = '\n\
-- Colours (for lovers of british spelling)\n\
local fnFile, err = loadfile("/rom/apis/colors")\n\
if not fnFile then\n\
	error( err )\n\
end\n\
\n\
local tColors = {}\n\
setmetatable( tColors, { __index = _G } )\n\
setfenv( fnFile, tColors )\n\
fnFile( tColors )\n\
\n\
local tColours = getfenv()\n\
for k,v in pairs( tColors ) do\n\
	tColours[k] = v\n\
end\n\
\n\
tColours.gray = nil\n\
tColours.grey = tColors.gray\n\
\n\
tColours.lightGray = nil\n\
tColours.lightGrey = tColors.lightGray\n\
';


rom["apis/disk"] = '\n\
\n\
local function isDrive( side )\n\
	return peripheral.getType( side ) == "drive"\n\
end\n\
\n\
function isPresent( side )\n\
	if isDrive( side ) then\n\
		return peripheral.call( side, "isDiskPresent" )\n\
	end\n\
	return false\n\
end\n\
\n\
function getLabel( side )\n\
	if isDrive( side ) then\n\
		return peripheral.call( side, "getDiskLabel" )\n\
	end\n\
	return nil\n\
end\n\
\n\
function setLabel( side, label )\n\
	if isDrive( side ) then\n\
		peripheral.call( side, "setDiskLabel", label )\n\
	end\n\
end\n\
\n\
function hasData( side )\n\
	if isDrive( side ) then\n\
		return peripheral.call( side, "hasData" )\n\
	end\n\
	return false\n\
end\n\
\n\
function getMountPath( side )\n\
	if isDrive( side ) then\n\
		return peripheral.call( side, "getMountPath" )\n\
	end\n\
	return nil\n\
end\n\
\n\
function hasAudio( side )\n\
	if isDrive( side ) then\n\
		return peripheral.call( side, "hasAudio" )\n\
	end\n\
	return false\n\
end\n\
\n\
function getAudioTitle( side )\n\
	if isDrive( side ) then\n\
		return peripheral.call( side, "getAudioTitle" )\n\
	end\n\
	return nil\n\
end\n\
\n\
function playAudio( side )\n\
	if isDrive( side ) then\n\
		peripheral.call( side, "playAudio" )\n\
	end\n\
end\n\
\n\
function stopAudio( side )\n\
	if not side then\n\
		for n,sSide in ipairs( peripheral.getNames() ) do\n\
			stopAudio( sSide )\n\
		end\n\
	else\n\
		if isDrive( side ) then\n\
			peripheral.call( side, "stopAudio" )\n\
		end\n\
	end\n\
end\n\
\n\
function eject( side )\n\
	if isDrive( side ) then\n\
		peripheral.call( side, "ejectDisk" )\n\
	end\n\
end\n\
\n\
function getID( side )\n\
	if isDrive( side ) then\n\
		return peripheral.call( side, "getDiskID" )\n\
	end\n\
	return nil\n\
end\n\
\n\
';


rom["apis/gps"] = '\n\
\n\
CHANNEL_GPS = 65534\n\
\n\
local function trilaterate( A, B, C )\n\
	local a2b = B.position - A.position\n\
	local a2c = C.position - A.position\n\
		\n\
	if math.abs( a2b:normalize():dot( a2c:normalize() ) ) > 0.999 then\n\
		return nil\n\
	end\n\
	\n\
	local d = a2b:length()\n\
	local ex = a2b:normalize( )\n\
	local i = ex:dot( a2c )\n\
	local ey = (a2c - (ex * i)):normalize()\n\
	local j = ey:dot( a2c )\n\
	local ez = ex:cross( ey )\n\
\n\
	local r1 = A.distance\n\
	local r2 = B.distance\n\
	local r3 = C.distance\n\
		\n\
	local x = (r1*r1 - r2*r2 + d*d) / (2*d)\n\
	local y = (r1*r1 - r3*r3 - x*x + (x-i)*(x-i) + j*j) / (2*j)\n\
		\n\
	local result = A.position + (ex * x) + (ey * y)\n\
\n\
	local zSquared = r1*r1 - x*x - y*y\n\
	if zSquared > 0 then\n\
		local z = math.sqrt( zSquared )\n\
		local result1 = result + (ez * z)\n\
		local result2 = result - (ez * z)\n\
		\n\
		local rounded1, rounded2 = result1:round(), result2:round()\n\
		if rounded1.x ~= rounded2.x or rounded1.y ~= rounded2.y or rounded1.z ~= rounded2.z then\n\
			return rounded1, rounded2\n\
		else\n\
			return rounded1\n\
		end\n\
	end\n\
	return result:round()\n\
	\n\
end\n\
\n\
local function narrow( p1, p2, fix )\n\
	local dist1 = math.abs( (p1 - fix.position):length() - fix.distance )\n\
	local dist2 = math.abs( (p2 - fix.position):length() - fix.distance )\n\
	\n\
	if math.abs(dist1 - dist2) < 0.05 then\n\
		return p1, p2\n\
	elseif dist1 < dist2 then\n\
		return p1:round()\n\
	else\n\
		return p2:round()\n\
	end\n\
end\n\
\n\
function locate( _nTimeout, _bDebug )\n\
\n\
	-- Find a modem\n\
	local sModemSide = nil\n\
	for n,sSide in ipairs( rs.getSides() ) do\n\
		if peripheral.getType( sSide ) == "modem" and peripheral.call( sSide, "isWireless" ) then	\n\
			sModemSide = sSide\n\
			break\n\
		end\n\
	end\n\
\n\
	if sModemSide == nil then\n\
		if _bDebug then\n\
			print( "No wireless modem attached" )\n\
		end\n\
		return nil\n\
	end\n\
	\n\
	if _bDebug then\n\
		print( "Finding position..." )\n\
	end\n\
	\n\
	-- Open a channel\n\
	local modem = peripheral.wrap( sModemSide )\n\
	local bCloseChannel = false\n\
	if not modem.isOpen( os.getComputerID() ) then\n\
		modem.open( os.getComputerID() )\n\
		bCloseChannel = true\n\
	end\n\
	\n\
	-- Send a ping to listening GPS hosts\n\
	modem.transmit( CHANNEL_GPS, os.getComputerID(), "PING" )\n\
		\n\
	-- Wait for the responses\n\
	local tFixes = {}\n\
	local pos1, pos2 = nil\n\
	local timeout = os.startTimer( _nTimeout or 2 )\n\
	while true do\n\
		local e, p1, p2, p3, p4, p5 = os.pullEvent()\n\
		if e == "modem_message" then\n\
			-- We received a message from a modem\n\
			local sSide, sChannel, sReplyChannel, sMessage, nDistance = p1, p2, p3, p4, p5\n\
			if sSide == sModemSide and sChannel == os.getComputerID() and sReplyChannel == CHANNEL_GPS then\n\
				-- Received the correct message from the correct modem: use it to determine position\n\
				local tResult = textutils.unserialize( sMessage )\n\
				if type(tResult) == "table" and #tResult == 3 then\n\
					local tFix = { position = vector.new( tResult[1], tResult[2], tResult[3] ), distance = nDistance }\n\
					if _bDebug then\n\
						print( tFix.distance.." metres from "..tostring( tFix.position ) )\n\
					end\n\
					table.insert( tFixes, tFix )\n\
					if #tFixes >= 3 then\n\
						if not pos1 then\n\
							pos1, pos2 = trilaterate( tFixes[1], tFixes[2], tFixes[#tFixes] )\n\
						else\n\
							pos1, pos2 = narrow( pos1, pos2, tFixes[#tFixes] )\n\
						end\n\
					end\n\
					\n\
					if pos1 and not pos2 then\n\
						break\n\
					end\n\
				end\n\
			end\n\
			\n\
		elseif e == "timer" then\n\
			-- We received a timeout\n\
			local timer = p1\n\
			if timer == timeout then\n\
				break\n\
			end\n\
		\n\
		end \n\
	end\n\
	\n\
	-- Close the channel, if we opened one\n\
	if bCloseChannel then\n\
		modem.close( os.getComputerID() )\n\
	end\n\
	\n\
	-- Return the response\n\
	if pos1 and pos2 then\n\
		if _bDebug then\n\
			print( "Ambiguous position" )\n\
			print( "Could be "..pos1.x..","..pos1.y..","..pos1.z.." or "..pos2.x..","..pos2.y..","..pos2.z )\n\
		end\n\
		return nil\n\
	elseif pos1 then\n\
		if _bDebug then\n\
			print( "Position is "..pos1.x..","..pos1.y..","..pos1.z )\n\
		end\n\
		return pos1.x, pos1.y, pos1.z\n\
	else\n\
		if _bDebug then\n\
			print( "Could not determine position" )\n\
		end\n\
		return nil\n\
	end\n\
end\n\
';


rom["apis/help"] = '\n\
\n\
local sPath = "/rom/help"\n\
\n\
function path()\n\
	return sPath\n\
end\n\
\n\
function setPath( _sPath )\n\
	sPath = _sPath\n\
end\n\
\n\
function lookup( _sTopic )\n\
 	-- Look on the path variable\n\
    for sPath in string.gmatch(sPath, "[^:]+") do\n\
    	sPath = fs.combine( sPath, _sTopic )\n\
    	if fs.exists( sPath ) and not fs.isDir( sPath ) then\n\
			return sPath\n\
    	end\n\
    end\n\
	\n\
	-- Not found\n\
	return nil\n\
end\n\
\n\
function topics()\n\
	local tItems = {}\n\
	\n\
	-- Add topics from the path\n\
    for sPath in string.gmatch(sPath, "[^:]+") do\n\
		if fs.isDir( sPath ) then\n\
			local tList = fs.list( sPath )\n\
			for n,sFile in pairs( tList ) do\n\
				if string.sub( sFile, 1, 1 ) ~= "." then\n\
					if not fs.isDir( fs.combine( sPath, sFile ) ) then\n\
						tItems[ sFile ] = true\n\
					end\n\
				end\n\
			end\n\
		end\n\
    end	\n\
\n\
	-- Sort and return\n\
	local tItemList = {}\n\
	for sItem, b in pairs( tItems ) do\n\
		table.insert( tItemList, sItem )\n\
	end\n\
	table.sort( tItemList )\n\
	return tItemList\n\
end\n\
';


rom["apis/io"] = '\n\
-- Definition for the IO API\n\
\n\
local g_defaultInput = {\n\
	bFileHandle = true,\n\
	bClosed = false,\n\
	close = function( self )\n\
	end,\n\
	read = function( self, _sFormat )\n\
		if _sFormat and _sFormat ~= "*l" then\n\
			error( "Unsupported format" )\n\
		end\n\
		return _G.read()\n\
	end,\n\
	lines = function( self )\n\
		return function()\n\
			return _G.read()\n\
		end\n\
	end,\n\
}\n\
\n\
local g_defaultOutput = {\n\
	bFileHandle = true,\n\
	bClosed = false,\n\
	close = function( self )\n\
	end,\n\
	write = function( self, _sText )\n\
		_G.write( _sText )\n\
	end,\n\
	flush = function( self )\n\
	end,\n\
}\n\
\n\
local g_currentInput = g_defaultInput\n\
local g_currentOutput = g_defaultOutput\n\
\n\
function close( _file )\n\
	(_file or g_currentOutput):close()\n\
end\n\
\n\
function flush()\n\
	g_currentOutput:flush()\n\
end\n\
\n\
function input( _arg )\n\
	if _G.type( _arg ) == "string" then\n\
		g_currentInput = open( _arg, "r" )\n\
	elseif _G.type( _arg ) == "table" then\n\
		g_currentInput = _arg\n\
	elseif _G.type( _arg ) == "nil" then\n\
		return g_currentInput\n\
	else\n\
		error( "Expected file name or file handle" )\n\
	end\n\
end\n\
\n\
function lines( _sFileName )\n\
	if _sFileName then\n\
		return open( _sFileName, "r" ):lines()\n\
	else\n\
		return g_currentInput:lines()\n\
	end\n\
end\n\
\n\
function open( _sPath, _sMode )\n\
	local sMode = _sMode or "r"\n\
	local file = fs.open( _sPath, sMode )\n\
	if not file then\n\
		return nil\n\
	end\n\
	\n\
	if sMode == "r"then\n\
		return {\n\
			bFileHandle = true,\n\
			bClosed = false,				\n\
			close = function( self )\n\
				file.close()\n\
				self.bClosed = true\n\
			end,\n\
			read = function( self, _sFormat )\n\
				local sFormat = _sFormat or "*l"\n\
				if sFormat == "*l" then\n\
					return file.readLine()\n\
				elseif sFormat == "*a" then\n\
					return file.readAll()\n\
				else\n\
					error( "Unsupported format" )\n\
				end\n\
				return nil\n\
			end,\n\
			lines = function( self )\n\
				return function()\n\
					local sLine = file.readLine()\n\
					if sLine == nil then\n\
						file.close()\n\
						self.bClosed = true\n\
					end\n\
					return sLine\n\
				end\n\
			end,\n\
		}\n\
	elseif sMode == "w" or sMode == "a" then\n\
		return {\n\
			bFileHandle = true,\n\
			bClosed = false,				\n\
			close = function( self )\n\
				file.close()\n\
				self.bClosed = true\n\
			end,\n\
			write = function( self, _sText )\n\
				file.write( _sText )\n\
			end,\n\
			flush = function( self )\n\
				file.flush()\n\
			end,\n\
		}\n\
	\n\
	elseif sMode == "rb" then\n\
		return {\n\
			bFileHandle = true,\n\
			bClosed = false,				\n\
			close = function( self )\n\
				file.close()\n\
				self.bClosed = true\n\
			end,\n\
			read = function( self )\n\
				return file.read()\n\
			end,\n\
		}\n\
		\n\
	elseif sMode == "wb" or sMode == "ab" then\n\
		return {\n\
			bFileHandle = true,\n\
			bClosed = false,				\n\
			close = function( self )\n\
				file.close()\n\
				self.bClosed = true\n\
			end,\n\
			write = function( self, _number )\n\
				file.write( _number )\n\
			end,\n\
			flush = function( self )\n\
				file.flush()\n\
			end,\n\
		}\n\
	\n\
	else\n\
		file.close()\n\
		error( "Unsupported mode" )\n\
		\n\
	end\n\
end\n\
\n\
function output( _arg )\n\
	if _G.type( _arg ) == "string" then\n\
		g_currentOutput = open( _arg, "w" )\n\
	elseif _G.type( _arg ) == "table" then\n\
		g_currentOutput = _arg\n\
	elseif _G.type( _arg ) == "nil" then\n\
		return g_currentOutput\n\
	else\n\
		error( "Expected file name or file handle" )\n\
	end\n\
end\n\
\n\
function read( ... )\n\
	return input():read( ... )\n\
end\n\
\n\
function type( _handle )\n\
	if _G.type( _handle ) == "table" and _handle.bFileHandle == true then\n\
		if _handle.bClosed then\n\
			return "closed file"\n\
		else\n\
			return "file"\n\
		end\n\
	end\n\
	return nil\n\
end\n\
\n\
function write( ... )\n\
	return output():write( ... )\n\
end\n\
';


rom["apis/keys"] = '\n\
\n\
-- Minecraft key code bindings\n\
-- See http://www.minecraftwiki.net/wiki/Key_codes for more info\n\
\n\
local nothing = 42\n\
local tKeys = {\n\
	nil,	 	"one", 		"two", 		"three", 	"four",			-- 1\n\
	"five", 	"six", 		"seven", 	"eight", 	"nine",			-- 6\n\
	"zero", 	"minus", 	"equals", 	"backspace","tab",			-- 11\n\
	"q", 		"w", 		"e", 		"r",		"t",			-- 16\n\
	"y",		"u",		"i",		"o",		"p",			-- 21\n\
	"leftBracket","rightBracket","enter","leftCtrl","a",			-- 26\n\
	"s",		"d",		"f",		"g",		"h",			-- 31\n\
	"j",		"k",		"l",		"semiColon","apostrophe",	-- 36\n\
	"grave",	"leftShift","backslash","z",		"x",			-- 41\n\
	"c",		"v",		"b",		"n",		"m",			-- 46\n\
	"comma",	"period",	"slash",	"rightShift","multiply",	-- 51\n\
	"leftAlt",	"space",	"capsLock",	"f1",		"f2",			-- 56\n\
	"f3",		"f4",		"f5",		"f6",		"f7",			-- 61\n\
	"f8",		"f9",		"f10",		"numLock",	"scollLock",	-- 66	\n\
	"numPad7",	"numPad8",	"numPad9",	"numPadSubtract","numPad4",	-- 71\n\
	"numPad5",	"numPad6",	"numPadAdd","numPad1",	"numPad2",		-- 76\n\
	"numPad3",	"numPad0",	"numPadDecimal",nil,	nil,			-- 81\n\
	nil,	 	"f11",		"f12",		nil,		nil,			-- 86\n\
	nil,		nil,		nil,		nil,		nil,			-- 91\n\
	nil,		nil,		nil,		nil,		"f13",			-- 96\n\
	"f14",		"f15",		nil,		nil,		nil,			-- 101\n\
	nil,		nil,		nil,		nil,		nil,			-- 106\n\
	nil,		"kana",		nil,		nil,		nil,			-- 111\n\
	nil,		nil,		nil,		nil,		nil,			-- 116	\n\
	"convert",	nil,		"noconvert",nil,		"yen",			-- 121\n\
	nil,		nil,		nil,		nil,		nil,			-- 126\n\
	nil,		nil,		nil,		nil,		nil,			-- 131\n\
	nil,		nil,		nil,		nil,		nil,			-- 136\n\
	"numPadEquals",nil,		nil,		"cimcumflex","at",			-- 141\n\
	"colon",	"underscore","kanji",	"stop",		"ax",			-- 146\n\
	nil,		"numPadEnter","rightCtrl",nil,		nil,			-- 151\n\
	nil,		nil,		nil,		nil,		nil,			-- 156\n\
	nil,		nil,		nil,		nil,		nil,			-- 161\n\
	nil,		nil,		nil,		nil,		nil,			-- 166\n\
	nil,		nil,		nil,		nil,		nil,			-- 171\n\
	nil,		nil,		nil,		"numPadComma",nil,			-- 176\n\
	"numPadDivide",nil,		nil,		"rightAlt",	nil,			-- 181\n\
	nil,		nil,		nil,		nil,		nil,			-- 186\n\
	nil,		nil,		nil,		nil,		nil,			-- 191\n\
	nil,		"pause",	nil,		"home",		"up",			-- 196\n\
	"pageUp",	nil,		"left",		nil,		"right",		-- 201\n\
	nil,		"end",		"down",		"pageDown",	"insert",		-- 206\n\
	"delete"														-- 211\n\
}\n\
\n\
local keys = getfenv()\n\
for nKey, sKey in pairs( tKeys ) do\n\
	keys[sKey] = nKey\n\
end\n\
keys["return"] = keys.enter\n\
\n\
function getName( _nKey )\n\
	return tKeys[ _nKey ]\n\
end\n\
';


rom["apis/paintutils"] = '\n\
\n\
local function drawPixelInternal( xPos, yPos )\n\
	term.setCursorPos(xPos, yPos)\n\
	term.write(" ")\n\
end\n\
\n\
local tColourLookup = {}\n\
for n=1,16 do\n\
	tColourLookup[ string.byte( "0123456789abcdef",n,n ) ] = 2^(n-1)\n\
end\n\
\n\
function loadImage( sPath )\n\
	local tImage = {}\n\
	if fs.exists( sPath ) then\n\
		local file = io.open(sPath, "r" )\n\
		local sLine = file:read()\n\
		while sLine do\n\
			local tLine = {}\n\
			for x=1,sLine:len() do\n\
				tLine[x] = tColourLookup[ string.byte(sLine,x,x) ] or 0\n\
			end\n\
			table.insert( tImage, tLine )\n\
			sLine = file:read()\n\
		end\n\
		file:close()\n\
		return tImage\n\
	end\n\
	return nil\n\
end\n\
\n\
function drawPixel( xPos, yPos, nColour )\n\
	if nColour then\n\
		term.setBackgroundColor( nColour )\n\
	end\n\
	drawPixelInternal( xPos, yPos )\n\
end\n\
\n\
function drawLine( startX, startY, endX, endY, nColour )\n\
	if nColour then\n\
		term.setBackgroundColor( nColour )\n\
	end\n\
	\n\
	startX = math.floor(startX)\n\
	startY = math.floor(startY)\n\
	endX = math.floor(endX)\n\
	endY = math.floor(endY)\n\
	\n\
	if startX == endX and startY == endY then\n\
		drawPixelInternal( startX, startY )\n\
		return\n\
	end\n\
	\n\
	local minX = math.min( startX, endX )\n\
	if minX == startX then\n\
		minY = startY\n\
		maxX = endX\n\
		maxY = endY\n\
	else\n\
		minY = endY\n\
		maxX = startX\n\
		maxY = startY\n\
	end\n\
		\n\
	local xDiff = maxX - minX\n\
	local yDiff = maxY - minY\n\
			\n\
	if xDiff > math.abs(yDiff) then\n\
		local y = minY\n\
		local dy = yDiff / xDiff\n\
		for x=minX,maxX do\n\
			drawPixelInternal( x, math.floor( y + 0.5 ) )\n\
			y = y + dy\n\
		end\n\
	else\n\
		local x = minX\n\
		local dx = xDiff / yDiff\n\
		if maxY >= minY then\n\
			for y=minY,maxY do\n\
				drawPixelInternal( math.floor( x + 0.5 ), y )\n\
				x = x + dx\n\
			end\n\
		else\n\
			for y=minY,maxY,-1 do\n\
				drawPixelInternal( math.floor( x + 0.5 ), y )\n\
				x = x - dx\n\
			end\n\
		end\n\
	end\n\
end\n\
\n\
function drawImage( tImage, xPos, yPos )\n\
	for y=1,#tImage do\n\
		local tLine = tImage[y]\n\
		for x=1,#tLine do\n\
			if tLine[x] > 0 then\n\
				term.setBackgroundColor( tLine[x] )\n\
				drawPixelInternal( x + xPos - 1, y + yPos - 1 )\n\
			end\n\
		end\n\
	end\n\
end\n\
';


rom["apis/parallel"] = '\n\
\n\
local function create( first, ... )\n\
	if first ~= nil then\n\
		return coroutine.create(first), create( ... )\n\
    end\n\
    return nil\n\
end\n\
\n\
local function runUntilLimit( _routines, _limit )\n\
    local count = #_routines\n\
    local living = count\n\
    \n\
    local tFilters = {}\n\
    local eventData = {}\n\
    while true do\n\
    	for n=1,count do\n\
    		local r = _routines[n]\n\
    		if r then\n\
    			if tFilters[r] == nil or tFilters[r] == eventData[1] or eventData[1] == "terminate" then\n\
	    			local ok, param = coroutine.resume( r, unpack(eventData) )\n\
					if not ok then\n\
						error( param )\n\
					else\n\
						tFilters[r] = param\n\
					end\n\
					if coroutine.status( r ) == "dead" then\n\
						_routines[n] = nil\n\
						living = living - 1\n\
						if living <= _limit then\n\
							return n\n\
						end\n\
					end\n\
				end\n\
    		end\n\
    	end\n\
		for n=1,count do\n\
    		local r = _routines[n]\n\
			if r and coroutine.status( r ) == "dead" then\n\
				_routines[n] = nil\n\
				living = living - 1\n\
				if living <= _limit then\n\
					return n\n\
				end\n\
			end\n\
		end\n\
    	eventData = { os.pullEventRaw() }\n\
    end\n\
end\n\
\n\
function waitForAny( ... )\n\
    local routines = { create( ... ) }\n\
    return runUntilLimit( routines, #routines - 1 )\n\
end\n\
\n\
function waitForAll( ... )\n\
    local routines = { create( ... ) }\n\
	runUntilLimit( routines, 0 )\n\
end\n\
';


rom["apis/peripheral"] = '\n\
local native = peripheral\n\
\n\
function getNames()\n\
	local tResults = {}\n\
	for n,sSide in ipairs( rs.getSides() ) do\n\
		if native.isPresent( sSide ) then\n\
			table.insert( tResults, sSide )\n\
			if native.getType( sSide ) == "modem" and not native.call( sSide, "isWireless" ) then\n\
				local tRemote = native.call( sSide, "getNamesRemote" )\n\
				for n,sName in ipairs( tRemote ) do\n\
					table.insert( tResults, sName )\n\
				end\n\
			end\n\
		end\n\
	end\n\
	return tResults\n\
end\n\
\n\
function isPresent( _sSide )\n\
	if native.isPresent( _sSide ) then\n\
		return true\n\
	end\n\
	for n,sSide in ipairs( rs.getSides() ) do\n\
		if native.getType( sSide ) == "modem" and not native.call( sSide, "isWireless" ) then\n\
			if native.call( sSide, "isPresentRemote", _sSide )  then\n\
				return true\n\
			end\n\
		end\n\
	end\n\
	return false\n\
end\n\
\n\
function getType( _sSide )\n\
	if native.isPresent( _sSide ) then\n\
		return native.getType( _sSide )\n\
	end\n\
	for n,sSide in ipairs( rs.getSides() ) do\n\
		if native.getType( sSide ) == "modem" and not native.call( sSide, "isWireless" ) then\n\
			if native.call( sSide, "isPresentRemote", _sSide )  then\n\
				return native.call( sSide, "getTypeRemote", _sSide ) \n\
			end\n\
		end\n\
	end\n\
	return nil\n\
end\n\
\n\
function getMethods( _sSide )\n\
	if native.isPresent( _sSide ) then\n\
		return native.getMethods( _sSide )\n\
	end\n\
	for n,sSide in ipairs( rs.getSides() ) do\n\
		if native.getType( sSide ) == "modem" and not native.call( sSide, "isWireless" ) then\n\
			if native.call( sSide, "isPresentRemote", _sSide )  then\n\
				return native.call( sSide, "getMethodsRemote", _sSide ) \n\
			end\n\
		end\n\
	end\n\
	return nil\n\
end\n\
\n\
function call( _sSide, _sMethod, ... )\n\
	if native.isPresent( _sSide ) then\n\
		return native.call( _sSide, _sMethod, ... )\n\
	end\n\
	for n,sSide in ipairs( rs.getSides() ) do\n\
		if native.getType( sSide ) == "modem" and not native.call( sSide, "isWireless" ) then\n\
			if native.call( sSide, "isPresentRemote", _sSide )  then\n\
				return native.call( sSide, "callRemote", _sSide, _sMethod, ... ) \n\
			end\n\
		end\n\
	end\n\
	return nil\n\
end\n\
\n\
function wrap( _sSide )\n\
	if peripheral.isPresent( _sSide ) then\n\
		local tMethods = peripheral.getMethods( _sSide )\n\
		local tResult = {}\n\
		for n,sMethod in ipairs( tMethods ) do\n\
			tResult[sMethod] = function( ... )\n\
				return peripheral.call( _sSide, sMethod, ... )\n\
			end\n\
		end\n\
		return tResult\n\
	end\n\
	return nil\n\
end\n\
';


rom["apis/rednet"] = '\n\
\n\
CHANNEL_BROADCAST = 65535\n\
\n\
function open( sModem )\n\
	if type( sModem ) ~= "string" then\n\
		error( "string expected" )\n\
	end\n\
	if peripheral.getType( sModem ) ~= "modem" then	\n\
		error( "No such modem: "..sModem )\n\
	end\n\
	peripheral.call( sModem, "open", os.getComputerID() )\n\
	peripheral.call( sModem, "open", CHANNEL_BROADCAST )\n\
end\n\
\n\
function close( sModem )\n\
	if type( sModem ) ~= "string" then\n\
		error( "string expected" )\n\
	end\n\
	if peripheral.getType( sModem ) ~= "modem" then	\n\
		error( "No such modem: "..sModem )\n\
	end\n\
	peripheral.call( sModem, "close", os.getComputerID() )\n\
	peripheral.call( sModem, "close", CHANNEL_BROADCAST )\n\
end\n\
\n\
function isOpen( sModem )\n\
	if type( sModem ) ~= "string" then\n\
		error( "string expected" )\n\
	end\n\
	if peripheral.getType( sModem ) == "modem" then	\n\
		return peripheral.call( sModem, "isOpen", os.getComputerID() ) and peripheral.call( sModem, "isOpen", CHANNEL_BROADCAST )\n\
	end\n\
	return false\n\
end\n\
\n\
function send( nRecipient, sMessage )\n\
	for n,sModem in ipairs( peripheral.getNames() ) do\n\
		if isOpen( sModem ) then\n\
			peripheral.call( sModem, "transmit", nRecipient, os.getComputerID(), sMessage )\n\
			return true\n\
		end\n\
	end\n\
	error( "No open sides" )\n\
end\n\
\n\
function broadcast( sMessage )\n\
	send( CHANNEL_BROADCAST, sMessage )\n\
end\n\
\n\
function receive( nTimeout )\n\
	local timer = nil\n\
	local sFilter = nil\n\
	if nTimeout then\n\
		timer = os.startTimer( nTimeout )\n\
		sFilter = nil\n\
	else\n\
		sFilter = "rednet_message"\n\
	end\n\
	while true do\n\
		local e, p1, p2, p3, p4, p5 = os.pullEvent( sFilter )\n\
		if e == "rednet_message" then\n\
			local nSenderID, sMessage, nDistance = p1, p2, p3\n\
			return nSenderID, sMessage, nDistance\n\
		elseif e == "timer" and p1 == timer then\n\
			return nil\n\
		end\n\
	end\n\
end\n\
\n\
local bRunning = false\n\
function run()\n\
	if bRunning then\n\
		error( "rednet is already running" )\n\
	end\n\
	bRunning = true\n\
	\n\
	while bRunning do\n\
		local sEvent, sModem, nChannel, nReplyChannel, sMessage, nDistance = os.pullEventRaw( "modem_message" )\n\
		if sEvent == "modem_message" and isOpen( sModem ) and (nChannel == os.getComputerID() or nChannel == CHANNEL_BROADCAST) then\n\
			os.queueEvent( "rednet_message", nReplyChannel, sMessage, nDistance )\n\
		end\n\
	end\n\
end\n\
';


rom["apis/term"] = '\n\
\n\
native = term.native or term\n\
\n\
local redirectTarget = native\n\
local tRedirectStack = {}\n\
\n\
local function wrap( _sFunction )\n\
	return function( ... )\n\
		return redirectTarget[ _sFunction ]( ... )\n\
	end\n\
end\n\
\n\
local term = {}\n\
term.redirect = function( _object )\n\
	if _object == nil or type( _object ) ~= "table" then\n\
		error( "Invalid redirect object" )\n\
	end\n\
	for k,v in pairs( native ) do\n\
		if type( k ) == "string" and type( v ) == "function" then\n\
			if type( _object[k] ) ~= "function" then\n\
				_object[k] = function() \n\
					term.restore()\n\
					error( "Redirect object is missing method "..k..". Restoring.")\n\
				end\n\
			end\n\
		end\n\
	end\n\
\n\
	tRedirectStack[#tRedirectStack + 1] = redirectTarget\n\
	redirectTarget = _object\n\
end\n\
term.restore = function()\n\
	if #tRedirectStack > 0 then\n\
		redirectTarget = tRedirectStack[#tRedirectStack] \n\
		tRedirectStack[#tRedirectStack] = nil\n\
	end\n\
end\n\
for k,v in pairs( native ) do\n\
	if type( k ) == "string" and type( v ) == "function" then\n\
		if term[k] == nil then\n\
			term[k] = wrap( k )\n\
		end\n\
	end\n\
end\n\
	\n\
local env = getfenv()\n\
for k,v in pairs( term ) do\n\
	env[k] = v\n\
end\n\
';


rom["apis/textutils"] = '\n\
\n\
function slowWrite( sText, nRate )\n\
	nRate = nRate or 20\n\
	if nRate < 0 then\n\
		error( "rate must be positive" )\n\
	end\n\
	local nSleep = 1 / nRate\n\
		\n\
	sText = tostring( sText )\n\
	local x,y = term.getCursorPos(x,y)\n\
	local len = string.len( sText )\n\
	\n\
	for n=1,len do\n\
		term.setCursorPos( x, y )\n\
		sleep( nSleep )\n\
		local nLines = write( string.sub( sText, 1, n ) )\n\
		local newX, newY = term.getCursorPos()\n\
		y = newY - nLines\n\
	end\n\
end\n\
\n\
function slowPrint( sText, nRate )\n\
	slowWrite( sText, nRate)\n\
	print()\n\
end\n\
\n\
function formatTime( nTime, bTwentyFourHour )\n\
	local sTOD = nil\n\
	if not bTwentyFourHour then\n\
		if nTime >= 12 then\n\
			sTOD = "PM"\n\
		else\n\
			sTOD = "AM"\n\
		end\n\
		if nTime >= 13 then\n\
			nTime = nTime - 12\n\
		end\n\
	end\n\
\n\
	local nHour = math.floor(nTime)\n\
	local nMinute = math.floor((nTime - nHour)*60)\n\
	if sTOD then\n\
		return string.format( "%d:%02d %s", nHour, nMinute, sTOD )\n\
	else\n\
		return string.format( "%d:%02d", nHour, nMinute )\n\
	end\n\
end\n\
\n\
local function makePagedScroll( _term, _nFreeLines )\n\
	local nativeScroll = _term.scroll\n\
	local nFreeLines = _nFreeLines or 0\n\
	return function( _n )\n\
		for n=1,_n do\n\
			nativeScroll( 1 )\n\
			\n\
			if nFreeLines <= 0 then\n\
				local w,h = _term.getSize()\n\
				_term.setCursorPos( 1, h )\n\
				_term.write( "Press any key to continue" )\n\
				os.pullEvent( "key" )\n\
				_term.clearLine()\n\
				_term.setCursorPos( 1, h )\n\
			else\n\
				nFreeLines = nFreeLines - 1\n\
			end\n\
		end\n\
    end\n\
end\n\
\n\
function pagedPrint( _sText, _nFreeLines )\n\
	local nativeScroll = term.scroll\n\
	term.scroll = makePagedScroll( term, _nFreeLines )\n\
	local result\n\
	local ok, err = pcall( function()\n\
		result = print( _sText )\n\
	end )\n\
	term.scroll = nativeScroll\n\
	if not ok then\n\
		error( err )\n\
	end\n\
	return result\n\
end\n\
\n\
local function tabulateCommon( bPaged, ... )\n\
	local tAll = { ... }\n\
	\n\
	local w,h = term.getSize()\n\
	local nMaxLen = w / 8\n\
	for n, t in ipairs( tAll ) do\n\
		if type(t) == "table" then\n\
			for n, sItem in pairs(t) do\n\
				nMaxLen = math.max( string.len( sItem ) + 1, nMaxLen )\n\
			end\n\
		end\n\
	end\n\
	local nCols = math.floor( w / nMaxLen )\n\
\n\
	local nLines = 0\n\
	local function newLine()\n\
		if bPaged and nLines >= (h-3) then\n\
			pagedPrint()\n\
		else\n\
			print()\n\
		end\n\
		nLines = nLines + 1\n\
	end\n\
	\n\
	local function drawCols( _t )\n\
		local nCol = 1\n\
		for n, s in ipairs( _t ) do\n\
			if nCol > nCols then\n\
				nCol = 1\n\
				newLine()\n\
			end\n\
\n\
			local cx,cy = term.getCursorPos()\n\
			cx = 1 + (nCol - 1) * (w / nCols)\n\
			term.setCursorPos( cx, cy )\n\
			term.write( s )\n\
\n\
			nCol = nCol + 1  	\n\
		end\n\
		print()\n\
	end\n\
	for n, t in ipairs( tAll ) do\n\
		if type(t) == "table" then\n\
			if #t > 0 then\n\
				drawCols( t )\n\
			end\n\
		elseif type(t) == "number" then\n\
			term.setTextColor( t )\n\
		end\n\
	end	\n\
end\n\
\n\
function tabulate( ... )\n\
	tabulateCommon( false, ... )\n\
end\n\
\n\
function pagedTabulate( ... )\n\
	tabulateCommon( true, ... )\n\
end\n\
\n\
local function serializeImpl( t, tTracking )	\n\
	local sType = type(t)\n\
	if sType == "table" then\n\
		if tTracking[t] ~= nil then\n\
			error( "Cannot serialize table with recursive entries" )\n\
		end\n\
		tTracking[t] = true\n\
		\n\
		local result = "{"\n\
		for k,v in pairs(t) do\n\
			result = result..("["..serializeImpl(k, tTracking).."]="..serializeImpl(v, tTracking)..",")\n\
		end\n\
		result = result.."}"\n\
		return result\n\
		\n\
	elseif sType == "string" then\n\
		return string.format( "%q", t )\n\
	\n\
	elseif sType == "number" or sType == "boolean" or sType == "nil" then\n\
		return tostring(t)\n\
		\n\
	else\n\
		error( "Cannot serialize type "..sType )\n\
		\n\
	end\n\
end\n\
\n\
function serialize( t )\n\
	local tTracking = {}\n\
	return serializeImpl( t, tTracking )\n\
end\n\
\n\
function unserialize( s )\n\
	local func, e = loadstring( "return "..s, "serialize" )\n\
	if not func then\n\
		return s\n\
	else\n\
		setfenv( func, {} )\n\
		return func()\n\
	end\n\
end\n\
\n\
function urlEncode( str )\n\
	if str then\n\
		str = string.gsub (str, "\n", "\r\n")\n\
		str = string.gsub (str, "([^%w ])",\n\
		function (c)\n\
			return string.format ("%%%02X", string.byte(c))\n\
		end)\n\
		str = string.gsub (str, " ", "+")\n\
	end\n\
	return str	\n\
end\n\
\n\
';


rom["apis/vector"] = '\n\
\n\
local vector = {\n\
	add = function( self, o )\n\
		return vector.new(\n\
			self.x + o.x,\n\
			self.y + o.y,\n\
			self.z + o.z\n\
		)\n\
	end,\n\
	sub = function( self, o )\n\
		return vector.new(\n\
			self.x - o.x,\n\
			self.y - o.y,\n\
			self.z - o.z\n\
		)\n\
	end,\n\
	mul = function( self, m )\n\
		return vector.new(\n\
			self.x * m,\n\
			self.y * m,\n\
			self.z * m\n\
		)\n\
	end,\n\
	dot = function( self, o )\n\
		return self.x*o.x + self.y*o.y + self.z*o.z\n\
	end,\n\
	cross = function( self, o )\n\
		return vector.new(\n\
			self.y*o.z - self.z*o.y,\n\
			self.z*o.x - self.x*o.z,\n\
			self.x*o.y - self.y*o.x\n\
		)\n\
	end,\n\
	length = function( self )\n\
		return math.sqrt( self.x*self.x + self.y*self.y + self.z*self.z )\n\
	end,\n\
	normalize = function( self )\n\
		return self:mul( 1 / self:length() )\n\
	end,\n\
	round = function( self )\n\
		return vector.new(\n\
			math.floor( self.x + 0.5 ),\n\
			math.floor( self.y + 0.5 ),\n\
			math.floor( self.z + 0.5 )\n\
		)\n\
	end,\n\
	tostring = function( self )\n\
		return self.x..","..self.y..","..self.z\n\
	end,\n\
}\n\
\n\
local vmetatable = {\n\
	__index = vector,\n\
	__add = vector.add,\n\
	__sub = vector.sub,\n\
	__mul = vector.mul,\n\
	__unm = function( v ) return v:mul(-1) end,\n\
	__tostring = vector.tostring,\n\
}\n\
\n\
function new( x, y, z )\n\
	local v = {\n\
		x = x or 0,\n\
		y = y or 0,\n\
		z = z or 0\n\
	}\n\
	setmetatable( v, vmetatable )\n\
	return v\n\
end\n\
';


getCode = function() {
	return prebios + "\n\n" + bios;
}
