--bios file--

--  Some functions are taken from the ComputerCraft bios.lua, 
--  which was written by dan200

--  I just cleaned up the code a bit


xpcall = function(_fn, _fnErrorHandler)
	assert(type(_fn) == "function", "bad argument #1 to xpcall (function expected, got " .. type(_fn) .. ")")

	local co = coroutine.create(_fn)
	local coroutineClock = os.clock()

	debug.sethook(co, function()
		if os.clock() >= coroutineClock + 2 then
			print("Lua: Too long without yielding")
			error("Too long without yielding", 2)
		end
	end, "", 10000)

	local results = {coroutine.resume(co)}

	debug.sethook(co)
	while coroutine.status(co) ~= "dead" do
		coroutineClock = os.clock()
		debug.sethook(co, function()
			if os.clock() >= coroutineClock + 2 then
				print("Lua: Too long without yielding")
				error("Too long without yielding", 2)
			end
		end, "", 10000)

		results = {coroutine.resume(co, coroutine.yield())}
		debug.sethook(co)
	end

	if results[1] == true then
		return true, unpack(results, 2)
	else
		return false, _fnErrorHandler(results[2])
	end
end


pcall = function(_fn, ...)
	assert(type(_fn) == "function", "bad argument #1 to pcall (function expected, got " .. type(_fn) .. ")")

	local args = {...}
	return xpcall(
		function()
			return _fn(unpack(args))
		end, 
		function(_error)
			return _error
		end
	)
end


local fsWrite = fs.write
fs.write = nil

local fsAppend = fs.append
fs.append = nil

local fsRead = fs.read
fs.read = nil


function fs.open(path, mode)
	if mode == "w" then
		local f = {
			["_buffer"] = "",
			["write"] = function(str)
				f._buffer = f._buffer .. tostring(str)
			end,
			["writeLine"] = function(str)
				f._buffer = f._buffer .. tostring(str) .. "\n"
			end,
			["flush"] = function()
				fsWrite(path, f._buffer)
			end,
			["close"] = function()
				fsWrite(path, f._buffer)
				f.write = nil
				f.flush = nil
			end,
		}

		return f
	elseif mode == "r" then
		local contents = fsRead(path)
		local f = {
			["_cursor"] = 1,
			["_contents"] = contents,
			["readAll"] = function()
				local contents = f._contents:sub(f._cursor)
				f._cursor = f._contents:len()
				return contents
			end,
			["readLine"] = function()
				local nextLine = f._contents:find("\n", f._cursor, true)
				local line = f._contents:sub(f._cursor, nextLine)
				f._cursor = nextLine + 1
				return line
			end,
			["close"] = function() end,
		}

		return f
	elseif mode == "a" then
		local f = {
			["_buffer"] = "",
			["write"] = function(str)
				f._buffer = f._buffer .. tostring(str)
			end,
			["writeLine"] = function(str)
				f._buffer = f._buffer .. tostring(str) .. "\n"
			end,
			["flush"] = function()
				fsAppend(path, f._buffer)
			end,
			["close"] = function()
				fsAppend(path, f._buffer)
				f.write = nil
				f.flush = nil
			end,
		}

		return f
	else
		error("mode not supported")
	end
end
