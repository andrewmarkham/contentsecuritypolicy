define("epi/shell/ViewContextHistory", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    "dojo/topic",
    "epi/dependency",
    "epi/shell/ViewSettings"
], function (
    declare,
    lang,
    Stateful,
    topic,
    dependency,
    viewSettings
) {
    return declare([Stateful], {
        // summary:
        //		Stores context for each view to make it possible to retrive the context for the current view.
        //
        // tags:
        //      internal

        profile: null,
        viewName: null,

        postscript: function () {
            // summary:
            //		Watch model and initialize model dependent properties.
            // tags:
            //		public

            this.inherited(arguments);

            topic.subscribe("/epi/shell/context/changed", lang.hitch(this, "_onContextChanged"));
            topic.subscribe("/epi/shell/context/requestfailed", lang.hitch(this, "_onContextChangeFailed"));

            if (!this.profile) {
                this.profile = dependency.resolve("epi.shell.Profile");
            }

            if (!this.viewName) {
                this.viewName = viewSettings.viewName;
            }
        },

        getLastContextForView: function () {
            // summary:
            //		Gets the last context for the view.
            //

            return this.get("profile").get(this._getLastContextProfileKey());
        },

        _onContextChanged: function (context, callerData) {
            // summary:
            //		Sets the context to the last view context for the view.
            //

            return this._setLastContextForView(context);
        },

        _onContextChangeFailed: function (context, callerData) {
            // summary:
            //		Removes the context from the profile for the view.
            //

            this._setLastContextForView(null);
        },

        _setLastContextForView: function (context) {
            // summary:
            //		Sets the context to the last view context for the view.
            //

            return this.get("profile").set(this._getLastContextProfileKey(), context, { location: "session" });
        },

        _getLastContextProfileKey: function () {
            // summary:
            //		Gets the key used to store the context for the last view.
            //

            return "lastContext" + this.get("viewName");
        }
    });
});
