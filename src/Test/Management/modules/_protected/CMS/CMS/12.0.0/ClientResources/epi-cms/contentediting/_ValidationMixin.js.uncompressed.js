define("epi-cms/contentediting/_ValidationMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang"
],

function (
    array,
    declare,
    lang
) {

    return declare(null, {
        // summary:
        //      Handles validation stuffs
        // tags:
        //      public

        _watchHandles: null,

        constructor: function () {
            this._watchHandles = [];
        },

        destroy: function () {
            this._removeViewModelWatches();

            this.inherited(arguments);
        },

        _removeViewModelWatches: function () {
            // summary:
            //      Removes the view model watches
            // tags:
            //      internal, protected

            array.forEach(this._watchHandles, function (handle) {
                handle.remove();
            });
            this._watchHandles = [];
        },

        _addStateWatch: function (/*Object*/widget) {
            var propertyName = widget.get("name"),
                viewModel = this.viewModel;

            var update = function () {
                var state = widget.get("state");
                if (state !== "Error") {
                    viewModel.validator.clearPropertyErrors(propertyName, viewModel.validator.validationSource.client);
                } else if (state === "Error") {
                    var errorMessage = widget.get("message") || widget.getErrorMessage() || "";
                    viewModel.validator.setPropertyErrors(
                        propertyName, [{
                            severity: viewModel.validator.severity.error,
                            errorMessage: errorMessage
                        }],
                        viewModel.validator.validationSource.client
                    );
                }
            };

            this._watchHandles.push(widget.watch("state", update));
            this._watchHandles.push(widget.watch("message", update));
        }
    });
});
