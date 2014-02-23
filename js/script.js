
//  
//  WebCC
//  Made by 1lann and GravityScore
//  



var gui = {
	"tabs": [],
	"selected": -1,
	"files": [],
	"editor": null,
}



//  ----------------  Editor  ----------------  //


configureEditor = function() {
	gui.editor = ace.edit("editor");
	gui.editor.setTheme("ace/theme/tomorrow");
	gui.editor.getSession().setMode("ace/mode/lua");
	gui.editor.getSession().setTabSize(4);
	gui.editor.setShowPrintMargin(false);
	gui.editor.setHighlightActiveLine(true);
	gui.editor.getSession().setUseWrapMode(false);
	gui.editor.getSession().setUseSoftTabs(false);

	gui.editor.getSession().on("change", function(e) {
		gui.tabs[gui.selected].contents = gui.editor.getValue();

		for (var i in gui.files) {
			var file = gui.files[i];
			if (file.path == gui.tabs[gui.selected].path) {
				file.contents = gui.tabs[gui.selected].contents;
			}
		}
	});

	gui.editor.getSession().selection.on("changeCursor", function(e) {
		gui.tabs[gui.selected].cursor = gui.editor.getSession().selection.getCursor();
	});
}


waitForWebfonts = function(fonts, callback) {
	var loadedFonts = 0;
	for (var i = 0, l = fonts.length; i < l; ++i) {
		(function(font) {
			var node = document.createElement("span");
			node.innerHTML = "giItT1WQy@!-/#";
			node.style.position = "absolute";
			node.style.left = "-10000px";
			node.style.top = "-10000px";
			node.style.fontSize = "300px";
			node.style.fontFamily = "sans-serif";
			node.style.fontVariant = "normal";
			node.style.fontStyle = "normal";
			node.style.fontWeight = "normal";
			node.style.letterSpacing = "0";
			document.body.appendChild(node);

			var width = node.offsetWidth;
			node.style.fontFamily = font;

			var interval;
			function checkFont() {
				if (node && node.offsetWidth != width) {
					++loadedFonts;
					node.parentNode.removeChild(node);
					node = null;
				}

				if (loadedFonts >= fonts.length) {
					if (interval) {
						clearInterval(interval);
					}
					if (loadedFonts == fonts.length) {
						callback();
						return true;
					}
				}
			};

			if (!checkFont()) {
				interval = setInterval(checkFont, 50);
			}
		})(fonts[i]);
	}
}



//  ----------------  Tabs  ----------------  //


reloadTabData = function() {
	$("#tabs").empty();

	var active = (gui.selected == -1) ? " class='active'" : "";
	$("#tabs").append("<li" + active + " id='computer-computer-tab'> \
		<a href='#'>Computer</span></a> \
	</li>");

	for (var i in gui.tabs) {
		var tab = gui.tabs[i];
		var active = (gui.selected == i) ? " class='active computer-tab'" : " class='computer-tab'";
		$("#tabs").append("<li" + active + " id='computer-tab-" + i + "'> \
			<a href='#''>" + tab.name + " <span id='computer-tab-close-" + i + "' class='glyphicon glyphicon-remove pull-right computer-tab-close'></span></a> \
		</li>");
	}

	addTabResponders();
}


reloadTab = function() {
	if (gui.selected != -1) {
		var cursor = gui.tabs[gui.selected].cursor;
		gui.editor.setValue(gui.tabs[gui.selected].contents);
		gui.editor.getSession().selection.clearSelection();

		$("#editor").attr("style", "")
		$("#computer").attr("style", "display: none;");
		gui.editor.focus();

		gui.tabs[gui.selected].cursor = cursor;
		gui.editor.getSession().selection.moveCursorToPosition(cursor);
	} else {
		$("#editor").attr("style", "display: none;");
		$("#computer").attr("style", "");
	}
}


openEditorTab = function(name, path, contents) {
	gui.tabs.push({
		"name": name,
		"path": path,
		"contents": contents,
		"cursor": {"row": 0, "column": 0},
	});

	gui.selected = gui.tabs.length - 1;
	reloadTabData();
	reloadTab();
}


closeEditorTab = function(index) {
	gui.tabs.splice(index, 1);
	if (gui.selected > index) {
		gui.selected -= 1;
	} else if (index == gui.selected) {
		gui.selected = (gui.tabs.length > 0) ? 0 : -1;
		reloadTab();
	}

	reloadTabData();
}


addTabResponders = function() {
	$("#computer-computer-tab").on("click", function(e) {
		if (gui.selected != -1) {
			gui.selected = -1;
			reloadTab();
			reloadTabData();
		}
	});

	$(".computer-tab").on("click", function(e) {
		var id = parseInt(e.currentTarget.id.replace("computer-tab-", ""));
		if (gui.selected != id) {
			gui.selected = id;
			reloadTab();
			reloadTabData();
		}
	});

	$(".computer-tab-close").on("click", function(e) {
		var id = parseInt(e.currentTarget.id.replace("computer-tab-close-", ""));
		closeEditorTab(id);
	});
}


setupTabs = function() {
	reloadTabData();
	reloadTab();
}



//  ----------------  Computer Tabs  ----------------  //


setupComputers = function() {
	
}



//  ----------------  File List  ----------------  //


reloadFileList = function() {
	$("#file-list").empty();

	for (var i in gui.files) {
		var file = gui.files[i];
		if (file.path.substring(0, 1) == "/") {
			file.path = file.path.substring(1);
		}

		var breadcrumb = "<ol class='breadcrumb'>";
		var parts = file.path.split("/");
		for (var ii in parts) {
			var part = parts[ii];
			if (ii == parts.length - 1) {
				breadcrumb += "<li><a class='open-file' id='open-file-" + i + "' style='margin-right: 15px'>" + part + "</a></li>";
			} else {
				breadcrumb += "<li>" + part + "</li>";
			}
		}
		breadcrumb += "</ol>";

		$("#file-list").append(breadcrumb);
	}

	addFileResponders();
}


addFileResponders = function() {
	$(".open-file").on("click", function(e) {
		var i = parseInt(e.currentTarget.id.replace("open-file-", ""));
		var file = gui.files[i];

		for (var i in gui.tabs) {
			var tab = gui.tabs[i];
			if (tab.path == file.path) {
				gui.selected = i;
				reloadTab();
				reloadTabData();
				return;
			}
		}

		var name = file.path.split("/");
		name = name[name.length - 1];

		openEditorTab(name, file.path, file.contents);
	});
}


onFilesystemChange = function(files) {
	gui.files = files;
	reloadFileList();
}


setupFileList = function() {
	reloadFileList();
}



//  ----------------  Popups  ----------------  //


setupPopups = function() {
	$("#about-popup-open").on("click", function(e) {
		$("#about-popup").attr("style", "");
	});

	$("#settings-popup-open").on("click", function(e) {
		$("#settings-popup").attr("style", "");
	});

	$(".popup-close").on("click", function(e) {
		$(".popup").attr("style", "display: none;");
	});
}



//  ----------------  Main  ----------------  //


configureEditor();

$(document).ready(function() {
	setupComputers();
	setupFileList();
	setupTabs();
	setupPopups();
});
