var curProblem = null;
var unseenFeedback = null;
var pretendStudent = false;
var miniBar = true;
var codeIsPub;
var tabOrder = [];
var tabName = {};
var editors = [];
var tabData = {};
var tabid = 0;

//Jorge edit start
var sid;
var sname;

function get_sid() {
    id = $.post("/login/get/", function(login){
        return login;
    }).done(function() {
        sid = id.responseJSON.displayName;
    });
};



function get_sname() {
    $.post("/user/read", function(user) {
        for(x of user) {
            for(y in x) {
                if(x[y] === sid) {
                    let index = user.indexOf(x);
                    sname = user[index].username;
                }
            }
        }
    });
};


//grab current user id, to then get onyen
get_sid();
get_sname();



//we can assume onyen is unique, so we just save all studnet names, except stotts
var studentNames = [];
var tempName;
function get_allStudents() {
    $.post("/user/read", function(user) {
        for(x of user) {
            for(y in x) {
                let index = user.indexOf(x);
                tempName = user[index].username;
                if(tempName != "stotts" && studentNames.includes(tempName) == false) {
                    studentNames.push(tempName);
                }
            }
        }
    });
};

get_allStudents();

//Jorge edit end

function isNull(item) {
    if (item == null || item == "null" || item == "" || item == '') {
        return true;
    } else {
        return false;
    }
}

function addProblemToAccordian(problem, folderName) {
    var earnedPointsDiv = "#earned-" + folderName;
    var availPointsDiv = "#avail-" + folderName;
    var checkDiv = "#check-" + folderName;
    var maxScore = 0;
    var probMax = Number(problem.value.correct) + Number(problem.value.style);
    var problemName = problem.name;
    if (problem.testMode == true) {
        problemName = "<font color=#E67E22><b>[TEST]&nbsp;</b></font>" + problem.name;
    }
    var link = $('<li id="' + problem.id + '" ></li>').append(
        $("<a></a>")
            .attr("href", "#")
            .append(problemName)
    );
    if (problem.phase == 0) {
        link.css("background-color", "#ededed");
    }
    if (problem.testMode == true) {
        link.css("background-color", "#DDECF2");
    }

    link.click(function() {
        addProbInfo(problem);
    });

    if (loggedIn) {
        var results = {
            correct: false,
            style: false
        };
        $.post("/submission/read/" + problem.id, {
                currentUser: true
            },
            function(submissions) {
                if (submissions.length !== 0) {
                    $("#panel-" + folderName).removeClass("panel-info");
                    $("#panel-" + folderName).removeClass("panel-danger");
                    $("#panel-" + folderName).addClass("panel-warning");
                    submissions.forEach(
                        function(submission) {
                            var curSubScore = Number(submission.value.correct) + Number(submission
                                .value.style);
                            if (curSubScore > maxScore) {
                                maxScore = curSubScore;
                            }
                            results.correct =
                                results.correct || (submission.value.correct == problem.value.correct);
                            results.style = results.style || (submission.value.style == problem.value
                                .style);
                            if (results.correct && results.style) {
                                return true;
                            }
                        }
                    );
                    if (maxScore < probMax) {
                        $("#" + problem.id).css("color", "#ae4345");
                        $("a", link).css("color", "#ae4345");
                    } else {
                        $("#" + problem.id).css("color", "green");
                        $("a", link).css("color", "green");
                    }
                    var probGrade = $('<span style="float:right;">' + maxScore + "/" +
                        (Number(problem.value.correct) +
                            Number(problem.value.style)) + "</span>");
                    $("a", link).append(probGrade);

                    var availablePoints = Number($(availPointsDiv).text());
                    var currentEarned = Number($(earnedPointsDiv).text()) + maxScore;
                    $(earnedPointsDiv).empty().append(currentEarned);

                    if ((currentEarned >= availablePoints) && $("#panel-" + folderName).hasClass(
                            "panel-warning")) {
                        $(checkDiv).empty().append(correct("8px").css("float", "right"));
                        $("#panel-" + folderName).removeClass("panel-info");
                        $("#panel-" + folderName).removeClass("panel-danger");
                        $("#panel-" + folderName).removeClass("panel-warning");
                        $("#panel-" + folderName).addClass("panel-success");
                    } else if ((currentEarned == 0) && (availablePoints > 0) && $("#panel-" +
                            folderName).hasClass("panel-info")) {
                        $("#panel-" + folderName).removeClass("panel-info");
                        $("#panel-" + folderName).addClass("panel-danger");
                    }
                } else {
                    var probGrade = $('<span style="float:right;">' + (Number(problem.value.correct) +
                        Number(problem.value.style)) + "pts</span>");
                    $("a", link).append(probGrade);

                    // problem here has no submissions
                    // but we know the folder is not empty of problems
                    // so if it is blue we change it to red
                    if ($("#panel-" + folderName).hasClass("panel-info")) {
                        $("#panel-" + folderName).removeClass("panel-info");
                        $("#panel-" + folderName).addClass("panel-danger");
                        $("#panel-" + folderName).removeClass("panel-warning");
                        $("#panel-" + folderName).removeClass("panel-success");
                    }
                }
            }
        );
    }
    return link;
}

function correct(pad) {
    return $("<span></span>")
        .addClass("glyphicon")
        .addClass("glyphicon-ok")
        .css("color", "green")
        .css("margin-left", pad);
}

function wrong(pad) {
    return $("<span></span>")
        .addClass("glyphicon")
        .addClass("glyphicon-remove")
        .css("color", "red")
        .css("margin-left", pad);
}

function inProgress(pad) {
    return $("<span></span>")
        .addClass("glyphicon")
        .addClass("glyphicon-minus")
        .css("color", "red")
        .css("margin-left", pad);
}

function addFolder(folder) {
    folder.probCount = 0;
    var folderName = folder.name;
    var accordianFolderName = "accordianFolder" + folder.id;
    var toggleLabel =
        /*
                 '<a href="http://www.unc.edu/~stotts/comp110/110-L1-BS0.pptx" ' +
                 'target="#pptTab"> <b>[PPT]&nbsp</b> </a>' +
        */
        '<a data-toggle="collapse" data-parent="#accordion" href="#' +
        accordianFolderName + '">' + folderName + '</a>';
    var accordian = "<div id='panel-" + accordianFolderName +
        "' class='panel panel-info panelHide'><div class='panel-heading'>" +
        "<h4 class='panel-title'>" + toggleLabel +
        "<span style='float:right;'>" + // left float span for folder scores
        " <span id='earned-" + accordianFolderName + "'> 0 </span>" +
        "<span > / </span> <span id='avail-" + accordianFolderName + "'></span>" +
        " </span>" + // left float span
        "<span id='check-" + accordianFolderName +
        "'></span></h4></div><ul id = '" + accordianFolderName +
        "' class='panel-collapse collapse folderCollapse doneCollapse'></ul></div></div>";


    $("#folderAccordion").append(accordian);
    var accordianFolderBody = '';
    $("#" + accordianFolderName).append(accordianFolderBody);
    var folderScore = 0;
    $("#avail-" + accordianFolderName).empty().append(folderScore);
    $("#" + accordianFolderName).empty();
    $.post("/problem/read", {
            folder: folder.id,
            phase: 2,
            pretendStudent: pretendStudent
        },
        function(problems) {
            problems.forEach(function(problem) {
                var link = addProblemToAccordian(problem, accordianFolderName);
                folderScore += parseFloat(problem.value.style) + parseFloat(problem.value
                    .correct);
                $("#" + accordianFolderName).append(link);
            });
            $("#avail-" + accordianFolderName).empty().append(folderScore);
        }
    );
}

