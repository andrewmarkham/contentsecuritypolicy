require({cache:{
'url:epi-cms/contentediting/templates/ScheduledPublishSelector.html':"﻿<div>\r\n    <div data-dojo-type=\"epi-cms/widget/Breadcrumb\" data-dojo-attach-point=\"breadcrumbNode\" data-dojo-props=\"showCurrentNode: false\"></div>\r\n    <h1 data-dojo-attach-point=\"contentNameNode\" class=\"epi-breadCrumbsCurrentItem dijitInline dojoxEllipsis\"></h1>\r\n    <div data-dojo-attach-point=\"publishChangesCaptionNode\"></div>\r\n    <div data-dojo-type=\"epi/shell/widget/DateTimeSelectorDropDown\" data-dojo-attach-point=\"dateTimeSelector\" data-dojo-props=\"required:true\"></div>\r\n    <div data-dojo-attach-point=\"referenceGrid\" data-dojo-type=\"epi-cms/project/ContentReferenceGrid\" class=\"dijitHidden push-margin--top\"></div>\r\n</div>"}});
define("epi-cms/contentediting/ScheduledPublishSelector", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",

    // Dijit
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",

    //EPi
    "epi/shell/widget/_ActionProviderWidget",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/widget/dialog/_DialogContentMixin",
    "./ScheduledPublishSelectorViewModel",

    // Resources
    "dojo/text!./templates/ScheduledPublishSelector.html",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.scheduledpublishselector",
    "epi/i18n!epi/nls/episerver.shared",

    // Widgets used in template
    "epi/shell/widget/DateTimeSelectorDropDown",
    "epi-cms/project/ContentReferenceGrid",
    "epi-cms/widget/Breadcrumb"
],

function (
// Dojo
    declare,
    lang,
    domClass,

    // Dijit
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    // EPi
    _ActionProviderWidget,
    _ModelBindingMixin,
    _DialogContentMixin,
    ScheduledPublishSelectorViewModel,
    // Resources
    template,
    resources,
    sharedResources
) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin, _ActionProviderWidget, _DialogContentMixin], {
        // summary:
        //    A widget for selecting date when doing a scheduled publish.
        //
        // tags:
        //    internal

        templateString: template,

        modelData: null,

        _setTitleAttr: {
            node: "contentNameNode",
            type: "innerText"
        },

        _setDateLabelAttr: {
            node: "publishChangesCaptionNode",
            type: "innerHTML"
        },

        _setDateValueAttr: function (date) {
            this.dateTimeSelector.set("value", date);
        },

        _setBreadcrumbModelAttr: function (breadcrumbModel) {
            this.breadcrumbNode.set("contentLink", breadcrumbModel);
        },

        _setScheduleButtonEnabledAttr: function (enabled) {
            if (this._actions && this._actions.length) {
                this.setActionProperty("save", "disabled", !enabled);
            }
        },

        _setModelAttr: function (model) {
            // summary:
            //      Set the model for the embedded item grid

            this.inherited(arguments);
            this.referenceGrid.set("model", model);
            if (model) {
                this.own(model.watch("totalItems", lang.hitch(this, "_onGridItemsChange")));
            }
        },

        modelBindingMap: {
            title: ["title"],
            dateLabel: ["dateLabel"],
            dateValue: ["dateValue"],
            breadcrumbModel: ["breadcrumbModel"],
            scheduleButtonEnabled: ["scheduleButtonEnabled"]
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            this.model = this.model || new ScheduledPublishSelectorViewModel(this.modelData);
        },

        postCreate: function () {
            // summary:
            //
            // tags:
            //      protected
            this.inherited(arguments);

            this.connect(this.dateTimeSelector, "onChange", "dateTimeSelectorChanged");

            this.addActions([
                {
                    name: "save",
                    label: resources.confirmtext,
                    settings: { type: "button", "class": "Salt" },
                    action: lang.hitch(this, function () {
                        if (this.dateTimeSelector.validate()) {
                            this.dateTimeSelectorChanged(this.dateTimeSelector.get("value"));
                            this.executeDialog();
                        }
                    })
                },
                {
                    name: "cancel",
                    label: sharedResources.action.cancel,
                    settings: { type: "button" },
                    action: lang.hitch(this, function () {
                        this.cancelDialog();
                    })
                }
            ]);
        },

        _onGridItemsChange: function (propName, oldValue, newValue) {
            // summary:
            //      Changes the label of the schedule button and visibility of the embedded when the visible items in the grid changes.
            // tags:
            //      private

            var hasScheduledItems = newValue > 0;
            if (this.referenceGrid) {
                domClass.toggle(this.referenceGrid.domNode, "dijitHidden", !hasScheduledItems);
            }
            this.setActionProperty("save", "label", hasScheduledItems ? resources.scheduleanyway : resources.confirmtext);
            this.setActionProperty("save", "class", hasScheduledItems ? "" : "Salt");
        },

        dateTimeSelectorChanged: function (value) {
            this.model.set("dateValue", value);
        }
    });
});
