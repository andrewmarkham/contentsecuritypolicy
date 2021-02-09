define("epi-cms/contentediting/PropertyXhtmlRenderer", [
    "epi",
    "dojo",
    "epi-cms/contentediting/PropertyRenderer"],

function (epi, dojo, PropertyRenderer) {

    return dojo.declare([PropertyRenderer], {
        // summary:
        //    PropertyXhtmlString's renderer.
        // description:
        //    Hybrid renderer.
        //    If the given value contains fragements which need to be parsed, the renderer will ask for server's render, otherwise, just return the plain html value.
        // tags:
        //    internal

        render: function (contentLink, propertyName, propertyValue, renderSettings) {
            // summary:
            //    Get the content rendered by the server for an editable block.
            //
            // contentLink: object
            //    The content containing the update property
            //
            // propertyName: String
            //    The updated property name.
            //
            // propertyValue: String
            //    The updated raw value of the property.
            //
            // returns:
            //      A deferred
            //
            // tags:
            //    public

            if (this._containStringFragment(propertyValue)) { //check fragment
                //server render
                return this.inherited(arguments);
            } else {
                //just return value
                var def = new dojo.Deferred();
                def.resolve(propertyValue);
                return def;
            }
        },

        _containStringFragment: function (value) {
            // summary:
            //    Check if the given value contains any string fragment that need to be rendered on server.
            //
            // value: String
            //    The value
            //
            // tags:
            //    private

            //Regexp explanation
            //We look for a tag with class attribute matching "epi_pc" or "epi_dc".
            //This part (?:\s+[\w-]+=['"]+[^'"]*?['"])*\s+ matches any number of attributes in a tag.
            //That part is repeated twice to match possible attributes before and after the class attribute.
            var pcRgex = /<\w+(?:\s+[\w-]+=['"]+[^'"]*?['"])*\s+class="epi_pc"(?:\s+[\w-]+=['"]+[^'"]*?['"])*\s*>/gi;
            var dcRgex = /<\w+(?:\s+[\w-]+=['"]+[^'"]*?['"])*\s+class="epi_dc"(?:\s+[\w-]+=['"]+[^'"]*?['"])*\s*>/gi;

            return (value && value.match && (value.match(pcRgex) || value.match(dcRgex)));
        }
    });

});