function addProbInfo(problem) {

    if (problem.type === "diy") {
        if (isNull(problem.vidURL)) {
            problem.vidURL =
                "http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/vidDIY.mp4";
        }
        var buttonPart = "<button type='button' disabled " +
            " class='span4 proj-div text-right noVidButton'> " +
            " <font > " +
            "(DIY, no video) " +
            // "<span class='glyphicon glyphicon-menu-hamburger'></span>" +
            " </font></button>";
        var preParts = buttonPart + "&nbsp&nbsp";
    } else if (problem.type === "wall") {
        if (isNull(problem.vidURL)) {
            problem.vidURL =
                "http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/vidWALL.mp4";
        }
        var buttonPart = "<button type='button' disabled " +
            " class='span4 proj-div text-right noVidButton'> " +
            " <font > " +
            "(WALL, No VIDEO) " +
            // "<span class='glyphicon glyphicon-menu-hamburger'></span>" +
            " </font></button>";
        var preParts = buttonPart + "&nbsp&nbsp";
    } else if (problem.type === "exam") {
        if (isNull(problem.vidURL)) {
            problem.vidURL =
                "http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/vidEXAM.mp4";
        }
        var buttonPart = "<button type='button' disabled " +
            " class='span4 proj-div text-right noVidButton'> " +
            " <font > " +
            "(EXAM, No VIDEO) " +
            // "<span class='glyphicon glyphicon-menu-hamburger'></span>" +
            " </font></button>";
        var preParts = buttonPart + "&nbsp&nbsp";
    } else {
        // problem.type==="twit", or something else
        if (isNull(problem.vidURL)) {
            problem.vidURL =
                "http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/uncLogo2.mp4";
        }
        var buttonPart = "<button type='button' " +
            " class='span4 proj-div text-right vidButton'> " +
            " <font > " +
            "Click for VIDEO <span class='glyphicon glyphicon-facetime-video'></span>" +
            " </font></button>";
        var preParts =
            '<A target="_blank" href="' + problem.vidURL + '">' +
            buttonPart +
            "</A>" +
            "&nbsp&nbsp";
    }

    if (problem.testMode == true) {
        preParts += "<font color=#E67E22><b>[TEST]&nbsp;</b></font>";
    };
    problemName = preParts + "<font color=firebrick><b>" + problem.name +
        "</b></font>";

    $("#submissions").removeClass("hidden");
    $("#hideInst").removeClass("hidden");
    $("#initSubmit").removeClass("hidden");
    $("#reload").removeClass("hidden");
    $("#save").removeClass("hidden");
    if (miniBar == false) {
        $("#save").css("width", "49%");
    } else {
        $("#save").css("width", "23%");
    }

    //$("#vidPanel video").attr("src", problem.vidURL);
    //$("#vidModal video").attr("src", problem.vidURL);
    //$("#vidModalLabel span").text("Video for "+problem.name+" in "+problem.folder);

    //$("#vidModal").on('hide.bs.modal', function (e) {
    //   $("#vidModal video").attr("src", $("#vidModal video").attr("src"));
    //});
    //$("#vidModal").draggable({
    //   handle: ".modal-header"
    //});

    $("#recentpointbreakdown").addClass("hidden");
    $("#desc-title").empty().append(problemName);
    $.post("/folder/read/", {
        id: problem.folder
    }, function(folder) {
        $("#desc-title").html("<b>" + problemName +
            "</b>&nbsp;&nbsp; <i>in module&nbsp;<font color=darkblue><b> " + folder.name +
            "</b></font></i>");
    });
    $("#desc-body").empty();
    if (problem.phase == 0) {
        $("#desc-body").append(
            '<div class="alert alert-danger" role="alert"> <span ' +
            'class="glyphicon glyphicon-exclamation-sign" aria-hidden="true" ' +
            'style="margin-right:5px;">' +
            '</span>Since this problem is overdue, you may only earn partial credit.</div>'
        );
    }
    if (!isNull(problem.maxSubmissions)) {
        $("#desc-body").append(
            '<div class="alert alert-danger" role="alert" id="remainingAttempts"><span ' +
            'class="glyphicon glyphicon-exclamation-sign" aria-hidden="true" ' +
            'style="margin-right:5px;">' +
            '</span>The number of submissions allowed for this problem is limited to ' +
            problem.maxSubmissions + '.</div>'
        );
    }

    if (problem.language !== "javascript") {
        $("#test").addClass('hidden');
    } else {
        $("#test").removeClass('hidden');
    }

    $("#desc-body").append(problem.text);
    $("#console").empty();
    curProblem = problem;
    $(".availablePtStyle").empty().append(problem.value.style);
    $(".availablePtCorrect").empty().append(problem.value.correct);
    var highestStyle = 0;
    var highestCorrect = 0;
    $.post("/submission/read/" + problem.id, {
            currentUser: true,
            ascending: true
        },
        function(submissions) {
            $("#subs").empty();

            var remaining = problem.maxSubmissions - submissions.length;
            if (remaining < 0) {
                remaining = 0;
            }
            if (!isNull(problem.maxSubmissions)) {
                $("#remainingAttempts").append(' You have ' + remaining +
                    ' remaining attempts.');
            }

            if (submissions.length > 0) {
                $("#reload").removeAttr("disabled");
                $("#pointbreakdown").removeClass("hidden");
            } else {
                $("#reload").attr("disabled", "disabled");
                $("#pointbreakdown").addClass("hidden");
            }
            if (parseInt(submissions.length) < parseInt(problem.maxSubmissions) ||
                isNull(problem.maxSubmissions)) {
                $("#initSubmit").removeAttr("disabled");
            } else {
                $("#initSubmit").attr("disabled", "disabled");
            }

            submissions.forEach(function(submission) {
                addSubmission(submission);
            });
            setHighestScore(submissions, problem);
            resizeWindow();
        }
    );
}

function limitCheck(submission, problem) {
    $.post("/submission/read/" + problem.id, {
            currentUser: true
        },
        function(submissions) {
            var remaining = problem.maxSubmissions - submissions.length;
            if (remaining < 0) {
                remaining = 0;
            }
            $("#remainingAttempts").empty().append(
                '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true" ' +
                'style="margin-right:5px;"></span> ' +
                'The number of submissions allowed for this problem is limited to ' +
                problem.maxSubmissions + '. You have ' + remaining +
                ' remaining attempts.'
            );
            if (parseInt(submissions.length) < parseInt(problem.maxSubmissions)) {
                $("#initSubmit").removeAttr("disabled");
            } else {
                $("#initSubmit").attr("disabled", "disabled");
            }
        }
    );
}

function addSubmission(submission) {
    var time = new Date(submission.createdAt);
    var timeString = time.toLocaleDateString() + " " + time.toLocaleTimeString();
    var link = $("<tr></tr>");
    var buttonTD = $("<td></td>");
    var modalLink = $("<a></a>")
        .attr("data-toggle", "modal") //save
        .attr("data-target", "#loadSubmissionModal") //save
        .text(timeString)
        .click(function(event) {
            event.preventDefault();
            fillReloadModal(submission, "add_S");
        });
    buttonTD.append(modalLink);
    link.append(buttonTD);
    var gradeF = $("<td></td>");
    var gradeS = $("<td></td>");
    var results = {
        correct: false,
        style: false
    };
    results.correct =
        results.correct || (submission.value.correct >= curProblem.value.correct);
    results.style = results.style || (submission.value.style >= curProblem.value.style);

    $(gradeF).append("<span class='badge'>" + submission.value.correct + "/" +
        curProblem.value.correct + "</span>"
    );
    if (results.correct) {
        $(gradeF).append(correct("8px"));
    } else {
        $(gradeF).append(wrong("8px"));
    }
    $(gradeS).append("<span class='badge'>" + submission.value.style + "/" +
        curProblem.value.style + "</span>"
    );
    if (results.style) {
        $(gradeS).append(correct("8px"));
    } else {
        $(gradeS).append(wrong("8px"));
    }
    link.append(gradeF);
    link.append(gradeS);

    if (feedbackOn) {
        var requestFeedbackButton = $("<td id='subReq" + submission.id + "'></td>");
        link.append(requestFeedbackButton);
    }
    if (shareOn) {
        var shareButton = $("<td id='subShare" + submission.id + "'></td>");
        link.append(shareButton);
    }

    //attach the link to the submission
    $("#subs").prepend(link);

    if (submission.fbResponseTime == null) {
        if (submission.fbRequested == false) {
            request(submission);
        } else {
            pending(submission);
        }
    } else {
        view(submission);
    }

    if (submission.shareOK == true) {
        unshare(submission);
    } else {
        share(submission);
    }
}

function fillReloadModal(submission, depend) {
    //parameter depend adjust the functionality of Reload button
    // <button id="loadSubmission"> Reload </button>

    console.log("start");
    console.log(submission);
    console.log("End");
    reloadEditor.setValue(submission.code);
    //weird trick to make sure the codemirror box refreshes
    var that = this;
    setTimeout(function() {
        that.reloadEditor.refresh();
    }, 10);
    console.log("print_10");
    $("#loadSubmission").unbind('click');
    console.log("print_19");
    $("#loadSubmission").click(function() {
        // console.log(tabOrder);
        // parse the code from submit
        if(depend == "add_S"){
            var splitString = submission.code.split(/\/\/\s\/\*\/|\/\/\*\//);
        }else {
            var splitString = submission.code.split();
        }
        // var splitString = submission.code.split(/\/\/\s\/\*\/|\/\/\*\//);

        // name array for name of consoles and content array for content in consoles
        var names = [];
        var contents = [];

        // wpoon Edit <04_03_2018> <START>: depend which function call this function
        // it will perform different
        if(depend == "add_S"){
            for (var p = 0; p < splitString.length - 1; p++) {
                contents.push(splitString[p]);
                names.push(splitString[p + 1]);
                p++;
            }
        }else {
            for (var p = 0; p < splitString.length; p++) {
                contents.push(splitString[p]);
                names.push(submission.tabname);
            }
            //appendTab();
        }
        // wpoon Edit <04_09_2018> <END>:

         console.log("contents: " + contents);
         console.log("names: " + names);

        $('#sortable').empty();
        $("#demoTabs .tab-content").empty();

        tabName = {};
        tabOrder = [];
        var num_tabs = contents.length;
        //wpoon: <edit> if(depend == "add_S"){...}
        if(depend == "add_S"){
            tabData = {};
        }
        for (var i = 1; i < contents.length + 1; i++) {
            $("<li id='list_" + i + "'><a href='#editor" +
                i + "'>" + names[i - 1] + "</a></li>").appendTo(
                "#demoTabs .ui-tabs-nav");
            $("#demoTabs .tab-content").append(
                "<div id='editor" + i +
                "'class='tab-pane'><div class='row' style='height: 100%'><textarea id='codemirror" +
                i + "'>" + contents[i - 1] + "</textarea></div></div>"
            );
            console.log("console has been auto reloaded");
            var listname = "list_" + i;
            tabOrder.push(listname);
            tabName[listname] = names[i - 1];


            editors[i] = CodeMirror.fromTextArea(document.getElementById(
                "codemirror" +
                i), {
                mode: "javascript",
                styleActiveLine: true,
                lineNumbers: true,
                lineWrapping: true,
                theme: "mbo",
                extraKeys: {
                    "F11": function(cm) {
                        if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                            $(".CodeMirror").css("font-size", "150%");
                        } else {
                            $(".CodeMirror").css("font-size", "115%");
                        }
                    },
                    "Esc": function(cm) {
                        if (cm.getOption("fullScreen")) cm.setOption("fullScreen",
                            false);
                        $(".CodeMirror").css("font-size", "100%");
                    }
                }
            });
            console.log("ednitors[i]:" + editors[i]);
            var list = "list_" + i;
            var listid = "#list_" + i;
            // tabOrder.push(list);
            tabData[list] = {
                tabname: $(listid).text(),
                editor: editors[i]
            };
        }
        // console.log(tabData);
        // console.log(tabOrder);
        $("#demoTabs").tabs("refresh");
        $("#demoTabs").tabs("option", "active", 0);
        $('.CodeMirror').each(function(i, el) {
            el.CodeMirror.refresh();
        });
    });
}

