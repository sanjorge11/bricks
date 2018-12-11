(function($){
    var mainEditor;
    function initMainCodeEditor(){
      if(mainEditor instanceof CodeMirror){
				mainEditor.refresh();
		  } else {
        // Load main editor
        var el = document.getElementById("codifyme");
        mainEditor = CodeMirror.fromTextArea(el, {
          lineNumbers: true
        });
        mainEditor.setSize('100%', 50);
      }
    }

    function initSecondaryCodeEditor(){
      var $active = $('#code_mirror_editors > .active > a');
      var $sec_tab = $($active.data('target'));
      // --> 1. & 2. & 3.: try to find an already existing CodeMirror instance (https://github.com/codemirror/CodeMirror/issues/1413)
      // if found, simply refresh it!
      var codeMirrorContainer = $sec_tab.find(".CodeMirror")[0];
      if (codeMirrorContainer && codeMirrorContainer.CodeMirror) {
				codeMirrorContainer.CodeMirror.refresh();
      } else {
        CodeMirror.fromTextArea($sec_tab.find('textarea')[0], {
          lineNumbers: true
        });
      }
      // <--
    }

  $(document).ready(function(){

      // Only load editors if tab has been clicked
      $('#maintabs > li > a[data-target="#codemirror"]').on('shown.bs.tab', function(e){
        initMainCodeEditor();
        // --> 1.: init/update the secondary code editor too
        initSecondaryCodeEditor();
        // <--
      });

      $('#code_mirror_editors > li > a[data-toggle="tab"]').on('shown.bs.tab', function(e){
        // --> 1.: this might be called while the element is still invisible which breaks some CodeMirror calculations
        if ($(e.target).is(":visible")) {
          initSecondaryCodeEditor();
        }
        // <--
      });

      // Remember tabs
      var json, tabsState;
      $('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
        tabsState = localStorage.getItem("tabs-state");
        json = JSON.parse(tabsState || "{}");
        json[$(e.target).parents("ul.nav.nav-pills, ul.nav.nav-tabs").attr("id")] = $(e.target).data('target');

        localStorage.setItem("tabs-state", JSON.stringify(json));
      });

      tabsState = localStorage.getItem("tabs-state");

      json = JSON.parse(tabsState || "{}");
      $.each(json, function(containerId, target) {
        return $("#" + containerId + " a[data-target=" + target + "]").tab('show');
      });

      $("ul.nav.nav-pills, ul.nav.nav-tabs").each(function() {
        var $this = $(this);
        if (!json[$this.attr("id")]) {
          return $this.find("a[data-toggle=tab]:first, a[data-toggle=pill]:first").tab("show");
          }
      });

    });// doc.ready
  })(jQuery);
