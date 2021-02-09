define("epi-cms/widget/_GridWidgetBase", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-construct",
    "dojo/keys",
    "dojo/topic",
    "dojo/when",

    "dgrid/Keyboard",
    "dgrid/OnDemandGrid",
    "dgrid/Selection",

    "dijit/layout/_LayoutWidget",

    "epi",
    "epi/datetime",
    "epi/UriParser",
    "epi/username",

    "epi/shell/dgrid/Formatter",
    "epi/shell/TypeDescriptorManager",

    "epi-cms/_ContentContextMixin",
    "epi-cms/core/ContentReference",
    "epi-cms/dgrid/DnD",
    "epi-cms/dgrid/formatters",
    "epi-cms/dgrid/WithContextMenu",
    "epi/dependency"
], function (
    declare,
    lang,
    aspect,
    domConstruct,
    keys,
    topic,
    when,

    Keyboard,
    OnDemandGrid,
    Selection,

    _LayoutWidget,

    epi,
    epiDate,
    UriParser,
    username,

    Formatter,
    TypeDescriptorManager,

    _ContentContextMixin,
    ContentReference,
    DnD,
    formatters,
    WithContextMenu,
    dependency
) {

    return declare([_LayoutWidget, _ContentContextMixin], {
        // tags:
        //      internal xproduct

        // _gridClass: [protected] Object
        //		The class to construct the grid with.
        _gridClass: declare([OnDemandGrid, Formatter, Selection, DnD, Keyboard, WithContextMenu]),

        // storeKeyName: [public] string
        //		The key of the store used to retrieve the store from the store registry.
        storeKeyName: null,

        // grid: [public] dgrid
        //		The grid that is used to display information.
        grid: null,

        // store: [public] dojo/store
        //		The store that contains the data.
        store: null,

        // ignoreVersionWhenComparingLinks: [public] boolean
        //		If item comparison should consider versions or not.
        ignoreVersionWhenComparingLinks: true,

        // trackActiveItem: [public] boolean
        //		If comparison should be done to highlight the currently active context item.
        trackActiveItem: true,

        // defaultGridMixin: [protected] object
        //		An object with default settings for dnd to mixin to the grid class.
        defaultGridMixin: null,

        currentItem: null,

        // contextChangeEvent: [public] String
        //      Set the event that will cause a context change (i.e. click or dblclick). Default value is "click".
        contextChangeEvent: "click",

        // forceContextReload: [public] boolean
        //      If context should be forced to reloaded when changing context
        forceContextReload: false,

        // selectionMode: [public] String
        //      The selection mode of the grid. See documentation on dgrid/Selection for valid values.
        selectionMode: "single",

        // selection: [public] Array
        //      An array containing the selected items in the grid.
        selection: null,

        postMixInProperties: function () {
            // summary:
            //		Called after constructor parameters have been mixed-in; sets default values for parameters that have not been initialized.
            // tags:
            //		protected

            this.inherited(arguments);

            this.defaultGridMixin = {
                selectionMode: this.get("selectionMode"),
                dndParams: {
                    creator: lang.hitch(this, this._dndNodeCreator),
                    copyOnly: true,
                    selfAccept: false
                }
            };

            if (!this.store && this.storeKeyName) {
                var registry = dependency.resolve("epi.storeregistry");
                this.store = registry.get(this.storeKeyName);
            }
        },

        startup: function () {
            // summary:
            //		Connects event handlers to common grid events.
            // tags:
            //		protected

            this.inherited(arguments);

            if (this.contextChangeEvent) {
                var callback = lang.hitch(this, "_onChangeContext");
                this.grid.on(".dgrid-row:" + this.contextChangeEvent, callback);

                // Setup the default keyboard handling for changing context if the Keyboard mixin is supported.
                if (typeof this.grid.addKeyHandler == "function") {
                    this.grid.addKeyHandler(keys.ENTER, callback);
                    this.grid.addKeyHandler(keys.SPACE, callback);
                }
            }

            this.grid.on("dgrid-select, dgrid-deselect", lang.hitch(this, "_onSelectionChanged"));
            this.grid.on("dgrid-error", lang.hitch(this, "_onError"));

            if (this.trackActiveItem) {
                this.own(aspect.after(this.grid, "insertRow", lang.hitch(this, this._selectActiveItem)));
            }

            this.own(this.connect(this, "layout", lang.hitch(this, function () {
                this.grid.resize();
            })));

            this.grid.startup();
        },

        destroy: function () {
            if (this.grid) {
                this.grid.destroy();
            }

            this.inherited(arguments);
        },

        select: function (/*Object*/item) {
            // summary:
            //      Select a grid row from the given item
            // item: [Object]
            // tags:
            //      public

            this.grid.clearSelection();
            if (item) {
                // using .toString() instead of item.id to get the full content link, which contains provider name
                var contentLink = (item instanceof ContentReference ? item : new ContentReference(item.id)).createVersionUnspecificReference().toString();
                this.grid.select(contentLink);
            }
        },

        _forceKeepContext: function (/*String*/uri) {
            // summary:
            //
            // uri: [String]
            //
            // tags:
            //      protected, extension

            return this._isSameAsCurrentContext(uri);
        },

        _onChangeContext: function (e) {
            // summary:
            //      Publish a context request when a version is selected in the list.
            // tags:
            //      protected, extension
            this._onChangeContextInternal(e);
        },

        _onChangeContextInternal: function (e) {
            // summary:
            //      Publish a context request when a version is selected in the list.
            // tags:
            //      internal

            var row = this.grid.row(e),
                uri = row.data.uri,
                newContext = { uri: uri };

            if (this._forceKeepContext(uri)) {
                return;
            }

            this._requestNewContext(newContext, { sender: this, forceReload: this.forceContextReload });
        },

        _onSelectionChanged: function (e) {
            // summary:
            //      Emits "itemsSelected" as an array of the items selected.
            // tags:
            //      private

            var selection = [];
            for (var id in this.grid.selection) {
                if (this.grid.selection[id]) {
                    var row = this.grid.row(id);
                    selection.push(row.data);
                }
            }

            this.set("selection", selection);
            this.emit("selectionChanged", { selection: selection });
            this._onSelect(e);
        },

        _onSelect: function (e) {
            // summary:
            //		Publish a context request when a version is selected in the list.
            // tags:
            //		protected, extension
        },

        _onError: function (e) {
            // summary:
            //		Shows an error message to the user when failing to load data.
            // tags:
            //		protected, extension
            var errorMessage = this.grid.errorMessage;
            var error = e.error;

            if (error.status && error.status === 403) {
                errorMessage = epi.resources.messages.nopermissiontoviewdata;
            }
            this._showErrorMessage(errorMessage);
        },

        _requestNewContext: function (contextParameters, callerData) {
            topic.publish("/epi/shell/context/request", contextParameters, callerData);
        },

        restore: function () {
            // summary: Restore component visuals
            this.resize();
        },

        _isActiveItem: function (/*dgrid row*/row) {
            // summary:
            //      Compare uri current dgrid row with current context
            // tags:
            //      private

            return when(this.getCurrentContext(), lang.hitch(this, function (context) {
                var rowUri = row.data.uri;
                return context && this._compareUris(rowUri, context.uri);
            }));
        },

        _selectActiveItem: function (node) {
            // summary:
            //		Called 'after' the insertRow method in order to select the active version.
            // tags:
            //		private

            var row = this.grid.row(node);

            if (!row) {
                //Note: We don't know why row is null in some cases. Is something wrong?
                return node;
            }

            when(this._isActiveItem(row), lang.hitch(this, function (isActive) {
                if (isActive) {
                    if (this.grid.selectionMode === "single") {
                        this.grid.clearSelection();
                    }
                    this.grid.select(row, null);
                }
            }));

            return node;
        },

        contextChanged: function (context, callerData) {
            this.inherited(arguments);

            if (context.type !== "epi.cms.contentdata") {
                return;
            }

            if (!callerData || callerData.sender !== this) {
                // the context changed, probably because we navigated or published something
                this.onContextChanged(context);
            }
        },

        onContextChanged: function (context) {
            this.fetchData();
        },

        fetchData: function () {
            // summary:
            //      Override this method to implement your logic to bind data to the grid.
            //
            // tags:
            //    protected
        },

        _showErrorMessage: function (errorMessage) {
            this.grid.cleanup();

            // There is no public method for setting messages, so use the same style as dgrid.
            this.grid.contentNode.innerHTML = errorMessage  || "";
        },

        contextChangeFailed: function (oldContext, requestContextParams, callerData) {
            // summary:
            //    Subcriptions to /epi/shell/context/requestfailed topic to sync page tree selection
            //
            // tags:
            //    private

            this.inherited(arguments);

            // select old page link
            if (callerData && callerData.sender === this) {
                this._selectActiveItem();
            }
        },

        _renderContentItem: function (object, value, node, options) {
            node.innerHTML = formatters.contentItem(object.typeIdentifier, object.missingLanguageBranch, value);
        },

        _localizeDate: function (value) {
            return formatters.localizedDate(value);
        },

        _createUserFriendlyUsername: function (name) {
            return formatters.userName(name);
        },

        _dndNodeCreator: function (item, hint) {
            // summary:
            //      Custom DnD avatar creator method

            var dndTypes = TypeDescriptorManager.getAndConcatenateValues(item.typeIdentifier, "dndTypes");

            if (!dndTypes && this.dndTypes) {
                dndTypes = this.dndTypes;
            }

            var node = domConstruct.create("div").appendChild(document.createTextNode(item.name));
            return {
                node: node,
                type: dndTypes,
                data: item
            };
        },

        _aroundInsertRow: function (original) {
            // summary:
            //      Called 'around' the insertRow method to fix the grids less than perfect selection.
            // tags:
            //      protected

            return lang.hitch(this, function (object, parent, beforeNode, i, options) {

                // Call original method
                var row = original.apply(this.grid, arguments);

                var currentItem = this.get("currentItem");
                if (currentItem) {
                    // using .toString() instead of currentItem.id to get the full content link, which contains provider name
                    var contentLink = (currentItem instanceof ContentReference ? currentItem : new ContentReference(currentItem.id)).createVersionUnspecificReference().toString();
                    if (contentLink === object.contentLink) {
                        this.select(currentItem);
                    }
                }

                return row;
            });
        },

        _getCurrentItem: function () {
            // summary:
            //      Get current context row based on current context
            // returns: [Promise]
            //      An instance of dgrid row
            // tags:
            //      protected

            return when(this.getCurrentContext(), function (context) {
                return {
                    id: ContentReference.tryConvert(context.id, context).id
                };
            });
        },

        _setSelectionModeAttr: function (/*String*/selectionMode) {
            // summary:
            //      Set the selection mode for the grid.
            // selectionMode: String
            //      The selection mode.
            // tags:
            //      protected

            if (this.grid) {
                this.grid.set("selectionMode", selectionMode);
            }
            this._set("selectionMode", selectionMode);
        }
    });

});
