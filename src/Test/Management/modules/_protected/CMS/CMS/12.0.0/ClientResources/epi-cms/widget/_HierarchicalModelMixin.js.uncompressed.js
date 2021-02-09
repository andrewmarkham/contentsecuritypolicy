define("epi-cms/widget/_HierarchicalModelMixin", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    // epi
    "epi/shell/_HierarchicalModelMixin"
],

function (
// dojo
    declare,
    lang,
    // epi
    _HierarchicalModelMixin
) {

    return declare([_HierarchicalModelMixin], {
        // summary:
        //      Decorate model for epi/shell/_HierarchicalModelMixin
        // tags:
        //      public

        isTypeOfRoot: function (/*dojo/data/Item*/contentItem) {
            // summary:
            //      Checks to see if the item is type of root node such as: root, sub root
            // contentItem: [dojo/data/Item]
            //      The given data item object that wanted to verify
            // returns: [Boolean]
            // tags:
            //      public, extension

            return !!(contentItem && (this.isRoot(contentItem) || contentItem.isSubRoot));
        },

        isRoot: function (/*dojo/data/Item*/contentItem) {
            // summary:
            //      Checks to see if the item is a root node in the content tree
            // contentItem: [dojo/data/Item]
            //      The given data item object that wanted to verify
            // returns: [Boolean]
            // tags:
            //      public

            return !!(contentItem && this.root && contentItem === this.root);
        }

    });

});
