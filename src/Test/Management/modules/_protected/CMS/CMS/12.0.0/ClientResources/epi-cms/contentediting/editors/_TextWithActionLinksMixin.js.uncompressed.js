define("epi-cms/contentediting/editors/_TextWithActionLinksMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/on",
    "dojo/when",

    // EPi Framework
    "epi/shell/widget/TextWithActionLinks",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.overlay.blockarea"
],

function (
    declare,
    lang,
    Deferred,
    on,
    when,

    // EPi Framework
    TextWithActionLinks,

    // Resources
    resource
) {

    return declare(null, {
        // summary:
        //      Handles action links
        // tags:
        //      public

        // textWithLinks: [Object]
        //      The text with link area
        textWithLinks: null,

        // actionsResource: [Object]
        //      The resource of actions link
        actionsResource: resource,

        isCreateLinkVisible: function () {
            // summary:
            //      Determines whether the "create" link in the action area is visible.
            //      Defaults to true, meaning that the link is shown.
            // returns:
            //      Promise|Boolean
            // tags:
            //      protected

            return true;
        },

        getTemplateString: function () {
            // summary:
            //      Them template string to build actions area
            // tags:
            //      protected

            var deferred = new Deferred();
            var actionResources = this.actionsResource.emptyactions;

            when(this.isCreateLinkVisible(), function (showCreateLink) {

                var templateString = showCreateLink ? actionResources.template : actionResources.templatewithoutcreate;

                deferred.resolve({
                    templateString: templateString,
                    actions: actionResources.actions
                });

            });

            return deferred.promise;
        },

        setupActionLinks: function (/*Object*/container) {
            // summary:
            //      Initial new text with action links of content area, and
            //      depend on context are create will show template without create, otherwise
            // container: [Object]
            //      The container will put text with links
            // tags:
            //      public

            when(this.getTemplateString(), lang.hitch(this, function (template) {

                if (!template) {
                    return;
                }

                this.textWithLinks = new TextWithActionLinks({
                    contentString: template.templateString,
                    namedActions: template.actions
                });

                this.own(on(this.textWithLinks, "onActionClick", lang.hitch(this, this.executeAction)));
                if (container) {
                    this.textWithLinks.placeAt(container);
                }
            }));
        },

        executeAction: function (/*String*/actionName) {
            // summary:
            //      Called when action link clicked
            // tags:
            //      public

            //Override this method to implement custom actions.
        }
    });
});
