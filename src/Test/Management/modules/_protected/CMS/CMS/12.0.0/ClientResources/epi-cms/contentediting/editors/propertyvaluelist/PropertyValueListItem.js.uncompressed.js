require({cache:{
'url:epi-cms/contentediting/editors/propertyvaluelist/templates/PropertyValueListItem.html':"<div class=\"epi-card epi-card--numbered epi-card--mini\">\r\n    <div class=\"dijitInline dojoDndHandle\">\r\n        <span class=\"dijitInline epi-iconDnD\">\r\n        </span>\r\n    </div>\r\n    <div class=\"dijitInline epi-mo\" data-dojo-attach-point=\"containerNode\"></div>\r\n    <span class=\"dijitInline dijitIcon epi-iconContextMenu\"></span>\r\n</div>\r\n"}});
﻿define("epi-cms/contentediting/editors/propertyvaluelist/PropertyValueListItem", [
    // dojo
    "dojo/_base/declare",
    // dijit
    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "epi/shell/widget/_FocusableMixin",
    // resources
    "dojo/text!./templates/PropertyValueListItem.html"
], function (
    // dojo
    declare,
    // dijit
    _WidgetBase,
    _Container,
    _TemplatedMixin,
    _FocusableMixin,
    // resources
    template
) {
    return declare([_WidgetBase, _Container, _TemplatedMixin, _FocusableMixin], {
        // summary:
        //      The view for the PropertyValueListItem. Responsible for setting
        //      the editor and handle focus
        // tags:
        //      internal

        templateString: template,

        // widgetFactory: [readonly] epi/shell/widget/WidgetFactory
        //      The widget factory used when creating the editor
        widgetFactory: null,

        // editorDefinition: [readonly] Object
        //      The editor metadata used when creating the editor
        editorDefinition: null,

        buildRendering: function () {
            this.inherited(arguments);

            // Create the editor using the widget factory
            this._createDeferred = this.widgetFactory.createWidgets(this, this.editorDefinition).then(function (widgets) {
                this.editor = widgets[0];

                // Hook up the change event on the editor and forward it to wrapper
                this.own(this.editor.on("change", function (editorValue) {
                    if (typeof this.editor.isValid === "function" && !this.editor.isValid()) {
                        return;
                    }
                    this.onChange(editorValue);
                }.bind(this)));
            }.bind(this));
        },

        getDisplayedValue: function () {
            if (!this.editor) {
                return "";
            }

            return this.editor.displayedValue;
        },

        onChange: function (value) {
            // summary:
            //      callback method called when the value has changed
            //  tags:
            //      public
        },

        focus: function () {
            // summary:
            //      Focus the editor
            // tags:
            //      public

            this._createDeferred && this._createDeferred.then(function () {
                this.editor.focus && this.editor.focus();
            }.bind(this));
        },

        _onFocus: function (sender) {
            this.onFocus(sender);
        }
    });
});
