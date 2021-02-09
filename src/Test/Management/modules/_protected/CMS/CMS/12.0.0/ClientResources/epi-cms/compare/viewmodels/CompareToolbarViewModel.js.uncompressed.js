define("epi-cms/compare/viewmodels/CompareToolbarViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    "dojo/when",

    "epi/dependency",
    "epi/datetime",
    "epi/username",
    "epi/shell/TypeDescriptorManager",

    "epi-cms/contentediting/ContentActionSupport",

    "epi/i18n!epi/shell/ui/nls/episerver.cms.compare"
], function (
    declare,
    lang,
    Stateful,
    when,

    dependency,
    datetime,
    username,
    TypeDescriptorManager,

    ContentActionSupport,

    resources
) {
    return declare([Stateful], {
        // summary:
        //      View model for the compare toolbar.
        //
        // tags:
        //      internal

        // contentVersionStore: Store
        //      The content version store.
        contentVersionStore: null,

        // leftVersion: Object
        //      The left version.
        leftVersion: null,

        // rightVersion: Object
        //      The right version.
        rightVersion: null,

        // leftButtonLabel: String
        //      The left version dropdown button's label.
        leftButtonLabel: null,

        // rightButtonLabel: String
        //      The right version dropdown button's label.
        rightButtonLabel: null,

        // leftByText: String
        //      The friendly formatted name of the user who created the left version.
        leftByText: null,

        // rightByText: String
        //      The friendly formatted name of the user who created the right version.
        rightByText: null,

        // leftDateText: String
        //      The friendly formatted creation date of the left version.
        leftDateText: null,

        // leftDateText: String
        //      The friendly formatted creation date of the right version.
        rightDateText: null,

        // messageText: String
        //      The message displayed in the toolbar when comparison cannot be done.
        messageText: null,

        // showsVersionSelectors: Boolean
        //      Indicates that the version selectors should be shown or not.
        showsVersionSelectors: null,

        // hasAccess: Boolean
        //      Indicates that the current user has sufficient access to the current content or not.
        hasAccess: true,

        // typeIdentifier: String
        //      The current content's type identifier.
        typeIdentifier: null,

        // languages: [public] Array
        //      An array of languages supported by the current content. An empty array or null indicates
        //      that the current content does not support localization.
        languages: null,

        // currentLanguage: [public] String
        //      The language code for the language of the current content.
        currentLanguage: null,

        postscript: function () {
            this.inherited(arguments);

            var profile = this._profile || dependency.resolve("epi.shell.Profile");

            when(profile.getContentLanguage(), lang.hitch(this, function (language) {
                this.set("currentLanguage", language);
            }));
        },

        _leftVersionSetter: function (version) {
            // summary:
            //      Sets the left version.

            this.leftVersion = version;

            if (version) {
                this.set("leftButtonLabel", this._createButtonLabel(version));

                this.set("leftByText", username.toUserFriendlyString(version.savedBy, null, false));
                this.set("leftDateText", datetime.toUserFriendlyString(version.savedDate));
            }
        },

        _rightVersionSetter: function (version) {
            // summary:
            //      Sets the right version.

            this.rightVersion = version;

            if (version) {
                this.set("rightButtonLabel", this._createButtonLabel(version));

                this.set("rightByText", username.toUserFriendlyString(version.savedBy, null, false));
                this.set("rightDateText", datetime.toUserFriendlyString(version.savedDate));
            }

            this.set("showsVersionSelectors", version !== null);
        },

        _typeIdentifierSetter: function (typeIdentifier) {
            // summary:
            //      Sets the type identifier.

            this.typeIdentifier = typeIdentifier;
            this._updateMessageText();
        },

        _hasAccessSetter: function (hasAccess) {
            // summary:
            //      Set the hasAccess flag.

            this.hasAccess = hasAccess;
            this._updateMessageText();
        },

        _updateMessageText: function () {
            // summary:
            //      Update the failure message.

            this.set("messageText", this.hasAccess ?
                TypeDescriptorManager.getResourceValue(this.typeIdentifier, "compare.onlyoneversion") :
                resources.insufficientpermission);
        },

        _createButtonLabel: function (version) {
            // summary
            //      Create version dropdown button's label base on the version.
            // version: Object
            //      The version.

            var language = version.language ? " (" + version.language + ")" : "";
            var statusName = ContentActionSupport.getVersionStatus(version.status);
            return statusName + language;
        }
    });
});
