define("epi-cms/component/command/ViewTrash", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/when",
    "epi/dependency",
    "epi-cms/ApplicationSettings",
    // Parent class
    "epi/shell/command/_Command",
    // Resource
    "epi/i18n!epi/cms/nls/episerver.cms.command"
], function (
    declare,
    lang,
    topic,
    when,
    dependency,
    ApplicationSettings,
    // Parent class
    _Command,
    // Resource
    resources
) {

    return declare([_Command], {
        // summary:
        //      A command that opens the trash.
        // tags:
        //      internal

        // label: [public] String
        //		The action text of the command to be used in visual elements.
        label: resources.viewtrash,

        // category: [readonly] String
        //		A category which provides a hint about how the command could be displayed.
        category: "setting",

        // typeIdentifiers: [public] Array
        //      An array of type identifiers that indicates which types should be displayed in the trash.
        typeIdentifiers: null,

        postscript: function () {
            this.inherited(arguments);

            var store = this.store || dependency.resolve("epi.storeregistry").get("epi.cms.content.light"),
                request = store.get(ApplicationSettings.wastebasketPage.toString());

            // Get the wastebasket page in order to determine whether the use has READ access. If the user
            // does not have access then the response will have a 403 status code.
            when(request, lang.hitch(this, function (response) {
                this.set("canExecute", response.statusCode !== 403);
            }));
        },

        _execute: function () {
            // summary:
            //		Executes this command; publishes a change view request to change to the view trash view.
            // tags:
            //		protected
            topic.publish("/epi/shell/context/request",
                { uri: "epi.cms.contentdata:///" + ApplicationSettings.wastebasketPage },
                { sender: this, typeIdentifiers: this.typeIdentifiers });
        }
    });
});
