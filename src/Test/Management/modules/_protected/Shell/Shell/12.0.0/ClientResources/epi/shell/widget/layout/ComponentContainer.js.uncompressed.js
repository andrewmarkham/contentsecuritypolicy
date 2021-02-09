define("epi/shell/widget/layout/ComponentContainer", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/aspect",
    "dojo/when",

    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/dom-style",


    "dojox/layout/GridContainer",
    "dojox/layout/GridContainerLite",

    "dijit/focus",
    "dijit/registry",

    "epi/dependency",

    "epi/shell/widget/_ActionProvider",

    "epi/shell/widget/ComponentSelectorDialog",
    "epi/shell/widget/layout/_ComponentWrapper",
    "epi/shell/widget/layout/ComponentTabContainer",

    "epi/i18n!epi/shell/ui/nls/episerver.shell.ui.resources"
], function (
    array,
    declare,
    lang,

    aspect,
    when,

    domClass,
    domGeometry,
    domStyle,

    GridContainer,
    GridContainerLite,

    focus,
    registry,

    dependency,

    _ActionProvider,

    ComponentSelectorDialog,
    _ComponentWrapper,
    ComponentTabContainer,

    resources
) {

    return declare([GridContainer, _ActionProvider], {
        // tags:
        //      internal

        // containerUnlocked: [public] Boolean
        //		States whether the container is locked or not.
        containerUnlocked: false,

        // isAutoOrganized: [public] Boolean
        //		Sets if the widgets on the container will be organized automatically or manually.
        isAutoOrganized: false,

        // baseClass: [private] String
        //    The css class for the component container.
        baseClass: "epi-componentContainer",

        // numberOfColumns: [public] Integer
        //		Container's number of columns.
        numberOfColumns: 1,

        // hasResizableColumns: [public] Boolean
        //		If the grid should have resizable columns.
        hasResizableColumns: false,

        // _componentSelectorDialog: [private] epi/shell/widget/ComponentSelectorDialog
        //    The dialog selector for the tab container.
        _componentSelectorDialog: null,

        // _componentsController: [private] epi/shell/widget/Application
        //    Holds the container's dependency controller.
        _componentsController: null,

        postMixInProperties: function () {
            // summary:
            //		Set additional properties after the constructor arguments have been mixed into the widget.
            // tags:
            //		protected

            this.inherited(arguments);

            this.nbZones = this.numberOfColumns;

            this._componentsController = this._componentsController || dependency.resolve("epi.shell.controller.Components");
        },

        resizeChildAfterDrop: function (/*DomNode*/node, /*Object*/targetArea, /*Integer*/indexChild) {
            // summary:
            //    Called when a child is dropped.
            //
            // node:
            //    domNode of dropped widget.
            //
            // targetArea:
            //    AreaManager Object containing information of targetArea
            //
            // indexChild:
            //    Index where the dropped widget has been placed
            //
            // tags:
            //    protected

            this.inherited(arguments);

            if (registry.getEnclosingWidget(targetArea.node) === this) {
                this._onDndDrop();
            }
        },

        _persistComponentSettings: function () {
            // summary:
            //    Get the settings for all the components and persist them

            var components = [];
            this.getChildren().forEach(function (component) {
                var componentDef = this._componentsController.getComponentDefinitionById(component.componentId);

                componentDef.settings = lang.mixin(componentDef.settings, component.get("settings"));
                componentDef.settings.column = component.get("column");
                components.push(componentDef);
            }, this);

            this._componentsController.saveComponents(components);
        },

        buildRendering: function () {
            this.inherited(arguments);

            // Only accept types that has the dndType to this container
            // Must place in buildRendering function because we need to set acceptTypes
            // before call _createCells function in GridContainerLite in order to set value for accept attribute of each zone in GridContainer
            this.acceptTypes = [this.id];
        },

        postCreate: function () {
            // summary:
            //    Executed after the widget has been created.
            //
            // tags:
            //		protected

            this.inherited(arguments);

            this._setupDragManager();

            // The container node of the grid container renders the id, making the same id appear twice. Removing the duplicate.
            this.containerNode.removeAttribute("id");
        },

        _setupDragManager: function () {
            // summary:
            //      Override _searchDragHandle from dojox/mdnd/AreaManager to enable Dnd for current container when it have Dnd child/children
            // tags:
            //      private override

            aspect.before(this._dragManager, "_searchDragHandle", function (/*DOMNode*/node) {
                if (node && domClass.contains(node, "dojoxDragHandle")) {
                    return node;
                }
            });
        },

        startup: function () {
            // summary:
            //    Start up the widget
            //
            // tags:
            //		public

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            // Set whether drag and drop is disabled for components.
            this.changeLockButtonState(false);
        },

        onShow: function () {
            // summary:
            //      Override default behaviour, otherwise dnd will be enabled by default
            //      Enabled the Drag And Drop if it's necessary.
            // tags:
            //      override

            if (this._disabled && this.containerUnlocked) {
                this.enableDnd();
            }
        },

        layout: function () {
            // summary:
            //		Change size of the container node
            // tags:
            //		protected

            //Store the container size before we layout the children
            this._containerSize = {
                h: this._contentBox.h - this._border.h,
                w: this._contentBox.w - this._border.w
            } ;

            this.layoutComponents();

            //Set the size on the container node AFTER we layed out the children
            if (this.doLayout) {
                domGeometry.setContentSize(this.containerNode, {
                    h: this._contentBox.h - this._border.h
                });
                domGeometry.setContentSize(this.domNode, {
                    w: this._contentBox.w - this._border.w
                });
            }
        },

        layoutComponents: function () {
            // summary:
            //		Resize the child components to fit the container size.
            // tags:
            //		protected

            var containerSize = domGeometry.getContentBox(this.gridContainerDiv);
            var childBox = { w: containerSize.w / this.numberOfColumns };

            array.forEach(this.getChildren(), function (widget) {
                if (widget.resize && lang.isFunction(widget.resize)) {
                    widget.resize(childBox);
                }
            });
        },

        _layoutChildren: function (child, height, complete) {
            // Resize the child based on the new height.
            child.resize({ h: height });

            // If the resize is complete persist settings and layout all the components.
            if (complete) {
                child.set("lastOpenHeight", height);

                this.layoutComponents();

                this._persistComponentSettings();
            }
        },

        addComponent: function (/*Object*/component) {
            // summary:
            //    Add a new component to the container.
            //
            // component:
            //    The component that is being added to the container.
            //
            // tags:
            //    public


            this._componentSelectorDialog.hide();
            this._componentsController.addComponent(this, component, true, lang.hitch(this, function () {
                this.layoutComponents();
            }));
        },

        _selectFocus: function () {
            // summary:
            //    Overridden to prevent focus problem in IE. Seems related to http://trac.dojotoolkit.org/ticket/10763
            //
            // tags:
            //    private

            // The GridContainer checks focusNode.parentNode.parentNode without null check
            var focusNode = focus.curNode;
            if (focusNode === null || focusNode.parentNode === null) {
                return;
            }
            this.inherited(arguments);
        },

        addChild: function (/*dijit/_Widget*/child, /*Integer*/column) {
            // summary:
            //    Adds a child in a specific column of the GridContainer widget.
            //    The child is wrapped in a epi/shell/widget/layout/_ComponentWrapper
            //
            // child:
            //    widget to insert
            //
            // column:
            //    column number where the widget will be inserted
            //
            // p:
            //    place in the zone (first = 0)
            //
            // returns: dijit/_Widget
            //    The widget inserted

            var gadget,
                definition = this._componentsController.getComponentDefinitionById(child.componentId),
                id = definition ? definition.id : child.componentId,
                unlocked = this.containerUnlocked,
                settings = {
                    componentId: id,
                    dndType: this.id,
                    isRemovable: definition ? definition.settings.isRemovable : child.params.isRemovable,
                    minHeight: child.get("minHeight") || 200,
                    maxHeight: child.get("maxHeight") || Infinity,
                    dragRestriction: !unlocked,
                    closable: unlocked,
                    heading: child.get("heading"),
                    container: this
                },
                parameters = lang.mixin(settings, definition.settings);

            if (!child.isInstanceOf(_ComponentWrapper) && !child.isInstanceOf(ComponentTabContainer)) {
                gadget = new _ComponentWrapper(parameters);
                gadget.addChild(child);
            } else {
                // the gadget is just being moved to another column.
                gadget = child;
                for (var property in parameters) {
                    gadget.set(property, settings[property]);
                }
            }

            //Connect to the onClose event on the component
            this.connect(gadget, "onClosed", lang.hitch(this, this._gadgetClosed, gadget));

            //Connect to the toggle event on the component
            this._connect(gadget.on("toggle", lang.hitch(this, function () {
                this._componentToggle(gadget);
            })));

            if (column >= this.numberOfColumns) {
                column = this.numberOfColumns - 1;
            }

            var childWidget = this.inherited(arguments, [gadget, column]);

            if (unlocked && lang.isFunction(childWidget.disableResize)) {
                childWidget.disableResize();
            }

            this._onCompontentsChanged();

            return childWidget;
        },

        _componentToggle: function (component) {
            component.resize();
            this.layoutComponents();
            this._persistComponentSettings();
        },

        _gadgetClosed: function (/*dijit/_Widget*/gadget) {
            // summary:
            //    Called when a gadget is closed
            //
            // gadget:
            //    The component that is being closed.
            //
            // tags:
            //    private callback
            var identity = gadget.componentId;
            when(this._componentsController.removeComponent(identity), lang.hitch(this, function () {
                gadget.destroyRecursive();

                this._onCompontentsChanged();

                this._persistComponentSettings();

                this.layoutComponents();
            }));
        },

        _onCompontentsChanged: function () {
            // summary:
            //		Callback function when the components has changed.
            // tags:
            //		protected callback

            this.layoutComponents();
        },

        showComponentSelector: function () {
            // summary:
            //    Raised by the add gadgets button to bring up the select gadgets dialog.
            //
            // tags:
            //    protected

            if (this._componentSelectorDialog === null) {
                this._componentSelectorDialog = new ComponentSelectorDialog();
                this.own(this._componentSelectorDialog);

                this.connect(this._componentSelectorDialog, "onComponentSelected", this.addComponent);
            }

            this._componentSelectorDialog.show();
        },

        changeLockButtonState: function (/*Boolean*/isUnlocked) {
            // summary:
            //    Raised by the locker button and it will lock or unlock component removal and drag and drop.
            //
            // isUnlocked:
            //    Flag determining whether the container is locked or unlocked.
            //
            // tags:
            //    protected

            this.containerUnlocked = isUnlocked;

            array.forEach(this.getChildren(), lang.hitch(this, function (child) {
                child.set("dragRestriction", !isUnlocked);
                child.set("closable", isUnlocked);
            }));

            this.containerUnlocked ? this.enableDnd() : this.disableDnd();
        },

        _saveComponentOrder: function (/*dijit/_Widget[]*/componentList, /*Function*/callback) {
            // summary:
            //    Save componentList order to store
            //
            // componentList:
            //    List of the components on the container that has been rearranged
            //
            // callback:
            //    Callback function.
            //
            // tags:
            //    private
            var reindexedComponentIDsList = array.map(componentList, function (gadget) {
                return { id: gadget.componentId, column: gadget.get("column") };
            });

            this._componentsController.sortComponents(this, reindexedComponentIDsList, callback);
        },

        _onDndDrop: function () {
            // summary:
            //    Raised when a gadget is moved
            //
            // tags:
            //    private callback
            var children = this.getChildren();
            this._saveComponentOrder(children);

            this._onCompontentsChanged();

            this.layoutComponents();
        },

        _reloadGadgets: function () {
            // summary:
            //    Reloads the gadgets in the grid
            //
            // tags:
            //    private
            var gadgets = this.getChildren();
            var numGadgets = gadgets.length;
            var self = this;

            array.forEach(gadgets, function (gadget) {
                self.removeChild(gadget);
                self.addChild(gadget, gadget.get("column"), numGadgets);
            });

            this._onCompontentsChanged();
        },

        _reloadContainer: function (/*Boolean*/reloadChildren, /*Integer*/columns) {
            // summary:
            //    Set the number of columns for the current container.
            //
            // reloadChildren:
            //    Flag determining whether rearrange the widgets on the container or not.
            //
            // columns:
            //    Number of columns
            //
            // tags:
            //    private
            this.numberOfColumns = columns;
            if (reloadChildren) {
                this._reloadGadgets();
            }
        },

        setColumns: function (/*Integer*/columns) {
            // summary:
            //    Set the number of columns in the grid
            //
            // columns:
            //    Number of columns
            //
            // tags:
            //    public
            var componentList = this.getChildren();

            // if the container has not children, it isn't necessary to reorder on the
            // server and reload the gadgets.
            if (componentList.length <= 0) {
                this._reloadContainer(false, columns);
            } else {
                array.forEach(componentList, function (component) {
                    if (component.column >= columns) {
                        component.set("column", columns - 1);
                    }
                });

                this._saveComponentOrder(componentList, lang.hitch(this, function (response) {
                    this._reloadContainer(response, columns);
                }));
            }

            this.inherited(arguments);

            this.resize();
        },

        _organizeChildrenManually: function () {
            // summary:
            //    Organize children by column property of widget.
            //    Overridden to fix a possible bug in GridContainerLite
            //
            // tags:
            //    private
            var children = GridContainerLite.superclass.getChildren.call(this),
                length = children.length,
                child;
            for (var i = 0; i < length; i++) {
                child = children[i];
                try {
                    this._insertChild(child, child.column);  // Don't subtract 1, which is the bug in GridContainerLite
                } catch (e) {
                    console.error("Unable to insert child in GridContainer", e);
                }
            }
        },

        _connect: function (handler) {
            //Add the handler to the default _connect handlers
            this._connects.push(handler);
        },

        getActions: function () {
            // summary:
            //      Gets the actions to be added to the header container's toolbar.
            // tags:
            //      protected

            var self = this,
                actions = this.inherited(arguments),
                addGadgetsMenuItem = {
                    parent: "settings",
                    name: "addGadgets",
                    label: resources.componentselection.addgadgetstitle,
                    type: "menuitem",
                    action: lang.hitch(this, this.showComponentSelector)
                },
                rearrangeGadgetsMenuItem = {
                    parent: "settings",
                    name: "rearrangeGadgets",
                    label: resources.componentselection.rearrangegadgets,
                    type: "checkedmenuitem",
                    action: function () {
                        lang.hitch(this, self.changeLockButtonState(this.checked));
                    }
                };

            actions.splice(actions.length, 0, addGadgetsMenuItem);
            actions.splice(actions.length, 0, rearrangeGadgetsMenuItem);

            return actions;
        }
    });
});
