
//
//  code.js
//  GravityScore and 1lann
//



var code = {};


code.getAll = function() {
	return code.prebios + "\n" + code.bios;
}


code.prebios = '\n\
\n\
--  Some functions are taken from the ComputerCraft bios.lua,\n\
--  which was written by dan200\n\
\n\
--  I just cleaned up the code a bit\n\
\n\
\n\
console = {}\n\
console.log = print\n\
\n\
\n\
local debugLib = debug\n\
collectgarbage = nil\n\
require = nil\n\
module = nil\n\
package = nil\n\
newproxy = nil\n\
load = nil\n\
\n\
\n\
xpcall = function(_fn, _fnErrorHandler)\n\
	assert(type(_fn) == "function",\n\
		"bad argument #1 to xpcall (function expected, got " .. type(_fn) .. ")")\n\
\n\
	local co = coroutine.create(_fn)\n\
	local coroutineClock = os.clock()\n\
\n\
	debugLib.sethook(co, function()\n\
		if os.clock() >= coroutineClock + 3.5 then\n\
			console.log("Lua: Too long without yielding")\n\
			error("Too long without yielding", 2)\n\
		end\n\
	end, "", 10000)\n\
\n\
	local results = {coroutine.resume(co)}\n\
\n\
	debugLib.sethook(co)\n\
	while coroutine.status(co) ~= "dead" do\n\
		local events = {coroutine.yield()}\n\
\n\
		coroutineClock = os.clock()\n\
		debugLib.sethook(co, function()\n\
			if os.clock() >= coroutineClock + 3.5 then\n\
				console.log("Lua: Too long without yielding")\n\
				error("Too long without yielding", 2)\n\
			end\n\
		end, "", 10000)\n\
\n\
		results = {coroutine.resume(co, unpack(events))}\n\
		debugLib.sethook(co)\n\
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
	assert(type(_fn) == "function",\n\
		"bad argument #1 to pcall (function expected, got " .. type(_fn) .. ")")\n\
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
function fs.open(path, mode)\n\
	local containingFolder = path:sub(1, path:len() - fs.getName(path):len())\n\
	if fs.isDir(path) or not fs.isDir(containingFolder) or path:find("%s") then\n\
		return nil\n\
	end\n\
\n\
	if mode == "w" then\n\
		if fs.isReadOnly(path) then\n\
			return nil\n\
		end\n\
