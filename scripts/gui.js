
//  
//  Mimic
//  Made by 1lann and GravityScore
//  



var gui = {
	"tabs": [],
	"selected": -1,
	"files": [],
	"editor": null,
}



//  ------------------------
//    Editor
//  ------------------------


gui.configureEditor = function() {
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



//  ------------------------
//    File Tabs
//  ------------------------


gui.reloadTabData = function() {
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

	gui.addTabResponders();
}


gui.reloadTab = function() {
	filesystem.saveFiles(gui.tabs);

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


gui.openEditorTab = function(name, path, contents) {
	gui.tabs.push({
		"name": name,
		"path": path,
		"contents": contents,
		"cursor": {"row": 0, "column": 0},
	});

	gui.selected = gui.tabs.length - 1;
	gui.reloadTabData();
	gui.reloadTab();
}


gui.closeEditorTab = function(index) {
	gui.tabs.splice(index, 1);
	if (gui.selected > index) {
		gui.selected -= 1;
	} else if (index == gui.selected) {
		gui.selected = (gui.tabs.length > 0) ? 0 : -1;
		gui.reloadTab();
	}

	gui.reloadTabData();
}


gui.addTabResponders = function() {
	$("#computer-computer-tab").on("click", function(e) {
		if (gui.selected != -1) {
			gui.selected = -1;
			gui.reloadTab();
			gui.reloadTabData();
		}
	});

	$(".computer-tab").on("click", function(e) {
		var id = parseInt(e.currentTarget.id.replace("computer-tab-", ""));
		if (gui.selected != id) {
			gui.selected = id;
			gui.reloadTab();
			gui.reloadTabData();
		}
	});

	$(".computer-tab-close").on("click", function(e) {
		var id = parseInt(e.currentTarget.id.replace("computer-tab-close-", ""));
		gui.closeEditorTab(id);
	});
}


gui.setupTabs = function() {
	gui.reloadTabData();
	gui.reloadTab();
}



//  ------------------------
//    Computer Tabs
//  ------------------------


gui.setupComputers = function() {
	
}



//  ------------------------
//    File List Sidebar
//  ------------------------


gui.reloadFileList = function() {
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

	gui.addFileResponders();
}


gui.addFileResponders = function() {
	$(".open-file").on("click", function(e) {
		var i = parseInt(e.currentTarget.id.replace("open-file-", ""));
		var file = gui.files[i];

		for (var i in gui.tabs) {
			var tab = gui.tabs[i];
			if (tab.path == file.path) {
				gui.selected = i;
				gui.reloadTab();
				gui.reloadTabData();
				return;
			}
		}

		var name = file.path.split("/");
		name = name[name.length - 1];

		gui.openEditorTab(name, file.path, file.contents);
	});
}


gui.onFilesystemChange = function(files) {
	gui.files = files;
	gui.reloadFileList();
}


gui.setupFileList = function() {
	gui.reloadFileList();
}



//  ------------------------
//    Popups
//  ------------------------


gui.setupPopups = function() {
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



//  ------------------------
//    Computer Sidebar
//  ------------------------


gui.updateComputerSidebar = function() {
	var computer = core.getActiveComputer();
	$("#computer-id-field").html(computer.id.toString());
	$("#computer-type-field").html(computer.advanced ? "Advanced" : "Normal");
}



//  ------------------------
//    Main
//  ------------------------


gui.configureEditor();

$(document).ready(function() {
	gui.setupComputers();
	gui.setupFileList();
	gui.setupTabs();
	gui.setupPopups();
});
