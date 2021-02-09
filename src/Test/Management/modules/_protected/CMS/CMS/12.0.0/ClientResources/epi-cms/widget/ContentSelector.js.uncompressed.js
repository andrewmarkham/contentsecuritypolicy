define("epi-cms/widget/ContentSelector", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/string",
    "dojo/when",

    // dijit
    "dijit/focus",
    "dijit/form/Button",

    // epi.shell
    "epi/dependency",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/widget/dialog/Dialog",

    // epi.cms
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/widget/ContentSelectorDialog",
    "epi-cms/widget/_SelectorBase",

    // resources

    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentselector"
],

function (
// dojo
    array,
    declare,
    lang,
    domClass,
    domStyle,
    domConstruct,
    stringUtil,
    when,

    focusManager,
    Button,

    // epi.shell
    dependency,
    TypeDescriptorManager,
    Dialog,

    // epi.cms
    ContentReference,
    ContentActionSupport,
    ContentSelectorDialog,
    _SelectorBase,

    // resources

    localization
) {

    return declare([_SelectorBase], {
        // summary:
        //    Represents the widget to select ContentReference.
        // tags:
        //      internal xproduct

        roots: null,

        value: null,

        // required: Boolean
        //		User is required to enter data into this field.
        required: false,

        // missingMessage: [public] String
        //    Message which is displayed when required is true and value is empty.
        missingMessage: localization.requiredmessage,

        // tooltipPosition: String[]
        //		See description of `dijit/Tooltip.defaultPosition` for details on this parameter.
        tooltipPosition: [],

        // contentLink: [public] String
        //      Content reference of the content being edited.
        contentLink: null,

        // previewUrl: [internal] String
        //      The preview url to the selected content
        previewUrl: null,

        // canSelectOwnerContent: [public] Boolean
        //      Indicates whether the owner content that is being edited can be selected
        canSelectOwnerContent: false,

        // accessLevel: [public] Enum
        //      The access right level for the content node can be selected
        accessLevel: ContentActionSupport.accessLevel.Read,

        // showAllLanguages: Boolean
        //      Flags to indicate that the content tree should show all content in multiple languages or not.
        showAllLanguages: true,

        // showSearchBox: Boolean
        //      If true - a search field is displayed that allows user to find content
        showSearchBox: true,

        // searchArea: String
        //      Search area for the search box.
        searchArea: null,

        // contentClass: [public] String
        //      The content class to be set on the epi-cms/widget/ContentSelectorDialog.
        contentClass: null,

        // dialogClass: [public] String
        //      The dialog class to be set on the epi-cms/widget/ContentSelectorDialog.
        dialogClass: "epi-dialog-portrait",

        _setDisabledAttr: function (value) {
            this.inherited(arguments);
            this.button.set("disabled", value);
            this._set("disabled", value);
        },

        buildRendering: function () {
            // summary:
            //		Creates and append the input hidden field to the dom to preserve the contentLink id
            // tags:
            //    protected

            var inputName = this.name ? (this.name.replace(/"/g, "&quot;")) : "";
            this.input = domConstruct.create("input", { type: "hidden", name: inputName });

            this.inherited(arguments);
            this.domNode.appendChild(this.input);
        },

        postMixInProperties: function () {
            // summary:
            //		Initialize properties
            // tags:
            //    protected

            this.inherited(arguments);

            var registry = dependency.resolve("epi.storeregistry");
            this._store = registry.get("epi.cms.content.light");

            var contentRepositoryDescriptors = this.contentRepositoryDescriptors || dependency.resolve("epi.cms.contentRepositoryDescriptors");
            var settings = contentRepositoryDescriptors.get(this.repositoryKey);

            if (settings &&  !this.roots) {
                this.roots = settings.roots;
            }

            if (settings && !this.searchArea) {
                this.searchArea = settings.searchArea;
            }
        },

        postCreate: function () {
            // summary:
            //      Overridden to initialize ui elements when no value is set.

            this.inherited(arguments);

            if (!this.value) {
                this._updateDisplayNode(null);
            }
        },

        destroy: function () {
            // summary:
            //      Destroy the widget and hide the dialog.
            // tags:
            //      protected

            if (this.dialog) {
                this.dialog.destroy();
            }

            this.inherited(arguments);
        },

        _setReadOnlyAttr: function (value) {
            this._set("readOnly", value);

            domStyle.set(this.button.domNode, "display", value ? "none" : "");
            domStyle.set(this.clearButton, "display", value ? "none" : "");
            domClass.toggle(this.domNode, "dijitReadOnly", value);
        },

        _setValueAttr: function (value) {
            //summary:
            //    Value's setter.
            //
            // value: String
            //    Value to be set.
            //
            // tags:
            //    protected

            this._setValueAndFireOnChange(value);
        },

        createDialogContent: function () {
            // summary:
            //    Create dialog content
            // tags:
            //    protected

            return new ContentSelectorDialog({
                canSelectOwnerContent: this.canSelectOwnerContent,
                showButtons: false,
                roots: this.roots,
                allowedTypes: this.allowedTypes,
                restrictedTypes: this.restrictedTypes,
                showAllLanguages: this.showAllLanguages,
                showSearchBox: this.showSearchBox,
                searchArea: this.searchArea
            });
        },

        _getDialog: function () {
            // summary:
            //    Create page tree dialog
            // tags:
            //    protected

            // Verifies that the dialog instance and its dom node existing or not
            if (this.dialog && this.dialog.domNode) {
                return this.dialog;
            }

            var title = localization.title;
            if (this.allowedTypes && this.allowedTypes.length === 1) {
                var name = TypeDescriptorManager.getResourceValue(this.allowedTypes[0], "name");
                if (name) {
                    title = stringUtil.substitute(localization.format, [name]);
                }
            }

            this.contentSelectorDialog = this.createDialogContent();

            this.dialog = new Dialog({
                title: title,
                dialogClass: this.dialogClass,
                contentClass: this.contentClass,
                content: this.contentSelectorDialog,
                destroyOnHide: false
            });

            this.dialog.own(this.contentSelectorDialog);

            this.connect(this.contentSelectorDialog, "onChange", "_setDialogButtonState");
            this.connect(this.dialog, "onExecute", "_onDialogExecute");
            this.connect(this.dialog, "onHide", "_onDialogHide");
            this.connect(this.dialog, "onShow", "_onDialogShow");

            return this.dialog;
        },

        _onDialogShow: function () {
            //summary:
            //    Handle onShow dialog event. Sets the button state of the dialog.
            // tags:
            //    protected

            this.inherited(arguments);
            // We need to convert the value since this.value might be a
            // permanent link (_UrlSelectorMixin.js) that will not work in _setDialogButtonState
            this._setDialogButtonState(this._convertValueToContentReference(this.value));
        },

        _isContentAllowed: function (contentTypeIdentifier) {
            // summary:
            //    Checks whether the given content type belongs to the any of the allowedTypes/parent type or not
            //
            // contentTypeIdentifier: String
            //    The content type identifier
            //
            // tags:
            //    Private

            var acceptedTypes = TypeDescriptorManager.getValidAcceptedTypes([contentTypeIdentifier], this.allowedTypes, this.restrictedTypes);

            return !!acceptedTypes.length;
        },

        _onButtonClick: function () {
            // summary:
            //    Handle pick button click
            // tags:
            //    private

            when(this._getContentData(this.contentLink), lang.hitch(this, function (content) {

                // if the current content is any of allowedTypes then allow to select it
                this.canSelectOwnerContent = this.canSelectOwnerContent && content && this._isContentAllowed(content.typeIdentifier);
                var dialog = this._getDialog();
                this.isShowingChildDialog = true;

                var valueAsContentReference;
                if (this.value) {
                    valueAsContentReference = this._convertValueToContentReference(this.value);
                }

                if (valueAsContentReference) {
                    valueAsContentReference = valueAsContentReference.createVersionUnspecificReference().toString();
                    this.contentSelectorDialog.set("value", valueAsContentReference);
                } else {
                    this.setInitialValue();
                }

                dialog.show();
            }));
        },

        setInitialValue: function () {
            this.contentSelectorDialog.set("value", undefined);
        },

        _onDialogExecute: function () {
            //summary:
            //    Handle dialog close
            // tags:
            //    private

            var value = this.contentSelectorDialog.get("value");
            this._setValueAndFireOnChange(value);
        },

        _convertValueToContentReference: function (value) {
            //summary:
            //
            // tags:
            //    protected
            return value ? new ContentReference(value) : null;
        },

        _setValueAndFireOnChange: function (value) {
            //summary:
            //    Gets the content data by selected value, updates the view and calls onChange if value was changed
            // tags:
            //    private

            var contentLink = value === "-" ? this.contentLink : value;

            this.set("permanentLink", null);
            this.set("previewUrl", null);

            this._valueChangedPromise = when(this._getContentData(contentLink), lang.hitch(this, function (content) {

                if (this._destroyed) {
                    return;
                }

                // Clear the pointer to the promise since it is resolved.
                this._valueChangedPromise = null;

                var hasChange = this.value !== contentLink;

                this.value = contentLink;
                this.input.value = this.value;
                this._started && this.validate();
                this._updateDisplayNode(content);

                if (hasChange) {
                    this.onChange(contentLink);
                }

                if (content) {
                    this.set("permanentLink", content.permanentLink);
                    this.set("previewUrl", content.previewUrl);
                }
            }));
        },

        _getContentData: function (contentLink) {
            //summary:
            //    Loads the content data from the store
            // tags:
            //    private

            if (!contentLink) {
                return null;
            }
            return this._store.get(contentLink);
        },

        _onFocus: function () {
            // summary:
            //		This is where widgets do processing for when they start being active,
            //		such as changing CSS classes.  See onFocus() for more details.
            // tags:
            //		protected

            if (this.get("disabled")) {
                return;
            }
            this.inherited(arguments);
            this.validate();
        },


        _onBlur: function () {
            // summary:
            //		This is where widgets do processing for when they stop being active,
            //		such as changing CSS classes.  See onBlur() for more details.
            // tags:
            //		protected

            if (this.get("disabled")) {
                return;
            }
            this.inherited(arguments);
            this.validate();
        },

        focus: function () {
            // summary:
            //       Put focus on this widget
            // tags:
            //      public

            if (!this.button.disabled && this.button.focusNode && this.button.focusNode.focus) {
                try {
                    focusManager.focus(this.button.focusNode);
                } catch (e) {
                    /*squelch errors from hidden nodes*/
                }
            }
        },

        _updateDisplayNode: function (content) {
            //summary:
            //    Update widget's display text
            // tags:
            //    protected

            this.inherited(arguments);

            // content selector also sets Link id
            if (content) {
                this.set("selectedContentLink", new ContentReference(content.contentLink).id);
            } else {
                this.set("selectedContentName", localization.helptext);
                this.set("selectedContentLink", "");
            }
        },

        reset: function () {
            this.set("value", null);
        },

        _setDialogButtonState: function (contentLink) {
            // summary:
            //    Set state of dialog button.
            //
            // tags:
            //    protected

            var self = this;

            if (!contentLink) {
                self.dialog.definitionConsumer.setItemProperty(self.dialog._okButtonName, "disabled", true);
                return;
            }

            when(self._store.get(contentLink), function (content) {
                self.dialog.definitionConsumer.setItemProperty(self.dialog._okButtonName, "disabled", !ContentActionSupport.hasAccess(content.accessMask, self.accessLevel));
            });
        }
    });
});
