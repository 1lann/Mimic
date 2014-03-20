
--  Some functions are taken from the ComputerCraft bios.lua, 
--  which was written by dan200

--  I just cleaned up the code a bit


xpcall = function(fn, fnErrorHandler)
	assert(type(fn) == "function", "bad argument #1 to xpcall (function expected, got " .. type(fn) .. ")")

	local co = coroutine.create(fn)
	local results = {coroutine.resume(co)}
	while coroutine.status(co) ~= "dead" do
		results = {coroutine.resume(co, coroutine.yield())}
	end

	if results[1] == true then
		return true, unpack(results, 2)
	else
		return false, fnErrorHandler(results[2])
	end
end


pcall = function(fn, ...)
	assert(type(fn) == "function", "bad argument #1 to pcall (function expected, got " .. type(fn) .. ")")

	local args = {...}
	return xpcall(
		function()
			return fn(unpack(args))
		end,
		function(_error)
			return _error
		end
	)
end
