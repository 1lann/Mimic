
--  Almost all functions are taken from the ComputerCraft bios.lua,
--  which was written by dan200

--  I just cleaned up the code a bit


local startupScriptContents = startupScript
startupScript = nil


function os.version()
	return "CraftOS 1.5"
end


function os.pullEventRaw(filter)
	return coroutine.yield(filter)
end


function os.pullEvent(filter)
	local eventData = {os.pullEventRaw(filter)}
	if eventData[1] == "terminate" then
		error("Terminated", 0)
	end

	return unpack(eventData)
end


function sleep(time)
	local timer = os.startTimer(time)
	while true do
		local event, id = os.pullEvent("timer")
		if timer == id then
			break
		end
	end
end


function write(sText)
	local w, h = term.getSize()
	local x, y = term.getCursorPos()

	local nLinesPrinted = 0
	local function newLine()
		if y + 1 <= h then
			term.setCursorPos(1, y + 1)
		else
			term.setCursorPos(1, h)
			term.scroll(1)
		end
		x, y = term.getCursorPos()
		nLinesPrinted = nLinesPrinted + 1
	end

	while string.len(sText) > 0 do
		local whitespace = string.match(sText, "^[ \\t]+")
		if whitespace then
			term.write(whitespace)
			x, y = term.getCursorPos()
			sText = string.sub(sText, string.len(whitespace) + 1)
		end

		local newline = string.match(sText, "^\\n")
		if newline then
			newLine()
			sText = string.sub(sText, 2)
		end

		local text = string.match(sText, "^[^ \\t\\n]+")
		if text then
			sText = string.sub(sText, string.len(text) + 1)
			if string.len(text) > w then
				while string.len(text) > 0 do
					if x > w then
						newLine()
					end
					term.write(text)
					text = string.sub(text, (w-x) + 2)
					x, y = term.getCursorPos()
				end
			else
				if x + string.len(text) - 1 > w then
					newLine()
				end
				term.write(text)
				x, y = term.getCursorPos()
			end
		end
	end

	return nLinesPrinted
end


print = function(...)
	local nLinesPrinted = 0
	for n, v in ipairs({...}) do
		nLinesPrinted = nLinesPrinted + write(tostring(v))
	end
	nLinesPrinted = nLinesPrinted + write("\\n")
	return nLinesPrinted
end


function printError(...)
	if term.isColour() then
		term.setTextColour(colors.red)
	end

	print(...)
	term.setTextColour(colors.white)
end


function read(replaceCharacter, history)
	term.setCursorBlink(true)

    local line = ""
	local historyPos = nil
	local pos = 0
    if replaceCharacter then
		replaceCharacter = string.sub(replaceCharacter, 1, 1)
	end

	local w, h = term.getSize()
	local sx, sy = term.getCursorPos()

	local function redraw(replChar)
		local scroll = 0
		if sx + pos >= w then
			scroll = (sx + pos) - w
		end

		term.setCursorPos(sx, sy)
		local replace = replChar or replaceCharacter
		if replace then
			term.write(string.rep(replace, string.len(line) - scroll))
		else
			term.write(string.sub(line, scroll + 1))
		end
		term.setCursorPos(sx + pos - scroll, sy)
	end

	while true do
		local sEvent, param = os.pullEvent()
		if sEvent == "char" then
			line = string.sub(line, 1, pos) .. param .. string.sub(line, pos + 1)
			pos = pos + 1
			redraw()
		elseif sEvent == "key" then
		    if param == 28 then
				break
			elseif param == 203 then
				if pos > 0 then
					pos = pos - 1
					redraw()
				end
			elseif param == 205 then
				if pos < string.len(line) then
					redraw(" ")
					pos = pos + 1
					redraw()
				end
			elseif param == 200 or param == 208 then
				if history then
					redraw(" ")
					if param == 200 then
						if historyPos == nil then
							if #history > 0 then
								historyPos = #history
							end
						elseif historyPos > 1 then
							historyPos = historyPos - 1
						end
					else
						if historyPos == #history then
							historyPos = nil
						elseif historyPos ~= nil then
							historyPos = historyPos + 1
						end
					end
					if historyPos then
                    	line = history[historyPos]
                    	pos = string.len(line)
                    else
						line = ""
						pos = 0
					end
					redraw()
                end
			elseif param == 14 then
				if pos > 0 then
					redraw(" ")
					line = string.sub(line, 1, pos - 1) .. string.sub(line, pos + 1)
					pos = pos - 1
					redraw()
				end
			elseif param == 199 then
				redraw(" ")
				pos = 0
				redraw()
			elseif param == 211 then
				if pos < string.len(line) then
					redraw(" ")
					line = string.sub(line, 1, pos) .. string.sub(line, pos + 2)
					redraw()
				end
			elseif param == 207 then
				redraw(" ")
				pos = string.len(line)
				redraw()
			end
		end
	end

	term.setCursorBlink(false)
	term.setCursorPos(w + 1, sy)
	print()

	return line
