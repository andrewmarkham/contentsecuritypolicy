define("epi-cms/dgrid/DnD", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/NodeList",
    "epi/shell/dnd/Source",
    "dojo/dom-construct",

    "epi/dependency",
    "epi/shell/TypeDescriptorManager",

    "put-selector/put"

], function (
    declare,
    lang,
    NodeList,
    DnDSource,
    domConstruct,

    dependency,
    TypeDescriptorManager,

    put) {

    var GridSource = declare(DnDSource, {
        _legalMouseDown: function (evt) {
            // Fix _legalMouseDown to only allow starting drag from an item
            // (not from bodyNode outside contentNode).
            var legal = this.inherited(arguments);
            return legal && evt.target !== this.grid.bodyNode;
        },

        getSelectedNodes: function () {
            var grid = this.grid;

            // If dgrid's Selection mixin is in use, synchronize with it, using a
            // map of node references (updated on dgrid-[de]select events).
            var nodes = this.inherited(arguments);
            if (!grid.selection || Object.keys(grid.selection).length === 0) {
                // Only select if there are nodes available.
                if (nodes.length) {
                    grid.select(nodes[0]);
                }
                return nodes;
            }

            var isGridSelection = false;
            var gridSelectionNodes = new NodeList();

            //isGridSelection when exist any selection in nodes
            for (var id in grid.selection) {
                if (grid.row(id).element !== nodes[0]) {
                    gridSelectionNodes.push(grid.row(id).element);
                } else {
                    isGridSelection = true;
                    gridSelectionNodes.push(nodes[0]);
                }
            }
            if (isGridSelection) {
                return gridSelectionNodes;
            }

            grid.clearSelection();
            // Only select if there are nodes available.
            if (nodes.length) {
                grid.select(nodes[0]);
            }
            return nodes;
        },

        destroy: function () {

            this.grid = null;

            this.inherited(arguments);
        }
    });

    return declare([], {
        // tags:
        //      public

        // dndSourceTypes: Array
        //      Specifies the types which will be set for DnD items in the grid.
        dndSourceTypes: null,

        // dndParams: Object
        //      Object containing params to be passed to the DnD Source constructor.
        dndParams: null,

        // dndConstructor: Function
        //      Constructor from which to instantiate the DnD Source.
        dndConstructor: GridSource,

        // dndDisabled: Booleaen
        //      Set to true to disable the dnd support.
        dndDisabled: false,

        // dndFormatSuffix: String
        //      The format suffix to append to the dndTypes for items contained in the list
        //      Set to allow dragging the item to targets that allow for the type with the specified suffix or have a converter
        dndFormatSuffix: null,

        postCreate: function () {
            this.inherited(arguments);

            if (!this.dndDisabled) {
                this._setupDnD();
            }
        },

        destroy: function () {

            this.inherited(arguments);

            this.dndSource && this.dndSource.destroy();
            this.dndParams = this.dndSource = null;

        },

        insertRow: function (object) {
            // override to add dojoDndItem class to make the rows draggable
            var row = this.inherited(arguments);

            if (this.dndDisabled) {
                return row;
            }
            put(row, ".dojoDndItem");

            // setup the source if it hasn't been done yet
            this._setupDnD();

            var opts = {};
            if (this.query) {
                opts.oldParentItem = { contentLink: this.query.referenceId };
            }

            this.dndSource.setItem(row.id, { data: object, type: this._getDndType(object), options: opts });
            return row;
        },

        _getDndType: function (object) {
            // Get a custom dnd type array from the specific object or a general type array from the source.
            var dndTypes = TypeDescriptorManager.getAndConcatenateValues(object.typeIdentifier, "dndTypes");
            if ((!dndTypes || dndTypes.length <= 0) && this.dndSourceTypes) {
                dndTypes = this.dndSourceTypes;
            }
            if (this.dndFormatSuffix) {
                dndTypes = dndTypes.map(lang.hitch(this, function (type) {
                    return type + "." + this.dndFormatSuffix;
                }));
            }
            return dndTypes;
        },

        _setupDnD: function () {

            if (this.dndSource) {
                return;
            }

            if (!this.dndParams.creator) {
                this.dndParams.creator = lang.hitch(this, this._dndNodeCreator);
            }

            this.dndSource = new this.dndConstructor(
                this.bodyNode,
                lang.mixin(this.dndParams, {
                    // add cross-reference to grid for potential use in inter-grid drop logic
                    grid: this,
                    dropParent: this.contentNode
                })
            );
            // Allows selection of only one element
            this.dndSource.singular = true;
        },

        _dndNodeCreator: function (item, hint) {
            // summary:
            //      Custom DnD avatar creator method

            var dndTypes, node;

            dndTypes = this._getDndType(item);

            if (!dndTypes && this.dndTypes) {
                dndTypes = this.dndTypes;
            }

            node = domConstruct.create("div").appendChild(document.createTextNode(item.name));
            return {
                node: node,
                type: dndTypes,
                data: item
            };
        }
    });
});
