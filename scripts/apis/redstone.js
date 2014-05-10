
//
//  Mimic
//  Made by 1lann and GravityScore
//



var redstoneAPI = {};

var sides = [
	"top",
	"bottom",
	"front",
	"back",
	"left",
	"right",
];


redstoneAPI.getSides = function(L) {
	C.lua_newtable(L);
	for (var i in sides) {
		C.lua_pushnumber(L, parseInt(i) + 1);
		C.lua_pushstring(L, sides[i].toString());
		C.lua_rawset(L, -3);
	}

	return 1;
}


redstoneAPI.getInput = function(L) {

}


redstoneAPI.setOutput = function(L) {

}


redstoneAPI.getOutput = function(L) {

}


redstoneAPI.getAnalogOutput = function(L) {

}


redstoneAPI.setAnalogOutput = function(L) {

}


redstoneAPI.getBundledInput = function(L) {

}


redstoneAPI.getBundledOutput = function(L) {

}


redstoneAPI.setBundledOutput = function(L) {

}


redstoneAPI.testBundledOutput = function(L) {

}
