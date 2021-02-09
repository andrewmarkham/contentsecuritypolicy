define("epi-cms/widget/_HasChildDialogMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom",
    "dijit/_FocusMixin",
    "dijit/popup"
], function (
    declare,
    lang,
    aspect,
    dom,
    _FocusMixin,
    popup
) {

    return declare([_FocusMixin], {
        // summary:
        //    Base class for all EPiServer CMS property editor controls.
        // tags:
        //    public

        // isShowingChildDialog: [public] Boolean
        //    Indicates whether a child dialog window is currently being displayed.
        isShowingChildDialog: false,

        // _openedChildDialog: [private] Widget
        //      A reference to the currently open child dialog
        _openedChildDialog: null,

        // _waitingForFocus: [private] Boolean
        //      A flag indicating that the child dialog has been closed and we're waiting for a focus on this widget
        _waitingForFocus: false,

        startup: function () {
            // summary:
            //		startup widgets
            // tags:
            //		public

            if (!this._started) {
                this.own(
                    aspect.before(popup, "open", lang.hitch(this, "_onPopupOpen"), true),
                    aspect.after(popup, "close", lang.hitch(this, "_onPopupClosed"), true)
                );
            }

            this.inherited(arguments);
        },

        _onPopupOpen: function (openArgs) {
            // summary:
            //      Called before a popup is opened. Checks if the popup is opened for a descendant,
            //      and if so it's assumed to be a child dialog.
            // tags:
            //		private

            var popup = openArgs.popup;

            // If the popup is a context menu with a parent node then set the dijit focus handling.
            // This will keep the widget in the stack and not blur the owner widget.
            // The WithContextMenu mixin sets popupParent for grid context menus.
            if (popup && popup.popupParent) {
                return;
            }

            // currentTarget is the node clicked to open a pop-up menu
            var target = popup && popup.currentTarget;

            // if the popup is a opened for a descendant node, then it's opened for this widget
            // and we're entering "prevent blur" mode.
            if (target && dom.isDescendant(target, this.domNode)) {
                this._openedChildDialog = popup;
                this.isShowingChildDialog = true;
            }
        },

        _onPopupClosed: function (popup) {
            // summary:
            //      Called when a popup dialog has been closed
            // popup: Object
            //		The provided closed popup instance
            // tags:
            //		private

            if (this._openedChildDialog === popup) {
                this._openedChildDialog = null;
                this.isShowingChildDialog = false;

                // If the popup is closed by a click on this widget we get a focus call,
                // but when focus is lost to a widget which isn't a child of ours we need to explicitly
                // call _onBlur since we've prevented the original blur call when the pop-up was opened.
                // If we're still waiting for a focus call when _waitForFocus executes we've lost focus
                // to an element which is not a descendant.
                this._waitingForFocus = true;
                setTimeout(lang.hitch(this, "_waitForFocus"), 0);
            }
        },

        _waitForFocus: function () {
            // summary:
            //      Pop-up was closed and we should have received focus by now if we are the new focus target.
            // tags:
            //		private

            // _waitForFocus is called inside setTimeout. In some scenarios
            // the widget can be already destroyed
            if (this._destroyed) {
                return;
            }

            if (this._waitingForFocus) {
                this._waitingForFocus = false;
                this._onBlur();
            }
        },

        _onBlur: function () {
            // summary:
            //		This is where widgets do processing for when they stop being active,
            //		such as changing CSS classes.  See onBlur() for more details.
            // tags:
            //		protected

            if (this.isShowingChildDialog) {
                return;
            }

            this.inherited(arguments);
        },

        _onFocus: function () {
            // summary:
            //		This is where widgets do processing for when they are active,
            //		such as changing CSS classes.  See onFocus() for more details.
            // tags:
            //		protected

            this._waitingForFocus = false;

            if (this.isShowingChildDialog) {
                return;
            }

            this.inherited(arguments);
        }
    });
});
