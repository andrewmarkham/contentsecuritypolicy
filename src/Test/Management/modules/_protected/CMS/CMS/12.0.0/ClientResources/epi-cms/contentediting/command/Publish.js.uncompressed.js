define("epi-cms/contentediting/command/Publish", [
//Dojo
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/when",
    //EPi
    "epi/shell/TypeDescriptorManager",

    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/command/_ChangeContentStatus",

    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
],

function (
//Dojo
    declare,
    topic,
    when,
    //EPi
    TypeDescriptorManager,

    ContentReference,
    ContentActionSupport,
    _ChangeContentStatus,

    //Resources
    resources
) {

    return declare([_ChangeContentStatus], {
        // summary:
        //      Publish content command.
        //
        // tags:
        //      internal

        label: resources.publish.label,

        executingLabel: resources.publish.executinglabel,

        tooltip: resources.publish.title,

        iconClass: "epi-iconPublished",

        action: ContentActionSupport.saveAction.Publish,

        // forceReload: [public] Boolean
        //      When publishing a content, it may affect the preview parts which fetch data from published version meanwhile the context change request might not force the preview to reload if the preview is already reloaded before the action (switch Allproperties/OPE).
        forceReload: true,

        _execute: function () {
            // summary:
            //    Executes this command; publish the current content
            //
            // tags:
            //		protected

            // Execute base to change content status
            return when(this.inherited(arguments)).then(function (result) {
                // Update tree children nodes
                // if this has sorting by sort order.
                var versionAgnosticId = new ContentReference(result.oldId).createVersionUnspecificReference().toString();
                topic.publish("/epi/cms/contentdata/childrenchanged", versionAgnosticId);
            });
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            this.inherited(arguments);

            var contentData = this.model.contentData,
                res = null;

            switch (contentData.status) {
                case ContentActionSupport.versionStatus.PreviouslyPublished:
                    res = resources.republish;
                    break;
                case ContentActionSupport.versionStatus.CheckedOut:
                    if (contentData.isMasterVersion) {
                        res = resources.publish;
                    } else {
                        res = resources.publishchanges;
                    }
                    break;
                default:
                    res = resources.publishchanges;
            }

            var publishView = TypeDescriptorManager.getValue(contentData.typeIdentifier, "publishView");

            this.set("label", res.label);
            this.set("title", res.title);
            this.set("executingLabel", res.executinglabel);
            this.set("viewName", publishView);
        }
    });
});
