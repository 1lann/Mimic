
local function newLine()
	local wid, hi = term.getSize()
	local x, y = term.getCursorPos()
	if y == hi then
		term.scroll(1)
		term.setCursorPos(1, y)
	else
		term.setCursorPos(1, y+1)
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

local function reader()
	local data = ""
	local visibleData = ""
	local startX, startY = term.getCursorPos()
	local wid, hi = term.getSize()
	while true do
		term.setCursorBlink(true)
		local e, p1 = coroutine.yield()
		if e == "key" and p1 == 14 then
			data = data:sub(1, -2)
		elseif e == "key" and p1 == 28 then
			newLine()
			return data
		elseif e == "char" then
			data = data .. p1
		end

		term.setCursorPos(startX, startY)
		if #data+startX+1 > wid then
			visibleData = data:sub(-1*(wid-startX-1))
		else
			visibleData = data
		end

		term.write(visibleData .. " ")
		local curX, curY = term.getCursorPos()
		term.setCursorPos(curX-1, curY)
	end
end

while true do
	term.setTextColor(1)
	term.setBackgroundColor(32768)
	term.write("lua> ")
	local toRun, cError = loadstring(reader(), "error")
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
