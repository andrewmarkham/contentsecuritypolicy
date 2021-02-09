define("epi-cms/contentediting/ClientRenderer", [
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "epi-cms/contentediting/_Renderer"],

function (declare, Deferred, _Renderer) {

    return declare([_Renderer], {
        // summary:
        //    Pure client side renderer.
        // tags:
        //    internal

        render: function (contentLink, propertyName, propertyValue, renderSettings) {
            // summary:
            //    Get the content rendered by the server for an editable block.
            // contentLink: Object
            //    The content containing the update property
            //
            // propertyName: String
            //    The updated property name.
            //
            // propertyValue: String
            //    The updated raw value of the property.
            //
            // returns:
            //      Deferred
            //
            // tags:
            //    public

            var def = new Deferred();

            // Resolve property value as it is
            //
            def.resolve(propertyValue || "");

            return def;
        }
    });

});
