var editor;
var editor2;

window.onload = function () {
	editor2 = CodeMirror.fromTextArea(codemirror2, {
		mode: "javascript",
		styleActiveLine: true,
		lineNumbers: true,
		lineWrapping: true,
		readOnly: true,
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
   
	editor = CodeMirror.fromTextArea(codemirror, {
		mode: "javascript",
		styleActiveLine: true,
		lineNumbers: true,
		lineWrapping: true,
		readOnly: true,
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
		console.log("submisison Message");
		$("#console").empty().append(submission.message);
		var eachLine = submission.message.split('\n');
		$('#console').attr("rows", eachLine.length);

		var d = new Date(submission.fbResponseTime);
    	$("#responseTime").empty().append(d.toLocaleString());
    	if(submission.fbResponseMsg == "" || submission.fbResponseMsg == null){
			$("#responseMsg").addClass('hidden');
    	}else {
			$("#responseMsg").empty().append(submission.fbResponseMsg);
    	}
	    $.post("/user/read", {onyen: submission.fbResponder}, function (user) {
	        if (!user) {
	            console.log("The user who responded could not be found.")
				$("#responder").empty().append("someone");	
	        }else {
				$("#responder").empty().append(user.displayName);	
	        }
		});

		var d = new Date(submission.fbRequestTime);

		console.log('message'+submission.fbRequestMsg);
		if(submission.fbRequestTime){
	    	if(submission.fbRequestMsg == '' || submission.fbRequestMsg == null){
				$("#request").empty().append('<b>On ' + d.toLocaleString() + ', you requested feedback');
	    	}else {
				$("#request").empty().append('<b>On ' + d.toLocaleString() + ', you asked the following:</b><br /><br />' + submission.fbRequestMsg);
	    	}
		}else {
			$("#request").addClass('hidden');
		}

        editor2.setValue(submission.code);
        editor.setValue(submission.fbCode);

	});

};

