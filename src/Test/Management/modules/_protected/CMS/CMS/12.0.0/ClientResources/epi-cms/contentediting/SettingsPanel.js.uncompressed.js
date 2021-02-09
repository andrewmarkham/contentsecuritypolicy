require({cache:{
'url:epi-cms/contentediting/templates/SettingsPanel.html':"﻿<div class=\"epi-documentHeader\">\r\n    <div data-dojo-type=\"epi/shell/layout/SimpleContainer\" data-dojo-attach-point=\"widgetContainer\"></div>\r\n    <div data-dojo-attach-point=\"contentDetails\"></div>\r\n</div>"}});
﻿define("epi-cms/contentediting/SettingsPanel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/Deferred",
    "dojo/when",
    "dojo/dom-geometry",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/_LayoutWidget",
    "dijit/layout/BorderContainer",
    "epi/shell/layout/SimpleContainer",
    "dojo/text!./templates/SettingsPanel.html"
],
function (
    declare,
    lang,
    array,
    Deferred,
    when,
    domGeometry,
    _Container,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _LayoutWidget,
    BorderContainer,
    SimpleContainer,
    template) {

    return declare([_LayoutWidget, _Container, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //    Base class for rendering a content block.
        // tags:
        //    internal abstract

        templateString: template,

        contentViewModel: null,

        detailsWidgetIdentifier: "epi-cms/contentediting/ContentDetails",

        detailsModelIdentifier: "epi-cms/contentediting/viewmodel/ContentDetailsViewModel",

        detailsWidgetProperties: null,

        _contentDetailsDef: null,

        _contentDetailsModelDef: null,

        buildRendering: function () {
            this.inherited(arguments);

            // Load details widget class and its model class async
            var widgetIdentifier = this.detailsWidgetIdentifier;
            var modelIdentifier = this.detailsModelIdentifier;
            var widgetDef = new Deferred();
            var modelDef = new Deferred();

            require([widgetIdentifier, modelIdentifier], lang.hitch(this, function (widgetClass, modelClass) {

                var widget = new widgetClass({}, this.contentDetails);
                this.own(widget);

                var model = new modelClass();
                this.own(model);

                widget.set("model", model);

                // If the widget constructor takes time to load, we might have missed the startup, so better call it manually.
                widget.startup();

                this.contentDetails = widget;
                widgetDef.resolve(widget);
                modelDef.resolve(model);
            }));

            this._contentDetailsDef = widgetDef;
            this._contentDetailsModelDef = modelDef;
        },

        _setContentViewModelAttr: function (contentViewModel) {
            this._set("contentViewModel", contentViewModel);

            // When the model is created, change its datamodel
            when(this._contentDetailsModelDef, function (model) {
                model.set("dataModel", contentViewModel);
            });
        },

        addChild: function (w) {
            // Check settings if this property should be blaced in the contentDetails widget
            if (this.detailsWidgetProperties) {
                var matches = array.filter(this.detailsWidgetProperties, function (item) {
                    return item.propertyName === w.name;
                });
                if (matches.length > 0) {
                    when(this._contentDetailsDef, lang.hitch(this, function (contentDetails) {
                        contentDetails.addChild(w, matches[0].options);
                    }));

                    return;
                }
            }

            // Default: Place in property widget container
            this.widgetContainer.addChild(w);
        }
    });
});
