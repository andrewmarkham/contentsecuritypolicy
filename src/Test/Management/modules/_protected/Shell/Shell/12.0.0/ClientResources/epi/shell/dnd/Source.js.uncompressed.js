define("epi/shell/dnd/Source", [

//Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/dom-construct",
    "dojo/dnd/Source",
    //EPi Framework
    "./_DndDataMixin",
    "epi/shell/TypeDescriptorManager"],

function (
    //Dojo
    array,
    declare,
    lang,
    topic,
    domConstruct,
    Source,
    //EPi Framework
    _DndDataMixin,
    TypeDescriptorManager) {

    return declare([Source, _DndDataMixin], {
        // tags:
        //      internal

        alwaysCopy: true,

        createItemOnDrop: true,

        //	singular: Boolean
        //		Allows selection of only one element, if true.
        //		Tree hasn't been tested in singular=true mode, unclear if it works.
        singular: true,

        generateText: false,

        _dummyDropItemContainer: null,

        readOnly: null,

        postscript: function () {

            this.inherited(arguments);

            if (!this.createItemOnDrop) {
                this.parent = this._dummyDropItemContainer = domConstruct.create("div");
            }

            // If there are restricted types then add them to the accept array
            // with a value of zero to indicated that they are not accepted.
            var reject = this.reject;
            if (reject) {

                // we need to filter out restrictedDndTypes
                var allowedDnD = [];
                for (var key in this.accept) {
                    allowedDnD.push(key);
                }

                this.accept = {};
                allowedDnD = TypeDescriptorManager.removeIntersectingTypes(allowedDnD, this.reject);
                array.forEach(allowedDnD, function (allowed) {
                    this.accept[allowed] = 1;
                }, this);

                for (var i = 0; i < reject.length; ++i) {
                    this.accept[reject[i]] = 0;
                }
            }
        },

        destroy: function () {

            if (this._dummyDropItemContainer) {
                domConstruct.destroy(this._dummyDropItemContainer);
                this._dummyDropItemContainer = null;
            }

            this.inherited(arguments);
        },

        checkAcceptance: function (source, nodes) {
            // summary:
            //		Checks if the target can accept nodes from this source.
            // source: Object
            //		The source which provides items.
            // nodes: Array
            //		The list of transferred items.
            // tags:
            //    public

            if (this.readOnly) {
                return false;
            }

            var items = array.map(nodes, function (node) {
                return source.getItem(node.id);
            });

            return this._checkAcceptanceForItems(items, this.accept);
        },

        getOrderedItems: function () {
            return array.map(this.getAllNodes(), function (node) {
                return this.getItem(node.id);
            }, this);
        },

        onDndItemRemoved: function (dndData, source, nodes, copy, target) {
            // summary:
            //      Called when the nodes has been removed from the source, i.e. droped in another target
            //
            // dndData:
            //    Dnd data extracted from the dragging items which have the same data type to the current target
            //
            // source:
            //    The dnd source.
            //
            // nodes:
            //    The dragging nodes.
            //
            // copy:
            //    Denote that the drag is copy.
            //
            // tags:
            //    public, event
        },

        onDropData: function (dndData, source, nodes, copy) {
            // summary:
            //    Drop data event.
            //
            // dndData:
            //    Dnd data extracted from the dragging items which have the same data type to the current target
            //
            // source:
            //    The dnd source.
            //
            // nodes:
            //    The dragging nodes.
            //
            // copy:
            //    Denote that the drag is copy.
            //
            // tags:
            //    public, event
        },

        onDrop: function (source, nodes, copy) {
            // summary:
            //		Called only on the current target, when drop is performed
            // source: Object
            //		The source which provides items
            // nodes: Array
            //		The list of transferred items
            // copy: Boolean
            //		Copy items, if true, move items otherwise

            // always copy when dropping on this target type

            var dndData = array.map(nodes, function (node) {
                return this._getDndData(source.getItem(node.id), this.accept, this === source);
            }, this);

            this.inherited(arguments, [source, nodes, this.alwaysCopy || copy]);

            if (!this.createItemOnDrop) {
                domConstruct.empty(this._dummyDropItemContainer);
            }

            this.onDropData(dndData, source, nodes, this.alwaysCopy || copy);

            if (!copy && this !== source && source.onDndItemRemoved) {
                source.onDndItemRemoved(dndData, source, nodes, copy, this);
            }

            topic.publish("/epi/dnd/dropdata", dndData, source, nodes, this.alwaysCopy || copy);
        }
    });
}
);
