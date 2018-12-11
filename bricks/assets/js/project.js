var editor;

function changeFontSize(size){
  editor.getWrapperElement().style["font-size"] = size+"px";
  editor.refresh();
  	$( "#console" ).css("font-size",size);
	$( "#consoleHeader" ).css("font-size",size);

}

function resizeWindow(){
	var height = $( window ).height() - 100;
	var width = $( window ).width() - 40;

	editor.setSize(width, height);
  	$( "#cWrap" ).css("width",width);

}
window.onload = function () {
   	$( "#fontSize" ).change(function() {
	    var str = "";
		$( "select option:selected" ).each(function() {
			str += $( this ).text() + " ";
		});
		console.log(str);
		changeFontSize(parseInt(str));
	});

	editor = CodeMirror.fromTextArea(codemirror, {
		mode: "javascript",
		styleActiveLine: true,
		lineNumbers: true,
		lineWrapping: true,
		theme: "mbo",
		extraKeys: {
			"F11": function (cm) {
				if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
					$(".CodeMirror").css("font-size", "150%");
				} else {
					$(".CodeMirror").css("font-size", "115%");
				}
			},
			"Esc": function (cm) {
				if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
				$(".CodeMirror").css("font-size", "100%");
			}
		}
	});

	console.log("submissionId");
	var submissionId = $("#submissionId").html();
	console.log(submissionId);
	$.post("/submission/read/", {subId: submissionId}, function (submission) {
		$("#console").empty().append(submission.message);
        editor.setValue(submission.code);

	});

	$("#test").click(function () {
		var code = editor.getValue();
		$("#console").empty();
		try {
			eval(code);
			$("#console").append("No error reports");
		} catch (e) {
			//alert(e);
			$("#console").append(e);
		}
	});



	resizeWindow();
	changeFontSize(24);
	$( window ).resize(function() {
		resizeWindow();
	});

};

