define("epi-cms/contentediting/editors/ShortcutEditor", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",

    // dijit
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button",

    //epi cms
    "epi", //Used for the manage button label
    "epi/shell/DialogService",
    "epi-cms/contentediting/ShortcutDialog",
    "../viewmodel/ShortcutDialogViewModel",
    "../../widget/_HasChildDialogMixin",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.shortcutblockeditor",
    "epi/i18n!epi/nls/episerver.shared"

], function (
// dojo
    declare,
    lang,
    domClass,
    domStyle,

    //dijit
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    Button,

    //epi cms
    epi,
    dialogService,
    ShortcutDialog,
    ShortcutDialogViewModel,
    _HasChildDialogMixin,
    resources,
    sharedResources) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _HasChildDialogMixin], {
        // tags:
        //      internal

        templateString: "<div class=\"dijitInline\"> \
                           <span data-dojo-attach-point=\"shortcutTypeNameNode\" class=\"dijitInline\"></span> <div class=\"epi-chromelessButton epi-chromelessLinkButton epi-functionLink\" data-dojo-attach-point=\"button\" data-dojo-type=\"dijit/form/Button\" data-dojo-attach-event=\"onClick:_showDialog\" >${resources.action.manage}</div> \
                         </div>",

        resources: epi.resources,
        value: null,
        contentLink: null,
        metadata: null,

        destroy: function () {
            if (this.button) {
                this.button.destroyRecursive();
            }

            this.inherited(arguments);
        },

        onChange: function (value) {
            // summary:
            //		Callback method for updating the editor wrapper.
            // tags:
            //		callback
        },

        _showDialog: function () {
            var content = new ShortcutDialog({
                metadata: this.metadata,
                contentLink: this.contentLink,
                value: this.value,
                model: new ShortcutDialogViewModel({
                    contentLink: this.contentLink,
                    contentName: this.contentName,
                    value: this.value })
            });

            dialogService.dialog({
                defaultActionsVisible: false,
                confirmActionText: sharedResources.action.save,
                content: content,
                title: resources.dialogtitle
            }).then(function () {
                var value = content.get("value");
                this.set("value", value);
                this.onChange(value);
            }.bind(this)).always(function () {
                this.isShowingChildDialog = false;
            }.bind(this));

            this.isShowingChildDialog = true;
        },

        _setShortcutTypeNameAttr: {
            node: "shortcutTypeNameNode",
            type: "innerHTML"
        },

        _setReadOnlyAttr: function (value) {
            this._set("readOnly", value);

            domStyle.set(this.button.domNode, "display", value ? "none" : "");
        },

        _setValueAttr: function (value) {
            this._set("value", value);
            this.set("ShortcutTypeName", value && value.pageShortcutTypeName ? value.pageShortcutTypeName : "");
        }
    });
});
