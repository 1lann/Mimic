
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var gui = {
	"cursors": {},
	"scrolls": {},
	"computerSelected": true,
	"isFullscreen": false,
	"narrow": false,
};

var sidebar = {
	"selected": 0,
	"data": [],
};



//  ------------------------
//    Editor
//  ------------------------


gui.configureEditor = function() {
	gui.editor = ace.edit("editor");
	gui.editor.setTheme("ace/theme/tomorrow");
	gui.editor.getSession().setMode("ace/mode/lua");
	gui.editor.getSession().setTabSize(4);
	gui.editor.setShowPrintMargin(false);
	gui.editor.setHighlightActiveLine(false);
	gui.editor.getSession().setUseWrapMode(false);
	gui.editor.getSession().setUseSoftTabs(false);

	gui.editor.getSession().selection.on("changeCursor", function(e) {
		var file = sidebar.itemFromID(sidebar.selected);
		if (typeof(file.path) != "undefined") {
			gui.cursors[file.path] = gui.editor.getSession().selection.getCursor();
		}
	});

	gui.editor.getSession().on("changeScrollTop", function(e) {
		var file = sidebar.itemFromID(sidebar.selected);
		if (typeof(file.path) != "undefined") {
			gui.scrolls[file.path] = gui.editor.getSession().getScrollTop();
		}
	});
}



//  ------------------------
//    Sidebar
//  ------------------------


sidebar.populate = function(data, level) {
	var sidebarList = $(".sidebar-list");

	for (var i in data) {
		var item = data[i];

		var isSelected = "";
		if (item.id == sidebar.selected) {
			isSelected = " selected";
		}

		if (item.type == "folder") {
			sidebarList.append('\
			<li class="sidebar-item' + isSelected + '" fileid="' + item.id + '" style="padding-left: ' + (level * 20 + 25) + 'px;">\n\
				' + item.name + '\n\
				<span class="glyphicon glyphicon-chevron-down"></span>\n\
			</li>\n\
			');

			sidebar.populate(item.children, level + 1);
		} else if (item.style == "large") {
			sidebarList.append('\
			<li class="sidebar-item large' + isSelected + '" fileid="' + item.id + '">\n\
				' + item.name + '\n\
				<span class="glyphicon glyphicon-chevron-right pull-right"></span>\n\
			</li>\n\
			');
		} else {
			sidebarList.append('\
			<li class="sidebar-item' + isSelected + '" fileid="' + item.id + '" style="padding-left: ' + (level * 20 + 25) + 'px;">\n\
				' + item.name + '\n\
			</li>\n\
			');
		}
	}
}


sidebar.reload = function(data) {
	sidebar.data = data || sidebar.data;

	$(".sidebar-list").empty();
	sidebar.populate(sidebar.data, 0);

	$(".sidebar-item").click(function(evt) {
		sidebar.select($(evt.target).attr("fileid"));
	});
}


sidebar.itemFromID = function(id, data) {
	data = data || sidebar.data;

	var found = undefined;
	for (var i in data) {
		var item = data[i];

		if (item.id == id) {
			found = item;
		} else if (item.type == "folder") {
			found = sidebar.itemFromID(id, item.children);
		}

		if (found) {
			break;
		}
	}

	return found;
}


sidebar.displayFile = function(file) {
	$(".editor-container").css("display", "block");
	$(".computer-container").css("display", "none");

	var cursor = gui.cursors[file.path];
	var scroll = gui.scrolls[file.path];

	var path = file.path;
	path = path.substring(1);
	path = path.substring(path.indexOf("/") + 1);
	path = path.substring(path.indexOf("/"));

	var contents = filesystem.read(file.path);
	gui.editor.getSession().setValue(contents);
	$("#editor-title").html(file.name);
	$("#editor-file-path").html(path);

	if (typeof(cursor) != "undefined") {
		gui.editor.getSession().selection.moveCursorToPosition(cursor);
	}

	if (typeof(scroll) != "undefined") {
		gui.editor.getSession().setScrollTop(scroll);
	}

	gui.editor.focus();
}


sidebar.select = function(id) {
	var item = sidebar.itemFromID(id);
	if (typeof(item) == "undefined" || item.type == "folder" || id == sidebar.selected) {
		return;
	}

	sidebar.saveOpenFile();
	sidebar.selected = id;

	if (item.type == "file") {
		sidebar.displayFile(item);
	} else if (item.type == "folder") {
		
	} else if (item.type == "computer") {
		$(".editor-container").css("display", "none");
		$(".computer-container").css("display", "block");
		$("#canvas").click();
	}

	if (item.type == "computer") {
		gui.computerSelected = true;
	} else {
		gui.computerSelected = false;
	}

	sidebar.reload();
}