//wpoon edit <04_09_2018><START>: append tab from SSC_Modal to the main code screen
function appendTab (){
    $("<li id='list_" + num_tabs + "'><a href='#editor" +
        num_tabs + "'>" + tab_name +
        "</a></li>"
    ).appendTo(
        "#demoTabs .ui-tabs-nav");
    //<====================================>
    // append style, class, id, <textarea>
    $("#demoTabs .tab-content").append(
        "<div id='editor" + num_tabs +
        "'class='tab-pane'><div class='row' style='height: 100%'><textarea id='codemirror" +
        num_tabs + "'></textarea></div></div>"
    );
    console.log("new code mirror created;");
}
//wpoon edit <END>:

function share(submission) {
    var button = $("<button></button>")
        .attr("type", "button")
        .addClass("btn btn-sm btn-primary")
        .text("Share")
        .click(function() {
            if (confirm("Would you like to submit this code to share with the class?")) {
                $.post("/submission/update", {
                        id: submission.id,
                        shareOK: true
                    },
                    function(submission) {
                        unshare(submission);
                    }
                );
            }
        });
    $("#subShare" + submission.id).empty().append(button);
}

function unshare(submission) {
    var button = $("<button></button>")
        .attr("type", "button")
        .addClass("btn btn-sm btn-success")
        .text("Shared")
        .click(function() {
            if (confirm("Would you like to revoke sharing permission?")) {
                $.post("/submission/update", {
                        id: submission.id,
                        shareOK: false
                    },
                    function(submission) {
                        share(submission);
                    }
                );
            }
        });
    $("#subShare" + submission.id).empty().append(button);
}

function pending(submission) {
    var button = $("<a></a>")
        .attr("data-toggle", "modal") //save
        .attr("data-target", "#pendingRequestModal") //save
        .addClass("btn btn-sm btn-warning")
        .text("Pending")
        .click(function(event) {
            event.preventDefault();
            fillPendingRequestModal(submission);
        });
    $("#subReq" + submission.id).empty().append(button);
}

function fillPendingRequestModal(submission) {
    var d = new Date(submission.createdAt);
    $("#modalText1").empty().append("You submitted this code on " + d.toLocaleString());
    var d = new Date(submission.fbRequestTime);
    $("#modalText2").empty().append("You requested feedback on " + d.toLocaleString());

    var submissionmessage = submission.fbRequestMsg;
    if (!submissionmessage) {
        submissionmessage = "You did not include a message with this request."
    }
    $("#submissionMessage").empty().append(submissionmessage);

    modalEditor.setValue(submission.code);
    modalEditor.refresh();
    //weird trick to make sure the codemirror box refreshes
    var that = this;

    setTimeout(function() {
        that.modalEditor.refresh();
    }, 10);

    $("#cancelRequest").unbind('click');
    $("#cancelRequest").click(
        function() {
            if (confirm("Sure you want to cancel this request?")) {
                $.post("/submission/update", {
                        id: submission.id,
                        fbRequested: false,
                        fbRequestTime: null,
                        fbRequestMsg: null
                    },
                    function(submission) {
                        request(submission);
                        addPendingButton();
                    }
                );
            }
        }
    );
}

function request(submission) {
    var button = $("<a></a>")
        .attr("data-toggle", "modal") //save
        .attr("data-target", "#submitRequestModal") //save
        .addClass("btn btn-sm btn-primary")
        .text("Request")
        .click(function(event) {
            event.preventDefault();
            fillSubmitRequestModal(submission);
        });
    $("#subReq" + submission.id).empty().append(button);
}

function fillSubmitRequestModal(submission) {
    var submissionmessage = submission.fbRequestMsg;
    if (!submissionmessage) {
        submissionmessage = "You did not include a message with this request."
    }
    $("#requestMessageModal").empty().append(submissionmessage);
    $('#submitRequestMsg').val('');

    requestModalEditor.setValue(submission.code);
    //weird trick to make sure the codemirror box refreshes
    var that = this;
    setTimeout(function() {
        that.requestModalEditor.refresh();
    }, 10);
    $("#submitRequest").unbind('click');
    $("#submitRequest").click(
        function() {
            if (confirm("Sure you want to submit this request?")) {
                var now = new Date().toISOString();
                var message = $('#submitRequestMsg').val();;
                $.post("/submission/update", {
                        id: submission.id,
                        fbRequested: true,
                        fbRequestTime: now,
                        fbRequestMsg: message
                    },
                    function(submission) {
                        pending(submission);
                        addPendingButton();
                    }
                );
            }
        }
    );
}

function view(submission) {
    var rqTime = new Date(submission.fbRequestTime);
    var rpTime = new Date(submission.fbResponseTime);

    if (!submission.feedbackSeen) {
        var classBlink = "blink";
    } else {
        var classBlink = " ";
    }

    var button = $("<a></a>")
        .attr("href", "feedback?subId=" + submission.id)
        .attr("target", "_blank")
        .attr("type", "button")
        .addClass("btn btn-sm btn-success " + classBlink)
        .text("View").click(
            function() {
                if (submission.feedbackSeen == false) {
                    $.post("/submission/update", {
                            id: submission.id,
                            feedbackSeen: true
                        },
                        function(submission) {
                            unseenFeedback = unseenFeedback - 1;
                            if (unseenFeedback == 0) {
                                $("#unseenFeedbackButton").remove();
                            }
                            view(submission);
                        }
                    );
                }
            }
        );
    $("#subReq" + submission.id).empty().append(button);
}

function resizeWindow() {
    $('.scrollableAccordian').height("800px");
    var height = $(document).height();
    var height = height - 100;
    if ($(window).width() > 990) {
        $('.scrollableAccordian').height(height);
    } else {
        $('.scrollableAccordian').height("400px");
    }
}

function submitFoldersReload(folderid) {
    //reload accordian folder for a single folder (ie after you make a submission within it)
    var accordianFolderName = "accordianFolder" + folderid;
    $("#" + accordianFolderName).empty();
    var earnedPointsDiv = "#earned-" + accordianFolderName;
    $(earnedPointsDiv).empty().append(0);
    $.post("/problem/read", {
            folder: curProblem.folder,
            phase: 2,
            pretendStudent: pretendStudent
        },
        function(problems) {
            problems.forEach(
                function(problem) {
                    var link = addProblemToAccordian(problem, accordianFolderName);
                    $("#" + accordianFolderName).append(link);
                }
            );
        }
    );
}

function foldersReload() {
    $("#folderAccordion").empty();
    $.post("/folder/read", {},
        function(folders) {
            folders.forEach(function(folder) {
                addFolder(folder);
            });
        }
    );
    if (curProblem) {
        addProbInfo(curProblem);
    }
}

function updateScore() {
    $.post("/setting/read/", {
            name: "points"
        },
        function(setting) {
            points = setting.value;
            $.post("/user/read/", {
                    me: true
                },
                function(user) {
                    $("#grade").empty().append("0" + " / " + points);
                    if ($.isNumeric(user.currentScore)) {
                        $("#grade").empty().append(user.currentScore + " / " + points);
                    } else { //if first log in
                        $.post("/user/updateScore/", {
                                currentScore: "0"
                            },
                            function(user) {}
                        );
                    }
                }
            );
        }
    );
}

function changeFontSize(size) {
    // editor.getWrapperElement().style["font-size"] = size + "px";
    // editor.refresh();
    // editor2.getWrapperElement().style["font-size"] = size + "px";
    // editor2.refresh();
    // editor3.getWrapperElement().style["font-size"] = size + "px";
    // editor3.refresh();

    for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
        editors[i].getWrapperElement().style["font-size"] = size + "px";
        editors[i].refresh();
    }
}

var editors = [];
var editor;

var modalEditor;
var requestModalEditor;
var reloadEditor;
var feedbackOn;
var shareOn;
var points;

function studentScore() { //recalculate and re-store the student's score
    $("#grade").empty().append(
        '<span class="glyphicon glyphicon-refresh spin"></span>');
    $("#studentScoreButton").empty().append(
        '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'
    );
    $.post("/submission/read/", {
        currentUser: true
    }, function(submissions) {
        var totalSubmissionNumber = submissions.length;
        var submissionCount = 0;
        var called = false; //make sure the update only gets called once.
        $.post("/folder/read", {}, function(folders) {
            var studScore = 0;
            folders.forEach(function(folder) {
                $.post("/problem/read", {
                    folder: folder.id,
                    phase: 2,
                    pretendStudent: pretendStudent
                }, function(problems) {
                    problems.forEach(function(problem) {
                        var maxScore = 0;
                        $.post("/submission/read/", {
                            id: problem.id,
                            currentUser: true
                        }, function(submissions) {
                            submissions.forEach(function(submission) {
                                submissionCount++;
                                var curSubScore = Number(submission.value.correct) +
                                    Number(submission.value.style);
                                if (curSubScore > maxScore) {
                                    maxScore = curSubScore;
                                }
                            });
                            studScore += maxScore;
                            if (totalSubmissionNumber == submissionCount && called ==
                                false) {
                                called = true; //make sure the update only gets called once.
                                $.post("/user/updateScore/", {
                                    currentScore: studScore
                                }, function(user) {
                                    updateScore();
                                });
                            }
                        });
                    });
                });
            });
        });
    });
}

