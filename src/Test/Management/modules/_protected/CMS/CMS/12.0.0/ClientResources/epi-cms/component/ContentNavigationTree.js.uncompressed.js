define("epi-cms/component/ContentNavigationTree", [
// dojo
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-class",

    "dojo/topic",
    "dojo/when",
    // epi
    "epi/dependency",
    "epi/string",

    "epi/shell/ClipboardManager",
    "epi/shell/command/_WidgetCommandProviderMixin",
    "epi/shell/selection",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/DialogService",

    "epi-cms/_ContentContextMixin",
    "epi-cms/_MultilingualMixin",
    "epi-cms/ApplicationSettings",

    "epi-cms/contentediting/PageShortcutTypeSupport",
    "epi-cms/command/ShowAllLanguages",
    "epi-cms/component/_ContentNavigationTreeNode",
    "epi-cms/component/ContentContextMenuCommandProvider",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/core/ContentReference",

    "epi-cms/widget/ContentTree",
    "epi/shell/widget/ContextMenu",

    "./command/_GlobalToolbarCommandProvider",
    "../command/CopyContent",
    "../command/CutContent",
    "../command/DeleteContent",
    "../command/PasteContent",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.createpage",
    "epi/i18n!epi/cms/nls/episerver.cms.components.pagetree",
    "epi/i18n!epi/cms/nls/episerver.shared.header"
],

function (
// dojo
    array,
    connect,
    declare,
    lang,

    domClass,

    topic,
    when,
    // epi
    dependency,
    epistring,

    ClipboardManager,
    _WidgetCommandProviderMixin,
    Selection,
    TypeDescriptorManager,
    dialogService,

    _ContentContextMixin,
    _MultilingualMixin,
    ApplicationSettings,

    PageShortcutTypeSupport,
    ShowAllLanguagesCommand,
    _ContentNavigationTreeNode,
    ContextMenuCommandProvider,
    ContentActionSupport,
    ContentReference,

    ContentTree,
    ContextMenu,

    _GlobalToolbarCommandProvider,
    CopyCommand,
    CutCommand,
    DeleteCommand,
    PasteCommand,
    // resources
    resCreatePage,
    res
) {

    return declare([ContentTree, _ContentContextMixin, _WidgetCommandProviderMixin, _MultilingualMixin], {
        // summary:
        //      Light weight Page tree component.
        // description:
        //      Extends epi.cms.widget.PageTree to provide global messaging capability.
        // tags:
        //      internal xproduct

        res: res,

        showAllLanguages: true,

        _separatorBeforeCssClass: "rowSeparatorBefore",
        _separatorAfterCssClass: "rowSeparatorAfter",

        _clipboardManager: null,
        _contextMenu: null,
        _contextMenuCommandProvider: null,

        _focusNode: null,

        // gets propagated to dndSource
        betweenThreshold: 0,

        contextMenuCommandProvider: ContextMenuCommandProvider,

        nodeConstructor: _ContentNavigationTreeNode,

        postMixInProperties: function () {
            this.inherited(arguments);

            this._clipboardManager = new ClipboardManager();

            this.selection = new Selection();


            //Create the context menu command provider
            this._contextMenuCommandProvider = new this.contextMenuCommandProvider({
                treeModel: this.model,
                clipboardManager: this._clipboardManager,
                repositoryKey: this.repositoryKey
            });
            this._startupCommands();

            this.model.roots = this.roots;
            this.model.notAllowToDelete = this.settings.preventDeletionFor;
            this.model.notAllowToCopy = this.settings.preventCopyingFor;
        },

        postCreate: function () {
            // summary:
            //    Post create initialization
            // tags:
            //    protected

            this.inherited(arguments);

            this.own(
                this.on("copyOrCut", lang.hitch(this, function (copy) {
                    copy ? this._copyCommand.execute() : this._cutCommand.execute();
                })),
                this.on("delete", lang.hitch(this, function () {
                    this._deleteCommand.canExecute ? this._deleteCommand.execute() : this._showNotificationMessage(this.res.cannotdelete);
                })),
                this.on("showContextMenu", this._showContextMenuFromKeyboard.bind(this)),
                this.on("select", lang.hitch(this, this._onTreeNodeClicked)),
                this.on("paste", function () {
                    if (this._pasteCommand.get("canExecute")) {
                        this._pasteCommand.execute();
                    }
                }.bind(this))
            );

            this.contextRequests = [];

            this.connect(this, "onClick", "_onTreeNodeClicked");

            //TODO: Remove topic and replace with normal event?
            var resetSelection = lang.hitch(this, "_resetSelectionToLastSelected");
            this.subscribe("/epi/dnd/dropdata", resetSelection);
            this.subscribe("/dnd/cancel", resetSelection);
        },

        _showContextMenuFromKeyboard: function (e) {
            this._ensureContextMenu();
            this._contextMenu.forceOpen(e);
        },

        startup: function () {
            this.inherited(arguments);

            when(this.getCurrentContext(), lang.hitch(this, function (context) {
                this.contextChanged(context);
            }));
        },

        _preparePathNodes: function (paths) {
            // summary:
            //      Prepare steps before node selection in the tree
            // tags:
            //      protected, extension

            var self = this,
                parentNodes;

            array.some(paths, function (pathNode, index) {

                var nodes = self.getNodesByItem(pathNode),
                    noNodes = nodes.length === 1 && !nodes[0]; // No hits returns a single item array with the item set to undefined

                if (index > 0 && noNodes) {
                    array.forEach(parentNodes, function (parentNode) {
                        if (parentNode.state === "LOADED") {
                            // "Unset" to get it to refresh next time it is called
                            parentNode._loadDeferred = null;
                        }
                    });

                    return true;
                }

                parentNodes = nodes;

                return false;
            });
        },

        _resetSelectionToLastSelected: function () {
            if (!this._lastSelectedContentReference || !this.selectedItem) {
                return;
            }

            if (this.selectedItem.contentLink !== this._lastSelectedContentReference) {
                // reset when we our selection is not the last one loaded
                this.selectContent(this._lastSelectedContentReference);
            }
        },

        _startupCommands: function () {
            // summary:
            //    Add command buttons to Global Toolbar
            //
            // appInstance: instance of current application
            //
            // tags:
            //    private

            this._showAllLanguagesCommand = new ShowAllLanguagesCommand({ model: this });

            var commands = this._contextMenuCommandProvider.get("commands");

            array.some(commands, lang.hitch(this, function (command) {
                if (command instanceof CopyCommand) {
                    this._copyCommand = command;
                } else if (command instanceof CutCommand) {
                    this._cutCommand = command;
                } else if (command instanceof PasteCommand) {
                    this._pasteCommand = command;
                } else if (command instanceof DeleteCommand) {
                    this._deleteCommand = command;
                }
                if (this._deleteCommand && this._pasteCommand && this._copyCommand) {
                    return true;
                }
            }));

            this.commands = [
                this._showAllLanguagesCommand
            ].concat(commands);
        },

        _setShowAllLanguagesAttr: function (value) {
            this._set("showAllLanguages", value);
            this.model.set("showAllLanguages", value);
            this._showAllLanguagesCommand.set("active", !value);
        },

        _onTreeNodeClicked: function (page, node, event) {
            // summary:
            //    Override onPageChange event
            //
            // page: Object
            //    The page object.
            //
            // tags:
            //    public

            var selectContent = function () {
                if (this.contextRequests.length > 0) {
                    //TODO: optimization, maybe we should drop all middle items?
                    this.contextRequests.push(page);
                    return;
                }

                this._requestContextChange(page);
                this.contextRequests.push(page);
            }.bind(this);

            if (this.selectContentThrottle) {
                clearTimeout(this.selectContentThrottle);
                this.selectContentThrottle = null;
            }

            // Set timeout to change context in case multiple clicks
            this.selectContentThrottle = setTimeout(selectContent, 200);
        },

        _requestContextChange: function (page) {
            // summary:
            //      Get content type and content name, to pass to requestContentChange request
            // tags:
            //      private

            var requestedContent = {
                typeName: TypeDescriptorManager.getResourceValue(page.typeIdentifier, "name"),
                name: page.name
            };

            topic.publish("/epi/shell/context/request", { uri: page.uri }, {
                sender: lang.mixin(this, { requestedContent: requestedContent }),
                forceContextChange: true
            });
        },

        contentContextChanged: function (newContext, callerData) {
            // summary:
            //      Subscriptions to /epi/shell/context/changed topic to sync page tree selection
            // tags:
            //      private

            this._dequeueContextRequest(newContext.versionAgnosticUri);

            var contentReference = new ContentReference(newContext.id),
                reference = contentReference.createVersionUnspecificReference().toString(),
                wasteBasketId = ApplicationSettings.wastebasketPage.toString();

            this.inherited(arguments);

            // We don't show wastebasket int the trees right now
            if (reference === wasteBasketId) {
                return;
            }

            // Set selection data in order to ensure that its value always updated
            this.selection.set("data", this._getSelectionData(this.selectedItem));

            // keep track of which content was selected last
            this._lastSelectedContentReference = reference;

            //If the new selection is the same as the old, return and do not request a context change.
            if (callerData && callerData.sender === this && this.selectedItem && reference === this.selectedItem.contentLink) {
                this._updateGlobalToolbarButtons();
            }

            // If the new context is a supported type then select that type within the tree and update commands.
            if (this.isSupportedType(newContext.dataType)) {
                this.selectContent(reference, false, true).then(lang.hitch(this, "_updateGlobalToolbarButtons"));
            }
        },

        isSupportedType: function (dataType) {
            // summary:
            //      Check the supported type of data type selected.
            // dataType: [String]
            //      The type of data selected
            // tags:
            //      protected

            return this.tree.model.isSupportedType(dataType);
        },

        _getSelectionData: function (/*dojo/data/Item*/itemData) {
            // summary:
            //      Return selection data
            // tags:
            //      private

            return itemData ? [{ type: "epi.cms.contentdata", data: itemData }] : [];
        },

        _updateGlobalToolbarButtons: function (targetNode) {
            // summary:
            //    Show/hide associated buttons (Copy/Cut/Paste/Move to Recycle Bin) with the current action
            //
            // tags:
            //    private

            var node = targetNode || this.get("selectedNode"),
                selected = node ? this._getSelectionData(node.item) : [],
                commandModel = this.getCommandModel(node);

            if (this._createCommand) {
                this._createCommand.set("model", commandModel);
            }

            //Bind the item
            this._contextMenuCommandProvider.updateCommandModel(commandModel);
            this.selection.set("data", selected);
        },

        getCommandModel: function (selectedTreeNode) {
            // summary:
            //    Gets the command model to update the commands with.
            // selectedTreeNode: Object
            //    The selected tree node that contains the command model.
            //
            // tags:
            //    protected

            return selectedTreeNode && selectedTreeNode.item;
        },

        contextChangeFailed: function (oldContext, requestContextParams, callerData) {
            // summary:
            //    Subscriptions to /epi/shell/context/requestfailed topic to sync page tree selection
            //
            // tags:
            //    protected

            this.inherited(arguments);

            if (oldContext) {
                this._dequeueContextRequest(requestContextParams.uri);
                // select old page link
                if (callerData && callerData.sender === this) {
                    this.selectContent(oldContext.contentLink);
                }
            }
        },

        _dequeueContextRequest: function (uri) {
            // summary:
            //      Removes context request with a given url and tries to process another item from the queue
            // tags:
            //      private

            var firstIndexOf = -1;
            this.contextRequests.some(function (request, i) {
                if (request.uri === uri) {
                    firstIndexOf = i;
                    return true;
                }
            });

            if (firstIndexOf !== -1) {
                this.contextRequests.splice(firstIndexOf, 1);
            }
            if (this.contextRequests.length > 0) {
                this._requestContextChange(this.contextRequests[0], this);
            }
        },

        _removeHighlightClass: function () {
            // summary:
            //      Remove highlight css class for current focus node
            // tags:
            //      private

            if (this._focusNode && this._focusNode !== this.selectedNode && this._focusNode.rowNode) {
                domClass.remove(this._focusNode.rowNode, "dijitTreeRowSelected");
            }
        },

        _onContextMenuClose: function () {
            // summary:
            //      Handles context menu close event
            // tags:
            //      private

            this._removeHighlightClass();
        },

        _onContextMenuOpen: function () {
            // summary:
            //      Handles context menu open event
            // tags:
            //      private

            if (this._focusNode) {
                domClass.add(this._focusNode.rowNode, "dijitTreeRowSelected");
            }
        },

        _set_focusNodeAttr: function (value) {
            // summary:
            //      Set focus node function
            // tags:
            //      private

            this._removeHighlightClass();
            this._focusNode = value;
        },

        _ensureContextMenu: function () {
            //Create the context menu if used for the first time
            if (!this._contextMenu) {
                this.own(
                    this._contextMenu = new ContextMenu({ leftClickToOpen: true, category: "context", popupParent: this}),
                    connect.connect(this._contextMenu, "onClose", this, "_onContextMenuClose"),
                    connect.connect(this._contextMenu, "onOpen", this, "_onContextMenuOpen")
                );
                this._contextMenu.addProvider(this._contextMenuCommandProvider);
                this._contextMenu.startup();
            }
        },

        _showContextMenu: function (evt) {
            this._ensureContextMenu();

            //Open the context menu
            this._contextMenu.scheduleOpen(evt.target, null, { x: evt.x, y: evt.y });
        },

        _createTreeNode: function () {
            // summary:
            //      Overridable function to make tree node draggable and droppable after creation
            // args: Object
            //      Tree node creation arguments
            // tags:
            //      extension

            var treeNode = this.inherited(arguments);

            treeNode.on("onContextMenuClick", lang.hitch(this, function (node) {

                this._updateGlobalToolbarButtons(node.node);

                this.set("_focusNode", node.node);
                this._showContextMenu(node);
            }));

            return treeNode;
        },

        getIconClass: function (/*dojo/data/Item*/item, /*Boolean*/opened) {
            // summary:
            //      Overridable function to return CSS class name to display icon,
            // item: [dojo/data/Item]
            //      The current contentdata.
            // opened: [Boolean]
            //      Indicate the node is expanded or not.
            // tags:
            //      public, extension

            var inherited = this.inherited(arguments);

            if (!item || !item.properties || !item.properties.pageShortcutType) {
                return inherited;
            }

            var shortcutTypeIcon = "";

            switch (item.properties.pageShortcutType) {
                case PageShortcutTypeSupport.pageShortcutTypes.Shortcut:
                    shortcutTypeIcon = "epi-iconObjectInternalLink";
                    break;
                case PageShortcutTypeSupport.pageShortcutTypes.External:
                    shortcutTypeIcon = "epi-iconObjectExternalLink";
                    break;
                case PageShortcutTypeSupport.pageShortcutTypes.Inactive:
                    shortcutTypeIcon = "epi-iconObjectNoLink";
                    break;
                case PageShortcutTypeSupport.pageShortcutTypes.FetchData:
                    shortcutTypeIcon = !item.hasTemplate ? "epi-iconObjectContainerFetchContent" : "epi-iconObjectFetchContent";
                    break;
                default:
                    break;
            }

            return shortcutTypeIcon ? inherited + " " + shortcutTypeIcon : inherited;
        },

        enableDrop: function (node, isAllowed) {
            // summary:
            //     Sets whether this target is droppable or not
            // node: Object
            //     Target node to update its _droppable.
            // isAllowed: Boolean
            //     Flag to indicate whether this target is droppable or not.
            // tags: callback

            node._droppable = isAllowed;
        },

        _showNotificationMessage: function (message) {
            // summary:
            //      Show a alert message
            // message:
            //      The message to be displayed in the alert.
            // tags:
            //      private

            dialogService.alert(epistring.toHTML(message));
        },

        _onNodeMouseEnter: function (/* Tree._TreeNode */node, evt) {
            // summary:
            //      Handles mouse enter event on a node
            // tags:
            //      private

            this.inherited(arguments);
            node.showContextMenu(true);
        },

        _onNodeMouseLeave: function (/* Tree._TreeNode */node, evt) {
            // summary:
            //      Handles mouse leave event on a node
            // tags:
            //      private

            this.inherited(arguments);
            node.showContextMenu(false);
        }

    });

});
