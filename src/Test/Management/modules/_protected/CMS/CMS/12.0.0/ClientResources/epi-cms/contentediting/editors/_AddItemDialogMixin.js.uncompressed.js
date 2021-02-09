define("epi-cms/contentediting/editors/_AddItemDialogMixin", [
    // dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    // epi
    "epi/shell/widget/_ValueRequiredMixin",
    "epi/shell/widget/dialog/Dialog",
    // epi-cms
    "../../widget/_HasChildDialogMixin",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.collectioneditor",
    "epi/i18n!epi/nls/episerver.shared"
], function (
    // dojo
    declare,
    lang,
    on,
    // epi
    _ValueRequiredMixin,
    Dialog,
    // epi-cms
    _HasChildDialogMixin,
    // resources
    resources,
    sharedResources
) {
    return declare([_ValueRequiredMixin, _HasChildDialogMixin], {
        // tags:
        //      internal xproduct

        // itemEditorType: Function
        //      The item editor class.
        itemEditorType: null,

        _itemEditor: null,

        _dialog: null,

        // Set autofocus to false to prevent the validate the require fields when opening dialog.
        dialogParams: null,

        _editingItemIndex: null,

        postCreate: function () {
            this.inherited(arguments);

            // Connect to model events
            this.own(on(this.model, "toggleItemEditor", lang.hitch(this, this._onToggleItemEditor)));
        },

        _onToggleItemEditor: function (item, index) {
            // summary:
            //      The model's toggleItemEditor event handler.
            // item: Object
            //      The item to edit (Note that it is an item model instance, not the raw data item). If null, open item editor to create new item.
            // tags:
            //      private

            // In IE11 we have to set focus explicitly to ensure that onFocus from SideBySideEditorWrapper gets triggered
            this.onFocus();

            this._setupItemEditor();

            // Set data to item editor. (NOTE: Consider item model or raw data???)
            this._itemEditor.set("value", item);
            this._editingItemIndex = index;

            // Show the dialog.
            this.isShowingChildDialog = true;
            this._dialog.show();

            this._setDialogConfirmActionText(item);
            this._setDialogTitle(item);

            // Set confirm action status when showing dialog
            this._setDialogConfirmActionStatus(item);
        },

        _setupItemEditor: function () {
            // summary:
            //      Returns grid's columns definition.
            // tags:
            //      private

            // Create item editor
            this._itemEditor = this._createItemEditor();
            this.own(
                // Create dialog
                this._dialog = new Dialog(lang.mixin({
                    title: this._getDialogTitleText(),
                    content: this._itemEditor
                }, this.dialogParams))
            );
            // the dialog will own all events so they get destroyed when the dialog is destroyed
            this._dialog.own(
                this._itemEditor,
                this.connect(this._itemEditor, "onChange", "_setDialogConfirmActionStatus"),

                // Connect to dialog events
                on(this._dialog, "execute", lang.hitch(this, this._onDialogExecute)),
                on(this._dialog, "hide", lang.hitch(this, this._onCancelDialog))
            );
        },

        _createItemEditor: function () {
            return new this.itemEditorType({ metadata: this.model.get("itemMetadata"), doLayout: false });
        },

        _setDialogTitle: function (existingItem) {
            this._dialog.set("title", this._getDialogTitleText(existingItem));
        },

        _getDialogTitleText: function (existingItem) {
            return resources.title;
        },

        _onCancelDialog: function () {
            // summary:
            //      Sets isShowingChildDialog to false before calling the public callback onCancelDialog.
            // tags:
            //      protected

            this.isShowingChildDialog = false;
            this.onCancelDialog();
        },

        _onDialogExecute: function () {
            // summary:
            //      Validates the dialog before calling the public callback onExecuteDialog.
            // tags:
            //      protected

            if (this.validate()) {
                this.onExecuteDialog();
            }
        },

        onExecuteDialog: function () {
            // summary:
            //      Callback for when the dialog is executed.
            // tags:
            //      public
        },

        onCancelDialog: function () {
            // summary:
            //      Callback for when the dialog is cancelled.
            // tags:
            //      public
        },

        _setDialogConfirmActionText: function (existingItem) {
            this._dialog.onActionPropertyChanged({ name: this._dialog._okButtonName }, "label", this._getDialogConfirmActionText(existingItem));
        },

        _getDialogConfirmActionText: function (existingItem) {
            return existingItem ? sharedResources.action.ok : sharedResources.action.add;
        },

        _setDialogConfirmActionStatus: function (item) {
            this._dialog.onActionPropertyChanged({ name: this._dialog._okButtonName }, "disabled", !item || item === "");
        }
    });

});
