
xpcall = function(_fn, _fnErrorHandler)
	assert(type(_fn) == "function", "bad argument #1 to xpcall (function expected, got " .. type(_fn) .. ")")

	local co = coroutine.create(_fn)
	local results = {coroutine.resume(co)}
	while coroutine.status(co) ~= "dead" do
		results = {coroutine.resume(co, coroutine.yield())}
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


local protectedEvents = {
	"fs_list",
	"fs_exists",
	"fs_isDir",
	"fs_makeDir",
	"fs_move",
	"fs_copy",
	"fs_read",
	"fs_write",
	"fs_append",
	"fs_delete",
}

local isProtected = function(evt)
	for k, v in pairs(protectedEvents) do
		if v == evt then
			return true
		end
	end
	return false
end


local queueEvents = function(evts)
	for k, v in pairs(evts) do
		os.queueEvent(unpack(v))
	end
end


local waitFor = function(evtName, evtID)
	local events = {}
	local timeout = os.startTimer(1)
	while true do
		local e = {coroutine.yield()}
		if e[1] == evtName and e[2] == evtID then
			queueEvents(events)
			return e
		elseif e[1] == "timer" and e[2] == timeout then
			queueEvents(events)
			return nil
		elseif not isProtected(e[1]) then
			table.insert(events, e)
		end
	end
end


local fs_list = fs.list
fs.list = function(path)
	local id = fs_list(path)
	local e = waitFor("fs_list", id)
	if e then
		return e[3]
	end
	return nil
end


local fs_exists = fs.exists
fs.exists = function(path)
	local id = fs_exists(path)
	local e = waitFor("fs_exists", id)
	if e then
		return e[3]
	end
	return false
end
