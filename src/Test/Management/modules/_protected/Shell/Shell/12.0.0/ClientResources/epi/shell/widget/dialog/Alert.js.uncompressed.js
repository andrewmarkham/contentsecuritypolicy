define("epi/shell/widget/dialog/Alert", [
    "epi",
    "dojo",
    "dijit/form/Button",
    "epi/shell/widget/dialog/_DialogBase"
], function (epi, dojo, Button, _DialogBase) {

    return dojo.declare([_DialogBase], {
        // summary:
        //		A modal alert dialog widget. Does not display a dialog title.
        //
        // tags:
        //      public

        // acknowledgeActionText: [public] String
        //		Label to be displayed for the acknowledge action.
        acknowledgeActionText: epi.resources.action.ok,

        // closeIconVisible: [public] Boolean
        //		Flag which indicates whether the close icon should be visible.
        //		To encourage users to read alert messages only allow closing
        //		via the acknowledge action.
        closeIconVisible: false,

        // dialogClass: [protected] String
        //		Class to apply to the root DOMNode of the dialog.
        dialogClass: "epi-dialog-alert",

        buildRendering: function () {
            // summary:
            //		Construct the UI for this widget from a template, adding
            //		an acknowledge button.
            // tags:
            //		protected

            this.inherited(arguments);

            this.domNode.setAttribute("role", "alertdialog");
            this.descriptionNode.setAttribute("role", "alert");

            var acknowledge = new Button({
                "class": "Salt",
                label: this.acknowledgeActionText,
                onClick: dojo.hitch(this, this._onAcknowledge)
            });
            dojo.place(acknowledge.domNode, this.actionContainerNode);
        },

        _onAcknowledge: function () {
            // summary:
            //		Called when user has triggered the dialog's acknowledge action.
            // type:
            //		callback

            this.hide();
            typeof this.onAction === "function" && this.onAction();
        },

        onAction: function () {
            // summary:
            //		Called when the user has triggered an action on the dialog.
            // type:
            //		public callback
        }
    });
});
