define("epi-cms/widget/UrlSelector", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/when",
    "dojo/aspect",
    "dojo/Deferred",

    // EPi Framework
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/widget/dialog/Dialog",
    "epi/Url",
    // EPi CMS
    "epi-cms/widget/LinkEditor",
    "epi-cms/widget/_SelectorBase",
    "epi-cms/core/PermanentLinkHelper",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.editlink"
],
function (
// dojo
    declare,
    lang,
    domClass,
    domStyle,
    when,
    aspect,
    Deferred,

    // EPi Framework
    _ModelBindingMixin,
    Dialog,
    Url,
    // EPi CMS
    LinkEditor,
    _SelectorBase,
    PermanentLinkHelper,
    res
) {

    return declare([_SelectorBase, _ModelBindingMixin], {
        // summary:
        //    Represents the widget to edit PropertyURL.
        // tags:
        //    internal

        resource: res,

        // LinkHelper to retrieve the link info
        linkHelper: PermanentLinkHelper,

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.model && this.modelClassName) {
                var modelClass = declare(this.modelClassName);
                this.model = new modelClass();
            }
        },

        startup: function () {
            // summary:
            //      Overridden to reset input field.

            if (this._started) {
                return;
            }

            this.inherited(arguments);
            !this.value && this.set("value", null);
        },

        isValid: function () {
            // summary:
            //    Check if widget's value is valid.
            // tags:
            //    protected

            return (!this.required || (!this.get("isEmpty"))); // Not required or have some value.
        },

        _onDialogShow: function () {
            //summary:
            //    Handle onShow dialog event.
            // tags:
            //    protected

            this.inherited(arguments);

            var link = this.get("value");

            // we set the value to LinkEditor with obj.href format
            this.dialogContent.set("value", { href: link});

        },

        _onDialogExecute: function () {
            //summary:
            //    Handle dialog close through executing OK, Cancel, Delete commands
            // tags:
            //    protected

            // we need to get value back from LinkEditor
            var linkObj = this.dialogContent.get("value");

            // we're only interested in setting the link
            this.set("value", linkObj.href);
        },

        _getDialog: function () {
            // summary:
            //		Create Link Editor dialog
            // tags:
            //    protected

            this.dialogContent = new LinkEditor({
                modelType: this.metadata.additionalValues["modelType"],
                hiddenFields: ["text", "title", "target", "language"]
            });

            this.own(this.dialogContent);

            return new Dialog({
                title: this._getTitle(),
                dialogClass: "epi-dialog-portrait",
                content: this.dialogContent,
                destroyOnHide: false,
                defaultActionsVisible: false
            });

        },

        _setValueAttr: function (/* String*/ value) {
            //summary:
            //    Value's setter.
            //
            // value: [String]
            //    A string as link value
            //    Value to be set.
            //
            // tags:
            //  protected

            if (!value) {
                this.set("isEmpty", true);

                this._setValueAndFireOnChange(null);
                return;
            }

            this.set("isEmpty", false);
            this._setValueAndFireOnChange(value);
        },

        _setValueAndFireOnChange: function (/* String */ value) {
            //summary:
            //    Sets the value internally and fires onChange if the value differs than the current value
            //
            // value: [String]
            //    A string as link value
            //    Value to be set.
            //
            // tags:
            //  private

            var currentLink = this.get("value");
            this._set("value", value);

            // detect whether to invoke onChange or not
            var triggerOnChange = true;

            if (!currentLink && !value) {
                triggerOnChange = false;
            } else if (value && value === currentLink) {
                triggerOnChange = false;
            }

            if (triggerOnChange) {
                this.onChange(value);
            }

            // update the displayNode with link name
            // There might be an ongoing getLinkName request, cancel it before starting a new one
            if (this._valueChangedPromise) {
                this._valueChangedPromise.cancel("");
            }

            if (value) {
                this._valueChangedPromise = this._getLinkName(value);
                this._valueChangedPromise.then(lang.hitch(this, this._updateDisplayNode));
            } else {
                this._updateDisplayNode(null);
            }

        },

        _getLinkName: function (/* String */ value) {
            // summary:
            //      Retrieves the name of given link value. If name not found then returns back the same provided value
            //
            // value: [String]
            //    A string as link value
            //
            // tags:
            //      private

            var def = new Deferred();
            when(this.linkHelper.getContent(value, { allLanguages: true }), lang.hitch(this, function (content) {
                var result = { name: content ? content.name : value };
                if (!def.isCanceled()) {
                    def.resolve(result);
                }
            }));

            return def.promise;
        },

        _getTitle: function () {
            // summary:
            //      Customize base get method for title prop.
            // tags:
            //      protected

            return lang.replace(this.value ? this.resource.title.template.edit : this.resource.title.template.create, this.resource.title.action);
        }
    });
});
