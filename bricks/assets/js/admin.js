//Color submission status boxes
function correct() {
  return $("<span class='glyphicon glyphicon-ok'></span>")
    .css("color", "green")
    .css("margin-right", "5px");
}

function wrong() {
  return $("<span class='glyphicon glyphicon-remove'></span>")
    .css("color", "red")
    .css("margin-right", "5px");
}

function exclam() {
  return $("<span class='glyphicon glyphicon-exclamation-sign'></span>")
    .css("color", "red")
    .css("margin-right", "5px");
}

function refresh() {
  return $('<span clas©s="glyphicon glyphicon-refresh spin" />');
}

function scoreBadge(a, b) {
  var check;
  if (a >= b) {
    check = correct();
  } else {
    check = wrong();
  }
  var badge = $("<span class='badge'></span>").append(a + "/" + b);
  return $("<span></span>").append(badge).append(check);
}

function isNull(item) {
  if (item == null || item == "null" || item == "" || item == '') {
    return true;
  } else {
    return false;
  }
}

function fillProblemEdit(problem) {
  $("#editForm").removeClass("hidden");
  $("#editQuestionpanel").removeClass("hidden");
  $("#deleteProblem").removeClass("hidden");
  $("#editPlaceholder").addClass("hidden");
  $(".problemDeleted").addClass("hidden");
  $("#editType").val(problem.type);
  $("#editPhase").val(problem.phase);
  $("#editProblemName").val(problem.name);
  $("#editFolderDropdown").val(problem.folder);
  $("#editLanguageDropdown").val(problem.language);
  if (problem.testMode == true) {
    $("#editModeDropdown").val("true");
  } else {
    $("#editModeDropdown").val("false");
  }
  if (isNull(problem.maxSubmissions)) {
    $("#editMaxSubmissions").prop("checked", false);
    $("#editSubmissionLimit").val("");
    $("#editSubmissionLimit").attr("disabled", "disabled");
  } else {
    $("#editMaxSubmissions").prop("checked", true);
    $("#editSubmissionLimit").val(problem.maxSubmissions);
    $("#editSubmissionLimit").removeAttr("disabled");
  }
  $("#editVideoURL").val(problem.vidURL); // pds video
  $("#editDescription").val(problem.text);
  $("#editStylePoints").val(problem.value.style),
    $("#editCorrectPoints").val(problem.value.correct),
    $("#editOnSubmit").val(problem.onSubmit);
  $("#deleteProblem").removeClass("hidden");
  $("#deleteProblem").unbind().click(function() {
    if (confirm('Are you sure you wish to delete the problem ' + problem.name +
        '?')) {
      deleteProblem(problem);
    }
  });
  fillProblemAdd(problem);
}

function fillProblemAdd(problem) {
  $("#type").val(problem.type);
  $("#phase").val(problem.phase);
  $("#problemName").val("{ " + (problem.name).toUpperCase() + " COPY }");
  $("#folderDropdown").val(problem.folder);
  $("#languageDropdown").val(problem.language);
  if (problem.testMode == true) {
    $("#modeDropdown").val("true");
  } else {
    $("#modeDropdown").val("false");
  }
  if (isNull(problem.maxSubmissions)) {
    $("#maxSubmissions").prop("checked", false);
    $("#submissionLimit").val("");
    $("#submissionLimit").attr("disabled", "disabled");
  } else {
    $("#maxSubmissions").prop("checked", true);
    $("#submissionLimit").val(problem.maxSubmissions);
    $("#submissionLimit").removeAttr("disabled");
  }
  $("#videoURL").val(problem.vidURL); // pds video
  $("#description").val(problem.text);
  $("#stylePoints").val(problem.value.style);
  $("#correctPoints").val(problem.value.correct);
  $("#onSubmit").val(problem.onSubmit);
}

function fillProblemDisplay(problem) {
  $(".displayProblem").removeClass("hidden");
  $("#pointbreakdown").removeClass("hidden");
  $("#problemDisplayName").empty().append(problem.name);
  $.post("/folder/read/", {
    id: problem.folder
  }, function(folder) {
    $("#problemDisplayName").html("<b>" + problem.name +
      "</b><i>&nbsp; in folder&nbsp;<b> " + folder.name + "</b></i>");
  });
  $("#problemDisplayBody").empty().append(problem.text);
  $("#availablePtStyle").empty().append(problem.value.style);
  $("#availablePtCorrect").empty().append(problem.value.correct);
  if (isNull(problem.maxSubmissions)) {
    $("#submissionLimitDisplay").addClass("hidden");
  } else {
    $("#submissionLimitDisplay").removeClass("hidden");
    $("#maxSubmissionLimit").empty().append(problem.maxSubmissions);
  }
}

function deleteProblem(problem) {
  $("#deleteProblem").addClass("hidden");
  $(".problemDeleted").removeClass('hidden');

  var problemPoints = parseFloat(problem.value.correct) + parseFloat(problem.value
    .style);
  var toDelete = problem;

  $.post("/problem/delete", {
    id: problem.id
  }, function(problem) {
    //need reorder to ensure problem numbering remains consecutive
    $.post("/problem/reorder", {
      folder: toDelete.folder
    }, function() {
      //change interface if necessary
      if (curProblem) {
        if (toDelete.id == curProblem.id) {
          $("#editForm").addClass("hidden");
          $("#editPlaceholder").removeClass("hidden");
          $("#problemDisplayName").empty().append("Choose a Problem");
          $("#problemDisplayBody").empty().append(
            "Select a problem from the left to view more information."
          );
          $("#pointbreakdown").addClass("hidden");
          $("#matrixBody").empty();
          $("#allStudents1ProblemTable").empty();
          $("#pbp-green").css("width", "0%");
          $("#pbp-yellow").css("width", "0%");
          curProblem == null;
        }
      }
      //update total available points if necessary
      if (toDelete.phase != 2 && Boolean(toDelete.testMode) == false) {
        var totalPoints = parseFloat(points) - parseFloat(problemPoints);
        $.post("/setting/update/", {
          name: "points",
          value: totalPoints
        }, function(setting) {
          points = totalPoints;
          $(".problemDeleted").addClass('hidden');
          loadSingleFolderSidebarSortable(toDelete.folder);
          loadSingleFolderSidebarNavigable(toDelete.folder);
        });
      } else {
        $(".problemDeleted").addClass('hidden');
        loadSingleFolderSidebarSortable(toDelete.folder);
        loadSingleFolderSidebarNavigable(toDelete.folder);
      }
    });
  });
}

function feedbackRequestButton(submission, username, problem) {
  //little icon for the matrix
  var button
  button = $("<a></a>")
    .attr("id", "feedbackPlease" + submission.id)
    .attr("href", "#submission")
    .attr("data-toggle", "pill") //save
    .css("color", "#627E86")
    .attr("class", "")
    .css("padding-left", "4px;")
    .html(
      '<span><span class="glyphicon glyphicon-exclamation-sign"  data-toggle="tooltip" ' +
      'data-placement="top" title="Feedback Request"></span>'
    ) // the trailing space is important!
    .click(function(event) {
      $("#matrixLink").removeClass("active");
      event.preventDefault();
      $.post("/user/read", {
        onyen: username
      }, function(user) {
        if (user) {
          getSubmission(submission, user, problem);
        } else {
          alert("error! user not found");
        }
      });
    });
  return button;
}

function shareButton(submission, username, problem) {
  //little icon for the matrix
  var button = $("<a></a>")
    .attr("data-toggle", "modal") //save
    .attr("data-target", "#shareSubmissionModal") //save
    .attr("id", "shareMe" + submission.id)
    .css("color", "#627E86")
    .attr("class", "")
    .css("padding-left", "4px;")
    .css("cursor", "pointer")
    .html(
      '<span><span class="glyphicon glyphicon-share" data-toggle="tooltip" ' +
      'data-placement="top" title="Share Request"></span>')
    .click(function(event) {
      event.preventDefault();
      fillShareSubmissionModal(submission, username, problem);
    });
  return button;
}

