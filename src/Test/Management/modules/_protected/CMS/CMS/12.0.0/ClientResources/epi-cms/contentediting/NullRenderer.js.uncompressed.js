define("epi-cms/contentediting/NullRenderer", [
    "dojo/_base/declare",
    "dojo/Deferred",
    "epi-cms/contentediting/_Renderer"
], function (declare, Deferred, _Renderer) {

    return declare([_Renderer], {
        // summary:
        //      A renderer that rejects the rendering action, causing nothing to be rendered.
        // tags:
        //      internal

        render: function (contentLink, propertyName, propertyValue, renderSettings) {
            // summary:
            //      Rejects the rendering action so that no changes are made to the DOM.
            // returns:
            //      Promise

            return new Deferred().reject("Do not render the content.");
        }
    });
});
