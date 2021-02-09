define("epi/dnd/Target", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/topic",
    "dojo/json",
    "dijit/Destroyable"
], function (array, declare, lang, connect, topic, json, Destroyable) {
    return declare(Destroyable, {
        // summary:
        //    Native Drag and drop target.
        //
        // tags:
        //    public

        constructor: function () {
            // summary:
            //		Constructor.
            // tags:
            //		Public

            this._dragStartSubscriptions = []; // an array to store all /EPi/DnD/DragStart listeners, which will be used on destroy
            this._dragEndSubscriptions = []; // an array to store all /EPi/DnD/DragEnd listeners, which will be used on destroy
        },

        addDroppableZone: function (node, acceptDataType) {
            // summary:
            //		Add a droppable node to Dnd target.
            // node: DomNode
            //		The droppable node to be added to Dnd target.
            // acceptDataType: String
            //		Type of associated data which is accepted to drop.

            // push this handle into listener list, to be able to unsubscribe them on destroy
            this._dragStartSubscriptions.push(topic.subscribe("/EPi/DnD/DragStart", lang.hitch(this, function (data) {
                node._droppable = (acceptDataType === data.type ||
                                acceptDataType === "EPiServer.FileManagementElement");   // Special case for elements in File management window
                this.onSourceDragStart(node._droppable);
            })));

            this._dragEndSubscriptions.push(topic.subscribe("/EPi/DnD/DragEnd", lang.hitch(this, function (data) {
                if (acceptDataType === data.type ||
                acceptDataType === "EPiServer.FileManagementElemen") {      // Special case for elements in File management window
                    node._droppable = false;
                }
                this.onSourceDragEnd(acceptDataType === data.type);
            })));

            this.own(connect.connect(node, "ondragenter", lang.hitch(this, function (e) {
                this._onDragEnter(e, node);
            })));
            this.own(connect.connect(node, "ondragover", lang.hitch(this, function (e) {
                this._onDragOver(e, node);
            })));
            this.own(connect.connect(node, "ondragleave", lang.hitch(this, function (e) {
                this._onDragLeave(e, node);
            })));
            this.own(connect.connect(node, "ondrop", lang.hitch(this, function (e) {
                this._onDrop(e, node, acceptDataType);
            })));
            this.own(connect.connect(node, "ondragend", lang.hitch(this, this._onDragEnd)));
        },

        _onDragEnter: function (e, node) {
            // summary:
            //		Handle ondragenter event.
            // e: Event
            //		event object.
            // tags:
            //		private
            if (node._droppable) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                this.onDragEnter(e, node);
                return false;
            }
        },

        _onDragLeave: function (e, node) {
            // summary:
            //		Handle ondragleave event.
            // e: Event
            //		event object.
            // tags:
            //		private

            this.onDragLeave(e, node);
        },

        _onDragOver: function (e, node) {
            // summary:
            //		Handle ondragover event.
            // e: Event
            //		event object.
            // tags:
            //		private
            if (node._droppable) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = "link";
                this.onDragOver(e, node);
                return false;
            }
        },

        _onDrop: function (e, node, acceptDataType) {
            // summary:
            //		Handle ondrop event.
            // e: Event
            //		event object.
            // tags:
            //		private

            var dragData = null;
            try {
                dragData = json.parse(e.dataTransfer.getData("Text"));
            } catch (ex) {
                return false;
            }

            if (dragData.type === acceptDataType) {
                this.onDrop(e, node, dragData.data);
            }

            if (e.preventDefault) {
                e.preventDefault();
            }

            return false;
        },

        _onDragEnd: function (e) {
            // summary:
            //		Handle ondragend event.
            // e: Event
            //		event object.
            // tags:
            //		private
            this.onDragEnd(e);
        },

        onDragEnter: function (e, node) {
            // summary:
            //     Trigger when some droppables enter the target
            // e: Event
            //		event object.
            // node: Object
            //		this node object.
            // tags: callback
        },

        onDragOver: function (e, node) {
            // summary:
            //     Trigger when some droppables enter the target
            // e: Event
            //		event object.
            // node: Object
            //		this node object.
            // tags: callback
        },

        onDragLeave: function (e, node) {
            // summary:
            //     Trigger when some droppables leave the target
            // e: Event
            //		event object.
            // node: Object
            //		this node object.
            // tags: callback
        },

        onDrop: function (e, node, data) {
            // summary:
            //     Trigger when some droppables dropped on the target
            // e: Event
            //		event object.
            // node: Object
            //		this node object.
            // data: Object
            //     Asscociated data.
            // tags: callback
        },

        onSourceDragStart: function (droppable) {
            // summary:
            //     Trigger when drag event was started by a source
            // droppable: Boolean
            //		Flag to indicate whether this target can accept dragging source or not
            // tags: callback
        },

        onSourceDragEnd: function (droppable) {
            // summary:
            //     Trigger when source's drag event was end
            // droppable: Boolean
            //		Flag to indicate whether this target can accept dragging source or not
            // tags: callback
        },

        onDragEnd: function (e) {
            // summary:
            //     Trigger when drag event was end
            // e: Event
            //		event object.
            // tags: callback
        },

        destroy: function () {
            // summary:
            //     Destroys a DOM element (which is a target). dojo.destroy deletes all children and the node itself.
            // e: Event
            //		event object.
            // tags: callback

            // unsubscribe all listeners
            array.forEach(this._dragStartSubscriptions, function (item) {
                topic.unsubscribe(item);
            });
            delete this._dragStartSubscriptions;

            array.forEach(this._dragEndSubscriptions, function (item) {
                topic.unsubscribe(item);
            });
            delete this._dragEndSubscriptions;
        }
    });
});