function getStudentResults(problem) {
  //creates matrix and student results table
  numfunct = 0;
  numstyle = 0;
  numattempted = 0;
  numearned = 0;
  $("#matrixBody").empty();
  var tbl = $(
    "<table class='table' style='margin-bottom:0px;'><thead><tr><th>Name</th><th class='probStudentSubmissionTableTD' width='40px'>Functionality</th><th class='probStudentSubmissionTableTD' width='40px'>Style Points</th></tr></thead><tbody id='allStudents1ProblemResults'></tbody></table>"
  );
  $("#allStudents1ProblemTable").empty().append(tbl);
  $.post("/user/read/", {}, function(users) {
    total = users.length;
    users.forEach(function(user) {
      var matrixSquare = $("<div></div>")
        .attr('class', 'matrixSquare alert alert-danger')
        .attr('id', 'matrix' + user.username);

      var matrixSquarehover = $("<div></div>")
        .attr('class', 'matrixSquareHover')
        .attr('id', 'matrixHover' + user.username)
        .attr('data-iconcount', 0);

      var userButton = $(
          "<a href='#individualStudent' data-toggle='pill' ></a>")
        .css("color", "#627E86")
        .css("padding-left", "4px;")
        .attr("class", "")
        .html(
          "<span><span class='glyphicon glyphicon-user' data-toggle='tooltip' data-placement='top' title='View User' ></span>"
        ) // the trailing space is important!
        .click(function() {
          $("#matrixLink").removeClass("active");
          event.preventDefault();
          $.post("/user/read/" + user.id, {}, function(user) {
            if (!user) {
              alert("No user with that id found");
              return;
            }
            getIndividual(user, false);
          });
        });
      $('[data-toggle="tooltip"]').tooltip();

      matrixSquarehover.append(userButton);
      matrixSquare.append(user.username);
      matrixSquare.append("<br />");
      matrixSquare.append(matrixSquarehover);

      $("#matrixBody").append(matrixSquare);
      $('#matrix' + user.username).mouseover(function() {
        $('#matrixHover' + user.username).css('visibility',
          'visible');
      });
      $('#matrix' + user.username).mouseout(function() {
        $('#matrixHover' + user.username).css('visibility',
          'hidden');
      });

      var rsectionF = $("<td>").attr("class",
        "probStudentSubmissionTableTD");
      var rsectionS = $("<td>").attr("class",
        "probStudentSubmissionTableTD");

      var results = {
        tried: false,
        correct: false,
        style: false,
        feedbackRequested: false,
        shareOK: false,
        shareRequested: false
      };
      $.post("/submission/read/" + problem.id, {
        id: problem.id,
        student: user.username
      }, function(submissions) {
        var student = $("<tr></tr>");
        var userButton = $(
            "<a href='#individualStudent' data-toggle='pill' ></a>"
          )
          .css("color", "#627E86")
          .css("padding-left", "4px;")
          .attr("class", "")
          .html(
            "<span><span class='glyphicon glyphicon-user' data-toggle='tooltip' data-placement='top' title='View User' ></span>"
          ) // the trailing space is important!
          .click(function() {
            $("#matrixLink").removeClass("active");
            event.preventDefault();
            $.post("/user/read/" + user.id, {}, function(user) {
              if (!user) {
                alert("No user with that id found");
                return;
              }
              getIndividual(user, false);
            });
          });
        $('[data-toggle="tooltip"]').tooltip();


        if (submissions.length == 0) {
          var a = $("<td></td>")
            .css("text-align", "left")
            .append(userButton)
            .append(" " + user.displayName + " (0)</a>");
          student.append(a);
        } else {
          var myVariable = $("<td>").attr("class",
            "probStudentSubmissionTableTD");

          var collapseLink = $("<a></a>").append(" " + user.displayName +
              " (" + submissions.length + ")")
            .click(function(event) {
              if ($(".submissionUser" + user.username).hasClass(
                  "hidden")) {
                $(".submissionUser" + user.username).removeClass(
                  'hidden');
              } else {
                $(".submissionUser" + user.username).addClass(
                  'hidden');
              }
            });
          var a = $("<td></td>")
            .css("text-align", "left")
            .append(userButton)
            .append(collapseLink);
          student.append(a);

          myVariable.append(a);
          student.append(myVariable);

          results.tried = true;
          submissions.forEach(function(submission) {
            if (feedbackOn) {
              if (submission.fbRequested == true && submission.fbResponseTime ==
                null) {
                results.feedbackRequested = true;
                $("#matrixHover" + user.username).append(
                  feedbackRequestButton(submission, user.username,
                    problem));
                $('[data-toggle="tooltip"]').tooltip()
                var iconCount = $("#matrixHover" + user.username)
                  .attr("data-iconcount");
                iconCount = parseInt(iconCount);
                iconCount++;
                $("#matrixHover" + user.username).attr(
                  "data-iconcount", iconCount);
              }
            }
            if (shareOn) {
              if (submission.shareOK && submission.shared !=
                true) {
                results.shareRequested = true;
                $("#matrixHover" + user.username).append(
                  shareButton(submission, user.username,
                    problem));
                $('[data-toggle="tooltip"]').tooltip()
                var iconCount = $("#matrixHover" + user.username)
                  .attr("data-iconcount");
                iconCount = parseInt(iconCount);
                iconCount++;
                $("#matrixHover" + user.username).attr(
                  "data-iconcount", iconCount);
              }
            }

            if (submission.value.correct >= problem.value.correct &&
              submission.value.style >= problem.value.style) {
              results.correct = true;
              results.style = true;
              return true;
            } else if (submission.value.correct >= problem.value
              .correct && submission.value.style != problem.value
              .style) {
              results.correct = true;
            }

          });
        }

        if (results.feedbackRequested == true || results.shareRequested ==
          true) {
          $("#matrix" + user.username).addClass("blink");
        }
        if (results.tried) {
          numattempted++;
          $("#matrix" + user.username).removeClass("alert-danger").addClass(
            "alert-warning");

          if (results.correct) {
            numfunct++;
            rsectionF.append(correct("8px"));
          } else {
            rsectionF.append(wrong("8px"));
          }
          if (results.style) {
            numstyle++;
            rsectionS.append(correct("8px"));
          } else {
            rsectionS.append(wrong("8px"));
          }
          if (results.correct && results.style) {
            numearned++;
            $("#matrix" + user.username).removeClass(
              "alert-warning").addClass("alert-success");
          }
        }

        var myRows = [];
        submissions.forEach(function(submission) {
          var width = $("#allStudents1ProblemTable").width();
          var submissionRow = $(
              "<tr class='hidden submissionUser" + user.username +
              "'>")
            .css('background-color', '#ECECEC');
          var d = new Date(submission.createdAt);
          var a = $("<a></a>")
            .attr("href", "#submission")
            .attr("data-toggle", "pill") //save
            .html(d.toLocaleString())
            .click(function(event) {
              event.preventDefault();
              getSubmission(submission, user, problem);
            });
          submissionRow.append($(
            "<td class='probStudentSubmissionTableTD'></td>"
          ).append(a));
          var iconF = submission.value.correct >= problem.value
            .correct ? correct("8px") : wrong("8px");
          var iconS = submission.value.style >= problem.value.style ?
            correct("8px") : wrong("8px");
          submissionRow.append($(
            "<td class='probStudentSubmissionTableTD'></td>"
          ).append(scoreBadge(submission.value.correct,
            problem.value.correct)));
          submissionRow.append($(
            "<td class='probStudentSubmissionTableTD'></td>"
          ).append(scoreBadge(submission.value.style,
            problem.value.style)));
          myRows.push(submissionRow);
        });

        student.append(rsectionF);
        student.append(rsectionS);
        $("#allStudents1ProblemResults").append(student);
        for (var index = 0; index < myRows.length; index++) {
          $("#allStudents1ProblemResults").append(myRows[index]);
        }

        //update progress labels
        $("#answeredCorrect").empty().append(Math.floor((numearned /
          numattempted) * 100) + "%");
        $("#function").empty().append(Math.floor((numfunct / total) *
          100) + "%");
        $("#style").empty().append(Math.floor((numstyle / total) *
          100) + "%");
        $("#pbp-yellow").css("width", Math.floor(((numattempted -
          numearned) / total) * 100) + "%");
        $("#pbp-green").css("width", Math.floor((numearned / total) *
          100) + "%");
      });
    });
  });
}

function updateStudentResults(problem, seconds) {
  //gets submissions updated within the last *seconds* seconds
  //updates matrix to reflect any changes
  $.post("/submission/read/" + problem.id, {
    id: problem.id,
    mostRecent: seconds
  }, function(submissions) {
    submissions.forEach(function(submission) {
      if (!$("#matrix" + submission.user).hasClass("alert-success")) {
        var submissionValue = parseFloat(parseFloat(submission.value.correct) +
          parseFloat(submission.value.style));
        var problemValue = parseFloat(parseFloat(problem.value.correct) +
          parseFloat(problem.value.style));
        if (submissionValue < problemValue) {
          $("#matrix" + submission.user).removeClass("alert-danger");
          $("#matrix" + submission.user).addClass("alert-warning");
        } else {
          $("#matrix" + submission.user).removeClass("alert-warning");
          $("#matrix" + submission.user).removeClass("alert-danger");
          $("#matrix" + submission.user).addClass("alert-success");
        }
      }
      if (feedbackOn) {
        if (submission.fbRequested == true && submission.fbResponseTime ==
          null) {
          if (!$("#feedbackPlease" + submission.id).length) {
            $("#matrix" + submission.user).addClass("blink");
            $("#matrixHover" + submission.user).append(
              feedbackRequestButton(submission, submission.user,
                problem));
            $('[data-toggle="tooltip"]').tooltip()
            var iconCount = $("#matrixHover" + submission.user).attr(
              "data-iconcount");
            iconCount = parseInt(iconCount);
            iconCount++;
            $("#matrixHover" + submission.user).attr("data-iconcount",
              iconCount);
          }
        }
      }
      if (shareOn) {
        if (submission.shareOK && submission.shared != true) {
          if (!$("#shareMe" + submission.id).length) {
            $("#matrix" + submission.user).addClass("blink");
            $("#matrixHover" + submission.user).append(shareButton(
              submission, submission.user, problem));
            $('[data-toggle="tooltip"]').tooltip()
            var iconCount = $("#matrixHover" + submission.user).attr(
              "data-iconcount");
            iconCount = parseInt(iconCount);
            iconCount++;
            $("#matrixHover" + submission.user).attr("data-iconcount",
              iconCount);
          }
        }
      }
    });
  });
}

function updateProblemProgressBar() {
  //updates the progress bar in the students attempts table on problem display view
  if (curProblem == null) {
    return;
  }
  problem = curProblem;
  numfunct = 0;
  numstyle = 0;
  numattempted = 0;
  numearned = 0;

  $.post("/user/read/", {}, function(users) {
    users.forEach(function(user) {
      var results = {
        tried: false,
        correct: false,
        style: false
      };
      $.post("/submission/read/" + problem.id, {
        id: problem.id,
        student: user.username
      }, function(submissions) {
        if (submissions.length == 0) {} else {
          results.tried = true;
          submissions.forEach(function(submission) {
            if (submission.value.correct >= problem.value.correct &&
              submission.value.style >= problem.value.style) {
              results.correct = true;
              results.style = true;
              return true;
            } else if (submission.value.correct >= problem.value
              .correct && submission.value.style != problem.value
              .style) {
              results.correct = true;
            }
          });
        }
        if (results.tried) {
          numattempted++;

          if (results.correct) {
            numfunct++;
          }
          if (results.style) {
            numstyle++;
          }
          if (results.correct && results.style) {
            numearned++;
          }
        }
        //update progress labels
        $("#answeredCorrect").empty().append(Math.floor((numearned /
          numattempted) * 100) + "%");
        $("#function").empty().append(Math.floor((numfunct / total) *
          100) + "%");
        $("#style").empty().append(Math.floor((numstyle / total) *
          100) + "%");
        $("#pbp-yellow").css("width", Math.floor(((numattempted -
          numearned) / total) * 100) + "%");
        $("#pbp-green").css("width", Math.floor((numearned / total) *
          100) + "%");
      });
    });
  });
}

function fillShareSubmissionModal(submission, username, problem) {
  var d = new Date(submission.createdAt);
  $("#subModal").empty().append(username + " on " + d.toLocaleString());
  modalEditor.setValue(submission.code);
  //weird trick to make sure the codemirror box refreshes
  var that = this;
  setTimeout(function() {
    that.modalEditor.refresh();
  }, 10);
  var button = $("<a></a>")
    .attr("href", "project?subId=" + submission.id)
    .attr("target", "_blank")
    .attr("type", "button")
    .addClass("btn btn-success ")
    .text("Project").click(function(event) {});
  $("#projectSubmissionButton").empty().append(button);

  var button = $("<a></a>")
    .attr("href", "project?subId=" + submission.id)
    .attr("target", "_blank")
    .attr("data-dismiss", "modal")
    .addClass("btn btn-danger ")
    .text("Dismiss").click(function(event) {
      $.post("/submission/update", {
        id: submission.id,
        shared: true
      }, function(submission) {
        $("#shareMe" + submission.id).remove();
        var iconCount = $("#matrixHover" + username).attr(
          "data-iconcount");
        iconCount = parseInt(iconCount);
        iconCount--;
        $("#matrixHover" + username).attr("data-iconcount", iconCount);
        if (iconCount == 0) {
          $("#matrix" + username).removeClass("blink");
        }
      });
    });
  $("#dimissShareButton").empty().append(button);
}

