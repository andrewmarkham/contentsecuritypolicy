define("epi/username", [
    "dojox/html/entities",
    "epi/dependency",
    "epi/i18n!epi/shell/ui/nls/episerver.shared.text"
],

function (
    entities,
    dependency,
    localizations
) {

    return {
        // tags:
        //      public

        toUserFriendlyString: function (username, currentUsername, capitalizeUsername, keepEmptyUsername, useSubjectPronoun) {
            // summary:
            //      Gets a user friendly username. If the username to be displayed is the same as
            //      the current username, then this will return "you".
            // username: String
            //      The username to be displayed.
            // currentUsername: String?
            //      The username to compare with to see if it's the current user.
            // capitalizeUsername: Boolean?
            //      If the first character should be in upper case.
            // keepEmptyUsername: Booelan?
            //      If the empty username should be kept or replaced by "Installer".
            // useSubjectPronoun: Booelan?
            //      True when the subject pronoun should be used to replace the username when it
            //      matches with the current username; otherwise false to use the object pronoun.
            // tags:
            //      public

            if (!currentUsername) {
                currentUsername = this._getCurrentUsername();
            }

            var emptyUsername = keepEmptyUsername ? "" : localizations.installer,
                youUsername = useSubjectPronoun ? localizations.yousubject : localizations.youobject,
                friendlyUsername = username && currentUsername.toLowerCase() === username.toLowerCase() ? youUsername : username || emptyUsername;

            if (capitalizeUsername) {
                friendlyUsername = friendlyUsername.charAt(0).toUpperCase() + friendlyUsername.slice(1);
            }
            return friendlyUsername;
        },

        toUserFriendlyHtml: function (username, currentUsername, capitalizeUsername, keepEmptyUsername, useSubjectPronoun) {
            // summary:
            //      Creates a user friendly version of the username and wraps it inside standardized
            //      HTML for styling purposes.
            // username: String
            //      The username to be displayed.
            // currentUsername: String?
            //      The username to compare with to see if it's the current user.
            // capitalizeUsername: Boolean?
            //      If the first character should be in upper case.
            // keepEmptyUsername: Booelan?
            //      If the empty username should be kept or replaced by "Installer".
            // useSubjectPronoun: Booelan?
            //      True when the subject pronoun should be used to replace the username when it
            //      matches with the current username; otherwise false to use the object pronoun.
            // tags:
            //      public

            var formattedUserName = this.toUserFriendlyString(username, currentUsername, capitalizeUsername, keepEmptyUsername, useSubjectPronoun);
            if (formattedUserName === "") {
                return formattedUserName;
            }
            return "<span class='epi-username'>" + entities.encode(formattedUserName) + "</span>";
        },

        _getCurrentUsername: function () {
            if (!this.currentUsername) {
                var profile = dependency.resolve("epi.shell.Profile");
                //TODO: Make this Async
                this.currentUsername = profile.get("userName");
            }
            return this.currentUsername;
        }
    };
});
