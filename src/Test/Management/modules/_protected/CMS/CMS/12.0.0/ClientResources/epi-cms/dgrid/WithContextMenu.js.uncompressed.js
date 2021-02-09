define("epi-cms/dgrid/WithContextMenu", [
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/on",
    "dojo/query",
    "dgrid/extensions/DijitRegistry",
    "epi/shell/DestroyableByKey",
    "epi/shell/widget/ContextMenu",
    "epi-cms/extension/events"
], function (
    declare,
    event,
    domGeometry,
    domStyle,
    on,
    query,
    DijitRegistry,
    DestroyableByKey,
    ContextMenu,
    events
) {

    return declare([DestroyableByKey, DijitRegistry], {
        // summary:
        //      Extension for dgrid that adds a context menu.
        // tags:
        //      public

        // contextMenu: [public] Object
        //      The context menu widget that is bound to the context menu node of each row
        //      in a grid or list.
        contextMenu: null,

        // commandCategory: [public] String
        //      The command category to be used when determining which command should
        //      appear in the context menu.
        commandCategory: "context",

        // stopPropagation: [public] Boolean
        //      Bool to stop propagation when clicking the context menu
        stopPropagation: false,

        // _contextMenuClass: [private] String
        //      The CSS class used to identify the context menu node within a dgrid-row.
        _contextMenuClass: "epi-iconContextMenu",

        postCreate: function () {
            // summary:
            //      Called after the list or grid has finished being created but before
            //      startup is called.
            // tags:
            //      protected

            this.inherited(arguments);

            this.contextMenu = this.contextMenu || new ContextMenu({ category: this.commandCategory, popupParent: this });

            this.own(
                this.contextMenu,
                this.on("." + this._contextMenuClass + ":click", this._contextMouseHandler.bind(this)),
                this.on(on.selector(".dgrid-row", events.keys.shiftf10), this._contextKeyHandler.bind(this))
            );
        },

        startup: function () {
            // summary:
            //      Called automatically after postCreate if the component is already
            //      visible; otherwise, it should be called manually once placed.
            // tags:
            //      protected

            this.inherited(arguments);

            this.contextMenu.startup();
        },

        onContextMenuClick: function (e) {
            // summary:
            //      Opens the context menu at the position the event occurred.
            // tags:
            //      protected callback

            // If the grid supports selection then ensure the row is selected before opening the
            // context menu.
            if (this.selection) {
                this.select(e.target);
            }

            on.emit(e.target, "dgrid-contextmenu", { bubbles: true });

            this.contextMenu.scheduleOpen(this.domNode, null, {
                x: e.pageX,
                y: e.pageY
            });
        },

        _extendedSelectionHandler: function (e, target) {
            // summary:
            //      Extend the selection handler for "extended" mode, so that clicks on
            //      the context menu of a selected row will not clear the selection.
            // tags:
            //      protected

            var hasContextMenuClass = new RegExp("\\b" + this._contextMenuClass + "\\b");

            // If we are clicking on the context menu and the target row is already
            // selected, then do an early exit in order to avoid deselecting the currently
            // selected rows.
            if (hasContextMenuClass.test(e.target.className) && this.isSelected(target)) {
                return;
            }

            this.inherited(arguments);
        },

        _isNodeVisible: function (domNode) {
            // summary:
            //      Checks the computed style on a domNode to see if display is other than "none"
            //      and visibility is other than "hidden".
            // tags:
            //      private

            if (!domNode) {
                return false;
            }
            var style  = domStyle.get(domNode);
            return style.display !== "none" && style.visibility !== "hidden";
        },

        _contextMouseHandler: function (e) {
            // tags:
            //      private

            if (this.stopPropagation) {
                e.stopImmediatePropagation();
                e.stopPropagation();
            }

            this.onContextMenuClick(e);
        },

        _contextKeyHandler: function (e) {
            // tags:
            //      private

            var contextMenuNode = query("." + this._contextMenuClass, e.target)[0],
                position;

            if (!this._isNodeVisible(contextMenuNode)) {
                return;
            }

            e.stopPropagation();
            e.preventDefault();
            position = domGeometry.position(contextMenuNode);

            this.onContextMenuClick({
                target: contextMenuNode,
                pageX: position.x,
                pageY: position.y
            });
        }
    });
});