function setConsoleResultMessage(msg) {
    $("#console").empty();
    if (msg) {
        //$('#console).style.font-family = "arial";
        //$('#console).style.font-size = "22px";
        //$('#console).style.color = #FFCCAA;
        $("#console").append(msg);
        var eachLine = msg.split('\n');
        $('#console').attr("rows", eachLine.length);
    }
};

function setHighestScore(submissions, problem) {
    var highestStyle = 0;
    var highestCorrect = 0;

    submissions.forEach(function(submission) {
        if (parseFloat(submission.value.style + submission.value.correct) >=
            parseFloat(highestStyle + highestCorrect)) {
            highestStyle = submission.value.style;
            highestCorrect = submission.value.correct;
        }
    });

    $("#highestPtCorrect").empty().append(highestCorrect);
    $("#highestPtStyle").empty().append(highestStyle);

    var myScore = parseFloat(highestCorrect) + parseFloat(highestStyle);
    var theScore = parseFloat(problem.value.style) + parseFloat(problem.value.correct);
    if (myScore >= theScore) {
        $("#pointbreakdown").removeClass("alert-warning");
        $("#pointbreakdown").addClass("alert-success");
    } else {
        $("#pointbreakdown").addClass("alert-warning");
        $("#pointbreakdown").removeClass("alert-success");
    }

    $("#correctCheck").empty();
    $("#styleCheck").empty();

    //append checks xs if they have attempted
    if (submissions.length > 0) {
        if (highestCorrect >= problem.value.correct) {
            $("#correctCheck").append(correct("8px"));
        } else {
            $("#correctCheck").append(wrong("8px"));
        }
        if (highestStyle >= problem.value.style) {
            $("#styleCheck").append(correct("8px"));
        } else {
            $("#styleCheck").append(wrong("8px"));
        }
    }
}

function setRecentScore(earnedF, earnedS) {
    $("#pointbreakdown").removeClass("hidden");
    $("#recentpointbreakdown").removeClass("hidden");
    $("#recentPtCorrect").empty().append(earnedF);
    $("#recentPtStyle").empty().append(earnedS);
    if (earnedF >= curProblem.value.correct) {
        $("#correctCheckRecent").empty().append(correct("8px"));
    } else {
        $("#correctCheckRecent").empty().append(wrong("8px"));
    }
    if (earnedS >= curProblem.value.style) {
        $("#styleCheckRecent").empty().append(correct("8px"));
    } else {
        $("#styleCheckRecent").empty().append(wrong("8px"));
    }
    var availF = $("#availptc").text();
    var availS = $("#availpts").text();
    if (parseFloat(earnedS + earnedF) >= (parseFloat(availF) + parseFloat(availS))) {
        $("#recentpointbreakdown").removeClass("alert-warning");
        $("#recentpointbreakdown").addClass("alert-success");
    } else {
        $("#recentpointbreakdown").addClass("alert-warning");
        $("#recentpointbreakdown").removeClass("alert-success");
    }

}

function fillUnseenFeedbackModal(submissions) {
    $("#unseenFeedbackBody").empty();
    var myArray = [];
    submissions.forEach(function(submission) {
        var rqTime = new Date(submission.fbRequestTime);
        var rpTime = new Date(submission.fbResponseTime);
        myArray.push(submission.problem);
    });

    $.unique(myArray);
    for (var i = 0; i < myArray.length; i++) {

        $.post("/problem/read", {
            id: myArray[i]
        }, function(problem) {
            $.post("/folder/read", {
                id: problem.folder
            }, function(folder) {
                var button = $("<a></a>")
                    .attr("data-dismiss", "modal")
                    .html(problem.name + " in " + folder.name).click(function() {
                        addProbInfo(problem);
                    });
                $("#unseenFeedbackBody").append($("<li>").append(button));
            });

            /*var button = $("<a></a>")
                .attr("href","feedback?subId=" + submission.id)
                .attr("target","_blank")
                .attr("data-dismiss","modal")
                .text(problem.name + rpTime.toLocaleString() ).click(function () {
                    $(this).detach();
                    $.post("/submission/update", {id: submission.id, feedbackSeen: true}, function (submission) {
                    });
                    $.post("/problem/read", {id: submission.problem}, function (problem) {
                        addProbInfo(problem);
                    });
                });*/

        });

    }
}

function fillPendingFeedbackModal(submissions) {
    $("#pendingFeedbackBody").empty();
    var myArray = [];
    submissions.forEach(function(submission) {
        var rqTime = new Date(submission.fbRequestTime);
        var rpTime = new Date(submission.fbResponseTime);
        myArray.push(submission.problem);
    });

    $.unique(myArray);
    for (var i = 0; i < myArray.length; i++) {

        $.post("/problem/read", {
            id: myArray[i]
        }, function(problem) {
            $.post("/folder/read", {
                id: problem.folder
            }, function(folder) {
                var button = $("<a></a>")
                    .attr("data-dismiss", "modal")
                    .html(problem.name + " in " + folder.name).click(function() {
                        addProbInfo(problem);
                    });
                $("#pendingFeedbackBody").append($("<li>").append(button));
            });
        });

    }
    if (myArray.length == 0) {
        $("#pendingFeedbackBody").append(
            "Oops! There are no pending requests! Try refreshing the page.");
    }
}

function addPendingButton() {
    $.post("/submission/read/", {
        currentUser: true,
        feedback: true
    }, function(submissions) {
        if (submissions.length > 0) {
            if (!$("#pendingFeedbackButton").length) {
                var modalLink = $("<button></button>")
                    .attr("id", "pendingFeedbackButton")
                    .attr("type", "button")
                    .css("float", "right")
                    .css("margin-top", "7px")
                    .addClass("btn btn-warning")
                    .attr("data-toggle", "modal") //save
                    .attr("data-target", "#pendingFeedbackModal") //save
                    .text("Pending Requests")
                    .click(function(event) {
                        event.preventDefault();
                        $.post("/submission/read/", {
                            currentUser: true,
                            feedback: true
                        }, function(submissions) {
                            fillPendingFeedbackModal(submissions);
                        });
                    });
                $("#navbarHeader").append(modalLink);
            }
        } else {
            $("#pendingFeedbackButton").remove();
        }

    });
}

function makeMiniBar() {
    if ($("#miniBarIcon").hasClass('glyphicon-resize-small')) {
        $("#miniBarIcon").removeClass('glyphicon-resize-small');
    }
    $("#miniBarIcon").addClass('glyphicon-resize-full');

    $("#test").css("width", "24%");
    $("#initSubmit").css("width", "24%");
    $("#reload").css("width", "24%");
    $("#save").css("width", "24%");
    $("#test").html('<span class="glyphicon glyphicon-play"  ></span>');
    $("#initSubmit").html('<span class="glyphicon glyphicon-send" ></span>');
    $("#reload").html('<span class="glyphicon glyphicon-open" ></span>');
    $("#save").html('<span class="glyphicon glyphicon-floppy-disk" ></span>');
    $("#test").attr("data-toggle", "tooltip");
    $("#reload").attr("data-toggle", "tooltip");
    $("#submitButtonTooltip").attr("data-toggle", "tooltip");
    ////
    $("#highestScoreLabel").html(
        '<span class="glyphicon glyphicon-pushpin" data-toggle="tooltip" ' +
        'data-placement="top" title="Best Score" style="padding-right:6px"></span>'
    );
    $("#highestFuntionalityLabel").html("");
    $("#highestStyleLabel").html("");
    $("#highestScoreLabel").css("float", "left");
    $("#highestCorrectDiv").css("float", "left");
    $("#highestStyleDiv").css("float", "left");
    $("#highestCorrectDiv").css("margin-left", "3px");
    $("#highestStyleDiv").css("margin-left", "3px");
    $("#pointbreakdown").css("height", "auto");
    $("#pointbreakdown").css("padding-top", "9px");
    $("#pointbreakdown").css("padding-bottom", "9px");
    ////
    $("#recentScoreLabel").html(
        '<span class="glyphicon glyphicon-time" data-toggle="tooltip" data-placement="top" ' +
        'title="Most Recent Score" style="padding-right:6px"></span>');
    $("#recentFuntionalityLabel").html("");
    $("#recentStyleLabel").html("");
    $("#recentScoreLabel").css("float", "left");
    $("#recentCorrectDiv").css("float", "left");
    $("#recentStyleDiv").css("float", "left");
    $("#recentCorrectDiv").css("margin-left", "3px")
    $("#recentStyleDiv").css("margin-left", "3px")
    $("#recentpointbreakdown").css("height", "auto");
    $("#recentpointbreakdown").css("padding-top", "9px");
    $("#recentpointbreakdown").css("padding-bottom", "9px");
    ///
    $("#fontSizeLabel").addClass("hidden");
    $("#fontSizeBox").css("height", "auto");
    $("#fontSizeBox").css("padding", "2px");
    $('[data-toggle="tooltip"]').tooltip()
    $('.sidebarBuddy button').tooltip('enable');
    $('#submitButtonTooltip').tooltip('enable');
}

