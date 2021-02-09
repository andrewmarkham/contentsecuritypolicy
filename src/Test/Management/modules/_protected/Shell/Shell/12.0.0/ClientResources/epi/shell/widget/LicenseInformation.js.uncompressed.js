require({cache:{
'url:epi/shell/widget/templates/LicenseInformation.html':"﻿<div class=\"epi-notificationBar epi-status-bar--error\" style=\"display:none;\">\r\n    <div class=\"epi-notificationBarItem\">\r\n        <div class=\"epi-notificationBarText\">\r\n            <p><strong data-dojo-attach-point=\"mainInfoNode\"></strong></p>\r\n            <p data-dojo-attach-point=\"additionalInfoNode\"></p>\r\n        </div>\r\n        <div class=\"epi-notificationBarButtonContainer\">\r\n            <button data-dojo-type=\"dijit/form/Button\" class=\"epi-chromelessButton\" data-dojo-attach-event=\"onClick: _onRefreshButtonClick\">${_res.refresh}</button>\r\n        </div>\r\n    </div>\r\n</div>"}});
﻿define("epi/shell/widget/LicenseInformation", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/topic",
    "dojo/when",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button",
    "epi/dependency",
    "dojo/text!./templates/LicenseInformation.html",
    "epi/i18n!epi/shell/ui/nls/episerver.shell.ui.resources.licenseinformation"],
function (
    declare,
    lang,
    domConstruct,
    domStyle,
    topic,
    when,
    _WidgetBase,
    _TemplatedMixin,
    WidgetsInTemplateMixin,
    Button,
    dependency,
    template,
    resources) {

    return declare([_WidgetBase, _TemplatedMixin, WidgetsInTemplateMixin], {
        // summary:
        //		Widget that displays license information from server.
        // tags:
        //		internal

        // templateString: String
        //      The template string.
        templateString: template,

        // licenseInformationStore: Object
        //      The license information rest store.
        licenseInformationStore: null,

        visible: false,

        // _res: Object
        //      I18N resources.
        _res: resources,

        postMixInProperties: function () {
            // summary:
            //      Obtains the license information store from store registry.

            this.inherited(arguments);

            var storeRegistry = dependency.resolve("epi.storeregistry");
            this.licenseInformationStore = this.licenseInformationStore || storeRegistry.get("epi.shell.licenseinformation");
        },

        buildRendering: function () {
            // summary:
            //      Build rendering from information gotten from the store.

            this.inherited(arguments);

            when(this.licenseInformationStore.query(), lang.hitch(this, this._bindInformation));
        },

        _setVisibleAttr: function (value) {
            // summary:
            //      Visible property setter
            // visible: Boolean
            //      Indicates that the widget is visible or not.

            if (!value && value === this.visible) {
                return;
            }

            this._set("visible", value);
            domStyle.set(this.domNode, "display", value ? "" : "none");

            // Tells the root container to re-layout
            topic.publish("/epi/shell/globalnavigation/layoutchange");
        },

        _onRefreshButtonClick: function () {
            // summary:
            //      Handles the Refresh button.

            when(this.licenseInformationStore.refresh("1"), lang.hitch(this, this._bindInformation));
        },

        _bindInformation: function (licenseInformation) {
            // summary:
            //      Binds license information to the widget.

            if (!licenseInformation || licenseInformation.isValid) {
                this.set("visible", false);
            } else {
                this.mainInfoNode.innerHTML = licenseInformation.message;
                this.additionalInfoNode.innerHTML = licenseInformation.additionalInformation;
                this.set("visible", true);
            }
        }
    });
});
