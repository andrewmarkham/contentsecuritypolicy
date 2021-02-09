define("epi-cms/contentediting/command/ItemEdit", [
// Dojo
    "dojo/_base/declare",

    // EPi CMS
    "epi-cms/contentediting/command/BlockEdit",                                     // mixed into me
    "epi-cms/contentediting/command/_CommandWithDialogMixin",                       // mixed into me
    "epi-cms/widget/LinkEditor"
], function (
// Dojo
    declare,

    // EPi CMS
    BlockEdit,
    _CommandWithDialogMixin,
    LinkEditor
) {

    return declare([BlockEdit, _CommandWithDialogMixin], {
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

            this.showDialog();
        },

        _onModelValueChange: function () {
            // summary:
            //      Overwrite base class, updates canExecute after the model value has changed.
            // tags:
            //      protected

            if (!this.model) {
                this.set("canExecute", false);
                return;
            }

            this.set("value", this.model.get("selectedItem"));
            this.set("canExecute", this.model.get("canEdit"));
        },

        onDialogExecute: function (/*Object*/actionParams) {
            // summary:
            //      Process value returned from dialog after it's executed.
            // action: [String]
            //      Which action corespondent with? ("ok" or "delete")
            //      See "epi-cms/widget/LinkEditor" module for more detail.
            // tags:
            //      protected override

            this.inherited(arguments);

            if (this.dialogContent) {
                this.value = this.dialogContent.get("value");
            }

            if (this.model) {
                if (actionParams && actionParams.action === "delete") {
                    this.model.remove();
                } else {
                    this.model.updateItemData(this.value);
                }
            }
        }
    });
});
