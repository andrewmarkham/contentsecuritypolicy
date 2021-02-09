define("epi-cms/component/_ShowAllLanguagesMixin", [
// Dojo
    "dojo/_base/declare",
    "dojo/when",
    // EPi Framework
    "epi/dependency"
], function (declare, when, dependency) {

    return declare([], {
        // summary:
        //      A mixin that provide storage mechanism for the gadget language setting
        // tags:
        //      internal

        // showAllLanguages: [public] Boolean
        //		Flag which indicates whether to show all languages. Value is true if all languages should be shown; otherwise false.
        showAllLanguages: true,

        // showAllLanguagesKey: [private] String
        //      The key to be used while storing the value into the profile.
        _showAllLanguagesKey: "_showAllLanguages",

        // profile: [private] epi.shell.Profile
        //      The profile store.
        _profile: null,

        constructor: function (kwArgs) {
            this._profile = kwArgs._profile || dependency.resolve("epi.shell.Profile");
        },

        loadShowAllLanguages: function () {
            return when(this._profile.get(this.componentId + this._showAllLanguagesKey)).then(function (showAllLanguages) {
                if (showAllLanguages !== null) {
                    this.showAllLanguages = showAllLanguages;
                    return showAllLanguages;
                }

                return this.showAllLanguages;
            }.bind(this));
        },

        saveShowAllLanguages: function (value) {
            // summary:
            //      Saves the setting in the profile.
            // value: Boolean
            // tags:
            //      public

            this._profile.set(this.componentId + this._showAllLanguagesKey, value);
        }
    });
});