function getCompletedFeedbackDash() {
  if (curCompletedFeedback != null) {
    fillCompletedFeedbackDash(curCompletedFeedback);
  }

  //adjust height of list div
  if ($("#fbDashBodyC").height() > 0) {
    var max = Math.max(parseInt($(window).height() - 65), $("#fbDashBodyC").height());
  } else {
    var max = parseInt($(window).height() - 65);
  }
  $("#archiveFeedbackList").css("height", max);

  //Generate completed feedback dash
  $("#feedbackDashC").empty();
  $.post("/submission/read/", {
    feedbackResponded: true
  }, function(submissions) {
    $("#fbArchiveSubmissionTH").empty().append("Submitted(" + submissions.length +
      ")");
    submissions.forEach(function(submission) {
      $.post("/problem/read", {
        id: submission.problem
      }, function(problem) {
        if (problem) {
          var row = $("<tr></tr>");
          var time = submission.createdAt;
          if (time != null) {
            time = new Date(submission.createdAt).toLocaleString();
          }
          var a = $("<a></a>")
            .html(time)
            .click(function(event) {
              curCompletedFeedback = submission;
              fillCompletedFeedbackDash(submission);
              $("#fbDashBodyC").removeClass("hidden");
            });
          row.append($("<td></td>").append(a));
          row.append($("<td></td>").append(submission.fbResponder));
          row.append($("<td></td>").append(submission.user));
          row.append($("<td></td>").append(problem.name));
          row.append($("<td></td>").append(scoreBadge(submission.value
            .correct, problem.value.correct)));
          row.append($("<td></td>").append(scoreBadge(submission.value
            .style, problem.value.style)));

          $("#feedbackDashC").append(row);
        }
      });
    });
  });
}

function fillCompletedFeedbackDash(submission) {
  if (submission.fbRequestTime) {
    $("#completedFeedbackRequest").removeClass("hidden");
    var time = submission.fbRequestTime;
    if (time != null) {
      time = new Date(submission.fbRequestTime).toLocaleString();
    }
    $.post("/user/read", {
      onyen: submission.user
    }, function(user) {
      if (user) {
        $("#feedbackRequestTimeC").empty().append("<b> Request from " +
          user.displayName + " at " + time + "</b>");
      }
    });
    if (submission.fbRequestMsg == "" || submission.fbRequestMsg == null) {
      $("#fbRequestMsgC").empty().append("No message");
    } else {
      $("#fbRequestMsgC").empty().append('"' + submission.fbRequestMsg + '"');
    }
  } else {
    $("#completedFeedbackRequest").addClass("hidden");
  }

  var responseTime = submission.fbResponseTime;
  if (responseTime != null) {
    responseTime = new Date(submission.fbResponseTime).toLocaleString();
  }
  $.post("/user/read", {
    onyen: submission.fbResponder
  }, function(user) {
    if (user) {
      $("#feedbackResponseTimeC").empty().append("<b> Response from " +
        user.displayName + " at " + responseTime + "</b>");
    }
  });
  $("#fbResponseMsgC").empty().append('"' + submission.fbResponseMsg + '"');

  $.post("/problem/read", {
    id: submission.problem
  }, function(problem) {
    if (problem) {
      $("#desc-bodyC").empty().append(problem.text);
      $("#desc-titleC").empty().append(problem.name);
    }
  });

  $("#fbDashConsoleC").empty().append(submission.message);
  completedFeedbackEditor.setValue(submission.fbCode);
  var that = this;
  setTimeout(function() {
    that.completedFeedbackEditor.refresh();
  }, 1);

}

function getFeedbackDash() {
  if (curFeedback != null) {
    fillFeedbackDash(curFeedback);
  }

  //Generate feedback dash
  $("#feedbackDash").empty();
  $.post("/submission/read/", {
    feedback: true
  }, function(submissions) {
    submissions.forEach(function(submission) {
      $.post("/problem/read", {
        id: submission.problem
      }, function(problem) {
        if (problem) {
          var row = $("<tr></tr>");
          var time = submission.fbRequestTime;
          if (time != null) {
            time = new Date(submission.fbRequestTime).toLocaleString();
          }
          var a = $("<a></a>")
            .html(time)
            .click(function(event) {
              curFeedback = submission;
              getFeedbackDash();
              $("#fbDashBody").removeClass("hidden");
            });
          if (curFeedback != null) {
            if (curFeedback.id == submission.id) {
              row.append($("<td></td>").append(time));
            } else {
              row.append($("<td></td>").append(a));
            }
          } else {
            row.append($("<td></td>").append(a));
          }

          row.append($("<td></td>").append(submission.user));
          row.append($("<td></td>").append(problem.name));
          row.append($("<td></td>").append(scoreBadge(submission.value
            .correct, problem.value.correct)));
          row.append($("<td></td>").append(scoreBadge(submission.value
            .style, problem.value.style)));

          $("#feedbackDash").append(row);
        }
      });
    });
  });
};

function fillFeedbackDash(submission) {
  var time = submission.fbRequestTime;
  if (time != null) {
    time = new Date(submission.fbRequestTime).toLocaleString();
  }

  $.post("/user/read", {
    onyen: submission.user
  }, function(user) {
    if (user) {
      $("#fbDashRequester").empty().append("<b> by " + user.displayName +
        "</b>");
    }
  });

  $.post("/problem/read", {
    id: submission.problem
  }, function(problem) {
    if (problem) {
      $("#desc-body").empty().append(problem.text);
      $("#desc-title").empty().append(problem.name);
    }
  });

  $("#fbDashRequestTime").empty().append("<b>Request made at " + time + "</b>");

  $("#fbDashConsole").empty().append(submission.message);
  feedbackEditor.setValue(submission.code);
  var that = this;
  setTimeout(function() {
    that.feedbackEditor.refresh();
  }, 1);

  if (submission.message == "" || submission.message == null) {
    $("#fbDashRequestMsg").empty().append("No message");
  } else {
    $("#fbDashRequestMsg").empty().append('"' + submission.fbRequestMsg + '"');
  }
}

function getStudentList() {
  //Generate list of all students to view individuals
  $("#viewStudentsList").empty();
  var tbl = $("<table class='table' id='viewStudentsTable'></table>");
  var csv = "onyen%2Cgrade";

  $("#viewStudentsList").append(tbl);
  $.post("/user/read/", {}, function(users) {
    total = users.length;
    var student = $("<tr></tr>");
    var count = 0;
    users.forEach(function(user) {
      var badge = $("<span id='studentListBadge" + user.username +
        "' class='badge'></span>").append(user.currentScore + "/" +
        points);
      var link = $("<a></a>")
        .attr("href", "#individualStudent")
        .attr("data-toggle", "pill")
        .append(user.displayName + "<br /><i>(" + user.username +
          ")</i><br />")
        .append(badge)
        .click(function(event) {
          $("#studentsLink").removeClass("active");
        });
      csv = csv + "%0A" + user.username + "," + user.currentScore;
      var a = $("<td></td>")
        .append(link)
        .click(function(event) {
          event.preventDefault();
          $.post("/user/read/" + user.id, {}, function(user) {
            if (!user) {
              alert("No user with that id found");
              return;
            }
            getIndividual(user, false);
          });
        });
      student.append(a);
      count++;
      if (count > 5) {
        $("#viewStudentsTable").append(student);
        student = $("<tr></tr>");
        count = 0;
      }
    });
    $("#exportCSV").click(function(event) {
      window.location.href = 'data:application/octet-stream,' + csv;
    });
    $("#viewStudentsTable").append(student);
  });
}

function getSubmission(submission, user, problem) {
  //Generate page for particular submission
  curSubmission = submission;
  var currentId = submission.id;

  //FILLING iN TOP PANEL
  var d = new Date(submission.createdAt);
  $("#submissionCreatedAt").html(d.toLocaleString());
  var studentLink = $("<a></>")
    .attr("href", "#individualStudent")
    .attr("data-toggle", "pill")
    .html(user.displayName)
    .click(function(event) {
      event.preventDefault();
      $.post("/user/read/" + user.id, {}, function(user) {
        if (!user) {
          alert("No user with that id found");
          return;
        }
        getIndividual(user, false);
      });
    });
  $("#submissionCreatedBy").empty().append(studentLink);

  var problemLink = $("<a></>")
    .attr("href", "#matrix")
    .attr("data-toggle", "pill")
    .html(problem.name)
    .click(function(event) {
      event.preventDefault();
      curProblem = problem;
      $("#moveMe").detach().appendTo('#moveMatrix');
      fillProblemEdit(curProblem);
      fillProblemDisplay(curProblem);
      getStudentResults(curProblem);

    });
  $("#submissionProblem").empty().append(problemLink);
  $("#relatedSubmissions").empty();
  $("#SearnedPtCorrect").html(submission.value.correct);
  $("#SavailablePtCorrect").html(problem.value.correct);
  $("#SearnedPtStyle").html(submission.value.style);
  $("#SavailablePtStyle").html(problem.value.style);
  if (submission.value.correct >= problem.value.correct) {
    $("#ScorrectCheck").empty().append(correct("8px"));
  } else {
    $("#ScorrectCheck").empty().append(wrong("8px"));
  }
  if (submission.value.style >= problem.value.style) {
    $("#SstyleCheck").empty().append(correct("8px"));
  } else {
    $("#SstyleCheck").empty().append(wrong("8px"));
  }

  $("#submissionTitle").html(problem.name);
  $.post("/folder/read/", {
    id: problem.folder
  }, function(folder) {
    $("#submissionTitle").html(problem.name + "<i> in " + folder.name +
      "</i>");
  });

  if (submission.shareOK == true) {
    var button = $("<a></a>")
      .attr("href", "project?subId=" + submission.id)
      .attr("target", "_blank")
      .attr("type", "button")
      .addClass("btn btn-primary ")
      .text("Project code in new window");

    $('#submissionProject').empty().append(button);
  } else {
    var button = $("<a></a>")
      .attr("href", "project?subId=" + submission.id)
      .attr("target", "_blank")
      .attr("type", "button")
      .attr("disabled", "disabled")
      .addClass("btn btn-primary ")
      .text("Project code (requires student permission)");

    $('#submissionProject').empty().append(button);
  }

  editor.setValue(submission.code);
  //weird trick to make sure the codemirror box refreshes
  var that = this;
  setTimeout(function() {
    that.editor.refresh();
  }, 1);

  //FILLING IN FEEDBACK PANEL
  if (feedbackOn == true) {
    fillSubmissionFeedback(submission, user);
  }

  $.post("/submission/read/", {
    id: problem.id,
    student: user.username
  }, function(submissions) {
    $("#relatedSubmissionHead").empty();

    $("#relatedSubmissionHead").append("<td>Time of Submission</td>");
    $("#relatedSubmissionHead").append("<td>Functionality</td>");
    $("#relatedSubmissionHead").append("<td>Style</td>");
    if (feedbackOn == true) {
      $("#relatedSubmissionHead").append("<td>Feedback</td>");
    }

    submissions.forEach(function(submission) {
      var d = new Date(submission.createdAt);
      var row = $("<tr></tr>")

      if (currentId == submission.id) {
        var a = $("<td></td>")
          .html(d.toLocaleString())
          .click(function(event) {
            event.preventDefault();
            getSubmission(submission, user, problem);
          });
      } else {
        var a = $("<td></td>")
          .html("<a href='#submission' data-toggle='pill'>" + d.toLocaleString() +
            '</a>')
          .click(function(event) {
            event.preventDefault();
            getSubmission(submission, user, problem);
          });
      }
      if (currentId == submission.id) {
        var d = $("<td id='activeSubmission' ></td>");
        var b = $("<td id='activeSubmissionScoreF'></td>").append(
          scoreBadge(submission.value.correct, problem.value.correct)
        );
        var c = $("<td id='activeSubmissionScoreS'></td>").append(
          scoreBadge(submission.value.style, problem.value.style));
      } else {
        var d = $("<td></td>");
        var b = $("<td></td>").append(scoreBadge(submission.value.correct,
          problem.value.correct));
        var c = $("<td></td>").append(scoreBadge(submission.value.style,
          problem.value.style));
      }
      row.append(a);
      row.append(b);
      row.append(c);

      if (feedbackOn == true) {
        if (submission.fbRequested) {
          d.append(
            "<span class='glyphicon glyphicon-exclamation-sign' style='color:red;''></span>"
          );
        }
        if (submission.fbResponseTime) {
          d.empty().append(
            "<span class='glyphicon glyphicon-ok' style='color:green;''></span>"
          );
        }
        row.append(d);
      }
      $("#relatedSubmissions").append(row);
    });
  });
  setTimeout(editor.refresh(), 0);
}

