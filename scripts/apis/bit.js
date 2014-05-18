
//
//  bit.js
//  GravityScore and 1lann
//



var bitAPI = {};


bitAPI.bnot = function(L) {
	var num = C.luaL_checknumber(L, 1);
	var result = ~num;
	C.lua_pushnumber(L, result);

	return 1;
}


bitAPI.band = function(L) {
	var first = C.luaL_checknumber(L, 1);
	var second = C.luaL_checknumber(L, 2);
	var result = first & second;
	C.lua_pushnumber(L, result);

	return 1;
}


bitAPI.bor = function(L) {
	var first = C.luaL_checknumber(L, 1);
	var second = C.luaL_checknumber(L, 2);
	var result = first | second;
	C.lua_pushnumber(L, result);

	return 1;
}


bitAPI.bxor = function(L) {
	var first = C.luaL_checknumber(L, 1);
	var second = C.luaL_checknumber(L, 2);
	var result = ~(first & second) & ~(~first & ~second);
	C.lua_pushnumber(L, result);

	return 1;
}


bitAPI.brshift = function(L) {
	var first = C.luaL_checknumber(L, 1);
	var amount = C.luaL_checknumber(L, 2);
	var result = first >> amount;
	C.lua_pushnumber(L, result);

	return 1;
}


bitAPI.blogic_rshift = function(L) {
	var first = C.luaL_checknumber(L, 1);
	var amount = C.luaL_checknumber(L, 2);
	var result = first >>> amount;
	C.lua_pushnumber(L, result);

	return 1;
}


bitAPI.blshift = function(L) {
	var first = C.luaL_checknumber(L, 1);
	var amount = C.luaL_checknumber(L, 2);
	var result = first << amount;
	C.lua_pushnumber(L, result);

	return 1;
}
