define("epi/shell/widget/ContextMenu", [
    "dojo/_base/declare",
    "dojo/aspect",
    "dojo/dom-geometry",
    "dijit/Menu",
    "dijit/popup",

    "epi/shell/command/_CommandConsumerMixin",
    "epi/shell/command/builder/MenuAssembler",
    "epi/shell/command/builder/MenuBuilder",

    "epi/shell/command/builder/MenuWithSeparatorBuilder"
], function (
    declare,
    aspect,
    domGeometry,
    Menu,
    popup,

    _CommandConsumerMixin,
    MenuAssembler,
    MenuBuilder,
    MenuWithSeparatorBuilder
) {

    var ContextMenu;

    aspect.before(popup, "open", function (args) {
        // Propagate the popupParent property from our ContextMenu to the dijit popup machinery.
        // This keeps the popupParent, the owner of our popup, in the dijit.focus.activeStack.
        // Otherwise we'll lose the dijitFocused class from the parent and the onBlur will
        // be raised on it, etc.

        var popup = args.popup;
        if (popup && popup instanceof ContextMenu && popup.popupParent) {
            args.parent = popup.popupParent;
            return [args];
        }
    });

    return ContextMenu = declare([Menu, _CommandConsumerMixin], {
        // summary:
        //      A context menu that can display context commands for an item.
        //
        // tags:
        //      public

        // category: string
        //		If set the menu will be filtered on the category.
        category: null,

        // leftClickToOpen: [readonly] Boolean
        //		Menu will open on left click instead of right click.
        leftClickToOpen: true,

        postCreate: function () {

            this.inherited(arguments);

            var defaultConfiguration = { builder: new MenuBuilder(), target: this, category: this.category },
                assembler;

            var configuration = [
                defaultConfiguration,
                { builder: new MenuWithSeparatorBuilder(), target: this, category: "menuWithSeparator" },
                { builder: new MenuBuilder(), target: this, category: "popup" }
            ];
            assembler = new MenuAssembler({ configuration: configuration, commandSource: this });

            assembler.build();
        },

        scheduleOpen: function (/*DomNode?*/delegatedTarget, /*DomNode?*/iframe, /*Object?*/coords, /*DomNode?*/target) {
            // summary:
            //      Display the menu
            // remarks:
            //      See more details in the base class(Dijit/Menu)
            // tags:
            //      public

            this._scheduleOpen(delegatedTarget, iframe, coords, target);
        },

        forceOpen: function (e) {
            // summary:
            //      Force to display the menu next to the icon
            // tags:
            //      internal

            if (!e.target || !e.target.parentElement) {
                return;
            }
            var contextMenuIconNode = e.target.parentElement.querySelector(".epi-iconContextMenu");
            if (!contextMenuIconNode) {
                return;
            }

            e.stopPropagation();
            e.preventDefault();
            var position = domGeometry.position(contextMenuIconNode);

            this.scheduleOpen(contextMenuIconNode, null, {x: position.x, y: position.y});
        }
    });
});
