define("epi/shell/widget/ToolbarSet", [
    "dojo/_base/declare",

    "dijit/_WidgetBase",

    "epi/shell/layout/ToolbarContainer",
    "epi/shell/widget/_AddByDefinition"
], function (
    declare,

    _WidgetBase,

    ToolbarContainer,
    _AddByDefinition) {

    return declare([_WidgetBase, _AddByDefinition], {
        // summary:
        //		A toolbar set widget that supports adding items using a simplified definition
        //
        // tags:
        //      internal xproduct

        // _layoutContainer: dijit/_Container
        //      Reference to the toolbar's current layout container.
        _layoutContainer: null,

        // layoutContainerClass: Constructor
        //      The layout container class used for the toolbar.
        layoutContainerClass: null,

        postMixInProperties: function () {
            // summary:
            //      Post mix in properties initialization
            // description:
            //      Set default layout container if not specified.

            this.inherited(arguments);

            this.layoutContainerClass = this.layoutContainerClass || ToolbarContainer;
        },

        buildRendering: function () {
            // summary:
            //      Build the toolbar set.
            // description:
            //      Instantiate layout container and put it directly under the dom node.
            this.inherited(arguments);

            this._layoutContainer = new this.layoutContainerClass();
            this._layoutContainer.placeAt(this.domNode);

            this.own(this._layoutContainer);
        },

        addChild: function (child) {
            // summary:
            //      Add a child item to the toolbar set.
            // description:
            //      Delegate to the layout container, who is responsible for arranging items.

            return this._layoutContainer.addChild(child);
        },

        _getLayoutContainerAttr: function () {
            return this._layoutContainer;
        }
    });
});
