require({cache:{
'url:epi-cms/compare/template/CompareToolbar.html':"<div class=\"dijit\" role=\"toolbar\" tabIndex=\"${tabIndex}\" data-dojo-attach-point=\"containerNode\">\r\n    <span data-dojo-attach-point=\"leftVersionSection\" class=\"epi-compare-toolbar__text-wrapper\">\r\n        <span>${_resources.comparing}</span>\r\n        <span data-dojo-attach-point=\"leftVersionSelector\"></span>\r\n\r\n        <span data-dojo-attach-point=\"leftDate\"></span>\r\n        <span class=\"epi-secondaryText epi-compare-toolbar__info-text\">${_resources.by}</span>\r\n        <span data-dojo-attach-point=\"leftBy\"></span>\r\n    </span>\r\n    <span data-dojo-attach-point=\"rightVersionSection\" class=\"epi-compare-toolbar__text-wrapper\">\r\n        <span>${_resources.with}</span>\r\n        <span data-dojo-attach-point=\"rightVersionSelector\"></span>\r\n        <span data-dojo-attach-point=\"rightDate\"></span>\r\n        <span class=\"epi-secondaryText epi-compare-toolbar__info-text\">${_resources.by}</span>\r\n        <span data-dojo-attach-point=\"rightBy\"></span>\r\n    </span>\r\n    <span data-dojo-attach-point=\"messageSection\" class=\"epi-compare-toolbar__text-wrapper epi-compare-toolbar__text-wrapper--text-only\"></span>\r\n</div>\r\n"}});
define("epi-cms/compare/CompareToolbar", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/Evented",
    "dojo/topic",

    "dijit/Toolbar",
    "epi/shell/widget/DeferredDropDownButton",

    "epi",
    "epi/username",
    "epi-cms/version/VersionSelector",
    "epi/shell/widget/_ModelBindingMixin",

    "dojo/text!./template/CompareToolbar.html",
    "epi/i18n!epi/shell/ui/nls/episerver.shared.header",
    "epi/i18n!epi/shell/ui/nls/episerver.cms.compare"
], function (
    declare,
    lang,
    domClass,
    Evented,
    topic,

    Toolbar,
    DeferredDropDownButton,

    epi,
    username,
    VersionSelector,
    _ModelBindingMixin,

    template,
    localizations,
    compareResources
) {
    return declare([Toolbar, Evented, _ModelBindingMixin], {
        // summary:
        //      Compare toolbar.
        // tags:
        //      internal xproduct

        region: "top",
        baseClass: "epi-compare-toolbar epi-localToolbar epi-flatToolbar",
        templateString: template,

        _leftVersionSelector: null,
        _rightVersionSelector: null,

        _resources: lang.mixin(localizations, compareResources),

        modelBindingMap: {
            currentLanguage: ["currentLanguage"],

            leftVersion: ["leftVersion"],
            rightVersion: ["rightVersion"],

            leftButtonLabel: ["leftButtonLabel"],
            rightButtonLabel: ["rightButtonLabel"],

            leftByText: ["leftByText"],
            rightByText: ["rightByText"],

            leftDateText: ["leftDateText"],
            rightDateText: ["rightDateText"],

            messageText: ["messageText"],
            showsVersionSelectors: ["showsVersionSelectors"]
        },

        buildRendering: function () {
            // summary:
            //      Setup the widgets DOM node based on the template and additionally create the version selectors.
            // tags:
            //      private
            this.inherited(arguments);

            this._leftVersionSelector = this._createVersionSelector("leftVersion", "left");
            this._rightVersionSelector = this._createVersionSelector("rightVersion", "right");

            this._leftButton = new DeferredDropDownButton({
                "class": "epi-chromeless epi-chromeless--with-arrow epi-flat",
                dropDown: this._leftVersionSelector,
                iconClass: "epi-iconVersions"
            }, this.leftVersionSelector);

            this._rightButton = new DeferredDropDownButton({
                "class": "epi-chromeless epi-chromeless--with-arrow epi-flat",
                dropDown: this._rightVersionSelector,
                iconClass: "epi-iconVersions"
            }, this.rightVersionSelector);

            this.own(
                this._leftVersionSelector,
                this._rightVersionSelector,
                this._leftButton,
                this._rightButton
            );
        },

        _refreshSelectors: function () {
            this._leftVersionSelector.refresh();
            this._rightVersionSelector.refresh();
        },

        _setLeftVersionAttr: function (version) {
            // summary:
            //      Sets the versions and updates the selectors.
            // tags:
            //      private
            if (epi.areEqual(this.leftVersion, version)) {
                // Early exit if setting the same value since we shouldn't cause unnecessary refreshes.
                // This also prevents recursive loops.
                return;
            }

            this._set("leftVersion", version);

            if (version) {
                this._leftVersionSelector.set("contentLink", version.contentLink);
                this._rightVersionSelector.set("markedContentLink", version.contentLink);
                this._refreshSelectors();
            }
        },

        _setRightVersionAttr: function (version) {
            this._set("rightVersion", version);

            if (version) {
                this._rightVersionSelector.set("contentLink", version.contentLink);
                this._leftVersionSelector.set("markedContentLink", version.contentLink);
            }
        },

        _setLeftButtonLabelAttr: function (label) {
            this._set("leftButtonLabel", label);
            this._leftButton.set("label", label);
        },

        _setRightButtonLabelAttr: function (label) {
            this._set("rightButtonLabel", label);
            this._rightButton.set("label", label);
        },

        _setLeftByTextAttr: {
            node: "leftBy",
            type: "innerHTML"
        },

        _setRightByTextAttr: {
            node: "rightBy",
            type: "innerHTML"
        },

        _setLeftDateTextAttr: {
            node: "leftDate",
            type: "innerHTML"
        },

        _setRightDateTextAttr: {
            node: "rightDate",
            type: "innerHTML"
        },

        _setMessageTextAttr: {
            node: "messageSection",
            type: "innerHTML"
        },

        _setShowsVersionSelectorsAttr: function (showsVersionSelectors) {
            // Hide the left and right sections if there is no right version.
            domClass.toggle(this.leftVersionSection, "dijitHidden", !showsVersionSelectors);
            domClass.toggle(this.rightVersionSection, "dijitHidden", !showsVersionSelectors);

            // Hide the message section if there is a right version.
            domClass.toggle(this.messageSection, "dijitHidden", showsVersionSelectors);

            this.emit("versionInformationUpdated");
        },

        _createVersionSelector: function (property, region) {
            // summary:
            //      Creates a drop down button with a version selector as its content.
            // tags:
            //      private

            var model = this.model,
                selector = new VersionSelector({
                    store: model.contentVersionStore,
                    region: region,
                    languages: model.languages,
                    currentLanguage: model.currentLanguage,
                    name: property
                }),
                callback = function (name, oldValue, value) {
                    selector.set(name, value);
                };

            this.own(
                selector.on("change", function (e) {
                    model.set(property, e.version);
                }),
                model.watch("languages", callback),
                model.watch("currentLanguage", callback)
            );

            return selector;
        }
    });
});
