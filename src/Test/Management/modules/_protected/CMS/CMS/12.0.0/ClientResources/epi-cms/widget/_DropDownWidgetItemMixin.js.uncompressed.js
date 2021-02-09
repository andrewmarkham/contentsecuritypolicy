define("epi-cms/widget/_DropDownWidgetItemMixin", [
    "dojo/_base/declare",
    "dojo/dom-construct"
], function (declare, DomConstruct) {
    return declare(null, {
        // summary:
        //    Mixin for a dropdown item.
        //
        // description:
        //    Used to wrap an widget into a <tr><th></tr></th> so it can be added
        //    to a dropdown button.
        //
        // tags:
        //    internal

        buildRendering: function () {
            this.inherited(arguments);
            this.domNode = this._wrapItem(this);
        },

        _wrapItem: function (/*Object*/item) {
            // summary:
            //    Returns the widget domNode wrapped into a <tr><td> elements.
            //
            // item:
            //    The widget to be wrapped.
            //
            // tags:
            //    private
            var tr = DomConstruct.create("tr");
            var td = DomConstruct.create("th", null, tr);
            item.placeAt(td, "first");
            return tr;
        }

    });
});
