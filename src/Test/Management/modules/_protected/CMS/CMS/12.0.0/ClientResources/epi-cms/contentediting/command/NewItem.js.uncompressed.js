define("epi-cms/contentediting/command/NewItem", [
// Dojo
    "dojo/_base/declare",

    // EPi Framework
    "epi/shell/command/_Command",                                                   // mixed into me

    // EPi CMS
    "epi-cms/contentediting/command/_CommandWithDialogMixin",                       // mixed into me
    "epi-cms/widget/LinkEditor"
], function (
// Dojo
    declare,

    // EPi Framework
    _Command,

    // EPi CMS
    _CommandWithDialogMixin,
    LinkEditor
) {

    return declare([_Command, _CommandWithDialogMixin], {
        // tags:
        //      internal

        // dialogContentClass: [public] Class
        //      The widget class that will be created and placed as dialog's content
        dialogContentClass: LinkEditor,

        // dialogContentParams: [public] Object
        //      The parameters for create new instance of dialogContentClass.
        dialogContentParams: null,

        // defaultActionsVisible: [public] Bool
        //      .Flag which indicates whether the default confirm and cancel
        //		actions should be visible. This can only be set in the constructor.
        defaultActionsVisible: false,

        _execute: function () {
            // summary:
            //      Overwrite base clase, change the context to edit the block.
            // tags:
            //      protected
            this.set("value", null); // Create new item dialog without value

            this.showDialog();
        },

        _onModelChange: function () {
            // summary:
            //      Overwrite base class, updates canExecute after the model has changed.
            // tags:
            //      protected

            if (!this.model) {
                this.set("canExecute", false);
                return;
            }

            this.set("canExecute", true);
        },

        onDialogExecute: function () {
            // summary:
            //      Process value returned from dialog after it's executed.

            this.inherited(arguments);

            if (this.dialogContent) {
                this.value = this.dialogContent.get("value");
            }

            if (this.model) {
                this.model.addTo(this.value, null, null);
            }
        }
    });
});
