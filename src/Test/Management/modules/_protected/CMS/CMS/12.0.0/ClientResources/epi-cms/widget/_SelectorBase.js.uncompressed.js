require({cache:{
'url:epi-cms/widget/templates/_SelectorBase.html':"﻿<div data-dojo-attach-point=\"inputContainer\" class=\"dijitReset dijitInputField dijitInputContainer dijitInline epi-resourceInputContainer\" id=\"widget_${id}\">\r\n    <div data-dojo-attach-point=\"displayNode, dropAreaNode, stateNode\" class=\"dijit dijitReset dijitInline dijitInlineTable dijitLeft dijitTextBox displayNode\">\r\n        <div class=\"dijitReset dijitLeft dijitInputField dijitInputContainer\">\r\n            <div data-dojo-attach-point=\"clearButton\" class=\"epi-clearButton\">&nbsp;</div>\r\n            <div data-dojo-attach-point=\"resourceName\" class=\"dijitInline epi-resourceName dojoxEllipsis\" >\r\n                <span data-dojo-attach-point=\"selectedContentNameNode\"></span> <span data-dojo-attach-point=\"selectedContentLinkNode\"></span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div data-dojo-type=\"dijit/form/Button\" data-dojo-attach-event=\"onClick: _onButtonClick\" data-dojo-attach-point=\"button\" data-dojo-props=\"label:'...'\"></div>\r\n</div>"}});
﻿define("epi-cms/widget/_SelectorBase", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-prop",

    "dojo/query",
    "dojo/when",

    // dijit,
    "dijit/_CssStateMixin",
    "dijit/_TemplatedMixin",
    "dijit/_Widget",
    "dijit/_WidgetsInTemplateMixin",

    // epi.shell
    "epi/dependency",
    "epi/i18n",
    "epi/shell/widget/_ValueRequiredMixin",

    // epi.cms
    "epi-cms/widget/_Droppable",
    "epi-cms/widget/_HasClearButton",
    "epi-cms/widget/_HasChildDialogMixin",

    // resources
    "dojo/text!./templates/_SelectorBase.html"
],

