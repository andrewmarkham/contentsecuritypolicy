define("epi-cms/contentediting/_Renderer", [
    "epi",
    "dojo"],

function (epi, dojo) {

    return dojo.declare(null, {
        // summary:
        //      Base class for rendering a content block.
        // tags:
        //      public abstract

        constructor: function (params) {
            dojo.mixin(this, params);
        },

        render: function (contentLink, propertyName, propertyValue, renderSettings) {
            // summary:
            //      Render a content block using render manager's implementation or its own implementation
            //
            // value: String
            //      The node value.
            //
            // tags:
            //      public abstract

            throw new Error("Abstract method _render must be overridden in a derived class");
        }
    });

});