function fillSubmissionFeedback(submission, user) {
  if (user != null) {
    if (submission.fbRequested) {
      //Request Message
      var message = submission.fbRequestMsg;
      $(".fbRequestMsg").empty().append(message);
      if (message == null || message == "") {
        $(".fbRequestMsg").addClass("hidden");
      } else {
        $(".fbRequestMsg").removeClass("hidden");
      }
      //Request Time
      var time = submission.fbRequestTime;
      if (time != null) {
        time = new Date(submission.fbRequestTime).toLocaleString();
      }
      $(".feedbackRequestTime").empty().append("<b>" + user.displayName +
        "</b> requested feedback on <b>" + time + "</b>");
    }
  } else {
    $("#activeSubmission").empty().append(correct());
  }

  if (submission.fbResponseTime == null) { //No feedback given yet
    $("#submissionTabMenu").addClass("hidden");
    $("#submissionTabFeedback").removeClass("active");
    $("#submissionTabSubmission").addClass("active");
    $("#feedbackTab").removeClass("active");
    $("#submissionTab").addClass("active");

    if (submission.fbRequested) {
      $("#feedbackRequestAlertSubTab").removeClass("hidden");
    } else {
      $("#feedbackRequestAlertSubTab").addClass("hidden");
    }
    $("#readOnlySubmission").addClass("hidden");
    $("#feedbackSubmitDiv").removeClass("hidden");
    $('#fbConsole').val(submission.message);
    var eachLine = submission.message.split('\n');
    $('#fbConsole').attr("rows", eachLine.length);

    $('#fbResponseMessage').empty();
    fbEditor.setValue(submission.code);
    //weird trick to make sure the codemirror box refreshes
    var that = this;
    setTimeout(function() {
      that.fbEditor.refresh();
    }, 1);
  } else { //Feedback has been given
    $("#submissionTabMenu").removeClass("hidden");
    $("#submissionTabFeedback").addClass("active");
    $("#submissionTabSubmission").removeClass("active");
    $("#feedbackTab").addClass("active");
    $("#submissionTab").removeClass("active");

    $("#feedbackRequestAlertSubTab").addClass("hidden");
    if (submission.fbRequested) {
      $("#feedbackRequestAlertFbTab").removeClass("hidden");
    } else {
      $("#feedbackRequestAlertFbTab").addClass("hidden");
    }
    $("#submissionTabMenu").removeClass("hidden");
    $("#feedbackSubmitDiv").addClass("hidden");
    $("#readOnlySubmission").removeClass("hidden");
    var editorText = "";
    if (submission.fbCode) {
      editorText = submission.fbCode;
    }
    fbEditorReadOnly.setValue(editorText);
    //weird trick to make sure the codemirror box refreshes
    setTimeout(function() {
      fbEditorReadOnly.refresh();
    }, 10);

    time = submission.fbResponseTime;
    if (time != null) {
      time = new Date(submission.fbResponseTime).toLocaleString();
    }
    $("#feedbackResponseTime").empty().append("Feedback from " + time);
    $.post("/user/read", {
      onyen: submission.fbResponder
    }, function(user) {
      if (user) {
        $("#feedbackResponseTime").empty().append("<b>" + user.displayName +
          "</b> provided feedback on <b>" + time + "</ b>");
      }
    });
    $("#fbResponseMsg").empty().append(submission.fbResponseMsg);
    if (submission.fbResponseMsg == null || submission.fbResponseMsg == "") {
      $("#fbResponseMsg").addClass("hidden");
    } else {
      $("#fbResponseMsg").removeClass("hidden");
    }
  }
}


function getIndividual(user, refresh) {
  //Generate page for particular individual student
  //if this student is already loaded and we don't want to refresh don't need to do anything
  if (curStudent == user.id && refresh == false) {
    return;
  }
  curStudent = user.id;

  $("#pbp-yellow").css("width", "0%");
  $("#pbp-green").css("width", "0%");
  $("#pbp-red").css("width", "0%");
  $("#individualProgessBar").removeClass("hidden");
  $("#studentScore").removeClass("hidden");
  $("#individualSubmissionList").empty();
  $("#studentRefresh").attr("disabled", "disabled");
  $("#studentRefreshGlyph").addClass("spin");

  $("#studentScoreButton").unbind('click');
  $('#studentScoreButton').on('click', function() {
    if (confirm(
        "This recalculates the student score just to be sure it's accurate."
      )) {
      $("#studentScoreButton").attr("disabled", "disabled");
      studentScore(user.username);
    }
  });

  $("#individualName").html(user.displayName + " (" + user.username + ")");
  var removeButton = $("<a href='#'></a>")
    .css("color", "#C84747")
    .html('delete')
    .click(function() {
      if (confirm('Are you sure you wish to delete person "' + user.username +
          '"?')) {
        $.post("/user/delete", {
            onyen: user.username
          },
          function(user) {
            alert("User has been removed. " +
              "Please refresh page to see the changes take effect.");
          }
        );
      }
    });
  $("#deleteUser").empty().append(removeButton);
  $("#studentScoreButton").html(user.currentScore + "/" + points);
  $("#feedbackConversation").empty();
  $("#feedbackHeader").addClass("hidden");
  $("#shareRequestCount").empty().append("0");
  $("#feedbackRequestCount").empty().append("0");

  var tooltipGreen = "Problems for which full points were earned";
  var tooltipYellow = "Attempted problems that did not receive full credit";

  $("#individualProgessBar").empty().append(
    '<div class="progress" style="height:33px"><div id="pbgreen" class="progress-bar progress-bar-success" style="width: 0%;" data-toggle="tooltip" data-placement="top" title="' +
    tooltipGreen +
    '"><span class="sr-only">35% Complete (success)</span></div> <div id="pbyellow" class="progress-bar progress-bar-warning progress-bar-striped" style="width: 0%" data-toggle="tooltip" data-placement="top" title="' +
    tooltipYellow +
    '"><span class="sr-only">20% Complete (warning)</span></div><div id="pbred" class="progress-bar progress-bar-danger" style="width: 0%"><span class="sr-only">10% Complete (danger)</span></div></div>'
  );
  //must enable tooltips
  $('[data-toggle="tooltip"]').tooltip()

  $.post("/submission/read/", {
    student: user.username
  }, function(submissions) {
    var totalSubmissionNumber = submissions.length;
    if (totalSubmissionNumber == 0) {
      $("#studentRefresh").removeAttr('disabled');
      $("#studentRefreshGlyph").removeClass("spin");
    }
    var submissionCount = 0;
    $.post("/folder/read", null, function(folders) {
      var totalEarned = 0;
      var totalAttempted = 0;
      var totalShareRequest = 0;
      var totalFeedbackRequest = 0;
      folders.forEach(function(folder) {
        var folderEarned = 0;
        var folderAvailable = 0;
        var toggleLabel =
          '<h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion" href="#Icollapse-' +
          folder.id + '">' + folder.name + '</a></h4>';
        if (feedbackOn) {
          var accordian = "<div id='indivFolder-" + folder.id +
            "' class='panel panel-danger'><div class='panel-heading'>" +
            toggleLabel +
            "</div><div class='panel-collapse collapse' id='Icollapse-" +
            folder.id +
            "'><table class='table' style='margin-bottom:0px;'><thead><tr><th>Problem</th><th>Submissions</th><th>Functionality</th> <th>Style</td> <th>Feedback</th></tr></thead><tbody id='ISL" +
            folder.id + "'> </tbody></table></div></div></div>";
        } else {
          var accordian = "<div id='indivFolder-" + folder.id +
            "' class='panel panel-danger'><div class='panel-heading'>" +
            toggleLabel +
            "</div><div class='panel-collapse collapse' id='Icollapse-" +
            folder.id +
            "'><table class='table' style='margin-bottom:0px;'><thead><tr><th>Problem</th><th>Submissions</th><th>Functionality</th> <th>Style</td></tr></thead><tbody id='ISL" +
            folder.id + "'> </tbody></table></div></div></div>";
        }
        $("#individualSubmissionList").append(accordian);

        $.post("/problem/read", {
          folder: folder.id,
          phase: 2
        }, function(problems) {
          problems.forEach(function(problem) {
            folderAvailable += parseFloat(problem.value.style) +
              parseFloat(problem.value.correct);
          });

          problems.forEach(function(problem) {
            var availableStylePoints = problem.value.style;
            var availableFuncPoints = problem.value.correct;
            var earnedStylePoints = parseFloat(0);
            var earnedFuncPoints = parseFloat(0);
            var attemptedStylePoints = parseFloat(0);
            var attemptedFuncPoints = parseFloat(0);
            var feedbackRequested = false;
            var feedbackGiven = false;
            var problemRow = $("<tr>");
            var problemRowSubmissions = [];
            $.post("/submission/read/", {
              id: problem.id,
              student: user.username
            }, function(submissions) {
              var highestSubmission = {
                correct: 0,
                style: 0
              };
              submissions.forEach(function(submission) {
                submissionCount++;
                if (totalSubmissionNumber ==
                  submissionCount) {
                  $("#studentRefresh").removeAttr(
                    'disabled');
                  $("#studentRefreshGlyph").removeClass(
                    "spin");
                  $("#shareRequestCount").empty().append(
                    totalShareRequest);
                  $("#feedbackRequestCount").empty()
                    .append(totalFeedbackRequest);
                }
                if (submission.fbRequested &&
                  submission.fbResponseTime == null
                ) {
                  $("#feedbackHeader").removeClass(
                    "hidden");
                  feedbackRequested = true;
                  var button = $("<a></a>")
                    .attr("href", "#submission")
                    .css("color", "#953032")
                    .attr("data-toggle", "pill") //save
                    .html(problem.name) // the trailing space is important!
                    .click(function(event) {
                      getSubmission(submission,
                        user, problem);
                    });

                  var panel = $(
                    '<div class="panel panel-danger"></div>'
                  ).append($(
                    '<div class="panel-heading"></div>'
                  ).append(button));
                  if (submission.fbRequestMsg) {
                    panel.append(
                      '<div class="panel-body">' +
                      submission.fbRequestMsg +
                      '</div>');
                  }
                  $("#feedbackConversation").append(
                    panel);
                }
                if (submission.fbResponseTime !=
                  null) {
                  feedbackGiven = true;
                }
                if (submission.fbRequested) {
                  totalFeedbackRequest =
                    totalFeedbackRequest + 1;
                }
                if (submission.shareOK) {
                  totalShareRequest =
                    totalShareRequest + 1;
                }

                var d = new Date(submission.createdAt);
                var a = $("<td></td>")
                  .html(
                    "<a href='#submission' data-toggle='pill'>" +
                    d.toLocaleString() + "</a>")
                  .click(function(event) {
                    event.preventDefault();
                    getSubmission(submission,
                      user, problem);
                  });
                if (submission.value.correct >=
                  problem.value.correct) {
                  var checkF = correct("8px");
                } else {
                  var checkF = wrong("8px");
                }
                if (submission.value.style >=
                  problem.value.style) {
                  var checkS = correct("8px");
                } else {
                  var checkS = wrong("8px");
                }
                var submissionRow = $("<tr>").addClass(
                  "hidden ISLP ISLP" + problem.id
                );
                submissionRow.append($("<td></td>"));
                submissionRow.append(a);
                submissionRow.append($("<td></td>")
                  .append(scoreBadge(submission.value
                    .correct, problem.value.correct
                  )));
                submissionRow.append($("<td></td>")
                  .append(scoreBadge(submission.value
                    .style, problem.value.style
                  )));
                if (feedbackOn) {
                  if (submission.fbRequested ==
                    true && submission.fbResponseTime ==
                    null) {
                    submissionRow.append($(
                      '<td><span class="glyphicon glyphicon-exclamation-sign"></span></td>'
                    ).css("color", "red"));
                  } else if (submission.fbResponseTime !=
                    null) {
                    submissionRow.append($(
                      "<td></td>").append(
                      correct()));
                  } else {
                    submissionRow.append($(
                      "<td></td>"));
                  }
                }
                problemRowSubmissions.push(
                  submissionRow);

                if (parseFloat(submission.value.style) >
                  parseFloat(earnedStylePoints)) {
                  earnedStylePoints = parseFloat(
                    submission.value.style);
                  totalEarned += parseFloat(
                    earnedStylePoints);
                }
                if (parseFloat(submission.value.correct) >
                  parseFloat(earnedFuncPoints)) {
                  earnedFuncPoints = parseFloat(
                    submission.value.correct);
                  totalEarned += parseFloat(
                    earnedFuncPoints);
                }
                if (parseFloat(submission.value.correct) +
                  parseFloat(submission.value.style) >
                  parseFloat(highestSubmission.correct) +
                  parseFloat(highestSubmission.style)
                ) {
                  highestSubmission.correct =
                    parseFloat(submission.value.correct);
                  highestSubmission.style =
                    parseFloat(submission.value.style);
                }
                var percent = parseFloat(
                  totalEarned) / parseFloat(
                  points) * parseInt(100);
                percent = percent + "%";
                $("#pbgreen").css("width", percent);

              });

              if (submissions.length > 0) {
                $("#indivFolder-" + folder.id).removeClass(
                  "panel-danger");
                $("#indivFolder-" + folder.id).addClass(
                  "panel-warning");

                totalAttempted += parseFloat(
                  availableStylePoints) - parseFloat(
                  earnedStylePoints);
                totalAttempted += parseFloat(
                  availableFuncPoints) - parseFloat(
                  earnedFuncPoints);
                if (earnedFuncPoints >=
                  availableFuncPoints) {
                  var checkF = correct("8px");
                } else {
                  var checkF = wrong("8px");
                }
                if (earnedStylePoints >=
                  availableStylePoints) {
                  var checkS = correct("8px");
                } else {
                  var checkS = wrong("8px");
                }
                var a = $("<a></a>")
                  .html(problem.name)
                  .click(function(event) {
                    if ($(".ISLP" + problem.id).hasClass(
                        "hidden")) {
                      $(".ISLP" + problem.id).removeClass(
                        'hidden');
                    } else {
                      $(".ISLP" + problem.id).addClass(
                        'hidden');
                    }
                  });
                problemRow.append($("<td>").append(a));
                problemRow.append($("<td></td>").append(
                  submissions.length));
                problemRow.append($("<td></td>").append(
                  scoreBadge(highestSubmission.correct,
                    availableFuncPoints)));
                problemRow.append($("<td></td>").append(
                  scoreBadge(highestSubmission.style,
                    availableStylePoints)));

                if (feedbackOn) {
                  if (feedbackRequested) {
                    problemRow.append($("<td>").append(
                      exclam()));
                  } else if (feedbackGiven) {
                    problemRow.append($("<td>").append(
                      correct()));
                  } else {
                    problemRow.append($("<td>"));
                  }
                }

                $("#ISL" + folder.id).append(problemRow);
                var index;
                for (index = 0; index <
                  problemRowSubmissions.length; index++
                ) {
                  $("#ISL" + folder.id).append(
                    problemRowSubmissions[index]);
                }

              } else {
                problemRow.append($("<td>").append(
                  problem.name));
                problemRow.append($("<td></td>").append(
                  "0"));
                problemRow.append($("<td>"));
                problemRow.append($("<td>"));
                problemRow.append($("<td>"));
                $("#ISL" + folder.id).append(problemRow);
              }
              if (submissions.length >= 0) {
                $("#ipCount" + problem.id).append(
                  "<div class='left'>" + submissions.length +
                  " submissons</div>");
              }
              var percent = parseFloat(totalAttempted) /
                parseFloat(points) * parseInt(100);
              percent = percent + "%";
              $("#pbyellow").css("width", percent);
              $("#ipPoints" + problem.id).append(
                "<div class='left'>Functionality: " +
                earnedStylePoints + "/" +
                availableStylePoints +
                "</div><div class='left'>Style: " +
                earnedFuncPoints + "/" +
                availableFuncPoints + "</div>")

              //Changing Folder Color
              folderEarned += parseFloat(
                earnedStylePoints) + parseFloat(
                earnedFuncPoints);
              if (folderEarned >= folderAvailable) {
                $("#indivFolder-" + folder.id).removeClass(
                  "panel-warning");
                $("#indivFolder-" + folder.id).addClass(
                  "panel-success");
              }

            });
          });
        });
      });
    });

  });

  $("#studentRefresh").unbind('click');
  $("#studentRefresh").click(function() {
    $.post("/user/read", {
      id: curStudent
    }, function(user) {
      if (!user) {
        alert("error");
      } else {
        getIndividual(user, true);
        $("#studentRefresh").attr("disabled", "disabled");
        $("#studentRefreshGlyph").addClass("spin");
      }
    });
  });
}