sidebar.dataFromFilesystem = function() {
	var data = [];

	var id = 0;
	for (var i in core.computers) {
		var computer = core.computers[i];
		var base = "/computers/" + computer.id;

		data.push({
			"id": id,
			"name": "Computer " + computer.id,
			"style": "large",
			"type": "computer",
		});

		id += 1;

		var files = filesystem.listHierarchically(base, id);
		id = files.id;

		for (var fi in files.files) {
			var file = files.files[fi];
			data.push(file);
		}
	}

	return data;
}


sidebar.saveOpenFile = function() {
	var item = sidebar.itemFromID(sidebar.selected);

	if (typeof(item) != "undefined" && item.type == "file") {
		var contents = gui.editor.getSession().getValue();
		filesystem.write(item.path, contents);
	}
}


sidebar.update = function() {
	sidebar.reload(sidebar.dataFromFilesystem());
}



//  ------------------------
//    Screenshot
//  ------------------------


gui.takeScreenshot = function(link) {
	var computer = core.getActiveComputer();
	var mainImage = new Image();
	var cursorImage = new Image();
	mainImage.src = canvas.toDataURL("image/png");
	cursorImage.src = overlayCanvas.toDataURL("image/png");

	mainImage.onload = function() {
		overlayContext.beginPath();
		overlayContext.rect(0, 0, overlayCanvas.width, overlayCanvas.height);
		overlayContext.fillStyle = "#000000";
		overlayContext.fill();

		overlayContext.drawImage(mainImage, 0, 0);

		cursorImage.onload = function() {
	    	overlayContext.drawImage(cursorImage, 0, 0);
	    	link.href = overlayCanvas.toDataURL("image/png");
	    	link.download = "screenshot.png";
	    	
	    	if (!computer.cursor.blink) {
	    		overlayContext.clearRect(0, 0, canvas.width, canvas.height);
	    	}

	    	return;
	   }
	}
}



//  ------------------------
//    Fullscreen
//  ------------------------


gui.toggleFullscreen = function() {
	gui.isFullscreen = !gui.isFullscreen;
	if (gui.isFullscreen) {
		$(".sidebar-container").fadeOut(500);
		$("#credits-toggle").fadeOut(500);
		$("#fullscreen-toggle").html("Exit").blur();

		window.onresize();
	} else {
		$(".sidebar-container").fadeIn(500);
		$("#credits-toggle").fadeIn(500);
		$("#fullscreen-toggle").html("Enter Fullscreen").blur();

		window.onresize();
	}
}



//  ------------------------
//    Loading
//  ------------------------


$(window).unload(function() {
	sidebar.saveOpenFile();
});


gui.beforeLoad = function() {
	$("#fullscreen-toggle").click(function() {
		gui.toggleFullscreen();
	});

	window.onresize();
}


gui.onLoad = function() {

}


gui.onRun = function() {
	$(".loader-container").fadeOut(1000);

	var computer = core.getActiveComputer();
	var size = computer.getActualSize();
	canvas.width = size.width;
	canvas.height = size.height;
	overlayCanvas.width = size.width;
	overlayCanvas.height = size.height;

	sidebar.update();

	context.beginPath();
	context.rect(0, 0, canvas.width, canvas.height);
	context.fillStyle = globals.colors["0"];
	context.fill();

	window.onresize();
}


gui.setupBrowserIndependence = function() {
	var isWebkit = 'WebkitAppearance' in document.documentElement.style;
	if (isWebkit) {
		$("#editor").addClass("editor-webkit");
	}
}



//  ------------------------
//    Main
//  ------------------------


window.onresize = function() {
	$(".loader").css("margin-top", (window.innerHeight / 2 + 100) + "px");

	if (window.innerWidth < 900) {
		$(".sidebar-container").hide();
		$("#credits-toggle").hide();
		$("#fullscreen-toggle").hide();
		narrow = true;
		gui.isFullscreen = true;
	} else if (narrow) {
		$(".sidebar-container").show();
		$("#credits-toggle").show();
		$("#fullscreen-toggle").show();
		narrow = false;
		gui.isFullscreen = false;
	}

	if (typeof(core) != "undefined") {
		var computer = core.getActiveComputer();
		if (typeof(computer) != "undefined") {
			var location = computer.getLocation();
			$(".computer-canvas").css({"left": location.x + "px", "top": location.y + "px"});
		}
	}
}


gui.setupBrowserIndependence();
window.onresize();
gui.configureEditor();

$(document).ready(function() {
	gui.beforeLoad();
	core.main({
		"onLoad": gui.onLoad,
		"onRun": gui.onRun,
	});
});
