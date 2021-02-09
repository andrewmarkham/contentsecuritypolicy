define("epi-cms/widget/_ContentListMouseMixin", [
    // Dojo
    "dojo/_base/declare",
    "dojo/dom-class"
],

function (
// Dojo
    declare,
    domClass) {

    return declare(null, {
        // summary:
        //    A Mixin to handle mouse event for ContentList.
        //
        // tags:
        //    internal mixin

        onHover: function (/*DomNode*/node) {
            // summary:
            //		Add hover CSS
        },

        onUnhover: function (/*DomNode*/node) {
            // summary:
            //		Remove hover CSS
        },

        onSelect: function (/*DomNode*/node) {
            // summary:
            //		Add selected CSS

            domClass.add(node, "dgrid-selected ui-state-active dgrid-focus");
        },

        onDeselect: function (/*DomNode*/node) {
            // summary:
            //		Remove selected CSS
            domClass.remove(node, "dgrid-selected ui-state-active dgrid-focus");
        }
    });
});
