define("epi/dnd/Source", ["dojo"], function (dojo) {

    return dojo.declare(null, {
        // summary:
        //    Native Drag and drop source.
        //
        // tags:
        //    public

        // avatarId: [public] String
        //    Id used for the dragging avatar.
        avatarId: "epi_dnd_avatar",

        // avatarId: [public] String
        //    Id used for the dragging avatar.
        _startDragPos: null,

        // _onDragHandle: [private] Object
        //    Connect handle to drag event.
        _onDragHandle: null,

        // _onDragHandle: [private] Object
        //    Connect handle to dragend event.
        _onDragEndHandle: null,

        buildAvatar: function (node) {
            // summary:
            //		Overridable function to build avatar node for IE browser when drag a node in tree
            // node: HTMLDomNode
            //      The given node to build avatar.
            // tags:
            //		extension
            return dojo.clone(node);
        },

        buildDragImage: function (evt, node) {
            // summary:
            //		Overridable function to build avatar node for not IE browsers when drag a node in tree
            // evt: Object
            //      Event source.
            // node: Object
            //      The given node to build avatar.
            // tags:
            //		extension
        },

        addDraggableNode: function (node, dataType, data) {
            // summary:
            //		Add a draggable node to Dnd source.
            // node: DomNode
            //		The node.
            // dataType: String
            //		Type of associated data.
            // data: Object
            //		Associated data.
            // tags:
            //		public

            node.draggable = true;
            dojo.connect(node, "ondragstart", dojo.hitch(this, function (evt) {
                var dragData = {
                    type: dataType,
                    data: data
                };

                evt.dataTransfer.setData("Text", dojo.toJson(dragData));
                this.buildDragImage(evt, node);

                dojo.publish("/EPi/DnD/DragStart", [{ type: dataType}]);

                if (dojo.isIE <= 9) {
                    this._createAvatar(node);
                }

                return true;
            }));
            dojo.connect(node, "ondragend", dojo.hitch(this, function (evt) {
                dojo.publish("/EPi/DnD/DragEnd", [{ type: dataType}]);
            }));
        },

        _createAvatar: function (node) {
            // summary:
            //		Create avatar object.
            // node: DomNode
            //		The node.

            var pos = this._startDragPos = dojo.position(node);
            var size = dojo.contentBox(node);

            //create avatar
            var avatar = this.buildAvatar(node);
            avatar.id = this.avatarId;

            dojo.place(avatar, dojo.body());

            dojo.style(avatar, "position", "absolute");
            dojo.style(avatar, "display", "block");

            dojo.style(avatar, "width", size.w + "px");
            dojo.style(avatar, "height", size.h + "px");
            dojo.style(avatar, "left", pos.x + "px");
            dojo.style(avatar, "top", pos.y + "px");
            dojo.style(avatar, "zIndex", 1200);

            //connect to drag event
            this._onDragHandle = dojo.connect(dojo.body(), "ondrag", dojo.hitch(this, this._moveAvatar));

            //connect to dragend event
            this._onDragEndHandle = dojo.connect(dojo.body(), "ondragend", dojo.hitch(this, this._destroyAvatar));
        },

        _moveAvatar: function (evt) {
            // summary:
            //		Move avatar object.
            // evt: Event
            //		The event.

            var avatar = dojo.byId(this.avatarId);

            if (!avatar) {
                return;
            }

            var pos = {
                x: evt.clientX,
                y: evt.clientY
            };

            dojo.style(avatar, "left", pos.x + "px");
            dojo.style(avatar, "top", (pos.y + 1) + "px");
        },

        _destroyAvatar: function (evt) {
            // summary:
            //		Destroy avatar object.
            // evt: Event
            //		The event.

            var avatar = dojo.byId(this.avatarId);

            if (!avatar) {
                return;
            }

            dojo.destroy(avatar);

            //disconnect events
            dojo.disconnect(this._onDragHandle);
            dojo.disconnect(this._onDragEndHandle);
        }
    });
});