function makeFullBar() {
    if ($("#miniBarIcon").hasClass('glyphicon-resize-full')) {
        $("#miniBarIcon").removeClass('glyphicon-resize-full');
    }
    $("#miniBarIcon").addClass('glyphicon-resize-small');

    $("#test").css("width", "49%");
    $("#initSubmit").css("width", "49%");
    $("#reload").css("width", "49%");
    $("#save").css("width", "49%");
    $("#test").html("Test All Locally");
    $("#reload").html("Reload Last");
    $("#save").html("Save");
    $("#initSubmit").html("Submit for Score");
    $("#test").removeAttr("data-toggle");
    $("#reload").removeAttr("data-toggle");
    $("#submitButtonTooltip").removeAttr("data-toggle");

    ////
    $("#highestScoreLabel").html("Highest Score:<br/>");
    $("#highestFuntionalityLabel").html("Functionality");
    $("#highestStyleLabel").html("Style");
    $("#highestScoreLabel").css("float", "auto");
    $("#highestCorrectDiv").css("float", "auto");
    $("#highestStyleDiv").css("float", "auto");
    $("#highestCorrectDiv").css("margin-left", "0px");
    $("#highestStyleDiv").css("margin-left", "0px");
    $("#pointbreakdown").css("height", "75px");
    $("#pointbreakdown").css("padding-top", "auto");
    $("#pointbreakdown").css("padding-bottom", "auto");
    ////
    $("#recentScoreLabel").html("Most Recent Score:<br/>");
    $("#recentFuntionalityLabel").html("Functionality");
    $("#recentStyleLabel").html("Style");
    $("#recentScoreLabel").css("float", "auto");
    $("#recentCorrectDiv").css("float", "auto");
    $("#recentStyleDiv").css("float", "auto");
    $("#recentCorrectDiv").css("margin-left", "0px");
    $("#recentStyleDiv").css("margin-left", "0px");
    $("#recentpointbreakdown").css("height", "75px");
    $("#recentpointbreakdown").css("padding-top", "auto");
    $("#recentpointbreakdown").css("padding-bottom", "auto");
    ///
    $("#fontSizeLabel").removeClass("hidden");
    $("#fontSizeBox").css("height", "75px");
    $("#fontSizeBox").css("padding", "auto");
    $('.sidebarBuddy button').tooltip('disable');
    $('#submitButtonTooltip').tooltip('disable');

}


//Jore edit start

function unpublishCode() {
    if ($("#pubCodeIcon").hasClass('glyphicon-ban-circle')) {
        $("#pubCodeIcon").removeClass('glyphicon-ban-circle');
    }
    $("#pubCodeIcon").addClass('glyphicon-share');

    $.post("/share/unpublish/", {
            //donorname: "_SUPER_USER__"
            donorname: sname  //Jorge edit here
        },
        function(share) {
            console.log("un-publish code");
        }
    );
}

// wpoon Edit: next 3 lines of code:
var Student_Name = []; // hold student onyen
var SSC_Timer = []; // hold share time (share.createdAt)
var SSC_obj = []; // <04_03_2018>: hold new object for the SSC_modal window
var names = [];
var contents = [];


/*
function getPublishedCode() {
     names = [];
        contents = [];


                 $.post("/share/getpublished/", {
                       donorname: "_SUPER_USER__"
        },
                function(share) {
                        console.log("get published code");
                        var txt = share.code;
                        if (!(txt == null)) {
                                var splitString = txt.split(/\/\/\s\/\*\/|\/\/\*\//);
                                console.log(splitString);

                                // name array for name of consoles and content array for content in consoles
                                for (var p = 0; p < splitString.length - 1; p++) {
                                        contents.push(splitString[p]);
                                        names.push(splitString[p + 1]);
                                        p++;
                                }
                        }

                });

    getPublishedCodeHelper(names, contents);
}
*/

var superUser_names;
var superUser_contents;
var shareData;


function getStudentPublishedCode() {
    getPublishedCodeHelper(names, contents);
}


function getPublishedCode() {
    getPublishedCodeHelper(superUser_names, superUser_contents);
}



function gatherSuperUserCode() {
    superUser_names = [];
    superUser_contents = [];

    shareData =  $.post("/share/getpublished/", {
        donorname: "_SUPER_USER__"
    },function(share) {
        shareData = share;
        return share;
    }).done(
        function() {
            console.log("get published code");

            var txt = shareData.code;

            if (!(txt == null)) {
                var splitString = txt.split(/\/\/\s\/\*\/|\/\/\*\//);

                // name array for name of consoles and content array for content in consoles
                for (var p = 0; p < splitString.length - 1; p++) {
                    superUser_names.push(splitString[p]);
                    superUser_contents.push(splitString[p + 1]);
                    p++;
                }
            }
        });
}


function gatherStudentCode() {
    // wpoon Edit: next 3 lines of code;
    Student_Name = [];
    SSC_Timer = [];
    SSC_obj = []; // <04_03_2018>: Store new object for the SSC_model window
    names = [];
    contents = [];


    for(var i=0; i<studentNames.length; i++) {
        shareData =  $.post("/share/getpublished/", {
            donorname: studentNames[i]
        },function(share) {
            shareData = share;
            return share;
        }).done(
            function() {
                //console.log("get published code");
                //console.log("shareData CreatedAt: " + shareData.createdAt);
                //console.log("shareData.code: " + shareData.code);
                var txt = shareData.code;

                if (!(txt == null)) {
                    var splitString = txt.split(/\/\/\s\/\*\/|\/\/\*\//);

                    for (var p = 0; p < splitString.length - 1; p++) {
                        //wpoon Edit: next 3 lines code;
                        var time = new Date(shareData.createdAt);
                        var timeString = time.toLocaleDateString() + " " + time.toLocaleTimeString();
                        SSC_Timer.push(timeString);
                        contents.push(splitString[p]);
                        Student_Name.push(shareData.donorname);
                        names.push(splitString[p + 1] + "_" + shareData.donorname);
                        // wpoon Edit <04_03_2018>: next 7 lines of codes
                        // Create New_object locally and store into SSC_obj[]
                        // use those object in SSC_modal window
                        var new_obj = new Object();
                        new_obj.id = shareData.id + p;
                        new_obj.donorname = shareData.donorname;
                        new_obj.tabname = splitString[p + 1] + "_" + shareData.donorname;
                        new_obj.code = splitString[p];
                        new_obj.Share_Time = timeString;
                        SSC_obj.push(new_obj);
                        p++;
                    }
                }
            });
    }
    StudentModal();
}


function getPublishedCodeHelper(names, contents) {
    console.log("get published code");

    console.log("This is contents array: " + contents);
    console.log("This is names array: " + names);
    if (contents.length != 0 && names.length != 0) {

        $('#sortable').empty();
        $("#demoTabs .tab-content").empty();

        var tabName = {};
        var editors = [];
        tabData = {};
        var num_tabs = contents.length;
        for (var i = 1; i < contents.length + 1; i++) {
            $("<li id='list_" + i + "'><a href='#editor" +
                i + "'>" + names[i - 1] + "</a></li>").appendTo(
                "#demoTabs .ui-tabs-nav");
            $("#demoTabs .tab-content").append(
                "<div id='editor" + i +
                "'class='tab-pane'><div class='row' style='height: 100%'><textarea id='codemirror" +
                i + "'>" + contents[i - 1] + "</textarea></div></div>"
            );
            console.log("console has been auto reloaded");

            var listname = "list_" + i;
            tabName[listname] = names[i - 1];

            editors[i] = CodeMirror.fromTextArea(document.getElementById(
                "codemirror" +
                i), {
                mode: "javascript",
                styleActiveLine: true,
                lineNumbers: true,
                lineWrapping: true,
                theme: "mbo",
                extraKeys: {
                    "F11": function(cm) {
                        if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                            $(".CodeMirror").css("font-size", "150%");
                        } else {
                            $(".CodeMirror").css("font-size", "115%");
                        }
                    },
                    "Esc": function(cm) {
                        if (cm.getOption("fullScreen")) cm.setOption("fullScreen",
                            false);
                        $(".CodeMirror").css("font-size", "100%");
                    }
                }
            });
            var list = "list_" + i;
            var listid = "#list_" + i;
            // tabOrder.push(list);
            tabData[list] = {
                tabname: $(listid).text(),
                editor: editors[i]
            };
        }
        $("#demoTabs").tabs("refresh");
        $("#demoTabs").tabs("option", "active", 0);
        $('.CodeMirror').each(function(i, el) {
            el.CodeMirror.refresh();
        });

        setConsoleResultMessage(
            "Published code is now in the main editor window\n "
        )
    } //end of if statment
    else {
        setConsoleResultMessage(
            "There is no published code at this time\n "
        )
    }
} //get published code ends here


//wpoon <START>: JS code for the getStudentCodeIcon modal
var StudentModal = function(){
    // Get the modal
    var modal = document.getElementById('Student_Modal');
    // Get the button that opens the modal
    var btn = document.getElementById("getStudentPubCode");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close_modal")[0];

// When the user clicks the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

// When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    setTimeout(function(){
        $("#S_Modal").empty();
        // for(i = 0; i < Student_Name.length; i++){
        for(i = 0; i < SSC_obj.length; i++){
            var SSC_id = SSC_obj[i].id;
            var link = $("<tr></tr>");
            var Select_code = $("<td></td>");
            var Select_code_input_tab = $("<input>")
                .attr("type", "checkbox")
                .attr("margin", "15")
                .attr("name", "sharecode");
            var SName_link = $("<td></td>");
            var SCode_link = $("<td></td>");
            var SCode_a_tab = $("<a></a>")
                .attr("data-target", "#loadSubmissionModal")
                .attr("data-toggle", "modal")
                .attr("id", SSC_obj[i].id)
                //click function will get the id and append corresponding code
                .click(function(event) {
                    event.preventDefault();
                    var get_SSC_id = $(this).attr("id");
                    for(var index=0; index<SSC_obj.length; index++){
                        if(SSC_obj[index].id === get_SSC_id){
                            fillReloadModal(SSC_obj[index], "Student_M");
                        }
                    }
                });
            var SCode_Timer = $("<td></td>");
            SName_link.text(Student_Name[i]);
            SCode_a_tab.text(names[i]);
            SCode_Timer.text(SSC_Timer[i]);

            link.append(Select_code_input_tab);
            link.append(SName_link);
            SCode_link.append(SCode_a_tab);
            link.append(SCode_link);
            link.append(SCode_Timer);
            link.append("<br>");
            $("#S_Modal").prepend(link);
        }
            var SSC_foot = $("<button></button>")
                .attr("type", "submit")
                .attr("value", "Submit")
                .attr("onclick", "printPublish()")
                .text("Publish");
            $("#S_Modal_tfoot").append(SSC_foot);

            // Gather future need data:
            // gather all the sharecode item
             //items = document.getElementsByName('sharecode');
    }, 1000);


