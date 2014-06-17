
//
//  ui.js
//  1lann and GravityScore
//



var ui = {};



//
//    Editor
//


ui = {};


ui.onCursorChange = function(event) {
	var type = sidebar.typeOfSelected();
	if (type == "file") {
		var path = sidebar.pathOfSelected();
		var cursor = ui.editor.getSession().selection.getCursor();

		ui.cursorLocations[path] = cursor;
	}
}


ui.onScrollChange = function(event) {
	var type = sidebar.typeOfSelected();
	if (type == "file") {
		var path = sidebar.pathOfSelected();
		var scroll = ui.editor.getSession().getScrollTop();

		ui.scrollLocations[path] = scroll;
	}
}


ui.configureEditor = function() {
	ui.editor = ace.edit("editor");
	ui.editor.setTheme("ace/theme/tomorrow");
	ui.editor.getSession().setMode("ace/mode/lua");
	ui.editor.getSession().setTabSize(4);

	ui.editor.setShowPrintMargin(false);
	ui.editor.setHighlightActiveLine(false);
	ui.editor.getSession().setUseWrapMode(false);
	ui.editor.getSession().setUseSoftTabs(false);

	ui.cursorLocations = {};
	ui.scrollLocations = {};

	ui.editor.getSession().selection.on("changeCursor",
		ui.onCursorChange);
	ui.editor.getSession().on("changeScrollTop",
		ui.onScrollChange);
}


//
//    Screenshots
//


ui.captureScreenshot = function(link) {
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
		}
	}
}



//
//    Fullscreen
//


ui.toggleFullscreen = function() {
	ui.isFullscreen = !ui.isFullscreen;
	if (ui.isFullscreen) {
		$(".sidebar-container").fadeOut(500);
		$("#credits-toggle").fadeOut(500);
		$("#actions-pull-down").fadeOut(500);
		$("#actions-pull-down-btn").fadeOut(500);
		$("#exit-fullscreen").fadeIn(500);
		$("#fullscreen-toggle").html("Exit").blur();

		window.onresize();
	} else {
		$(".sidebar-container").fadeIn(500);
		$("#credits-toggle").fadeIn(500);
		$("#actions-pull-down").fadeIn(500);
		$("#actions-pull-down-btn").fadeIn(500);
		$("#exit-fullscreen").fadeOut(500);
		$("#fullscreen-toggle").html("Enter Fullscreen").blur();

		window.onresize();
	}
}


//
//    Tabbing System
//


ui.saveOpenFile = function() {
	if (sidebar.typeOfSelected() == "file") {
		var path = sidebar.pathOfSelected();
		if (path) {
			var contents = ui.editor.getSession().getValue();
			filesystem.write(path, contents);
		}
	}
}


ui.showComputer = function(id) {
	ui.saveOpenFile();

	$(".editor-container").css("display", "none");
	$(".computer-container").css("display", "block");
}


ui.showEditor = function(path) {
	$(".editor-container").css("display", "block");
	$(".computer-container").css("display", "none");

	var cursor = ui.cursorLocations[path];
	var scroll = ui.scrollLocations[path];
	var name = filesystem.getName(path);
	var computer = core.getActiveComputer();
	var displayPath = path.replace("/computers/" + computer.id, "");

	$("#editor-title").html(name);
	$("#editor-file-path").html(displayPath);

	$("#delete-file-btn").off("click").click(function() {
		ui.showComputer(computer.id);
		sidebar.select($(".computer"));

		filesystem.delete(path);
		sidebar.update();
	});

	$("#download-file-btn").off("click").click(function() {
		var contents = ui.editor.getSession().getValue();
		var blob = new Blob([contents], {type: "text/plain;charset=utf-8"});
		var actualName = name;
		var extension = actualName.substring(actualName.length - 4);
		if (extension != ".lua" || extension != ".txt") {
			actualName += ".lua";
		}

		saveAs(blob, actualName);
	});

	var contents = filesystem.read(path);
	ui.editor.getSession().setValue(contents);

	if (cursor) {
		ui.editor.getSession().selection.moveCursorToPosition(cursor);
	} if (scroll) {
		ui.editor.getSession().setScrollTop(scroll);
	}

	ui.editor.focus();
}



//
//    Dropdown
//


ui.toggleDropdown = function() {
	ui.isDropdownActive = !ui.isDropdownActive;

	if (!ui.isDropdownActive) {
		var pullDown = $("#actions-pull-down");
		pullDown.fadeOut(200);

		var span = $($("#actions-pull-down-btn").children()[0]);
		span.addClass("glyphicon-chevron-down");
		span.removeClass("glyphicon-chevron-up");
	} else {
		var pullDown = $("#actions-pull-down");
		pullDown.fadeIn(200);

		var span = $($("#actions-pull-down-btn").children()[0]);
		span.removeClass("glyphicon-chevron-down");
		span.addClass("glyphicon-chevron-up");
	}
}



//
//    Loading
//


ui.onWindowClose = function() {

}


$(window).unload(ui.onWindowClose);
$(window).blur(ui.onWindowClose);


ui.beforeLoad = function() {
	ui.configureEditor();

	ui.isDropdownActive = false;
	ui.isNarrow = false;

	$("#actions-pull-down-btn").click(function() {
		ui.toggleDropdown();
	});

	$("#exit-fullscreen").click(function() {
		ui.toggleFullscreen();
	});

	$("#terminate-btn").click(function() {
		var computer = core.getActiveComputer();
		if (typeof(computer) != "undefined") {
			computer.terminate();
		}
	});

	$("#shutdown-btn").click(function() {
		var computer = core.getActiveComputer();
		if (typeof(computer) != "undefined") {
			computer.shutdown();
		}
	});

	$("#reboot-btn").click(function() {
		var computer = core.getActiveComputer();
		if (typeof(computer) != "undefined") {
			computer.reboot();
		}
	});

	$("#screenshot-btn").click(function() {
		ui.captureScreenshot(this);
	});

	$("#fullscreen-btn").click(function() {
		ui.toggleFullscreen();
	});

	window.onresize();
}


ui.onLoad = function() {

}


ui.afterLoad = function() {
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



//
//    Main
//


window.onresize = function() {
	$(".loader").css("margin-top", (window.innerHeight / 2 + 100) + "px");

	if (window.innerWidth < 900) {
		$(".sidebar-container").hide();
		$("#credits-toggle").hide();
		$("#fullscreen-toggle").hide();

		ui.isNarrow = true;
		ui.isFullscreen = true;
	} else if (ui.isNarrow) {
		$(".sidebar-container").show();
		$("#credits-toggle").show();
		$("#fullscreen-toggle").show();

		ui.isNarrow = false;
		ui.isFullscreen = false;
	}

	if (typeof(core) != "undefined") {
		var computer = core.getActiveComputer();
		if (typeof(computer) != "undefined") {
			var location = computer.getLocation();
			$(".computer-canvas").css({
				"left": location.x + "px",
				"top": location.y + "px"
			});
		}
	}
}
