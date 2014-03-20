
local function newLine()
	local wid, hi = term.getSize()
	local x, y = term.getCursorPos()
	if y == hi then
		term.scroll(1)
		term.setCursorPos(1, y)
	else
		term.setCursorPos(1, y + 1)
	end
end

local nativeShutdown = os.shutdown
function os.shutdown()
	nativeShutdown()
	while true do
		coroutine.yield()
	end
end

local nativeReboot = os.reboot
function os.reboot()
	nativeReboot()
	while true do
		coroutine.yield()
	end
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
		local sEvent, param = coroutine.yield()
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

while true do
	term.setTextColor(1)
	term.setBackgroundColor(32768)
	term.write("lua> ")
	local toRun, cError = loadstring(read(), "error")
	if toRun then
		setfenv(toRun, getfenv(1))
		local results = {pcall(toRun)}
		term.setBackgroundColor(32768)
		if results[1] then
			table.remove(results,1)
			for k,v in pairs(results) do
				newLine()
				term.write(tostring(v))
			end
		else
			if term.isColor() then
				term.setTextColor(16384)
			end
			term.write(results[2])
		end
	else
		if term.isColor() then
			term.setTextColor(16384)
		end
		term.write(cError)
	end
	newLine()
end
