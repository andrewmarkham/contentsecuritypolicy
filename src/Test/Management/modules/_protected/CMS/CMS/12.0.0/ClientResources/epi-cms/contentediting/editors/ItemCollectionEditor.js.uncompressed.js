require({cache:{
'url:epi-cms/contentediting/editors/templates/ItemCollectionEditor.html':"﻿<div class=\"dijitInline\" tabindex=\"-1\" role=\"presentation\">\r\n    <!-- To reuse styling of content area we wrap into a div that include content area class -->\r\n    <div class=\"epi-content-area-editor\" data-dojo-attach-point=\"container\">\r\n        <div data-dojo-attach-point=\"itemsContainer\"></div>\r\n        <div data-dojo-attach-point=\"actionsContainer\" class=\"epi-content-area-actionscontainer\"></div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/contentediting/editors/ItemCollectionEditor", [
// Dojo
    "dojo/_base/array",                                                         // got some array extension methods
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",                                                         // used to stop event
    "dojo/aspect",                                                              // used to listen event from model
    "dojo/dom-class",                                                           // used to add/remove dom class
    "dojo/dom-construct",                                                       // used to create dom elem
    "dojo/dom-style",                                                           // used to show or not the action's container
    "dojo/dom-geometry",                                                        // used to get dom position
    "dojo/keys",                                                                // used to detect key to open context menu
    "dojo/mouse",                                                               // used to detect mouse event
    "dojo/on",                                                                  // used to listen event
    "dojo/query",                                                               // used to select dome
    "dojo/topic",                                                               // used to publish global event
    "dojo/when",                                                                // used to work with potential assynchronous calls

    // Dijit
    "dijit/_TemplatedMixin",                                                    // mixin into me
    "dijit/_WidgetsInTemplateMixin",                                            // mixin into me
    "dijit/layout/_LayoutWidget",                                               // inherited directly

    // EPi Framework
    "epi/shell/dgrid/Formatter",                                                // mixin into grid class
    "epi/shell/dnd/Target",                                                     // used to create an drop zone in actionContainer area
    "epi/shell/widget/_ValueRequiredMixin",                                     // mixin into me
    "epi/shell/widget/ContextMenu",                                             // used to create context menu
    "epi/shell/TypeDescriptorManager",

    // EPi CMS
    "dgrid/Keyboard",                                                           // mixin into grid class
    "dgrid/OnDemandList",                                                       // mixin into grid class
    "dgrid/Selection",                                                          // mixin into grid class
    "epi-cms/dgrid/formatters",                                                 // used to format grid's item display name
    "epi-cms/dgrid/DnD",                                                        // mixin into grid class
    "epi-cms/extension/events",                                                 // used to get default events
    "epi-cms/contentediting/command/NewItem",                                   // used to create new item
    "epi-cms/contentediting/viewmodel/ItemCollectionViewModel",                 // editor view model
    "epi-cms/contentediting/command/ItemCollectionCommands",                    // context menu
    "epi-cms/widget/_HasChildDialogMixin",                                      // mixin into me
    "./_TextWithActionLinksMixin",

    // Resources
    "dojo/text!./templates/ItemCollectionEditor.html",                          // editor template
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.itemcollection"  // language resources

], function (
// Dojo
    array,
    declare,
    lang,
    event,
    aspect,
    domClass,
    domConstruct,
    domStyle,
    domGeometry,
    keys,
    mouse,
    on,
    query,
    topic,
    when,

    // Dijit
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _LayoutWidget,

    // EPi Framework
    Formatter,
    Target,
    _ValueRequiredMixin,
    ContextMenu,
    TypeDescriptorManager,

    // EPi CMS
    Keyboard,
    OnDemandList,
    Selection,
    formatters,
    DnD,
    events,
    NewItemCommand,
    ItemCollectionViewModel,
    ItemCollectionCommands,
    _HasChildDialogMixin,
    _TextWithActionLinksMixin,

    // Resources
    template,
    resources

) {

    return declare([
        _LayoutWidget,                                                          // for base functionalities
        _TemplatedMixin, _WidgetsInTemplateMixin,                               // for base functionalities
        _ValueRequiredMixin,                                                    // for styling
        _HasChildDialogMixin,                                                   // for open dialog to create/edit an item
        _TextWithActionLinksMixin
    ], {
        // summary:
        //      The new editor for property link collection.
        // description:
        //      That supports:
        //          - Collection item name automatically ellipsed
        //          - Sorting list of link items through drag n drop
        //          - Sorting list of link items through context menu
        //          - Create new link
        //          - Edit a link
        //          - Remove a link
        //          - Drag n drop of pages and media
        // tags:
        //    internal

        // baseClass: [public] String
        //    The widget's base CSS class.
        baseClass: "epi-item-collection-editor",

        // multiple: [proteced] Boolean
        //      used by formmixin to determine whether to inject value as an array or single item
        //      return true
        multiple: true,

        // res: [protected] Json object
        //      Language resource
        res: resources,

        // actionsResource: [Object]
        //      The language resource for actions link
        actionsResource: resources,

        // templateString: [protected] String
        //      UI template for the editor
        templateString: template,

        // value: [protected] String
        //      Value of the property (link collection)
        value: null,

        // model: [public] ItemCollectionViewModel
        //      The view model of this edtior.
        model: null,

        // contextMenu: [public] ContextMenu instance
        //      Context menu for each grid's item.
        contextMenu: null,

        // gird: [public] dgrid instance.
        //      The dgrid instance
        grid: null,

        // commandProviderClass: [public] String
        //      The command's namespace can be injected from inheritance or caller.
        commandProviderClass: ItemCollectionCommands,

        // newItemCommand: [public] Command
        //      The command is used to create new item.
        //      That called when user click on new link at textWithLinks widget.
        _newItemCommand: null,

        // _gridClass: [private] Grid class
        //      The grid class to create new grid instance.
        _gridClass: declare([OnDemandList, Formatter, Selection, DnD, Keyboard]),

        // _mouseOverClass: [private] CSS class
        //      Used to show context menu when mouse hover a row
        _mouseOverClass: "epi-dgrid-mouseover",

        // actionsVisible: Boolean
        //      The flag to show/not actions container area
        actionsVisible: true,

        // customTypeIdentifier: [public] String
        //      If set, will be propagated as the dnd type for all items in the collection
        customTypeIdentifier: null,

        onChange: function (value) {
            // summary:
            //      Event raised when model value change or item's sort order changed
            // value:
            //      The link collection value
            // tags:
            //      public callback
        },

        postMixInProperties: function () {

            this.inherited(arguments);

            this.setupAllowedTypes();
        },

        postCreate: function () {
            this.inherited(arguments);

            this.set("model", new ItemCollectionViewModel(this.value, {
                itemModelType: this.itemModelType,
                readOnly: this.readOnly
            }));

            this.setupCommands();
            this.setupList();
            this.setupActionContainer();
            this.setupEvents();
        },

        startup: function () {
            this.inherited(arguments);
            this.contextMenu.startup();
        },

        setupActionContainer: function () {
            // summary:
            //      Initialization a actions container.
            // tags:
            //      protected

            this.own(
                // Setup dndTarget and store it.
                this._dndTarget = new Target(this.actionsContainer, {
                    accept: this.get("allowedDndTypes"),
                    isSource: false,
                    alwaysCopy: false,
                    insertNodes: function () { }
                })
            );

            this.setupActionLinks(this.actionsContainer);

            this._displayActionsContainer();
        },

        setupCommands: function () {
            // summary
            //      Initialization commands
            // tags:
            //      protected

            // Make command provider is injected
            this.contextMenu = this.contextMenu || new ContextMenu();
            this.commandProvider = this.commandProvider || new this.commandProviderClass({ model: this.model, commandOptions: this.commandOptions });
            this.contextMenu.addProvider(this.commandProvider);

            this.own(
                this.contextMenu,
                this.commandProvider,

                // Create new item command, store to reuse.
                this._newItemCommand = new NewItemCommand({
                    model: this.model,
                    dialogContentParams: this.commandOptions ? this.commandOptions.dialogContentParams : {}
                }));
        },

        setupList: function () {
            // summary:
            //      Initialization a list.
            // tags:
            //      protected

            var menu = { hasMenu: !!this.contextMenu, settings: { title: this.res ? this.res.menutooltip : "" } },

                linkAssembler = function (data, object, row) {
                    return "<div class='epi-rowIcon'><span class='dijitInline dijitIcon epi-iconLink epi-objectIcon'></span></div>" + data;
                },
                // Init grid
                settings = {
                    selectionMode: "single",
                    selectionEvents: "click,dgrid-cellfocusin",
                    formatters: [formatters.contentItemFactory("text", "title", "typeIdentifier", menu), linkAssembler],
                    dndParams: {
                        copyOnly: true,
                        accept: this.get("allowedDndTypes"),
                        creator: lang.hitch(this, this._dndNodeCreator),
                        isSource: !this.readOnly
                    },
                    dndSourceTypes: this.customTypeIdentifier ? [this.customTypeIdentifier] : [],
                    consumer: this
                },

                getDndType = function (object) {
                    var types = TypeDescriptorManager.getAndConcatenateValues(this.dndSourceTypes, "dndTypes");

                    if (types.length === 0) {
                        types = this.dndSourceTypes;
                    }
                    return types;
                };

            if (this.customTypeIdentifier) {
                settings._getDndType = getDndType;
            }

            this.own(this.grid = new this._gridClass(settings, this.itemsContainer));
            this.grid.set("showHeader", false);
            this.grid.renderArray(this.model.get("data"));
            this.grid.startup();
        },

        setupEvents: function () {
            // summary:
            //      Initialization events on list.
            // tags:
            //      protected

            var self = this,
                selector = on.selector;

            this.own(
                // Automatic re-focus when selectedItem is changed.
                self.model.on("selectedItem", lang.hitch(this, this.focus)),
                // Sometime model initialization slower than, so we should listen on "initCompleted" then re-render grid ui
                self.model.on("initCompleted", lang.hitch(this, this._renderUI)),
                // When mouse is over a row, show the context menu node
                self.grid.on(selector(".dgrid-row", mouse.enter), function (e) {
                    domClass.add(self, self._mouseOverClass);
                }),
                // When mouse is out of an unselected row, hide the context menu node
                self.grid.on(selector(".dgrid-row", mouse.leave), function (e) {
                    domClass.remove(self, self._mouseOverClass);
                }),
                // Handle row click/selection event
                self.grid.on("dgrid-select", function (e) {
                    self.model.set("selectedItem", e.rows[0].data);
                    self.commandProvider.set("model", self.model);
                }),

                // Listen keyboard event to delete grid's row item
                self.grid.on(selector(".dgrid-row", events.keys.del), function (e) {
                    self.model.remove();
                }),

                // Listen keyboard event to open context menu
                self.grid.on(selector(".dgrid-row", events.keys.shiftf10), function (e) {
                    self._showContextMenu(e);
                }),
                self.grid.on(selector(".dgrid-row", events.contextmenu), function (e) {
                    var item = self.grid.row(e).data;
                    self.model.set("selectedItem", item);
                    self.select(item);
                    self._showContextMenu(e);
                }),
                // Open context menu when click on the context menu icon in row
                self.grid.on(".epi-iconContextMenu:click", function (e) {
                    self.contextMenu.scheduleOpen(self, null, { x: e.pageX, y: e.pageY });
                }),
                // Self handler checkAcceptance on grid
                aspect.around(self.grid.dndSource, "checkAcceptance", function (defaultCheckAcceptance) {
                    return function (source, nodes) {
                        return !self.readOnly && defaultCheckAcceptance.apply(self.grid.dndSource, arguments);
                    };
                }),

                aspect.after(self.grid.dndSource, "onDropData", function (dndData, source, nodes, copy) {

                    var i;

                    // internal move
                    if (self.grid.dndSource === source) {
                        for (i = 0; i < nodes.length; i++) {
                            self.model.moveTo(
                                self.grid.dndSource.getItem(nodes[i].id).data,
                                self.grid.dndSource.current != null ? self.grid.dndSource.getItem(self.grid.dndSource.current.id).data : null,
                                self.grid.dndSource.before);
                        }
                        // external drop
                    } else {
                        for (i = 0; i < dndData.length; i++) {

                            //Need to resolve the data since it might be a deferred.
                            when(dndData[i].data, lang.hitch(this, function (resolvedItem) {
                                self.model.addTo(
                                    resolvedItem,
                                    self.grid.dndSource.current != null ?
                                        this.grid.dndSource.getItem(self.grid.dndSource.current.id).data :
                                        null,
                                    self.grid.dndSource.before);

                                if (source && source.grid && source.grid.consumer && source.grid.consumer !== self) {
                                    source.grid.consumer.model.set("selectedItem", resolvedItem);
                                    source.grid.consumer.model.remove();
                                }
                            }));
                        }
                    }
                }, true),

                // Overide base method from grid to set selected item
                aspect.around(self.grid, "insertRow", lang.hitch(self, self._aroundInsertRow)),

                // Handle model value changed
                this.model.on("changed", lang.hitch(this, function () {
                    this.onChange(this.value = this.model.get("value") || []);
                    this._renderUI();
                    this.focus();
                })),

                // Listen to the grid at onDndStart method to override state
                aspect.after(this.grid.dndSource, "onDndStart", lang.hitch(this, function (source, nodes, copy) {
                    var dndSource = this.grid.dndSource,
                        accepted = dndSource.accept && dndSource.checkAcceptance(source, nodes);

                    domClass[accepted ? "remove" : "add"](this.container, "dojoDndTargetDisabled");
                }), true),

                // Listen dnd event on drop zone
                aspect.after(this._dndTarget, "onDropData", lang.hitch(this, function (dndData, source, nodes, copy) {
                    for (var i = 0; i < dndData.length; i++) {
                        //Need to resolve the data since it might be a deferred.
                        when(dndData[i].data, lang.hitch(this, function (resolvedItem) {
                            this.model.addTo(resolvedItem, null, false);

                            if (source && source.grid && source.grid.consumer && source.grid.consumer !== this) {
                                source.grid.consumer.model.set("selectedItem", resolvedItem);
                                source.grid.consumer.model.remove();
                            }
                        }));
                    }

                    // Set the focus back to the editor after a drop so that
                    // the focus is not left where the drag originated.
                    this.focus();

                }), true)
            );

            // Listen on command to change state
            var commands = this.commandProvider.commands.concat(this._newItemCommand);
            commands.forEach(function (command) {
                this.own(
                    aspect.after(command, "onDialogOpen", function () {
                        self.set("isShowingChildDialog", true);
                        self.validate();
                    }),
                    aspect.after(command, "onDialogHideComplete", function () {
                        self.set("isShowingChildDialog", false);
                        self.focus();
                    })
                );
            }, this);
        },

        executeAction: function (actionName) {
            // summary:
            //      Overidden mixin class, listen acion clicked on textWithLinks widget
            // actionName: [String]
            //      Action name of link on content area
            // tags:
            //      public

            if (actionName === "createnewitem") {
                // Execute create new link command here
                if (this._newItemCommand) {
                    this._newItemCommand.execute();
                }
            }
        },

        setupAllowedTypes: function () {
            // summary:
            //      Setup the allowed types for drag and drop
            // tags:
            //      Public

            var converterKey = this.itemConverterKey;

            this.allowedDndTypes = this.allowedDndTypes || [];

            if (converterKey) {
                this.allowedDndTypes = this.allowedDndTypes.map(function (type) {
                    return type + "." + converterKey;
                });
            }

            if (this.customTypeIdentifier) {
                this.allowedDndTypes.unshift(this.customTypeIdentifier);
            }
        },

        focus: function () {
            // summary:
            //      Focus the container if there is a value and
            //      focus the grid if we already have a model and set selected item,
            //      else focus the textWithLinks widget.
            // tags:
            //    public

            if (this.grid && this.value && this.value.length > 0) {
                this.grid.focus();

                if (this.model) {
                    var selectedItem = this.model.get("selectedItem"),
                        selectedItemIndex = this.model.getItemIndex(selectedItem);
                    if (selectedItem) {
                        this.grid.focus(this.grid.row(selectedItemIndex).element);
                    }
                }
            } else {
                this.textWithLinks.focus();
            }
        },

        select: function (item) {
            // summary:
            //      Set selected item on dgrid
            // item: Object
            //      The selected object
            // tags:
            //      protected

            this.grid.clearSelection();
            if (item) {
                this.grid.select(this.model.getItemIndex(item));
            }
        },

        isValid: function () {
            // summary:
            //    Check if widget's value is valid.
            // isFocused:
            //    Indicate that the widget is being focused.
            // tags:
            //    protected

            return (!this.required || (this.model && this.model.get("value").length > 0));
        },

        _onBlur: function () {
            // summary:
            //      Override base (_HasChildDialogMixin) to check that the context menu is showing or not.
            // tags:
            //      protected override

            if (this.contextMenu && this.contextMenu.isShowingNow) {
                return;
            }
            this.inherited(arguments);
        },

        _getValueAttr: function () {
            // summary:
            //      The get value method
            // tags:
            //      public override

            return this.model.get("value");
        },

        _setValueAttr: function (/*Object*/val) {
            // summary:
            //      The set value method
            // tags:
            //      public override

            this._set("value", val);
            // Reset value to an empty array
            if (!val || !(val instanceof Array)) {
                this._set("value", []);
            }

            if (this._started) {
                this.model ? this.model.set("data", this.value) : (this.model = new ItemCollectionViewModel(this.value, { readOnly: this.readOnly }));
                this._renderUI();
            }
        },

        _setReadOnlyAttr: function (/*Boolean*/readOnly) {
            // summary:
            //      Overwrite readonly property
            // tags:
            //      Protected

            this._set("readOnly", readOnly);

            // Hide actions container area if is readOnly
            this._displayActionsContainer();

            if (this.model) {
                this.model.set("readOnly", readOnly);
            }
        },

        _dndNodeCreator: function (/*Object*/item, /*Object*/hint) {
            // summary:
            //      Custom DnD avatar creator method
            // tags:
            //      Protected

            var dndTypes = this.allowedDndTypes,
                node = domConstruct.create("div").appendChild(document.createTextNode(item.text));

            if (item.typeIdentifier) {
                dndTypes = TypeDescriptorManager.getAndConcatenateValues(item.typeIdentifier, "dndTypes");
            }

            return {
                node: node,
                type: dndTypes,
                data: item
            };
        },

        _aroundInsertRow: function (/*Object*/original) {
            // summary:
            //      Called 'around' the insertRow method to fix the grids less than perfect selection.
            // tags:
            //      private

            return lang.hitch(this, function (object, parent, beforeNode, i, options) {

                // Call original method
                var row = original.apply(this.grid, arguments);

                var currentItem = this.model.get("selectedItem");
                if (currentItem && currentItem.id === object.id) {
                    this.select(currentItem);
                }

                return row;
            });
        },

        _renderUI: function () {
            // summary:
            //      The common method to update grid ui and set selected item.
            // tags:
            //      private

            this.grid.refresh();
            this.grid.renderArray(this.model.get("data"));
        },

        _showContextMenu: function (e) {
            // summary:
            //      Show context menu when keydown (shift+F10 or contextMenu key on windows)
            // e: Object
            //      Keyboard event
            // tags:
            //      private

            // Don't show the context menu if the editor is disabled.
            if (this.readOnly) {
                return;
            }

            var selectedItem = this.model.get("selectedItem"),
                selectedItemIndex = this.model.getItemIndex(selectedItem);
            if (selectedItem) {
                event.stop(e);
                this.contextMenu.scheduleOpen(this, null, domGeometry.position(query(".epi-iconContextMenu", this.grid.row(selectedItemIndex).element)[0], true));
            }
        },

        _displayActionsContainer: function () {
            // summary:
            //      Show/not actions container area
            // tags:
            //      private

            // Hide actions when readonly or set not visible
            domStyle.set(this.actionsContainer, "display", this.readOnly || !this.actionsVisible ? "none" : "");
        }
    });
});
