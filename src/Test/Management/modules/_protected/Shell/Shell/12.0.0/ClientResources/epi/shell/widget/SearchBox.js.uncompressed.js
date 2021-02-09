require({cache:{
'url:epi/shell/widget/templates/SearchBox.html':"﻿<div class=\"dijit dijitReset dijitInline dijitLeft dijitTextBox epi-searchInput epi-contentSearchBox\" id=\"widget_${id}\">\r\n    <span data-dojo-attach-point=\"clearButton\" class=\"dijitReset dijitRight epi-clearButton\" role=\"presentation\"></span>\r\n    <div class=\"dijitReset dijitInputField dijitInputContainer\">\r\n        <input data-dojo-attach-point=\"textbox,focusNode\" type=\"text\" class=\"dijitReset dijitInputInner\" role=\"textbox\" />\r\n        <span class=\"dijitPlaceHolder dijitInputField\" data-dojo-attach-point=\"_phspan,placeHolderNode\"></span>\r\n    </div>\r\n</div>"}});
define("epi/shell/widget/SearchBox", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",

    "dojo/keys",
    // dijit
    "dijit/_TemplatedMixin",
    "dijit/_Widget",
    "dijit/_WidgetsInTemplateMixin",

    "dijit/focus",
    "dijit/form/TextBox",
    // dojox
    "dojox/html/entities",
    // epi
    "epi/debounce",
    "epi",
    // Templates
    "dojo/text!./templates/SearchBox.html",
    // Resources
    "epi/i18n!epi/shell/ui/nls/EPiServer.Shell.UI.Resources.SearchBox"
],
function (
// dojo
    declare,
    lang,

    domAttr,
    domClass,
    domStyle,

    keys,
    // dijit
    _TemplatedMixin,
    _Widget,
    _WidgetsInTemplateMixin,

    focusManager,
    TextBox,
    // dojox
    htmlEntities,
    // epi
    debounce,
    epi,
    // Templates
    template,
    // Resources
    resources
) {
    return declare([TextBox], {
        // tags:
        //      internal

        templateString: template,

        // placeHolder: String
        //      Defines a hint to help users fill out the input field (as defined in HTML 5).
        //      This should only contain plain text (no html markup).
        placeHolder: epi.resources.action.search,

        // commonRes: [private] Object
        //    Common localization resources,
        commonRes: epi.resources,

        // defaultDelay: [Integer]
        //      Delay in milliseconds between when user types something and we start
        //      searching based on that value.
        // tags:
        //      protected
        defaultDelay: 500,

        // encodeSearchText: [public] Boolean
        //      Indicated that need to encode search text or not.
        encodeSearchText: false,

        // triggerChangeOnEnter: Boolean
        //      Indicates if ENTER should trigger the change event
        triggerChangeOnEnter: true,

        postCreate: function () {
            // summary:
            //		Post widget creation. Initialize event for buttons
            // tags:
            //      Protected

            this.inherited(arguments);

            domAttr.set(this.clearButton, "title", resources.clear);

            // clear textbox value when clicking on clear button
            this.connect(this.clearButton, "onclick", lang.hitch(this, this.clearValue));
            this.toggleClearButton();

            this.connect(this, "_onInput",
                debounce(lang.hitch(this, function (event) {
                    // the event callback is debounced, and it's possible that widget
                    // is already destroyed when it's executed
                    if (this._destroyed) {
                        return;
                    }
                    this.toggleClearButton();
                    this._valueChanged(event);
                }), null, this.defaultDelay));

            this.connect(this.domNode, "onclick", "_onClick");
        },

        clearValue: function () {
            // summary:
            //      Clears the value of the search box
            // tags:
            //      public

            this.set("value", "");
            this.focus();
            this.toggleClearButton();
            this._valueChanged();
        },

        toggleClearButton: function () {
            // summary:
            //      Set visibility for clear button
            // tags:
            //      private

            // show clear button only if textbox has value
            domStyle.set(this.clearButton, "visibility", this.textbox.value ? "visible" : "hidden");
        },

        focus: function () {
            // summary:
            //      Set focus for textbox
            // tags:
            //      public

            focusManager.focus(this.textbox);
        },

        _onClick: function () {
            // summary:
            //		Keep focus on textbox
            // tags:
            //		private

            this.focus();
        },

        _valueChanged: function (/* Event */event) {
            // summary:
            //      Trigger when textbox value has been changed
            // tags:
            //      private

            if (event && event.charOrCode) {
                switch (event.charOrCode) {
                    case keys.ESCAPE:
                        this.clearValue();
                        return;
                    case keys.PAGE_DOWN:
                    case keys.DOWN_ARROW:
                    case keys.PAGE_UP:
                    case keys.UP_ARROW:
                    case keys.LEFT_ARROW:
                    case keys.RIGHT_ARROW:
                    case keys.TAB:
                        // do nothing when navigating, selecting text
                        return;
                }

                if (!this.triggerChangeOnEnter && event.charOrCode === keys.ENTER) {
                    return;
                }
            }

            this.onSearchBoxChange(this.encodeSearchText ? htmlEntities.encode(this.textbox.value) : this.textbox.value);
        },
        onSearchBoxChange: function (queryText) {
            // summary:
            //      Callback for the search box change event
            // tags:
            //      public
        }
    });
});