end


loadfile = function(path)
	local file = fs.open(path, "r")
	if file then
		local func, err = loadstring(file.readAll(), fs.getName(path))
		file.close()
		return func, err
	end
	return nil, "File not found"
end


dofile = function(path)
	local fnFile, e = loadfile(path)
	if fnFile then
		setfenv(fnFile, getfenv(2))
		return fnFile()
	else
		error(e, 2)
	end
end


function os.run(_tEnv, _sPath, ...)
    local tArgs = { ... }
    local fnFile, err = loadfile(_sPath)
    if fnFile then
        local tEnv = _tEnv
		setmetatable(tEnv, { __index = _G })
        setfenv(fnFile, tEnv)

        local ok, err = pcall(function()
        	fnFile(unpack(tArgs))
        end)

        if not ok then
        	if err and err ~= "" then
	        	printError(err)
	        end
        	return false
        end
        return true
    end

    if err and err ~= "" then
		printError(err)
	end

    return false
end


local nativegetmetatable = getmetatable
local nativetype = type
local nativeerror = error

function getmetatable(_t)
	if nativetype(_t) == "string" then
		nativeerror("Attempt to access string metatable", 2)
		return nil
	end
	return nativegetmetatable(_t)
end


local tAPIsLoading = {}

function os.loadAPI(_sPath)
	local sName = fs.getName(_sPath)
	if tAPIsLoading[sName] == true then
		printError("API " .. sName .. " is already loaded")
		return false
	end
	tAPIsLoading[sName] = true

	local tEnv = {}
	setmetatable(tEnv, { __index = _G })
	local fnAPI, err = loadfile(_sPath)
	if fnAPI then
		setfenv(fnAPI, tEnv)
		fnAPI()
	else
		printError(err)
        tAPIsLoading[sName] = nil
		return false
	end

	local tAPI = {}
	for k, v in pairs(tEnv) do
		tAPI[k] =  v
	end

	_G[sName] = tAPI
	tAPIsLoading[sName] = nil
	return true
end


function os.unloadAPI(_sName)
	if _sName ~= "_G" and type(_G[_sName]) == "table" then
		_G[_sName] = nil
	end
end


function os.sleep(_nTime)
	sleep(_nTime)
end


local nativeShutdown = os.shutdown
local nativeReboot = os.reboot

function os.shutdown()
	nativeShutdown()
	while true do
		coroutine.yield()
	end
end


function os.reboot()
	nativeReboot()
	while true do
		coroutine.yield()
	end
end


if http then
	local function wrapRequest(_url, _post)
		local requestID = http.request(_url, _post)
		while true do
			local event, param1, param2 = os.pullEvent()
			if event == "http_success" and param1 == _url then
				return param2
			elseif event == "http_failure" and param1 == _url then
				return nil
			end
		end
	end

	http.get = function(_url)
		return wrapRequest(_url, nil)
	end

	http.post = function(_url, _post)
		return wrapRequest(_url, _post or "")
	end
end


local tApis = fs.list("rom/apis")
for n, sFile in ipairs(tApis) do
	if string.sub(sFile, 1, 1) ~= "." then
		local sPath = fs.combine("rom/apis", sFile)
		if not fs.isDir(sPath) then
			os.loadAPI(sPath)
		end
	end
end


if turtle then
	local tApis = fs.list("rom/apis/turtle")
	for n, sFile in ipairs(tApis) do
		if string.sub(sFile, 1, 1) ~= "." then
			local sPath = fs.combine("rom/apis/turtle", sFile)
			if not fs.isDir(sPath) then
				os.loadAPI(sPath)
			end
		end
	end
end


local ok, err = pcall(function()
	parallel.waitForAny(
		function()
			if startupScriptContents then
				local fn, err = loadstring(startupScriptContents, "startup.lua")
				if err then
					printError(err)
				else
					local _, err = pcall(fn)
					if err then
						printError(err)
					end
				end
			end

			os.run({}, "rom/programs/shell")
		end,
		function()
			rednet.run()
		end
	)
end)


if not ok then
	printError(err)
end


pcall(function()
	term.setCursorBlink(false)
	print("Press any key to continue")
	os.pullEvent("key")
end)

os.shutdown()
