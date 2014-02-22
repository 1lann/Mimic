var filer = new Filer();

filer.init({persistent: false, size: 1024 * 1024}, function(fs) {

}, function onError(e) {
  console.log("Filer Error: " + e.name);
});

var fsAPI = {

	"list": function(L) {

	},

	"combine": function(L) {

	},

	"getName": function(L) {

	},

	"getSize": function(L) {

	},

	"exists": function(L) {

	},

	"isDir": function(L) {

	},

	"isReadOnly": function(L) {

	},

	"makeDir": function(L) {

	},

	"move": function(L) {

	},

	"copy": function(L) {

	},

	"delete": function(L) {

	},

	"open": function(L) {

	},

	"getDrive": function(L) {

	},

	"getFreeSpace": function(L) {

	},

};