function (
// dojo
    declare,
    lang,

    aspect,
    Deferred,
    domClass,
    domStyle,
    domProp,

    query,
    when,

    // dijit
    _CssStateMixin,
    _TemplatedMixin,
    _Widget,
    _WidgetsInTemplateMixin,

    // epi.shell
    dependency,
    i18n,
    _ValueRequiredMixin,

    // epi.cms
    _Droppable,
    _HasClearButton,
    _HasChildDialogMixin,

    // resources
    template
) {
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _HasClearButton, _HasChildDialogMixin, _Droppable, _ValueRequiredMixin], {
        // summary:
        //    Represents base class for item selector widget (a textbox and a browse button).
        // tags:
        //    public

        templateString: template,

        roots: null,

        value: null,

        // required: Boolean
        //		User is required to enter data into this field.
        required: false,

        // missingMessage: [public] String
        //    Message which is displayed when required is true and value is empty.
        missingMessage: "",

        // tooltipPosition: String[]
        //		See description of `dijit/Tooltip.defaultPosition` for details on this parameter.
        tooltipPosition: [],

        // canSelectOwnerContent: [public] Boolean
        //      Indicates whether the owner content that is being edited can be selected
        canSelectOwnerContent: false,

        contentRepositoryDescriptors: null,

        allowedDndTypes: [],

        // _valueChangedPromise: [protected] Promise
        //      Promise which is set while the value in being changed within an asynchronous call.
        _valueChangedPromise: null,

        _setSelectedContentNameAttr: function (value) {
            // summary:
            //		Sets the display name for selected content
            // tags:
            //    protected

            // set the text
            domProp.set(this.selectedContentNameNode, "textContent", value);

            // set the title
            this._updateDisplayNodeTitle();
        },

        _setSelectedContentLinkAttr: function (value) {
            domProp.set(this.selectedContentLinkNode, "innerHtml", value);
            this._updateDisplayNodeTitle();
        },

        _updateDisplayNodeTitle: function () {
            // summary:
            //		updates the tooltip with the current text of displayNode
            // tags:
            //    protected

            this.resourceName.title = this.resourceName.textContent.trim();
        },

        postCreate: function () {
            // summary:
            //      Post create initialization.
            // description:
            //      Setup related components.
            // tags:
            //      protected

            this.inherited(arguments);

            // After dnd into widget
            this.own(aspect.after(this, "onDrop", lang.hitch(this, this.focus)));
        },

        postMixInProperties: function () {
            // summary:
            //		Initialize properties
            // tags:
            //    protected

            this.inherited(arguments);

            if (!this.contentRepositoryDescriptors) {
                this.contentRepositoryDescriptors = dependency.resolve("epi.cms.contentRepositoryDescriptors");
            }

            if (!this.roots && this.repositoryKey) {
                var settings = this.contentRepositoryDescriptors.get(this.repositoryKey);
                this.roots = settings.roots;
            }
        },

        destroy: function (/*Boolean*/ preserveDom) {
            // summary:
            //      Destroy this class, cancelling any promises that are in progress.
            // tags:
            //      public
            this.inherited(arguments);

            // If there is a value change promise in progress then cancel it.
            if (this._valueChangedPromise) {
                this._valueChangedPromise.cancel();
                this._valueChangedPromise = null;
            }
        },

        _setReadOnlyAttr: function (value) {
            this._set("readOnly", value);

            domStyle.set(this.button.domNode, "display", value ? "none" : "");
            domStyle.set(this.clearButton, "display", value ? "none" : "");
            domClass.toggle(this.domNode, "dijitReadOnly", value);
        },

        _getDialog: function () {
            // summary:
            //		Create page tree dialog. Need override
            // tags:
            //    protected
        },

        _onButtonClick: function () {
            //summary:
            //    Handle pick button click. Need override
            // tags:
            //    protected

            if (!this.dialog) {
                this.dialog = this._getDialog();
                this.dialog.startup();

                this.own(aspect.after(this.dialog, "onExecute", lang.hitch(this, this._onDialogExecute)));
                this.own(aspect.after(this.dialog, "onShow", lang.hitch(this, this._onDialogShow)));
                this.own(aspect.after(this.dialog, "onHide", lang.hitch(this, this._onDialogHide)));
                this.own(this.dialog);
            }

            this.dialog.show();
        },

        _onDialogShow: function () {
            //summary:
            //    Handle onShow dialog event.
            // tags:
            //    protected

            this.isShowingChildDialog = true;
        },

        _onDialogExecute: function () {
            //summary:
            //    Handle dialog close. Need override
            // tags:
            //    protected
        },

        _onDialogHide: function () {
            //summary:
            //    Handle dialog hide. Need override
            // tags:
            //    protected

            this.isShowingChildDialog = false;

            // Return focus to the editor when the dialog closes.
            this.focus();
        },

        _onBlur: function () {
            // summary:
            //		This is where widgets do processing for when they stop being active,
            //		such as changing CSS classes.  See onBlur() for more details.
            // tags:
            //		protected

            this.inherited(arguments);

            this.validate();
        },

        focus: function () {
            this.button.focus();
        },

        onChange: function (value) {
            // summary:
            //    Fired when value is changed.
            //
            // value:
            //    The value
            // tags:
            //    public, callback
        },

        _updateDisplayNode: function (content) {
            //summary:
            //    Update widget's display text and title.
            // tags:
            //    protected

            if (content) {
                domClass.remove(this.domNode, "epi-noValue");
                domClass.remove(this.resourceName, "dijitPlaceHolder");
                this.set("selectedContentName", content.name);

            } else {
                domClass.add(this.domNode, "epi-noValue");
                domClass.add(this.resourceName, "dijitPlaceHolder");
                this.set("selectedContentName", "");
            }
        },

        _setDialogButtonState: function (contentLink) {
            // summary:
            //    Set state of dialog button.
            //
            // tags:
            //    protected
        }
    });
});
