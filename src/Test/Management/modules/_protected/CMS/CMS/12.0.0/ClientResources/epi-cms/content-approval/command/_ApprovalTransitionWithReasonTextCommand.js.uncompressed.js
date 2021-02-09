define("epi-cms/content-approval/command/_ApprovalTransitionWithReasonTextCommand", [
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/dom-construct",
    // Parent class and mixins
    "epi/shell/widget/ValidationTextarea",
    "./_ApprovalTransitionCommand",
    "epi-cms/contentediting/command/_CommandWithDialogMixin"
], function (
    declare,
    Deferred,
    domConstruct,
    // Parent class and mixins
    ValidationTextarea,
    _ApprovalTransitionCommand,
    _CommandWithDialogMixin
) {

    return declare([_ApprovalTransitionCommand, _CommandWithDialogMixin], {
        // summary:
        //      Base class approval transitions that might need a comment
        // tags:
        //      internal

        // dialogContentClass: [readonly] ValidationTextarea
        //      Input field for the approve comment
        dialogContentClass: ValidationTextarea,

        dialogClass: "epi-dialog-confirm",

        // executeMethod: [readonly] String
        //      The method to execute on the approval service
        executeMethod: null,

        // isCommentRequiredPropertyName: [readonly] String
        //      The name of the property to look at to determine if a comment is required
        isCommentRequiredPropertyName: null,

        // dialogPlaceHolder: String
        //      Placeholder text for the text area
        dialogPlaceHolder: null,

        // dialogText: String
        //      Text to be displayed above text area, if any
        dialogText: null,

        postscript: function () {
            this.inherited(arguments);

            this.dialogContentParams = {
                required: true,
                intermediateChanges: true,
                placeHolder: this.dialogPlaceHolder,
                "class": "epi-textarea--max-height--500"
            };
        },

        _execute: function () {
            return this._getApprovalDefinition().then(function (approvalDefinition) {
                if (approvalDefinition[this.isCommentRequiredPropertyName]) {
                    this._executeDeferred = new Deferred();
                    this.showDialog();
                    return this._executeDeferred.promise;
                } else {
                    return this._executeServiceMethod();
                }
            }.bind(this));
        },

        _getApprovalDefinition: function () {
            // summary:
            //      Gets the approval definition when we execute the command
            //      to determine if a comment is required
            // tags:
            //      protected

            return this.approvalService.getApprovalRelatedDefinition(this.model.contentLink);
        },

        showDialog: function () {
            this.inherited(arguments);

            this._disableActionButton(true);

            if (this.dialogText && typeof this.dialogText === "string") { // Add text, if any, above the comment text area
                domConstruct.place("<p>" + this.dialogText + "</p>", this.dialogContent.domNode, "before");
            }

            this._dialog.own(this.dialogContent.on("change", this._onDialogContentChanged.bind(this)));
        },

        _onDialogContentChanged: function (value) {
            // summary:
            //      Called when the dialog content is changed.
            // tags:
            //      private

            this._disableActionButton(!value || !(value.trim()));
        },

        _disableActionButton: function (disable) {
            // summary:
            //      Disables the confirm button if the disable parameter is true.
            // tags:
            //      private

            this._dialog.onActionPropertyChanged({ name: this._dialog._okButtonName }, "disabled", disable);
        },

        onDialogExecute: function () {
            // summary:
            //      Resolves the execute promise after the dialog is executed.
            // tags:
            //      public virtual

            this._executeDeferred.resolve(this._executeServiceMethod.call(this, this.dialogContent.value));
        },

        onDialogCancel: function () {
            // summary:
            //      Rejects the execute promise after the dialog is canceled.
            // tags:
            //      public virtual

            this._executeDeferred.reject();
        },

        _executeServiceMethod: function (reason) {
            return this.approvalService[this.executeMethod](this.approval.id, this.approval.activeStepIndex, reason)
                .then(this._onContentStatusChange.bind(this));
        }
    });
});