function getIndividualNone(onyen) {

  $("#pbp-yellow").css("width", "0%");
  $("#pbp-green").css("width", "0%");
  $("#pbp-red").css("width", "0%");
  $("#individualSubmissionList").empty();
  $("#individualProgessBar").addClass("hidden");
  $("#studentScore").addClass("hidden");

  $("#individualName").html("No user with found with onyen <i>\"" + onyen +
    "\"</i>");
  var heading = $("<h3></h3>");
  var backLink = $("<a></a>")
    .attr("href", "#students")
    .attr("data-toggle", "pill")
    .html("Back to Students List");
  $("#individualSubmissionList").append(heading.append(backLink));

}

function loadNavigableSidebar() {
  $("#navigableFolders").empty(); //in the navigation bar
  $("#folderDropdown").empty(); //in the add question panels
  $("#editFolderDropdown").empty(); //in the edit question panel

  $("#navigableFolders").removeClass("hidden");
  $("#sortableFolders").addClass("hidden");

  $.post("/folder/read", null, function(folders) {
    folders.forEach(function(folder) {
      addFolder(folder); //on navigation sidebar
      loadSingleFolderSidebarNavigable(folder.id);
    });
  });
}

function showNavigableSidebar() {
  $("#navigableFolders").removeClass("hidden");
  $("#sortableFolders").addClass("hidden");
}

function showSortableSidebar() {
  $("#navigableFolders").addClass("hidden");
  $("#sortableFolders").removeClass("hidden");
}

function loadSortableSidebar() {
  $("#sortableFolders").empty();

  $("#navigableFolders").addClass("hidden");
  $("#sortableFolders").removeClass("hidden");

  var addFolder = $('<div></div>')
    .attr("id", "addFolder")
    .append(
      "<div class='input-group'><input type='text' id='newFolder' class='form-control' placeholder='Add folder...'></input><span class='input-group-btn'><button type='submit' id='newFolderBtn' class='btn btn-default'><span class='glyphicon glyphicon-plus' style='color:green;''></span></button></span></div><div id='newFolderError'></div>"
    );
  $("#sortableFolders").empty().append(addFolder);

  $("#newFolderBtn").click(function() {
    $("#newFolderError").empty();
    if ($("#newFolder").val() == "") {
      var noNameError = $(
        "<div class='alert alert-danger' role='alert'>Please enter a folder name</div>"
      );
      $("#newFolderError").append(noNameError);
    } else {
      $.post("/folder/create", {
        name: $("#newFolder").val()
      }, function(folder) {
        $("#newFolder").val("");
        addSortableFolder(folder);
        foldersChanged = true;
        $.post("/folder/reorder", {}, function() {});
      });
    }
  });

  $("#sortableFolders").append('<ul id="sortable" class="panel-default"></ul>');

  $.post("/folder/read", null, function(folders) {
    folders.forEach(function(folder) {
      addSortableFolder(folder); //on sortable sidebar
      loadSingleFolderSidebarSortable(folder.id);
    });
    $("#sortable").sortable({
      handle: ".sortableGrip",
      start: function(e, ui) {
        // creates a temporary attribute on the element with the old index
        $(this).attr('data-previndex', ui.item.index());
      },
      update: function(e, ui) {
        foldersChanged = true;
        var newIndex = ui.item.index();
        var oldIndex = $(this).attr('data-previndex');
        var id = ui.item.attr('id');
        $.post("/folder/update", {
          id: id,
          oldIndex: oldIndex,
          newIndex: newIndex
        }, function(folder) {
          $.post("/folder/reorder", {}, function() {});
        });
      }
    });
    $("#sortable").disableSelection();
  });
}

function loadSingleFolderSidebarNavigable(folderid) {
  var accordianFolderId = "accoridanFolder" + folderid;
  $("#" + accordianFolderId).empty();
  $.post("/problem/read", {
    folder: folderid
  }, function(problems) {
    problems.forEach(function(problem) {
      var name = problem.name;
      if (problem.testMode) {
        name = "<font color=#E67E22><b>[TEST]&nbsp;</b></font>" + name;
      }
      if (problem.phase == 2) {
        name = "<font color=#E67E22><b>*[FUTURE]&nbsp;</b></font>" +
          name;
      }
      var link = $("<p></p>").append(
        $("<a></a>")
        .append(name)
      );
      if (problem.phase == 0) {
        link.css("background-color", "#ededed");
      }
      if (problem.testMode == true) {
        link.css("background-color", "#DDECF2");
      }

      link.click(function() {
        curProblem = problem;
        fillProblemEdit(curProblem);
        fillProblemDisplay(curProblem);
        getStudentResults(curProblem);
      });
      $("#" + accordianFolderId).append(link);
    });
  });
}

