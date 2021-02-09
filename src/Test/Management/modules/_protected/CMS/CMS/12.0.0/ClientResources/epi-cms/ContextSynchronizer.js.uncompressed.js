define("epi-cms/ContextSynchronizer", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/when",
    "epi/shell/_ContextMixin",
    "epi-cms/core/ContentReference"],
function (
    declare,
    lang,
    connect,
    when,
    _ContextMixin,
    ContentReference) {

    return declare([_ContextMixin], {
        // summary:
        //      A _ContextMixin that synchronizes content changes with the context
        //
        // tags:
        //      internal

        _subscribeHandle: null,

        constructor: function () {
            this._subscribeHandle = connect.subscribe("/epi/cms/contentdata/updated", this, this._updateCurrentContext);
        },

        _updateCurrentContext: function (updatedContent) {
            //When the content is updated, also update the context.

            var contentLink = updatedContent.contentLink;

            //if it's the current context that has been changed, tell the context service to update the context
            when(this.getCurrentContext(), function (currentContext) {
                if (currentContext && ContentReference.compareIgnoreVersion(currentContext.id, contentLink)) {
                    var data = {
                        uri: "epi.cms.contentdata:///" + contentLink
                    };

                    //only append the epslanguage if the content supports languages
                    if (currentContext.languageContext) {
                        data.epslanguage = currentContext.languageContext.preferredLanguage;
                    }
                    connect.publish("/epi/shell/context/updateRequest", data);
                }
            });
        },

        destroy: function () {
            connect.unsubscribe(this._subscribeHandle);
        }

    });
});