// When the user clicks anywhere outside of the modal, close it


    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

var itmes = "";
// wpoon <START>: Gather data for the check box
function printPublish(){
    items = document.getElementsByName('sharecode');
    var selectedItem = "";
    for(var i=0; i < items.length; i++){
        if(items[i].type == 'checkbox' && items[i].checked==true) {
            selectedItem += items[i].name + "\n";
        }
    }
    console.log(selectedItem);
}

// wpoon <END>: Gather data for the check box

function myFunction(){
    document.getElementById("Student_Modal").style.display = "none";
}

//wpoon <END>: JS code for the getStudentCodeIcon modal




//wpoon <Start>: add student share code to StudentModal
//identical to addSubmission
// SSC stand for Student Share Code (from StudentModal)
function addStudentShare(share) {
    var time = new Date(share.createdAt);
        //time.toLocaleDateString return m/d/y
        //time.toLocalTimeString return h:m:s
    var timeString = time.toLocaleDateString() + " " + time.toLocaleTimeString();
    var SSC_link = $("<tr></tr>");
    var SSC_buttonTD = $("<td></td>");
    var SSC_modalLink = $("<a></a>")
        // .attr("data-toggle", "modal") //save //creata modal from css
        // .attr("data-target", "#loadSubmissionModal") //save ??Question??
         .text(timeString);
        // .click(function(event) {
        //     event.preventDefault();
        //     fillReloadModal(submission);
        // });
    SSC_buttonTD.append(SSC_modalLink);
    SSC_link.append(SSC_buttonTD);

    console.log("Time: " + time);
    console.log("TimeString: " + timeString);
    console.log("SSC_link: " + SSC_link);
    console.log(share.createdAt)

    //attach the link to the submission
    // I dont think the following code are need for current function:
    // $("#subs").prepend(link);
    //
    // if (submission.fbResponseTime == null) {
    //     if (submission.fbRequested == false) {
    //         request(submission);
    //     } else {
    //         pending(submission);
    //     }
    // } else {
    //     view(submission);
    // }
    //
    //
    //
    // if (submission.shareOK == true) {
    //     unshare(submission);
    // } else {
    //     share(submission);
    // }
}

//wpoon <END>: add student share code to StudentModal


