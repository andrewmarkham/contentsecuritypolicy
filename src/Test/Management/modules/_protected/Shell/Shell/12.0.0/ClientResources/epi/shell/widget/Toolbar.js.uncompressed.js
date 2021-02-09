define("epi/shell/widget/Toolbar", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/Toolbar",
    "epi/shell/DestroyableByKey"
], function (
    declare,
    lang,
    Toolbar,
    DestroyableByKey
) {

    return declare([Toolbar, DestroyableByKey], {
        // summary:
        //		Overriden toolbar that refines focusing functionality.
        //
        // tags:
        //      internal

        _originalTabIndex: null,
        _focusable: null,
        _firstFocusableItem: null,

        postCreate: function () {
            // summary:
            //      Post widget create initialization
            // description:
            //      Make sure that toolbar can not be tabbed into if it does not contain any visible item.
            // tags:
            //      protected

            this.inherited(arguments);

            this._originalTabIndex = this.get("tabIndex");
            this._correctTabIndex();
        },

        addChild: function (child) {
            // summary:
            //      Add child item to the toolbar
            // tags:
            //      public

            this.inherited(arguments);

            if (child.firstFocusable) {
                this.set("_firstFocusableItem", child);
            }

            // watch item visibility change to correct tab index.
            this.destroyByKey(child);
            this.ownByKey(child, child.watch("itemVisibility", lang.hitch(this, function () {
                this._correctTabIndex();
            })));

            this._correctTabIndex();
        },

        removeChild: function (child) {
            // summary:
            //      Add child item to the toolbar
            // tags:
            //      protected

            this.destroyByKey(child);

            this.inherited(arguments);

            this._correctTabIndex();
        },

        _correctTabIndex: function () {
            // summary:
            //      Overwrite tabIndex to -1 if there is no visible item. Otherwise use the original one.
            // tags:
            //      protected

            this._focusable = (this._getFirstFocusableChild() !== null);
            this.set("tabIndex", this._focusable ? this._originalTabIndex : -1);
        },

        _getFirstFocusableChild: function () {
            // summary:
            //      Overridden to make it easy to specify which toolbar item that should get primary focus.
            // tags:
            //      protected

            return this._firstFocusableItem || this.inherited(arguments);
        },

        _startupChild: function (/*dijit/_WidgetBase*/ widget) {
            // summary:
            //      Override the _startupChild method in _KeyNavContainer to stop blur and focus
            //      event listeners being attached. This is because they break tabbing in the dialog.
            // tags:
            //      private
            widget.set("tabIndex", "-1");
        },

        _onChildBlur: function (/*dijit/_WidgetBase*/ widget) {
            // summary:
            //      Called when focus leaves a child widget to go to a sibling widget.
            //      Ensure that the widget losing focus has it's tab index reset.
            // tags:
            //      protected
            widget.set("tabIndex", "-1");
        }
    });
});
