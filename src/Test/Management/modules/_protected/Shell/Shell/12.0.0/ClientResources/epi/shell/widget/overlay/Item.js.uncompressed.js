define("epi/shell/widget/overlay/Item", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/mouse",
    "dojo/on",
    "dojo/promise/all",
    "dojo/when",

    "dijit/_CssStateMixin",
    "dijit/_TemplatedMixin",

    "./_Base",
    "epi/shell/dnd/Target"
], function (
    array,
    declare,
    lang,
    domClass,
    domStyle,
    mouse,
    on,
    whenAll,
    when,

    _CssStateMixin,
    _TemplatedMixin,

    _Base,
    Target
) {

    return declare([_Base, _TemplatedMixin, _CssStateMixin], {
        // tags:
        //      public

        baseClass: "epi-overlay-item",

        name: "",

        // _displayName: [private] String
        //      name of the property.
        _displayName: null,

        // _description: [private] String
        //      description of the property.
        _description: null,

        _setDisplayNameAttr: function (value) {
            this._displayName = value;

            if (this.informationNode) {
                this.informationNode.textContent = value;
            }
        },

        _setDescriptionAttr: function (value) {
            this._description = value;

            if (this.informationNode) {
                this.informationNode.title = value || "";
            }
        },

        // epi-overlay-bracket div tag added to make clickable on overlay item in IE browser
        templateString: "<div data-dojo-attach-point=\"item\">\
                            <div data-dojo-attach-point=\"containerNode\" class=\"epi-overlay-item-container\">\
                                <span data-dojo-attach-point=\"informationNode\" class=\"epi-overlay-item-info\"></span>\
                                <div class=\"epi-overlay-bracket\"></div>\
                            </div>\
                        </div>",

        allowedDndTypes: null,

        error: false,

        childItems: null,

        parent: null,

        onClick: function (overlayItem, e) {
            // summary:
            //      Click handler
            //
            // tags:
            //      callback
        },

        onDrop: function (overlayItem, dndData) {
            // summary:
            //      Click handler
            //
            // tags:
            //      callback
        },

        onMouseEnter: function (e) {
            // summary:
            //      Mouse enter event
            //
            // tags:
            //      callback
        },

        onMouseLeave: function (e) {
            // summary:
            //      Mouse leave event
            //
            // tags:
            //      callback
        },

        constructor: function () {
            this.childItems = [];
        },

        postCreate: function () {

            this.inherited(arguments);

            this.own(
                on(this.domNode, "click", lang.hitch(this, function (e) {
                    this.onClick(this, e);
                })),
                on(this.domNode, mouse.enter, lang.hitch(this, this.onMouseEnter)),
                on(this.domNode, mouse.leave, lang.hitch(this, this.onMouseLeave))
            );

            this.transferDndControlTo(this);
        },

        destroy: function () {

            if (this.parent && this.parent.removeChild) {
                this.parent.removeChild(this);
            }

            for (var i = 0; i < this.childItems.length; i++) {
                this.childItems[i].destroyRecursive();
            }
            this.childItems = null;

            if (this._dropTarget) {
                this._dropTarget.destroy();
                this._dropTarget = null;
            }

            this.inherited(arguments);
        },

        resize: function (size) {
            //  summary:
            //      Override base method to resize and reposition this item and children

            this.inherited(arguments);

            if (this.childItems) {
                array.forEach(this.childItems, function (item, i) {
                    item.resize();
                });
            }
        },

        updatePosition: function (position) {
            // summary:
            //      Update size of our node according to the position argument
            //
            //      Returns true if the widget has triggered any layout of the source document
            //
            // position: Object
            //      the coordinates to set the position to
            var node = this.informationNode;

            if (node) {
                var height = domStyle.get(node, "minHeight");
                domClass.toggle(node, "epi-overlay-item-info--inside", position.y < height);
            }

            return this.inherited(arguments);
        },

        transferDndControlTo: function (/*Widget*/controller) {
            // summary:
            //      Transfer dnd control to whatever.
            //      For example: Transfer dnd data to editor below the overlay item.
            // controller: [Widget] The holder control dnd data.
            // tags:
            //      public

            var allowedDndTypes = controller.allowedDndTypes,
                restrictedDndTypes = controller.restrictedDndTypes,
                onDropData = controller.onDropData,
                context = controller;

            // Disconnect the old drop handler if there is one
            if (this._dropDataHandler) {
                this.disconnect(this._dropDataHandler);
                this._dropDataHandler = null;
            }

            if (!this._dropTarget) {
                this._setupDnd(context, allowedDndTypes, restrictedDndTypes, onDropData);
            } else {

                //Attach the onDropData event to the new controller
                this.own(this._dropDataHandler = this.connect(this._dropTarget, "onDropData", lang.hitch(controller, onDropData)));

                // Re-setup accept types in target
                var types = allowedDndTypes;
                this._dropTarget.accept = {};
                if (types) {
                    types.forEach(function (type) {
                        this._dropTarget.accept[type] = 1;
                    }, this);
                }

                // If there are restricted types then add them to the accept array
                // with a value of zero to indicated that they are not accepted.
                var reject = this.reject;
                if (reject) {
                    for (var i = 0; i < reject.length; ++i) {
                        this._dropTarget.accept[reject[i]] = 0;
                    }
                }
            }
        },

        onDropData: function (dndData, source, items, copy) {
            var dropValues = dndData.map(function (item) {
                return item.data;
            });

            whenAll(dropValues).then(function (resolvedValues) {
                var propertyName = this.dndSourcePropertyName;

                resolvedValues.forEach(function (item) {
                    var value = propertyName ? item[propertyName] : item;

                    // Call onDrop for each value instead of once for the entire array in order to
                    // avoid a breaking change.
                    this.onDrop(this, value);
                }, this);
            }.bind(this));
        },

        _setupDnd: function (/*Context*/context, /*Array*/allowedDndTypes, /*Array*/restrictedDndTypes, /*Callback method*/ onDropData) {
            // summary:
            //      Setup the overlay as a drag and drop target when there are allowed types configured.
            // tags:
            //      private
            if (allowedDndTypes) {
                this._dropTarget = new Target(this.domNode, {
                    accept: allowedDndTypes,
                    reject: restrictedDndTypes,
                    createItemOnDrop: false
                });

                this._dropDataHandler = this.connect(this._dropTarget, "onDropData", lang.hitch(context, onDropData));

                this.own(this._dropTarget, this._dropDataHandler);
            }
        },

        _setReadOnlyAttr: function (readOnly) {
            this._set("readOnly", readOnly);

            if (this._dropTarget) {
                this._dropTarget.readOnly = readOnly;
            }
        },

        _setErrorAttr: function (value) {
            this.set("state", value ? "Error" : "");
            this._set("error", value);
        }
    });
});