window.onload = function() {
//gatherStudentCode();
//gatherSuperUserCode();

//Jorge edit end at very bottom

    $("#demoTabs").tabs();
    $("#demoTabs").tabs('option', 'active', 0);

    $('.CodeMirror').each(function(i, el) {
        el.CodeMirror.refresh();
    });

    document.getElementById("sortable").addEventListener("click",
        function() {
            $('.CodeMirror').each(function(i, el) {
                el.CodeMirror.refresh();
            });
        });

    document.getElementById("folderAccordion").addEventListener("click",
        function() {
            $('.CodeMirror').each(function(i, el) {
                el.CodeMirror.refresh();
            });
            console.log("refreshed");
        });

    document.getElementById("addTabs").addEventListener("click",
        function() {
            $('.CodeMirror').each(function(i, el) {
                el.CodeMirror.refresh();
            });
            console.log("refreshed");
        });

    $("#removeTabs").click(function() {

        var tabid = getCurrent() - 1;

        if (tabid == 0) {
            alert("You can't delete the first console");
        } else {
            // var list = $("#demoTabs").find(".ui-tabs-nav li:eq(" + tabid + ")").attr('id');
            var list = $("ul#sortable li.ui-tabs-active").attr('id');
            var tab = $("ul#sortable li.ui-tabs-active").remove();

            // var listid = "#list_" + getCurrent();
            var index1 = tabOrder.indexOf(list);
            tabOrder.splice(index1, 1);

            delete tabName[list];

            console.log(list + " has been deleted.");
            console.log(tabOrder);

            delete tabData[list];
            // console.log(tabData);
            $("#demoTabs").tabs("refresh");

        }
    });

    var ref_this = null;
    document.getElementById("testTab").addEventListener("click",
        function() {
            ref_this = $("ul#sortable li.ui-tabs-active").attr('id');
            console.log(ref_this);
        });

    $("#testTab").click(function() {
        var code = tabData[ref_this].editor.getValue();
        // console.log(ref_this);
        $("#console").empty();
        try {
            eval(code);
            $("#console").append("No error reports");
        } catch (e) {
            $("#console").append(e);
        }
    });

    var num_tabs = $("div#demoTabs ul li").length;

    $("#addTabs").click(function() {
        num_tabs++;
        //console.log(num_tabs);

        var tab_name = document.getElementById("tabname").value;
        $("#tabname").val("");
        console.log("tab_name: " + tab_name); //wpoon

        if (!tab_name) {
            tab_name = "Console" + num_tabs;
        }

        //<====================================>
        // sign id and href to <li>
        $("<li id='list_" + num_tabs + "'><a href='#editor" +
            num_tabs + "'>" + tab_name +
            "</a></li>"
        ).appendTo(
            "#demoTabs .ui-tabs-nav");
        //<====================================>
        // append style, class, id, <textarea>
        $("#demoTabs .tab-content").append(
            "<div id='editor" + num_tabs +
            "'class='tab-pane'><div class='row' style='height: 100%'><textarea id='codemirror" +
            num_tabs + "'></textarea></div></div>"
        );
        console.log("new code mirror created;");
        // console.log(tab_name);
        //<====================================>

        var listname = "list_" + num_tabs;
        tabName[listname] = tab_name;
        console.log("listname: " + listname);
        console.log("tabName: " + tabName);

        var listid = "list_" + num_tabs;
        tabOrder.push(listid);
        console.log("listid: " + listid);
        console.log("tabOrder: " + tabOrder);

        //<====================================>
        editors[num_tabs] = CodeMirror.fromTextArea(document.getElementById(
            "codemirror" +
            num_tabs), {
            mode: "javascript",
            styleActiveLine: true,
            lineNumbers: true,
            lineWrapping: true,
            theme: "mbo",
            extraKeys: {
                "F11": function(cm) {
                    if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                        $(".CodeMirror").css("font-size", "150%");
                    } else {
                        $(".CodeMirror").css("font-size", "115%");
                    }
                },
                "Esc": function(cm) {
                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                    $(".CodeMirror").css("font-size", "100%");
                }
            }
        });
        console.log("editors[num_tabs]: " + editors[num_tabs]);
        //<====================================>

        tabData[listname] = {
            tabname: tab_name,
            editor: editors[num_tabs]
        };
        console.log("tabData: " + tabData);

        $("#demoTabs").tabs("refresh");
        $("#demoTabs").tabs("option", "active", $(".ui-tabs-nav").children().size() -
            1);
    });
    // addTbas function <END>



    function getCurrent() {
        var id = $("#demoTabs").tabs('option', 'active') + 1;
        return id;
    }



    (function() {
            var u = document.URL.split("/");
            u.pop();
            $("#target").val(u.join("/") + "/login/authenticate");
        }

    )();


    // var tabOrder = [];
    var tabName = {};
    for (var i = 1; i < num_tabs + 1; i++) {
        var list = "list_" + i;
        var listid = "#list_" + i;
        tabOrder.push(list);
        tabName[list] = $(listid).text();
    }


    console.log(tabOrder);
    // dragable tabs
    $(function() {
        $("#sortable").sortable({
            distance: 30,
            cancel: ".fixed",
            stop: function(event, ui) {
                tabOrder = $(this).sortable('toArray');
                console.log(tabOrder);

            }
        });
        $("#sortable").disableSelection();
    });

    // ========= submissions box feedback =============//
    // ========= submissions box feedback =============//

    $.post("/setting/read/", {
        name: "feedback"
    }, function(setting) {
        if (setting.on == true || setting.on == "true") {
            feedbackOn = true;
            $("#subsHead").append("<td>Feedback</td>");
            $.post("/submission/read/", {
                feedbackSeen: false,
                currentUser: true
            }, function(submissions) {
                unseenFeedback = submissions.length;
                if (submissions.length > 0) {
                    var modalLink = $("<button></button>")
                        .attr("id", "unseenFeedbackButton")
                        .attr("type", "button")
                        .css("float", "right")
                        .css("margin-top", "7px")
                        .addClass("btn btn-success")
                        .attr("data-toggle", "modal") //save
                        .attr("data-target", "#unseenFeedbackModal") //save
                        .text("Unread Feedback")
                        .click(function(event) {
                            event.preventDefault();
                            $.post("/submission/read/", {
                                feedbackSeen: false,
                                currentUser: true
                            }, function(submissions) {
                                fillUnseenFeedbackModal(submissions);
                            });
                        });
                    $("#navbarHeader").append(modalLink);
                }
            });

            addPendingButton();

        } else {
            feedbackOn = false;
        }

    });

 // ========= submissions box share =============//
    // ========= submissions box share =============//
    $.post("/setting/read/", {
        name: "share"
    }, function(setting) {
        if (setting.on == true || setting.on == "true") {
            shareOn = true;
            $("#subsHead").append("<td>Share</td>");

        } else {
            shareOn = false;
        }
    });


    $('[data-toggle="tooltip"]').tooltip()


    updateScore();

    if (miniBar) {
        makeMiniBar();
    } else {
        makeFullBar();
    }
    /*if (codeIsPub) {
        publishCode();
    } else {
        unpublishCode();
    } */

    //save student's code on interval
    setInterval(
        function() {
            //save current code into user modelget
            var code = '';

            for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
                code = code + editors[tabOrder[i - 1].charAt(5)].getValue() +
                    "// /*/" + tabName[tabOrder[i - 1]] + "//*/" + '\n';
                if (editors[tabOrder[i - 1]] === null) {
                    continue;
                }

            }
            $.post("/user/saveCode/", {
                code: code
            }, function(user) {});
        },
        120000 /* 120000ms = 2 min*/
    );
    $("#folderAccordion").empty();
    $.post("/folder/read/", {}, function(
        folders) {
        folders.forEach(function(folder) {
            addFolder(folder);
        });
    });



    for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
        if (editors[i] === null) {
            continue;
        }
        editors[i] = CodeMirror.fromTextArea(document.getElementById("codemirror" +
            i), {
            mode: "javascript",
            styleActiveLine: true,
            lineNumbers: true,
            lineWrapping: true,
            theme: "mbo",
            extraKeys: {
                "F11": function(cm) {
                    if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                        $(".CodeMirror").css("font-size", "150%");
                    } else {
                        $(".CodeMirror").css("font-size", "115%");
                    }
                },
                "Esc": function(cm) {
                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                    $(".CodeMirror").css("font-size", "100%");
                }
            }
        });
        var list = "list_" + i;
        var listid = "#list_" + i;
        // tabOrder.push(list);
        tabData[list] = {
            tabname: $(listid).text(),
            editor: editors[i]
        };
    }
    console.log(tabData);
    // console.log(editors);


    modalEditor = CodeMirror.fromTextArea(modalCodemirror, {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        readOnly: true,
        theme: "mbo",
        extraKeys: {
            "F11": function(cm) {
                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                    $(".CodeMirror").css("font-size", "150%");
                } else {
                    $(".CodeMirror").css("font-size", "115%");
                }
            },
            "Esc": function(cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                $(".CodeMirror").css("font-size", "100%");
            }
        }
    });

    // loading code lack into screen
    reloadEditor = CodeMirror.fromTextArea(reloadCodemirror, {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        readOnly: true,
        theme: "mbo",
        extraKeys: {
            "F11": function(cm) {
                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                    $(".CodeMirror").css("font-size", "150%");
                } else {
                    $(".CodeMirror").css("font-size", "115%");
                }
            },
            "Esc": function(cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                $(".CodeMirror").css("font-size", "100%");
            }
        }
    });

    requestModalEditor = CodeMirror.fromTextArea(requestModalCodemirror, {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        theme: "mbo",
        readOnly: true,
        extraKeys: {
            "F11": function(cm) {
                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                    $(".CodeMirror").css("font-size", "150%");
                } else {
                    $(".CodeMirror").css("font-size", "115%");
                }
            },
            "Esc": function(cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                $(".CodeMirror").css("font-size", "100%");
            }
        }
    });

    //$("#vidModal").on('hide.bs.modal', function (e) {
    //   $("#vidModal iframe").attr("src", $("#vidModal iframe").attr("src"));
    //})

    $('#submitRequestModal').on('shown.bs.modal', function(e) {
        requestModalEditor.refresh();
    })

    $('#pendingRequestModal').on('shown.bs.modal', function(e) {
        modalEditor.refresh();
    })

    $('#loadSubmissionModal').on('shown.bs.modal', function(e) {
        // shown.bs.modal: is a JS Modal events: event occurs when the modal is fully shown.
        reloadEditor.refresh();
    })

    //wpoon <START>:
    $('#loadPublishModal').on('shown.bs.modal', function(e) {
        // shown.bs.modal: is a JS Modal events: event occurs when the modal is fully shown.
        reloadEditor.refresh();
    })

    //wpoon <END>:

    $('.vidButton').click(function() {
        var src = $(this).attr('src');
        //$('#vidModal video').attr('src', src);
        //$('#vidPanel video').attr('src', src);
        //$("#vidModal").draggable({
        //  handle: ".modal-header"
        //});
    });

    $("#test").click(function() {
        var code = '';
        // console.log(tabOrder);
        for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
            // code = code + editors[i].getValue() + '\n';
            code = code + editors[tabOrder[i - 1].charAt(5)].getValue() + '\n';
        }
        $("#console").empty();
        try {
            eval(code);
            $("#console").append("No error reports");
        } catch (e) {
            //alert(e);
            $("#console").append(e);
        }
    });

    $("#reload").click(function() {
        $.post("/submission/read/" + curProblem.id, {
            currentUser: true,
            limitOne: true
        }, function(submissions) {
            submissions.forEach(function(submission) {
                // editors[1].setValue(submission.code);

                // console.log(tabOrder);
                // parse the code from submit
                var splitString = submission.code.split(/\/\/\s\/\*\/|\/\/\*\//);


                console.log(splitString);

                // name array for name of consoles and content array for content in consoles
                var names = [];
                var contents = [];
                for (var p = 0; p < splitString.length - 1; p++) {
                    contents.push(splitString[p]);
                    names.push(splitString[p + 1]);
                    p++;
                }
                // console.log(contents);
                // console.log(names);

                $('#sortable').empty();
                $("#demoTabs .tab-content").empty();
                // tabOrder = [];
                tabName = {};
                editors = [];
                tabData = {};
                tabOrder = [];
                num_tabs = contents.length;
                console.log(num_tabs);
                for (var i = 1; i < contents.length + 1; i++) {
                    $("<li id='list_" + i + "'><a href='#editor" +
                        i + "'>" + names[i - 1] + "</a></li>").appendTo(
                        "#demoTabs .ui-tabs-nav");
                    $("#demoTabs .tab-content").append(
                        "<div id='editor" + i +
                        "'class='tab-pane'><div class='row' style='height: 100%'><textarea id='codemirror" +
                        i + "'>" + contents[i - 1] + "</textarea></div></div>"
                    );
                    var listname = "list_" + i;
                    tabOrder.push(listname);
                    tabName[listname] = names[i - 1];


                    editors[i] = CodeMirror.fromTextArea(document.getElementById(
                        "codemirror" +
                        i), {
                        mode: "javascript",
                        styleActiveLine: true,
                        lineNumbers: true,
                        lineWrapping: true,
                        theme: "mbo",
                        extraKeys: {
                            "F11": function(cm) {
                                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                                    $(".CodeMirror").css("font-size", "150%");
                                } else {
                                    $(".CodeMirror").css("font-size", "115%");
                                }
                            },
                            "Esc": function(cm) {
                                if (cm.getOption("fullScreen")) cm.setOption("fullScreen",
                                    false);
                                $(".CodeMirror").css("font-size", "100%");
                            }
                        }
                    });
                    var list = "list_" + i;
                    var listid = "#list_" + i;
                    tabData[list] = {
                        tabname: $(listid).text(),
                        editor: editors[i]
                    };
                }
                console.log("console has been auto reloaded");
                console.log(tabData);
                $("#demoTabs").tabs("refresh");
                $("#demoTabs").tabs("option", "active", 0);
                $('.CodeMirror').each(function(i, el) {
                    el.CodeMirror.refresh();
                });
            });
        });
    });

    $("#save").click(function() {
        var code = '';
        console.log(editors);
        console.log(tabOrder);
        for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
            code = code + editors[tabOrder[i - 1].charAt(5)].getValue() +
                "// /*/" + tabName[tabOrder[i - 1]] + "//*/" + '\n';
        }
        console.log(code);
        $.post("/user/saveCode", {
            code: code
        }, function(user) {
            console.log("savecode");
            var save = $("#save").width();
            console.log(save);
            $("#save").empty().append(
                '<span class="glyphicon glyphicon-floppy-saved" aria-hidden="true"></span>'
            );
            setTimeout(function() {
                if (miniBar == true) {
                    $("#save").empty().append(
                        '<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>'
                    );
                } else {
                    $("#save").empty().append('Save');
                }
            }, 2000);

        });
    });

    $("#fontSize").change(function() {
        var str = "";
        $("select option:selected").each(function() {
            str += $(this).text() + " ";
        });
        changeFontSize(parseInt(str));
    });

    $("#submit").click(function() {
        if (curProblem == null) {
            alert("You must select a problem before submitting");
        } else {
            $("#console").empty();

            var code = '';
            for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
                code = code + editors[tabOrder[i - 1].charAt(5)].getValue() +
                    "// /*/" + tabName[tabOrder[i - 1]] + "//*/" + '\n';
            }

            try {
                if (curProblem.language == "javascript") {
                    var AST = acorn.parse(code); // return an abstract syntax tree structure
                    // return analysis of style grading by checking AST
                    var ssOb = pnut.collectStructureStyleFacts(AST);
                } else {
                    var ssOb = {
                        'null': 'null'
                    };
                }
                $.post("/submission/create", {
                        problem: curProblem.id,
                        code: code,
                        style: JSON.stringify(ssOb)
                    },
                    function(submission) {
                        $("#reload").removeAttr("disabled");
                        addSubmission(submission);
                        if (!isNull(curProblem.maxSubmissions)) {
                            limitCheck(submission, curProblem);
                        }
                        submitFoldersReload(curProblem.folder);
                        $.post("/submission/read/" + curProblem.id, {
                                currentUser: true
                            },
                            function(submissions) {
                                setHighestScore(submissions, curProblem);
                            }
                        );
                        setRecentScore(submission.value.correct, submission.value.style);
                        setConsoleResultMessage(submission.message);
                        studentScore();
                    }
                );
            } catch (e) {
                alert("Parsing Analysis Exception");
                $("#console").append(
                    "Did you test your code locally? You might have a syntax error."
                );
            }
        }
    });

    $('#accShow').on('click', function() {
        if ($("#accShowIcon").hasClass('glyphicon-folder-open')) {
            $("#accShowIcon").removeClass('glyphicon-folder-open');
            $("#accShowIcon").addClass('glyphicon-folder-close');
            $('.folderCollapse').collapse('show');
        } else {
            $("#accShowIcon").removeClass('glyphicon-folder-close');
            $("#accShowIcon").addClass('glyphicon-folder-open');
            $('.folderCollapse').collapse('hide');
        }
        return false;
    });

    $('#accDoneShow').on('click', function() {
        if ($("#accDoneShowIcon").hasClass('glyphicon-check')) {
            $("#accDoneShowIcon").removeClass('glyphicon-check');
            $("#accDoneShowIcon").addClass('glyphicon-unchecked');
            $('.panel-success').addClass('hidden');
        } else {
            $("#accDoneShowIcon").removeClass('glyphicon-unchecked');
            $("#accDoneShowIcon").addClass('glyphicon-check');
            $('.panel-success').removeClass('hidden');
        }
        return false;
    });

    $('#accFutureShow').on('click', function() {
        if ($("#accFutureShowIcon").hasClass('glyphicon-eye-close')) {
            $("#accFutureShowIcon").removeClass('glyphicon-eye-close');
            $("#accFutureShowIcon").addClass('glyphicon-eye-open');
            $('.panel-info').addClass('hidden');
        } else {
            $("#accFutureShowIcon").removeClass('glyphicon-eye-open');
            $("#accFutureShowIcon").addClass('glyphicon-eye-close');
            $('.panel-info').removeClass('hidden');
        }
        return false;
    });

    $('#miniBar').on('click', function() {
        if ($("#miniBarIcon").hasClass('glyphicon-resize-small')) {
            $("#miniBarIcon").removeClass('glyphicon-resize-small');
            $("#miniBarIcon").addClass('glyphicon-resize-full');
            makeMiniBar();
            miniBar = true;
        } else {
            $("#miniBarIcon").removeClass('glyphicon-resize-full');
            $("#miniBarIcon").addClass('glyphicon-resize-small');
            makeFullBar();
            miniBar = false;
        }
        return false;
    });


    $('#pubCode').on('click', function() {
        if ($("#pubCodeIcon").hasClass('glyphicon-share')) {
            $("#pubCodeIcon").removeClass('glyphicon-share');
            $("#pubCodeIcon").addClass('glyphicon-ban-circle');
            $("#pubCode").attr('title', 'Un-Publish Editor Code').tooltip('fixTitle')
                .tooltip('show');
            $("#pubCode").removeClass('btn-success');
            $("#pubCode").addClass('btn-danger');
            publishCode();
            codeIsPub = true;
        } else {
            $("#pubCodeIcon").removeClass('glyphicon-ban-circle');
            $("#pubCodeIcon").addClass('glyphicon-share');
            $("#pubCode").attr('title', 'Publish Editor Code').tooltip('fixTitle').tooltip(
                'show');
            $("#pubCode").removeClass('btn-danger');
            $("#pubCode").addClass('btn-success');
            unpublishCode();
            codeIsPub = false;
        }
        return false;
    });

