define("epi-cms/contentediting/command/_CommandWithDialogMixin", [
// Dojo
    "dojo/_base/array",                                                         // used to loop through array
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",                                                              // used to listen event from Dialog
    "dojo/when",

    // Dijit
    "dijit/Destroyable",                                                        // mixed into me

    // EPi Framework
    "epi/shell/widget/dialog/Dialog",                                           // used to create dialog

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.editlink",                        // used to get default title (common)
    "epi/i18n!epi/nls/episerver.shared"
], function (
// Dojo
    array,
    declare,
    lang,
    aspect,
    when,

    // Dijit
    Destroyable,

    // EPi Framework
    Dialog,

    // Resources
    resouce,
    sharedResources
) {
    return declare([Destroyable], {
        // summary:
        //      The base class for all edit commands wanna use dialog as an editor.
        //      <see cref = "epi-cms/contentediting/command/ItemEdit.js" />
        //
        // description:
        //      That supports:
        //          - Create a dialog
        //          - Interface to update value
        // tags:
        //    internal xproduct

        // res: [public] Object
        //      Json language resource object used to get default title when insert/edit item.
        res: resouce,

        // title: [public] String
        //      The dialog's title.
        title: null,

        // dialogClass: [public] String
        //      The css class for dialog.
        //      Default value is "epi-dialog-portrait".
        dialogClass: "epi-dialog-portrait",

        // dialogContentClass: [public] Class
        //      The widget class that will be created and placed as dialog's content
        dialogContentClass: null,

        // dialogParams: [public] Object
        //      The parameters for create new instance of dialog.
        dialogParams: null,

        // dialogContentParams: [public] Object
        //      The parameters for create new instance of dialogContentClass.
        dialogContentParams: null,

        // dialogContent: [public] Object
        //      The instance of dialogContentClass will be stored by this prop.
        dialogContent: null,

        // defaultActionsVisible: [public] Bool
        //      .Flag which indicates whether the default confirm and cancel
        //		actions should be visible. This can only be set in the constructor.
        defaultActionsVisible: true,

        // confirmActionText: [public] String
        //      Label to be displayed for the confirm (positive) action.
        confirmActionText: sharedResources.action.ok,

        // cancelActionText: [public] String
        //      Label to be displayed for the cancel (negative) action.
        cancelActionText: sharedResources.action.cancel,

        // value: [public] Object
        //      The value of item that being edited.
        value: null,

        // value: [protected] Object
        //      The dialog.
        _dialog: null,

        _getTitle: function () {
            // summary:
            //      Customize base get method for title prop.
            // tags:
            //      protected override

            return this.title || lang.replace(this.value ? this.res.title.template.edit : this.res.title.template.create, this.res.title.action);
        },

        onDialogOpen: function () {
            // summary:
            //      Triggered when dialog is opened.
            // tags:
            //      public virtual
        },

        onDialogExecute: function () {
            // summary:
            //      Process value returned from dialog after it's executed.
            //      It should be implemented from delivery
            // tags:
            //      public virtual
        },

        onDialogCancel: function () {
            // summary:
            //      Process value when dialog after it's hidden.
            //      It should be implemented from delivery
            // tags:
            //      public virtual
        },

        onDialogHideComplete: function () {
            // summary:
            //      Triggered when dialog is closed.
            // tags:
            //      public virtual
        },

        showDialog: function () {
            // summary:
            //      Create and show dialog
            // tags:
            //    protected

            if (this.dialogContent) {
                this.dialogContent.destroy();
                this.dialogContent = null;
            }
            this.dialogContent = new this.dialogContentClass(this.dialogContentParams);

            this._dialog = new Dialog(lang.mixin({
                title: this._getTitle(),
                dialogClass: this.dialogClass,
                content: this.dialogContent,
                defaultActionsVisible: this.defaultActionsVisible,
                confirmActionText: this.confirmActionText,
                cancelActionText: this.cancelActionText
            }, this.dialogParams));

            this._dialog.startup();

            //Set the value when the provider/consumer has been initialized
            this.dialogContent.set("value", this.value);

            this.own(
                this.dialogContent,
                aspect.after(this._dialog, "onExecute", lang.hitch(this, this.onDialogExecute), true),
                aspect.after(this._dialog, "onCancel", lang.hitch(this, this.onDialogCancel), true),
                aspect.after(this._dialog, "onHide", lang.hitch(this, this.onDialogHideComplete), true),
                this._dialog.watch("open", lang.hitch(this, function (name, oldValue, newValue) {
                    if (!newValue) {
                        return;
                    }
                    this.onDialogOpen();
                }))
            );

            this._dialog.show();
        }
    });
});