\n\
		local f = {}\n\
		f = {\n\
			["_buffer"] = "",\n\
			["write"] = function(str)\n\
				f._buffer = f._buffer .. tostring(str)\n\
			end,\n\
			["writeLine"] = function(str)\n\
				f._buffer = f._buffer .. tostring(str) .. "\\n"\n\
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
		if not fs.exists(path) or fs.isDir(path) then\n\
			return nil\n\
		end\n\
\n\
		local contents = fsRead(path)\n\
		if not contents then\n\
			return\n\
		end\n\
\n\
		local f = {}\n\
		f = {\n\
			["_cursor"] = 1,\n\
			["_contents"] = contents,\n\
			["readAll"] = function()\n\
				local contents = f._contents:sub(f._cursor)\n\
				f._cursor = f._contents:len()\n\
				return contents\n\
			end,\n\
			["readLine"] = function()\n\
				if f._cursor >= f._contents:len() then\n\
					return nil\n\
				end\n\
\n\
				local nextLine = f._contents:find("\\n", f._cursor, true)\n\
				if not nextLine then\n\
					nextLine = f._contents:len()\n\
				else\n\
					nextLine = nextLine - 1\n\
				end\n\
\n\
				local line = f._contents:sub(f._cursor, nextLine)\n\
				f._cursor = nextLine + 2\n\
				return line\n\
			end,\n\
			["close"] = function() end,\n\
		}\n\
\n\
		return f\n\
	elseif mode == "a" then\n\
		if fs.isReadOnly(path) then\n\
			return nil\n\
		end\n\
\n\
		local f = {}\n\
		f = {\n\
			["_buffer"] = "",\n\
			["write"] = function(str)\n\
				f._buffer = f._buffer .. tostring(str)\n\
			end,\n\
			["writeLine"] = function(str)\n\
				f._buffer = f._buffer .. tostring(str) .. "\\n"\n\
			end,\n\
			["flush"] = function()\n\
				fsAppend(path, f._buffer)\n\
			end,\n\
			["close"] = function()\n\
				fsAppend(path, f._buffer)\n\
				f.write = nil\n\
				f.flush = nil\n\
			end,\n\
		}\n\
\n\
		return f\n\
	else\n\
		error("mode not supported")\n\
	end\n\
end\n\
\n\
\n\
local listAllFiles = fs.listAll\n\
fs.listAll = nil\n\
\n\
function fs.find(path)\n\
	path = path:gsub("^/+", "")\n\
	path = path:gsub("/+", "/")\n\
	path = path:gsub("*", "[^/]-")\n\
	path = "^" .. path .. "$"\n\
\n\
	local allFiles = listAllFiles()\n\
	local matches = {}\n\
\n\
	for _, file in pairs(allFiles) do\n\
		file = file:gsub("^/+", "")\n\
		file = file:gsub("/+$", "")\n\
		file = file:gsub("/+", "/")\n\
\n\
		if file:find(path) then\n\
			table.insert(matches, file)\n\
		end\n\
	end\n\
\n\
	return matches\n\
end\n\
\n\
\n\
function fs.getDir(path)\n\
	path = path:gsub("^/+", "")\n\
	path = path:gsub("/+$", "")\n\
	path = path:gsub("/+", "/")\n\
\n\
	local name = fs.getName(path)\n\
	return path:sub(1, -name:len() - 2)\n\
end\n\
\n\
\n\
local nativeYield = coroutine.yield\n\
\n\
function coroutine.yield(filter)\n\
	while true do\n\
		local response = {nativeYield(filter)}\n\
		if response[1] == "http_bios_wrapper_success" then\n\
			local responseText = response[3]\n\
			local responseData = {\n\
				["readAll"] = function()\n\
					return responseText\n\
				end,\n\
				["close"] = function()\n\
				end,\n\
				["getResponseCode"] = function()\n\
					return "200"\n\
				end\n\
			}\n\
\n\
			return "http_success",response[2],responseData\n\
		elseif response[1] == filter or not filter then\n\
			return unpack(response)\n\
		end\n\
	end\n\
end\n\
';


code.bios = '\n\
\n\
--  Almost all functions are taken from the ComputerCraft bios.lua,\n\
--  which was written by dan200\n\
\n\
--  I just cleaned up the code a bit\n\
\n\
\n\
local startupScriptContents = startupScript\n\
startupScript = nil\n\
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
function write(sText)\n\
	local w, h = term.getSize()\n\
	local x, y = term.getCursorPos()\n\
\n\
	local nLinesPrinted = 0\n\
	local function newLine()\n\
		if y + 1 <= h then\n\
			term.setCursorPos(1, y + 1)\n\
		else\n\
			term.setCursorPos(1, h)\n\
			term.scroll(1)\n\
		end\n\
		x, y = term.getCursorPos()\n\
		nLinesPrinted = nLinesPrinted + 1\n\
	end\n\
\n\
	while string.len(sText) > 0 do\n\
		local whitespace = string.match(sText, "^[ \\t]+")\n\
		if whitespace then\n\
			term.write(whitespace)\n\
			x, y = term.getCursorPos()\n\
			sText = string.sub(sText, string.len(whitespace) + 1)\n\
		end\n\
\n\
		local newline = string.match(sText, "^\\n")\n\
		if newline then\n\
			newLine()\n\
			sText = string.sub(sText, 2)\n\
		end\n\
\n\
		local text = string.match(sText, "^[^ \\t\\n]+")\n\
		if text then\n\
			sText = string.sub(sText, string.len(text) + 1)\n\
			if string.len(text) > w then\n\
				while string.len(text) > 0 do\n\
					if x > w then\n\
						newLine()\n\
					end\n\
					term.write(text)\n\
					text = string.sub(text, (w-x) + 2)\n\
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
	return nLinesPrinted\n\
end\n\
\n\
\n\
print = function(...)\n\
	local nLinesPrinted = 0\n\
	for n, v in ipairs({...}) do\n\
		nLinesPrinted = nLinesPrinted + write(tostring(v))\n\
	end\n\
	nLinesPrinted = nLinesPrinted + write("\\n")\n\
	return nLinesPrinted\n\
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
	local sx, sy = term.getCursorPos()\n\
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
		local sEvent, param = os.pullEvent()\n\
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
                    	pos = string.len(line)\n\
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
				redraw()\n\
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
	print()\n\
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
		printError("API " .. sName .. " is already loaded")\n\
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
	_G[sName] = tAPI\n\
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
		end\n\
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
			if startupScriptContents then\n\
				local fn, err = loadstring(startupScriptContents)\n\
				if err then\n\
					printError(err)\n\
				else\n\
					local _, err = pcall(fn)\n\
					if err then\n\
						printError(err)\n\
					end\n\
				end\n\
			end\n\
\n\
			os.run({}, "rom/programs/shell")\n\
		end,\n\
		function()\n\
			rednet.run()\n\
		end\n\
	)\n\
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
	os.pullEvent("key")\n\
end)\n\
\n\
os.shutdown()\n\
';