function loadSingleFolderSidebarSortable(folderid) {
  $("#expandMe" + folderid).addClass("spin");

  //reload accordian folder for a single folder (ie after you make a submission within it)
  var accordianFolderName = "sortableFolder" + folderid;
  $("#" + accordianFolderName).empty();

  $.post("/problem/read", {
    folder: folderid
  }, function(problems) {
    if (problems.length == 0) {
      $("#expandMe" + folderid).removeClass("spin");
    }
    problems.forEach(function(problem) {
      var removeButton = $(
          "<a href='#' data-toggle='tooltip' data-placement='right' title='Delete?'></a>"
        )
        .css("color", "red")
        .html(
          '<span class="glyphicon glyphicon-remove" style="padding: 0 5px;float:right" ></span>'
        ) // the trailing space is important!
        .click(function() {
          if (confirm('Are you sure you wish to delete the problem "' +
              problem.name + '"?')) {
            $.post("/submission/read/" + problem.id, {
              id: problem.id
            }, function(submissions) {
              var myArray = [];
              submissions.forEach(function(submission) {
                myArray.push(submission.user);
              });
              $.unique(myArray);
              var print = "";
              for (var i = 0; i < myArray.length; i++) {
                print = print + myArray[i] + " ";
              }
              if (confirm('This will delete ' + submissions.length +
                  ' submission(s) from the following ' + myArray.length +
                  ' user(s): \n' + print +
                  '\nThese users\' scores may become inaccurate as a result of this deletion.'
                )) {
                deleteProblem(problem);
              }
            });
          }
        });

      var extras = "";
      if (problem.phase == 0) {
        extras = extras + " <font color=#E67E22><b>[PAST]</b></font>"
      } else if (problem.phase == 2) {
        extras = extras +
          " <font color=#E67E22><b>*[FUTURE]</b></font>"
      }
      if (Boolean(problem.testMode) == true) {
        extras = extras + " <font color=#E67E22><b>[TEST]</b></font>";
      }
      var sortableProblem = $("<li></li>")
        .attr("class", "ui-state-default")
        .attr("id", problem.id)
        .append(
          '<span class="sortableGrip2 ui-icon ui-icon-arrowthick-2-n-s"></span>' +
          problem.name + extras).append(removeButton);
      $("#sortableFolder" + folderid).append(sortableProblem);

      $("#expandMe" + folderid).removeClass("spin");
    });
    $('[data-toggle="tooltip"]').tooltip();
  });
  $("#sortableFolder" + folderid).sortable({
    handle: ".sortableGrip2",
    start: function(e, ui) {
      // creates a temporary attribute on the element with the old index
      $(this).attr('data-previndex', ui.item.index());
    },
    update: function(e, ui) {
      var newIndex = ui.item.index();
      var oldIndex = $(this).attr('data-previndex');
      var id = ui.item.attr('id');
      $.post("/problem/update", {
        id: id,
        oldIndex: oldIndex,
        newIndex: newIndex
      }, function(problem) {
        $.post("/problem/reorder", {
          folder: folderid
        }, function() {
          loadSingleFolderSidebarNavigable(folderid);
        });
      });
    }
  });
  $("#sortableFolder" + folderid).disableSelection();

}

function addFolder(folder) { //creates the folder to add problems to

  $("#folderDropdown").append($("<option></option>").attr("value", folder.id).html(
    folder.name));
  $("#problemsfolderDropdown").append($("<option></option>").attr("value",
    folder.id).html(folder.name));
  $("#editFolderDropdown").append($("<option></option>").attr("value", folder.id)
    .html(folder.name));

  if (curProblem) {
    $("#editFolderDropdown").val(curProblem.folder);
  }
  if (curFolder) {
    $("#problemsfolderDropdown").val(curFolder);
  }

  var accordianFolderId = "accoridanFolder" + folder.id;
  var toggleLabel =
    '<a data-toggle="collapse" data-parent="#accordion" href=".' +
    accordianFolderId + '">' + folder.name + '</a>';
  var accordian =
    "<div class='panel panel-default'><div class='panel-heading'><h4 class='panel-title'>" +
    toggleLabel + "</h4></div><div id = 'accoridanFolder" + folder.id +
    "' class='panel-collapse collapse folderCollapse accoridanFolder" + folder.id +
    "'></div>";

  $("#navigableFolders").append(accordian);
  $("#" + accordianFolderId).empty();
}

function addSortableFolder(folder) {
  if ($("#accoridanFolder" + folder.id).hasClass("in")) {
    var open = "in";
    var icon = "glyphicon-folder-close"
  } else {
    var open = "";
    var icon = "glyphicon-folder-open";
  }

  var expandButton = $("<a href='.accoridanFolder" + folder.id + "'></a>")
    .attr("data-parent", "#accordion")
    .attr("data-toggle", "collapse")
    .html('<span class="glyphicon expand-folders ' + icon +
      '" style="padding:0 8px;float:right" id="expandMe' + folder.id +
      '"></span>')
    .click(function() {
      if ($("#expandMe" + folder.id).hasClass("glyphicon-folder-open")) {
        $("#expandMe" + folder.id).removeClass("glyphicon-folder-open").addClass(
          "glyphicon-folder-close");
      } else {
        $("#expandMe" + folder.id).removeClass("glyphicon-folder-close").addClass(
          "glyphicon-folder-open");
      }
    });

  var removeButton = $("<a href='#'></a>")
    .css("color", "red")
    .html(
      '<span class="glyphicon glyphicon-remove" style="padding:0 5px;float:right"></span>'
    ) // the trailing space is important!
    .click(function() {
      if (confirm('Are you sure you wish to delete the folder "' + folder.name +
          '"?')) {
        $.post("/folder/delete", {
          id: folder.id
        }, function() {
          $.post("/folder/reorder", {}, function() {
            $("#" + folder.id).remove();
            foldersChanged = true;
          });
        });
      }
    });

  var heading = $("<h4></h4>")
    .addClass("panel-title")
    .html('<span class="sortableGrip ui-icon ui-icon-arrowthick-2-n-s"></span>' +
      folder.name + "</h4>")
    .append(removeButton).append(expandButton);

  var expandableFolder = $("<div></div>")
    .attr("id", "accoridanFolderSortable" + folder.id)
    .attr("class", "panel-collapse collapse " + open +
      " folderCollapse accoridanFolder" + folder.id)
    .html("<ul id='sortableFolder" + folder.id + "' class='sortable2' ></ul>");

  var sortableItem = $("<li></li>")
    .attr("class", "ui-state-default sortableFolder panel-heading")
    .attr("id", folder.id);
  sortableItem.append(heading);
  sortableItem.append(expandableFolder);
  $("#sortable").append(sortableItem);
}

function loadUsers() {
  //interface for editing who is an admin
  $("#admins").empty();
  $.post("/user/readAdmin", null, function(admins) {
    admins.forEach(function(admin) {
      var nameSpace = $("<div></div>").attr('id', "adminName" + admin.username)
        .append(adminRemoveButton(admin)).append(admin.displayName +
          "  <i>(" + admin.username + ")</i>").append(adminEditButton(
          admin));

      var label = $("<li></li>").attr("class", "list-group-item").append(
        nameSpace);
      $("#admins").append(label);
    });
    $('[data-toggle="tooltip"]').tooltip()

  });
}

function adminRemoveButton(admin) {
  var removeButton = $("<a href='#'></a>")
    .css("color", "red")
    .css("float", "left")
    .css("margin-right", "5px")
    .attr("data-toggle", "tooltip")
    .attr("data-placement", "top")
    .attr("title", "Remove as Admin")
    .html("<span class='glyphicon glyphicon-remove'></span> ") // the trailing space is important!
    .click(function() {
      if (confirm('Are you sure you wish to delete ?')) {
        $.post("/user/removeAdmin", {
          id: admin.id
        }, function() {
          loadUsers();
        });
      }
    });
  return removeButton;
}

function adminEditButton(admin) {
  var editButton = $("<a href='#'></a>")
    .css("color", "green")
    .css("margin-left", "5px")
    .attr("data-toggle", "tooltip")
    .attr("data-placement", "top")
    .attr("title", "Edit Display Name")
    .html("<span class='glyphicon glyphicon-pencil'></span> ") // the trailing space is important!
    .click(function() {
      var editDiv = $("<div class='input-group'></div>")
        .append("<input type='text' id='nameChange" + admin.username +
          "' class='form-control' placeholder='" + admin.displayName + "  (" +
          admin.username + ")" + "'></input>")
        .append($("<span class='input-group-btn' ></span>").append(
          adminSaveEditButton(admin)).append(adminCancelEditButton(admin)))
      $("#adminName" + admin.username).empty().append(editDiv).append(
        "<div id='nameChangeError'></div>");
      $('[data-toggle="tooltip"]').tooltip()

    });
  return editButton;
}

function adminSaveEditButton(admin) {
  var saveButton = $(
      "<button type='submit' id='changeNameBtn' class='btn btn-default'></button>"
    )
    .attr("data-toggle", "tooltip")
    .attr("data-placement", "top")
    .attr("title", "Save")
    .append(
      "<span class='glyphicon glyphicon-thumbs-up' style='color:green;'></span>"
    )
    .click(function() {
      if ($("#nameChange" + admin.username).val() == "") {
        var noNameError = $(
          "<div class='alert alert-danger' role='alert'>Please enter a name</div>"
        );
        $("#nameChangeError").append(noNameError);
      } else {
        var name = $("#nameChange" + admin.username).val();
        name = String(name);
        if (confirm(
            "Are you sure you want to change the display name of the user with onyen '" +
            admin.username + "'' from '" + admin.displayName + "'' to '" +
            name + "'?")) {
          $.post("/user/changeName/", {
            "onyen": admin.username,
            "name": name
          }, function(user) {
            $("#adminName" + admin.username).empty().append(name);
            $("#namesHaveChanged").removeClass("hidden");
          });
        }
      }
    });
  return saveButton;
}

function adminCancelEditButton(admin) {
  var saveButton = $(
      "<button type='submit' id='changeNameBtn' class='btn btn-default'></button>"
    )
    .attr("data-toggle", "tooltip")
    .attr("data-placement", "top")
    .attr("title", "Cancel")
    .append(
      "<span class='glyphicon glyphicon-thumbs-down' style='color:red;'></span>"
    )
    .click(function() {
      $("#adminName" + admin.username).empty().append(adminRemoveButton(admin))
        .append(admin.displayName + "  <i>(" + admin.username + ")</i>").append(
          adminEditButton(admin));
      $('[data-toggle="tooltip"]').tooltip()
    });
  return saveButton;
}

function getSettings() {
  feedbackToggle(feedbackOn);
  shareToggle(shareOn);
}

function feedbackToggle(boolean) {
  if (boolean) {
    var button = $("<button></button>")
      .addClass("btn btn-danger")
      .text("Turn Off Feedback")
      .click(function(event) {
        if (confirm(
            "Are you sure you want to turn this feature off? This will refresh the page."
          )) {
          $.post("/setting/update/", {
            name: "feedback",
            on: false
          }, function(setting) {
            location.reload();
          });
        }
      });
  } else {
    var button = $("<button></button>")
      .addClass("btn btn-success")
      .text("Turn On Feedback")
      .click(function(event) {
        if (confirm(
            "Are you sure you want to turn this feature on? This will refresh the page."
          )) {
          $.post("/setting/update/", {
            name: "feedback",
            on: true
          }, function(setting) {
            location.reload();
          });
        }
      });
  }
  $("#feedbackToggle").empty().append(button);
}

