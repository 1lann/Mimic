
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var prebios = '\
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
local function unserializeTable(s)\n\
	local func, e = loadstring("return " .. s, "serialize")\n\
	if not func then\n\
		return s\n\
	else\n\
		setfenv(func, {})\n\
		return func()\n\
	end\n\
end\n\
\n\
';

var bios = '\n\
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
	local toRun, cError = loadstring(read(), "error")\n\
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
			print("Lua prompt error: "..results[2])\n\
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
