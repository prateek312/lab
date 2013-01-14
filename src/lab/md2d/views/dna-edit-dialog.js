/*global $, define, model */

define(function () {

  return function DNAEditDialog() {
    var api,
        $dialogDiv,
        $dnaTextInput,
        $errorMsg,
        $submitButton,

        init = function() {
          // Basic dialog elements.
          $dialogDiv = $('<div></div>');
          $dnaTextInput = $('<input type="text" id="dna-sequence-input" size="45"></input>');
          $dnaTextInput.appendTo($dialogDiv);
          $errorMsg = $('<p class="error"></p>');
          $errorMsg.appendTo($dialogDiv);

          // jQuery UI Dialog.
          $dialogDiv.dialog({
            dialogClass: "dna-edit-dialog",
            title: "DNA Code on Sense Strand",
            autoOpen: false,
            width: "30em",
            modal: true,
            buttons: {
              "Apply": function () {
                model.getDNAProperties().set({
                  sequence: $dnaTextInput.val()
                });
                $(this).dialog("close");
              }
            }
          });

          // Dynamic validation on input.
          $submitButton = $(".dna-edit-dialog button");
          $dnaTextInput.on("input", function () {
            var props = {
                  sequence: $dnaTextInput.val()
                },
                status;
            status = model.getDNAProperties().validate(props);
            if (status.valid === false) {
              $submitButton.attr("disabled", "disabled");
              $errorMsg.text(status.errors["sequence"]);
            } else {
              $submitButton.removeAttr("disabled");
              $errorMsg.text("");
            }
          });
        };

    api = {
      open: function () {
        // Clear previous errors.
        $errorMsg.text("");
        $submitButton.removeAttr("disabled");
        // Set current value of DNA code.
        $dnaTextInput.val(model.getDNAProperties().get().sequence);
        $dialogDiv.dialog("open");
      }
    };

    init();

    return api;
  };
});