function shareToggle(boolean) {
  if (boolean) {
    var button = $("<button></button>")
      .addClass("btn btn-danger")
      .text("Turn Off Sharing")
      .click(function(event) {
        if (confirm(
            "Are you sure you want to turn this feature off? This will refresh the page."
          )) {
          $.post("/setting/update/", {
            name: "share",
            on: false
          }, function(setting) {
            location.reload();
          });
        }
      });
  } else {
    var button = $("<button></button>")
      .addClass("btn btn-success")
      .text("Turn On Sharing")
      .click(function(event) {
        if (confirm(
            "Are you sure you want to turn this feature on? This will refresh the page."
          )) {
          $.post("/setting/update/", {
            name: "share",
            on: true
          }, function(setting) {
            location.reload();
          });
        }
      });
  }
  $("#shareToggle").empty().append(button);
}

function studentScore(onyen) {
  $("#studentScoreButton").empty().append(
    '<span class="glyphicon glyphicon-refresh spin"></span>');
  $.post("/submission/read/", {
    student: onyen
  }, function(submissions) {
    var totalSubmissionNumber = submissions.length;
    var submissionCount = 0;
    $.post("/folder/read", {}, function(folders) {
      studScore = 0;
      totScore = 0;
      folders.forEach(function(folder) {
        $.post("/problem/read", {
          folder: folder.id,
          phase: 2
        }, function(problems) {
          problems.forEach(function(problem) {
            var maxScore = 0;
            $.post("/submission/read/", {
              id: problem.id,
              student: onyen
            }, function(submissions) {
              submissions.forEach(function(submission) {
                submissionCount++;
                var curSubScore = Number(submission
                  .value.correct) + Number(
                  submission.value.style);
                if (curSubScore > maxScore) {
                  maxScore = curSubScore;
                }
              });
              studScore += maxScore;
              if (totalSubmissionNumber ==
                submissionCount) {
                $.post("/user/updateScore/", {
                  onyen: onyen,
                  currentScore: studScore
                }, function(user) {
                  $("#studentScoreButton").empty().append(
                    studScore + "/" + points);
                  $("#studentScoreButton").removeAttr(
                    "disabled");
                  $("#studentListBadge" + onyen).empty()
                    .append(studScore + "/" +
                      points);
                });
              }
            });
          });
        });
      });
    });
  });
}

function recalculateAvailableScore() {
  $.post("/folder/read", {}, function(folders) {
    var totalProblemCount = 0;
    var problemCount = 0;
    var totalScore = 0;

    folders.forEach(function(folder) {
      $.post("/problem/read", {
        folder: folder.id,
        phase: 2,
        ignoreTest: "true"
      }, function(problems) {
        problems.forEach(function(problem) {
          totalProblemCount++;
        });
      });
    });

    folders.forEach(function(folder) {
      $.post("/problem/read", {
        folder: folder.id,
        phase: 2,
        ignoreTest: "true"
      }, function(problems) {
        problems.forEach(function(problem) {
          problemCount++;
          totalScore += parseFloat(problem.value.correct) +
            parseFloat(problem.value.style);
          if (totalProblemCount == problemCount) {
            $.post("/setting/update/", {
              name: "points",
              value: totalScore
            }, function(setting) {});
          }
        });
      });
    });
  });
}


//controls for the blinking on the edit folder side
var blinkTimer;

function blinking(elm) {
  blinkTimer = setInterval(blink, 10);

  function blink() {
    elm.fadeOut(600, function() {
      elm.fadeIn(600);
    });
  }
}

var editor;
var fbEditor;
var fbEditorReadOnly;
var modalEditor;
var feedbackEditor;
var completedFeedbackEditor;
var feedbackOn;
var points;
var foldersChanged = false;
window.onresize = function() {
  if ($("#fbDashBodyC").height() > 0) {
    var max = Math.max(parseInt($(window).height() - 80), $("#fbDashBodyC").height());
  } else {
    var max = parseInt($(window).height() - 65);
  }
  $("#archiveFeedbackList").css("height", max);
}

