define("epi-cms/contentediting/MappingManager", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/json",
    "dojo/_base/connect",
    "dojo/dom-attr",
    "dojox/encoding/digests/SHA1"],

function (declare, lang, array, json, connect, domAttr, SHA1) {

    return declare(null, {
        // summary:
        //		Keeps track of relationship among editable blocks, overlay items, property info, and edit wrappers.
        //
        // tags:
        //      internal

        _mappings: null,

        domUtils: null,

        attrNames: [
            "data-epi-edit",
            "data-epi-property-name",
            "data-epi-property-display-names",
            "data-epi-property-customsettings-customtag",
            "data-epi-use-mvc",
            "data-epi-disabled",
            "data-epi-useoverlay",
            "data-epi-overlay-z-index",
            "data-epi-property-type",
            "data-epi-property-edittype",
            "data-epi-property-editorsetting",
            "data-epi-property-editor",
            "data-epi-property-render"],

        constructor: function () {
            // summary:
            //      Constructor.
            //
            // tags:
            //		public

            this._mappings = [];
            this.domUtils = domAttr;
        },

        clear: function () {
            // summary:
            //      Destroy all items in mappings.
            //
            // tags:
            //		public

            var mapping;

            try {
                while ((mapping = this._mappings.pop())) {
                    this._clearMapping(mapping);
                }
            } catch (ex) {
                console.error(ex);
            }
        },

        clearMappings: function (mappings) {
            // summary:
            //      Destroy all the given mappings.
            //
            // tags:
            //		public

            mappings.forEach(function (mapping) {
                try {
                    this._clearMapping(mapping);
                    this._mappings.splice(this._mappings.indexOf(mapping), 1);
                } catch (ex) {
                    console.error(ex);
                }
            }, this);
        },

        _calculateNodeHash: function (node) {
            // summary:
            //		Calculate hash value for a dom node based on data-epi attributes.
            //
            // node: DomNode
            //      The dom node
            //
            // return: SHA1 hash string.
            //
            // tags:
            //		private

            if (!node) {
                return "";
            }
            var attrs = array.map(this.attrNames, lang.hitch(this, function (n) {
                return this.domUtils.get(node, n) || "";
            }));

            return SHA1(json.toJson(attrs));
        },

        add: function (item) {
            // summary:
            //      Add a mapping item.
            //
            // item: Object
            //      The mapping item.
            //
            // tags:
            //		public

            if (item.node) {
                item.nodeHash = this._calculateNodeHash(item.node);
            }
            if (item.blockPropertyInfo && !item.propertyName) {
                item.propertyName = item.blockPropertyInfo.name;
            }

            this._mappings.push(item);
        },

        _tryRemapNode: function (item, editableNode) {
            // summary:
            //      Try to remap an editable node to a mapping item.
            //
            // item: Object
            //      The mapping item.
            //
            // editableNode: Object
            //      The editable node info object.
            //
            // bodyNode: DomNode
            //      Reference to the page's body.
            //
            // returns: Object
            //      | success: true or false.
            //      | mappedNode: the node that is successfully mapped.
            //
            // tags:
            //		private

            if (this._calculateNodeHash(editableNode.node) === item.nodeHash) {
                item.node = editableNode.node;
                item.updateController.displayNode = editableNode.node;
                item.updateController.checkEmptyHtml();
                if (item.overlayItem) {
                    // reset the disabled flag, it's set to false when using iframe for preview
                    item.overlayItem.set("disabled", false);
                    item.overlayItem.set("sourceItemNode", editableNode.node);
                    item.overlayItem.refresh();
                }

                return {
                    success: true,
                    mappedNode: editableNode
                };
            }

            return {
                success: false
            };
        },

        remap: function (editableNodes) {
            // summary:
            //      Remap a list of editable nodes to the mapping items.
            //
            // editableNodes: Array
            //      The mapping item list.
            //
            // returns: Array
            //      List of unmapped node.
            //
            // tags:
            //		private

            var unusedMappingItems = [];

            var unmappedNodes = (editableNodes !=  null ? editableNodes.slice(0) : []);

            //Try remap the old editable blocks, and delete the blocks which are not found on the page anymore
            array.forEach(this._mappings, lang.hitch(this, function (item) {
                if (!item.updateController) {
                    return;
                }

                var mappedNode = null;
                var haveMapped = array.some(unmappedNodes, lang.hitch(this, function (editableNode) {
                    var result = this._tryRemapNode(item, editableNode);
                    mappedNode = mappedNode || result.mappedNode;
                    return result.success;
                }));

                if (haveMapped) {
                    if (mappedNode) {
                        unmappedNodes.splice(array.indexOf(unmappedNodes, mappedNode), 1);
                    }
                } else {
                    this._clearMapping(item);
                    delete item.node;
                    unusedMappingItems.push(item);
                }

                if (item.wrapper && item.node) {
                    item.wrapper.set("blockDisplayNode", item.node);
                }
            }));

            var unusedItem;
            while ((unusedItem = unusedMappingItems.pop())) {
                this._mappings.splice(array.indexOf(this._mappings, unusedItem), 1);
            }

            return unmappedNodes;
        },

        findOne: function (fieldName, value) {
            // summary:
            //      Returns first mapping that has a field with the value.
            //
            // fieldName: String
            //      The field name.
            //
            // value: Object|Variant
            //      The search value.
            //
            // returns: the first match item.
            //
            // tags: public

            var mapping;

            array.some(this._mappings, function (m) {
                if (m[fieldName] === value) {
                    mapping = m;
                    return true;
                }
            });

            return mapping;
        },

        find: function () {
            // summary:
            //      Returns all mappings that has a field with the value
            //
            // arguments: Array
            //      Can either be a filter function or field name and search value.
            //      If there is no argument provided, returns all mappings.
            //
            // returns: the match items.
            //
            // tags: public

            var filter;
            if (arguments[0] === undefined) {
                return this._mappings;
            } else if (lang.isFunction(arguments[0])) {
                filter = arguments[0];
            } else {
                var fieldName = arguments[0], value = arguments[1];
                filter = function (m) {
                    return m[fieldName] === value;
                };
            }

            return array.filter(this._mappings, filter);
        },

        _clearMapping: function (mapping) {
            // summary:
            //      Runs destroy on mapping properties
            //
            // tags:
            //		private

            for (var prop in mapping) {
                if (mapping[prop]) {
                    if (prop !== "node") {

                        if (lang.isFunction(mapping[prop].destroyRecursive)) {
                            mapping[prop].destroyRecursive();
                        } else if (lang.isFunction(mapping[prop].destroy)) {
                            mapping[prop].destroy();
                        } else if (lang.isFunction(mapping[prop].remove)) {
                            mapping[prop].remove();
                        }

                    }

                    mapping[prop] = null;
                }
            }
        }
    });
});