//Jorge edit start

    function publishCode() {
        if ($("#pubCodeIcon").hasClass('glyphicon-share')) {
            $("#pubCodeIcon").removeClass('glyphicon-share');
        }
        $("#pubCodeIcon").addClass('glyphicon-ban-circle');

        // var code = editor.getValue() + '\n' + editor2.getValue() + '\n' + editor3.getValue();

        var code = '';

        for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
            code = code + editors[tabOrder[i - 1].charAt(5)].getValue() +
                "// /*/" + tabName[tabOrder[i - 1]] + "//*/" + '\n';
            if (editors[tabOrder[i - 1]] === null) {
                continue;
            }
        }

        $.post("/share/publish/", {
                //donorname: "_SUPER_USER__",
                donorname: sname,  //Jorge edit here
                code: code
            },
            function(share) {
                console.log("publish code");
                console.log(code);
            }
        );
    }

    $('#getPubCode').on('click', function() {

        getPublishedCode();
        return false;
    });

    $('#getStudentPubCode').on('click', function() {

        getStudentPublishedCode();
        return false;
    });


    $('#refreshGather').on('click', function() {
        gatherStudentCode();  //Jorge edit end
        gatherSuperUserCode();
    });

//Jorge edit end

    resizeWindow();
    for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
        editors[i].refresh();
    }

    $(window).resize(function() {
        resizeWindow();
        for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
            editors[i].refresh();
        }
    });

    $('#expandSidebarIn').on('click', function() {
        if ($("#leftSidebar").hasClass('col-md-3')) { // 3 and 9
            $("#leftSidebar").removeClass('col-md-3').addClass('col-md-2');
            $("#right-side").removeClass('col-md-9').addClass('col-md-10');
        } else if ($("#leftSidebar").hasClass('col-md-4')) {
            $("#leftSidebar").removeClass('col-md-4').addClass('col-md-3');
            $("#right-side").removeClass('col-md-8').addClass('col-md-9');
            $("#expandSidebarOut").removeClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-5')) {
            $("#leftSidebar").removeClass('col-md-5').addClass('col-md-4');
            $("#right-side").removeClass('col-md-7').addClass('col-md-8');
            $("#expandSidebarOut").removeClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-6')) {
            $("#leftSidebar").removeClass('col-md-6').addClass('col-md-5');
            $("#right-side").removeClass('col-md-6').addClass('col-md-7');
            $("#expandSidebarOut").removeClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-7')) {
            $("#leftSidebar").removeClass('col-md-7').addClass('col-md-6');
            $("#right-side").removeClass('col-md-5').addClass('col-md-6');
            $("#expandSidebarOut").removeClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-8')) {
            $("#leftSidebar").removeClass('col-md-8').addClass('col-md-7');
            $("#right-side").removeClass('col-md-4').addClass('col-md-5');
            $("#expandSidebarOut").removeClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-2')) {
            $("#leftSidebar").removeClass('col-md-2').addClass('leftSidebarClosed');
            $("#right-side").removeClass('col-md-10').addClass('container-fluid');
            $("#expandSidebarIn").addClass('hidden');
            $("#folderAccordion").addClass('hidden');
            $("#accShow").addClass('hidden');
        }
        setTimeout(function() {
            for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
                editors[i].refresh();
            }
        }, 10);
        return false;
    });

    $('#expandSidebarOut').on('click', function() {
        if ($("#leftSidebar").hasClass('col-md-3')) {
            $("#leftSidebar").removeClass('col-md-3').addClass('col-md-4');
            $("#right-side").removeClass('col-md-9').addClass('col-md-8');
            //$("#expandSidebarOut").addClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-4')) {
            $("#leftSidebar").removeClass('col-md-4').addClass('col-md-5');
            $("#right-side").removeClass('col-md-8').addClass('col-md-7');
            //$("#expandSidebarOut").addClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-5')) {
            $("#leftSidebar").removeClass('col-md-5').addClass('col-md-6');
            $("#right-side").removeClass('col-md-7').addClass('col-md-6');
            //$("#expandSidebarOut").addClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-6')) {
            $("#leftSidebar").removeClass('col-md-6').addClass('col-md-7');
            $("#right-side").removeClass('col-md-6').addClass('col-md-5');
            //$("#expandSidebarOut").addClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-7')) {
            $("#leftSidebar").removeClass('col-md-7').addClass('col-md-8');
            $("#right-side").removeClass('col-md-5').addClass('col-md-4');
            $("#expandSidebarOut").addClass('hidden');
        } else if ($("#leftSidebar").hasClass('col-md-2')) {
            $("#leftSidebar").removeClass('col-md-2').addClass('col-md-3');
            $("#right-side").removeClass('col-md-10').addClass('col-md-9');
            $("#expandSidebarIn").removeClass('hidden');
        } else {
            $("#leftSidebar").removeClass('leftSidebarClosed').addClass('col-md-2');
            $("#right-side").removeClass('container-fluid').addClass('col-md-10');
            $("#expandSidebarIn").removeClass('hidden');
            $("#folderAccordion").removeClass('hidden');
            $("#accShow").removeClass('hidden');
        }
        setTimeout(function() {
            for (var i = 1; i < $("div#demoTabs ul li").length + 1; i++) {
                editors[i].refresh();
            }
        }, 10);
        return false;
    });

    if ($("#adminToggle").length != 0) {
        $("#adminToggle").click(
            function(event) {
                if (pretendStudent == true) {
                    alert("You are now in the admin view, meaning you can see Test Mode" +
                        " problems. Click here again to toggle back to student view.")
                    pretendStudent = false;
                } else {
                    alert(
                        "You are now in the student view, meaning you cannot see Test Mode" +
                        " problems. Click here again to toggle back to admin view.")
                    pretendStudent = true;
                }
                foldersReload();
            }
        );


        gatherStudentCode();  //Jorge edit end
        gatherSuperUserCode();

    }

//    gatherStudentCode();  //Jorge edit end
    //              gatherSuperUserCode();


};