window.onload = function() {
  curProblem = null;
  curStudent = null;
  curFolder = null;
  curSubmission = null;
  curFeedback = null;
  curCompletedFeedback = null;

  numProblems = 0;
  numfunct = 0; //num solutions with correct functionality
  numstyle = 0; //num solutions with correct style
  numattempted = 0; //num students submitted anything
  numearned = 0; //num students earned full points

  $(function() {
    $("#matrixBody").sortable({
      distance: 15
    });
  });


  $.post("/setting/read/", {
    name: "feedback"
  }, function(setting) {
    if (setting.on == true || setting.on == "true") {
      feedbackOn = true;
    } else {
      feedbackOn = false;
      $("#submissionTabMenu").addClass("hidden");
      $("#feedbackRequestAlertSubTab").addClass("hidden");
      $("#feedbackSubmitDiv").addClass("hidden");
    }
    if (feedbackOn) {
      var feedbackNavButton = $("<a></>")
        .attr("href", "#feedback")
        .attr("data-toggle", "pill")
        .attr("class", "navbar-brand")
        .html("<b>Feedback</b>")
        .click(function(event) {
          getFeedbackDash();
        });
      var completedFeedbackNavButton = $("<a></>")
        .attr("href", "#completedFeedback")
        .attr("data-toggle", "pill")
        .attr("class", "navbar-brand")
        .html("<b>Archive</b>")
        .click(function(event) {
          getCompletedFeedbackDash();
        });

      $('#feedbackNav').append(feedbackNavButton);
      $('#feedbackNavC').append(completedFeedbackNavButton);

    } else {
      $("#fbDashBody").empty().append("Feedback feature turned off.");
    }
    $.post("/setting/read/", {
      name: "share"
    }, function(setting) {
      if (setting.on == true || setting.on == "true") {
        shareOn = true;
      } else {
        shareOn = false;
      }
      getSettings();
    });
  });

  $.post("/setting/read/", {
    name: "points"
  }, function(setting) {
    points = setting.value;
  });

  loadNavigableSidebar();
  loadUsers();
  getStudentList();
  $("#refreshStudentListScores").click(function(event) {
    $.post("/setting/read/", {
      name: "points"
    }, function(setting) {
      points = setting.value;
      getStudentList();
    });
  });

  setInterval(
    function() {
      if ($("#edit").hasClass("active")) {
        updateProblemProgressBar();
      }
    },
    30000 /* 30000 ms = 30 sec */
  );

  fbEditorReadOnly = CodeMirror.fromTextArea(fbCodemirrorReadOnly, {
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
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen",
          false);
        $(".CodeMirror").css("font-size", "100%");
      }
    }
  });

  feedbackEditor = CodeMirror.fromTextArea(fbDashCodemirror, {
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

  completedFeedbackEditor = CodeMirror.fromTextArea(cfbEditor, {
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
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen",
          false);
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
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen",
          false);
        $(".CodeMirror").css("font-size", "100%");
      }
    }
  });

  fbEditor = CodeMirror.fromTextArea(fbCodemirror, {
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

  //reset student data
  $("#refreshData").click(function() {
    getStudentResults(curProblem);
  });

  var intervalID;
  $("#studentListRefresh").change(function() {
    var seconds = "";
    $("#studentListRefresh option:selected").each(function() {
      seconds = $(this).val();
    });
    clearInterval(intervalID);
    var millseconds = parseInt(seconds) * parseInt(1000);
    if (millseconds > 0) {
      intervalID = setInterval(function() {
        if (!$("#matrix").hasClass("active")) {
          clearInterval(intervalID);
          $("#studentListRefresh").val(0);
        } else {
          updateStudentResults(curProblem, seconds);
          //getStudentResults(curProblem);
        }
      }, millseconds);
    }
    getStudentResults(curProblem);
  });

  $("#clearShareRequests").click(function(event) {
    $.post("/submission/read", {
        id: curProblem.id,
        shareOK: true,
        shared: false
      },
      function(submissions) {
        var length = submissions.length;
        var count = 0;
        submissions.forEach(function(submission) {
          $.post("/submission/update", {
            id: submission.id,
            shared: true
          }, function(submission) {
            count = count + 1;
            if (count == length) {
              getStudentResults(curProblem);
            }
          });
        });
      }
    );
  });

  //add problems
  $("#addProblem").click(function(event) {
    var creatingProblem = $(
      "<div class='alert alert-warning' role='alert'> " +
      "Creating problem... <span class='glyphicon glyphicon-refresh spin'></div>"
    );
    $("#newProblemError").empty().append(creatingProblem);

    var subLimit = $("#editSubmissionLimit").val();
    if (subLimit == "" || !($('#maxSubmissions').is(":checked"))) {
      subLimit = null;
    }
    event.preventDefault();
    var opts = {
      type: $("#type").val(),
      phase: $("#phase").val(),
      name: $("#problemName").val(),
      vidURL: $("#videoURL").val(),
      folder: $("#folderDropdown").val(),
      language: $("#languageDropdown").val(),
      testMode: $("#modeDropdown").val(),
      maxSubmissions: subLimit,
      text: $("#description").val(),
      style: $("#stylePoints").val(),
      correct: $("#correctPoints").val(),
      onSubmit: $("#onSubmit").val()
    };

    //alert(opts.vidURL); return; // pds

    // TODO - Build errors with jQuery
    if ($("#problemName").val() == "") {
      var noNameError = $(
        "<div class='alert alert-danger' role='alert'>Please enter a problem name</div>"
      );
      $("#newProblemError").empty().append(noNameError);
    } else if ($("#description").val() == "") {
      var noDescriptionError = $(
        "<div class='alert alert-danger' role='alert'> " +
        "Please enter a problem description</div>");
      $("#newProblemError").empty().append(noDescriptionError);
    } else if ($("#stylePoints").val() == "" || $("#correctPoints").val() ==
      "") {
      var noPointsError = $(
        "<div class='alert alert-danger' role='alert'> " +
        "Please enter style and correctness points</div>");
      $("#newProblemError").empty().append(noPointsError);
    } else {
      $.post("/problem/create", opts, function(problem) {
        curProblem = problem;
        fillProblemEdit(curProblem);
        fillProblemDisplay(curProblem);
        getStudentResults(curProblem);

        $.post("/problem/reorder", {
          folder: problem.folder
        }, function() {
          loadSingleFolderSidebarNavigable(problem.folder);
          loadSingleFolderSidebarSortable(problem.folder);
          var problemCreated =
            $(
              "<div class='alert alert-success' id='problemCreatedSuccess' role='alert'> " +
              "Problem Created!</div>");
          $("#newProblemError").empty().append(problemCreated);
          setTimeout(function() {
            $("#problemCreatedSuccess").remove();
          }, 3000);
          //add points to total available score
          if (problem.phase != 2 && Boolean(problem.testMode) ==
            false) {
            var updatingPoints =
              $(
                "<div class='alert alert-warning' id='pointsupdating' role='alert'> " +
                "Updating available points... <span class='glyphicon glyphicon-refresh spin'></div>"
              );
            $("#newProblemError").append(updatingPoints);
            var totalPoints = parseFloat(points) + parseFloat(
                problem.value.style) +
              parseFloat(problem.value.correct);
            $.post("/setting/update/", {
              name: "points",
              value: totalPoints
            }, function(setting) {
              points = totalPoints;
              var pointsUpdated =
                $(
                  "<div class='alert alert-success' id='pointUpdateSuccess' role='alert'> " +
                  " Points Updated!</div>");
              $("#pointsupdating").remove();
              $("#newProblemError").append(pointsUpdated);
              setTimeout(function() {
                $("#pointUpdateSuccess").remove();
              }, 3000);
            });
          }
        });
      });
    }
  });

  $("#editProblem").click(function(event) {
    $("#editProblem").attr("disabled", "disabled");
    $("#editProblem").empty().append(refresh());

    var subLimit = $("#editSubmissionLimit").val();
    if (subLimit == "") {
      subLimit = null;
    }
    event.preventDefault();
    var opts = {
      id: curProblem.id,
      type: $("#editType").val(),
      phase: $("#editPhase").val(),
      name: $("#editProblemName").val(),
      folder: $("#editFolderDropdown").val(),
      language: $("#editLanguageDropdown").val(),
      testMode: $("#editModeDropdown").val(),
      maxSubmissions: subLimit,
      vidURL: $("#editVideoURL").val(),
      text: $("#editDescription").val(),
      correct: $("#editCorrectPoints").val(),
      style: $("#editStylePoints").val(),
      onSubmit: $("#editOnSubmit").val()
    };
    $("#editProblemError").empty();

    //Build errors with jQuery
    if ($("#editProblemName").val() == "") {
      var noNameError = $(
        "<div class='alert alert-danger' role='alert'>Please enter a problem name</div>"
      );
      $("#editProblemError").append(noNameError);
    } else if ($("#editDescription").val() == "") {
      var noDescriptionError =
        $(
          "<div class='alert alert-danger' role='alert'>Please enter a problem description</div>"
        );
      $("#editProblemError").append(noDescriptionError);
    } else if ($("#editStylePoints").val() == "" || $(
        "#editCorrectPoints").val() == "") {
      var noPointsError =
        $(
          "<div class='alert alert-danger' role='alert'>Please enter style and correctness points</div>"
        );
      $("#editProblemError").append(noPointsError);
    } else {
      try {
        if (opts.language == "javascript") {
          var AST = acorn.parse(opts.onSubmit);
        }
        //breaks here with "Failed to load resource:
        //the server responded with a status of 500 (Internal Server Error)"
        $.post("/problem/update", opts, function(problem) {
          fillProblemDisplay(problem);
          var updateSuccessMessage =
            $(
              "<div class='alert alert-success' role='alert' id='problemUpdatedMessage'>Problem Updated</div>"
            );
          setTimeout(function() {
            $("#problemUpdatedMessage").remove();
          }, 2000);
          $("#editProblemError").append(updateSuccessMessage);
          curProblem = problem;
          loadSingleFolderSidebarNavigable(problem.folder);
          loadSingleFolderSidebarSortable(problem.folder);
          recalculateAvailableScore();
          $("#editProblem").removeAttr("disabled");
          $("#editProblem").empty().append("Update Problem");
          fillProblemAdd(problem);
        });
      } catch (err) {
        var noParseError =
          $(
            "<div class='alert alert-danger' role='alert'>Solution function is not parsing properly</div>"
          );
        $("#editProblemError").append(noParseError);
        $("#editProblem").removeAttr("disabled");
        $("#editProblem").empty().append("Update Problem");
      }
    }
  });

  $("#newAdminBtn").click(function() {
    $.post("/user/setAdmin", {
      user: $("#newAdmin").val()
    }, function(admin) {
      if (admin) {
        var updateSuccessMessage =
          $(
            "<div class='alert alert-success' role='alert' id='adminUpdateMessage'>Update Succeeded</div>"
          );
        setTimeout(function() {
          $("#adminUpdateMessage").remove();
        }, 2000);
        $("#newAdmin").val("");
        $("#newAdminError").empty().append(updateSuccessMessage);
        loadUsers();
      } else {
        var updateErrorMessage =
          $(
            "<div class='alert alert-danger' role='alert'>That username is not in our database</div>"
          );
        $("#newAdminError").empty().append(updateErrorMessage);
      }
    });
  });

  //handle the alternating and blinking for editing folders button
  $('#sortFolderButton').on('click', function() {
    if ($(this).text() == 'Edit Folders') {
      blinking($("#sortFolderButton"));
      $(this).text('Done');
      if ($('#sortableFolders').is(':empty')) {
        loadSortableSidebar();
      } else {
        showSortableSidebar();
      }
    } else {
      clearInterval(blinkTimer);
      $(this).text('Edit Folders');
      if (foldersChanged == true) {
        loadNavigableSidebar();
        foldersChanged = false;
      } else {
        showNavigableSidebar();
      }
    }
  });

  $('#maxSubmissions').change(function() {
    if ($(this).is(":checked")) {
      $("#submissionLimit").removeAttr('disabled');
    } else {
      $("#submissionLimit").attr('disabled', 'disabled');
      $("#submissionLimit").val("");
    }
  });
  $('#editMaxSubmissions').change(function() {
    if ($(this).is(":checked")) {
      $("#editSubmissionLimit").removeAttr('disabled');
      $("#editSubmissionLimit").val("1");
    } else {
      $("#editSubmissionLimit").attr('disabled', 'disabled');
      $("#editSubmissionLimit").val("");
    }
  });

  $('#onyenSearchButton').on('click', function(event) {
    var onyenValue = $("#onyen").val();
    if (onyenValue == "") {
      getIndividualNone("null");
      return;
    }
    $.post("/user/read", {
      onyen: onyenValue
    }, function(user) {
      if (!user) {
        getIndividualNone(onyenValue);
      } else {
        $("#individual").tab('show');
        getIndividual(user, false);
      }
    });

  });

  $('#submitFeedbackButton').on('click', function(event) {
    var fbResponseMsg = $('#fbResponseMessage').val();
    $("#fbResponseMessage").val("");
    var fbCode = fbEditor.getValue();
    var now = new Date();
    var fbResponseTime = now.toLocaleString();
    var fbResponder = $("#userOnyen").text();

    $.post("/submission/update", {
      id: curSubmission.id,
      fbResponseTime: fbResponseTime,
      fbCode: fbCode,
      fbResponseMsg: fbResponseMsg,
      fbResponder: fbResponder
    }, function(submission) {
      fillSubmissionFeedback(submission, null);
      if (curProblem) {
        if (submission.problem == curProblem.id) {
          getStudentResults(curProblem)
        }
      }
    });
  });

  $('#submitFeedbackButtonDash').on('click', function(event) {
    $("#fbDashSuccess").removeClass("hidden");
    $("#fbDashBody").addClass("hidden");

    var fbResponseMsg = $('#fbResponseMessageDash').val();
    var fbCode = feedbackEditor.getValue();

    var now = new Date();
    var fbResponseTime = now.toLocaleString();
    var fbResponder = $("#userOnyen").text();

    $.post("/submission/update", {
      id: curFeedback.id,
      fbResponseTime: fbResponseTime,
      fbCode: fbCode,
      fbResponseMsg: fbResponseMsg,
      fbResponder: fbResponder
    }, function(submission) {
      $("#feedbackSubmitDiv").addClass("hidden");
      $("#feedbackRequestedDiv").removeClass("panel-danger");

      time = submission.fbResponseTime;
      if (time != null) {
        time = submission.fbResponseTime.toLocaleString()
      }
      $("#feedbackResponseTime").empty().append(
        "<b>Feedback submitted!</b>");
      $("#fbResponseMsg").empty().append(fbResponseMsg);
      var editorText = "";
      if (fbCode) {
        editorText = fbCode;
      }

      setTimeout(function() {
        $("#fbDashSuccess").addClass("hidden");
        $("#fbResponseMessageDash").val("");
        getFeedbackDash();
      }, 2000);

      if (curProblem) {
        if (submission.problem == curProblem.id) {
          getStudentResults(curProblem)
        }
      }


    });
  });

  $('#shareSubmissionModal').on('shown.bs.modal', function(e) {
    modalEditor.refresh();
  })

  $('.matrixLink').on('click', function() {
    $("#moveMe").detach().appendTo('#moveMatrix');
  });

  $('.editLink').on('click', function() {
    $("#moveMe").detach().appendTo('#moveEdit');
  });

  $('.addLink').on('click', function() {
    $("#moveMe").detach().appendTo('#moveAdd');
  });

  $('.nav-tabs').on('click', function() {
    setTimeout(function() {
      fbEditorReadOnly.refresh();
    }, 10);
    setTimeout(function() {
      fbEditor.refresh();
    }, 10);
  });

  $('#submissionCollapseAll').on('click', function() {
    if ($(this).text() == 'Hide Student Info') {
      $(this).text('Show Student Info');
      $('.submissionCollapse').collapse('hide');
    } else {
      $(this).text('Hide Student Info');
      $('.submissionCollapse').collapse('show');
    }
    return false;
  });

  $('#editSubmissionPtsF').on('click', function() {
    var newScore = prompt(
      "Insert updated functionality score for this submission: ");
    if (newScore) {
      if (isNaN(newScore)) {
        alert("Are you sure that was a number?");
        return;
      }
      $.post("/submission/update", {
        id: curSubmission.id,
        correct: parseFloat(newScore),
        style: parseFloat(curSubmission.value.style)
      }, function(submission) {
        studentScore(curSubmission.user);
        curSubmission = submission;
        $("#SearnedPtCorrect").empty().append(submission.value.correct);
        var SavailablePtCorrect = $("#SavailablePtCorrect").html();
        $("#activeSubmissionScoreF").empty().append(scoreBadge(
          submission.value.correct, SavailablePtCorrect));
        if (parseFloat(submission.value.correct) >= parseFloat(
            SavailablePtCorrect)) {
          $("#ScorrectCheck").empty().append(correct("8px"));
        } else {
          $("#ScorrectCheck").empty().append(wrong("8px"));
        }
        if (curSubmission.problem == curProblem.id) {
          fillProblemDisplay(curProblem);
        }
      });
    }
  });

  $('#editSubmissionPtsS').on('click', function() {
    var newScore = prompt(
      "Insert updated style score for this submission: ");
    if (newScore) {
      $.post("/submission/update", {
        id: curSubmission.id,
        style: parseFloat(newScore),
        correct: parseFloat(curSubmission.value.correct)
      }, function(submission) {
        studentScore(curSubmission.user);
        curSubmission = submission;
        $("#SearnedPtStyle").empty().append(submission.value.style);
        var SavailablePtStyle = $("#SavailablePtStyle").html();
        $("#activeSubmissionScoreS").empty().append(scoreBadge(
          submission.value.style, SavailablePtStyle));
        if (parseFloat(submission.value.style) >= parseFloat(
            SavailablePtStyle)) {
          $("#SstyleCheck").empty().append(correct("8px"));
        } else {
          $("#SstyleCheck").empty().append(wrong("8px"));
        }
        if (curSubmission.problem == curProblem.id) {
          fillProblemDisplay(curProblem);
        }
      });
    }
  });

  //enable tooltips
  $('[data-toggle="tooltip"]').tooltip()
};
