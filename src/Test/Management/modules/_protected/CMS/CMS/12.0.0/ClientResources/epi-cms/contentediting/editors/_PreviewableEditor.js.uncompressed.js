require({cache:{
'url:epi-cms/contentediting/editors/templates/_PreviewableEditor.html':"﻿<div class=\"dijitReset dijitInline epi-previewableTextBox-wrapper\">\r\n    <span data-dojo-attach-point=\"labelNode\" class=\"epi-previewableTextBox-text dojoxEllipsis dijitInline\"></span>\r\n    <a href=\"#\" data-dojo-attach-point=\"changeNode, focusNode\" class=\"epi-previewableTextBox-link epi-functionLink\">${changeLabel}</a>\r\n</div>\r\n"}});
define("epi-cms/contentediting/editors/_PreviewableEditor", [
    "dojo/_base/array",
    "dojo/_base/event",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",

    "dijit",
    "dijit/_CssStateMixin",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/ValidationTextBox",

    "epi",

    "dojo/text!./templates/_PreviewableEditor.html",
    "dojox/html/entities"

], function (
    array,
    event,
    declare,
    lang,
    domClass,
    domStyle,

    dijit,
    _CssStateMixin,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    ValidationTextBox,

    epi,

    template,
    entities
) {

    return declare([_Widget, _CssStateMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // tags:
        //      public

        value: null,

        changeLabel: epi.resources.action.change,

        templateString: template,

        control: null,

        // controlParams: Array
        //      Properties to copy from this widget into the wrapped control
        controlParams: [],

        // state: [readonly] String
        //		Shows current state (ie, validation result) of input (""=Normal, Incomplete, or Error).
        state: "",

        _setLabelValueAttr: function (value) {
            // summary:
            //      Sets the value to the innerHTML of the label node

            this._set("labelValue", value);
            if (this._isHtml(value)) {
                this.labelNode.innerHTML = value;
            } else {
                this.labelNode.title = value;
                this.labelNode.textContent = value;
            }
        },

        _setIsEmptyAttr: function (isEmpty) {
            this._set("isEmpty", isEmpty);
            if (isEmpty) {
                domClass.add(this.domNode, "epi-state-empty");
            } else {
                domClass.remove(this.domNode, "epi-state-empty");
            }
        },

        _setValueAttr: function (value) {
            this._set("value", value);
            this.control.set("value", value);
            this.set("labelValue", typeof (value) == "string" ? entities.encode(value) : value);
            this.set("isEmpty", !value);
        },

        onChange: function (val) {

        },

        buildRendering: function () {
            this.inherited(arguments);

            // Create default TextBox for input Node
            if (!this.control) {
                this.control = new ValidationTextBox();
                this.own(this.control);
            }

            this.control.placeAt(this.domNode, "first");
        },

        postCreate: function () {
            this.inherited(arguments);

            this._setDisplay(false);

            // connect events
            this.connect(this.labelNode, "onclick", this._onChangeNodeClick);
            this.connect(this.changeNode, "onclick", this._onChangeNodeClick);
            this.connect(this.control, "onChange", this._onControlChange);
            this.connect(this.control, "onBlur", this._onControlBlur);

            // always copy state value from control
            this.own(this.control.watch("state", lang.hitch(this, function (name, old, value) {
                this.set("state", value);
            })));

            // validate first time
            this.control.validate();

            this.set("state", this.control.state);

            // propagate value from this to the textbox
            array.forEach(this.controlParams, function (property) {
                this.control.set(property, this.get(property));
            }, this);
        },

        onBlur: function () {
            this._setDisplay(false);
        },

        _setDisplay: function (showControl) {
            // Validation input data before hidden textbox
            if (!showControl && !this.validate()) {
                return;
            }

            this.showControl = showControl;
            domStyle.set(this.labelNode, "display", showControl ? "none" : "");
            domStyle.set(this.control.domNode, "display", showControl ? "" : "none");

            if (!this.readOnly) {
                domStyle.set(this.changeNode, "display", showControl ? "none" : "");
            }
        },

        focus: function () {
            if (this.showControl) {
                this.control.focus();
            } else {
                this.changeNode.focus();
            }
        },

        _onControlChange: function (value) {
            this._set("value", value);
            this.set("labelValue", typeof (value) == "string" ? entities.encode(value) : value);
            this.set("isEmpty", !value);
            this.onChange(value);
        },

        _onControlBlur: function () {
            this._setDisplay(false);
        },

        _onChangeNodeClick: function (e) {
            event.stop(e);
            this._setDisplay(true && !this.readOnly);
            dijit.selectInputText(this.control.focusNode);
        },

        _setReadOnlyAttr: function (readOnly) {
            this._set("readOnly", readOnly);

            domStyle.set(this.changeNode, "display", this.readOnly ? "none" : "");
            this.readOnly && this._setDisplay(false);
        },

        validate: function () {
            return this.control.validate();
        },

        isValid: function () {
            return this.control.isValid();
        },

        getErrorMessage: function () {
            // summary:
            //      Get error message from the control
            // tags:
            //      public

            return this.control.getErrorMessage();
        },

        _isHtml: function (text) {
            // summary:
            //      Checks whether string is an HTML string
            // tags:
            //      private

            return text !== entities.encode(text);
        }
    });
});
