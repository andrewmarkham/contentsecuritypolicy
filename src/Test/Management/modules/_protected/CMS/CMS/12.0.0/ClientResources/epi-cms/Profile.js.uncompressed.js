define("epi-cms/Profile", [
    "dojo/_base/lang",
    "dojo/when",
    "epi/shell/Profile",
    "epi-cms/ApplicationSettings"
], function (lang, when, Profile, ApplicationSettings) {

    lang.extend(Profile, {

        getContentLanguage: function () {
            // summary:
            //      Get the content language for the host
            // tags:
            //      internal xproduct

            return when(this.get("editlanguage"), function (currentLanguage) {

                //If the user hasn't selected any preferred language yet use the current content language configured in the application settings
                return currentLanguage || ApplicationSettings.currentContentLanguage;
            });
        },
        setContentLanguage: function (languageId) {
            // summary:
            //      Set the language for a specific host (stored on the server)
            //
            // languageId: String
            //      The id of the language to set
            // tags:
            //      internal xproduct

            return this.set("editlanguage", languageId, { location: "server" });
        }
    });

    return Profile;
});
