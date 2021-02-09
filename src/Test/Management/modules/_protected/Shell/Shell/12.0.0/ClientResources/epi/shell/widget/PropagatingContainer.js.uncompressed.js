define("epi/shell/widget/PropagatingContainer", [
    "epi",
    "dojo",
    "dijit",
    "dijit/_Widget",
    "dijit/_Container",
    "dijit/_Contained"],

function (epi, dojo, dijit, _Widget, _Container, _Contained) {

    return dojo.declare([_Widget, _Container, _Contained], {
        // summary:
        //    Container that should be used when set properties need to be propagated to child widgets.
        //
        // tags:
        //      internal

        buildRendering: function () {
            this.inherited(arguments);
            dojo.addClass(this.domNode, "dijitContainer");
        },

        set: function (/*String*/property, /*Object*/value) {
            // summary:
            //    Sets the property value and also propagates the set to all children.
            // tags:
            //    public

            this.inherited(arguments);

            dojo.forEach(this.getChildren(), function (child) {
                child.set(property, value);
            });
        }
    });
});
