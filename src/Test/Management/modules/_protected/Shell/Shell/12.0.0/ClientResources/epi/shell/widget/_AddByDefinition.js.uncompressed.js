define("epi/shell/widget/_AddByDefinition", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/Deferred",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/when",

    "dijit",
    "dijit/_Widget",
    "dijit/ToolbarSeparator",
    "dijit/Menu",
    "dijit/MenuSeparator",

    "epi/shell/widget/WidgetFactory",

    // The following are indirect dependencies, WidgetFactory will require() them when they're instantiated
    "dijit/CheckedMenuItem",
    "dijit/MenuItem",
    "dijit/form/Button",
    "dijit/form/ComboButton",
    "dijit/form/DropDownButton",
    "dijit/form/RadioButton",
    "epi/shell/widget/PopupMenuItem",
    "epi/shell/widget/Toolbar",
    "epi/shell/widget/ToolbarLabel",
    "epi/shell/widget/ToolbarDropDownButton"],

function (array, declare, lang, Deferred, dom, domConstruct, domStyle, when, dijit, _Widget, ToolbarSeparator, Menu, MenuSeparator, WidgetFactory) {

    return declare(null, {
        // summary:
        //    A mixin that supports adding sub-items using a definition object
        //
        // tags:
        //    internal

        /*=====
        // _widgetFactory: [private] epi/shell/widget/WidgetFactory
        //    The instance used for creating widgets from definitions added to the toolbar.
        _widgetFactory: {},
        =====*/

        /*=====
        // _widgetMap: [private] Object
        //    Maps names to widget instances
        _widgetMap: {},
        =====*/

        // template objects for the widget factory
        _widgetTypeTemplates: {
            checkedmenuitem: { widgetType: "dijit/CheckedMenuItem" },
            menu: { widgetType: "dijit/Menu" },
            menuitem: { widgetType: "dijit/MenuItem" },
            popupmenu: { widgetType: "epi/shell/widget/PopupMenuItem" },
            button: { widgetType: "dijit/form/Button" },
            combo: { widgetType: "dijit/form/ComboButton" },
            dropdown: { widgetType: "epi/shell/widget/ToolbarDropDownButton" },
            radio: { widgetType: "dijit/form/RadioButton" },
            toolbargroup: { widgetType: "epi/shell/widget/Toolbar" },
            label: { widgetType: "epi/shell/widget/ToolbarLabel" }
        },

        constructor: function () {
            this._widgetFactory = new WidgetFactory();
            this._widgetMap = {};
        },

        postMixInProperties: function () {
            // summary:
            //    Initializes the widget factory
            // tags:
            //    protected

            this.connect(this._widgetFactory, "onWidgetHierarchyCreated", lang.hitch(this, function (widget, componentDefintion) {
                this._widgetMap[componentDefintion.name] = widget;
                if (componentDefintion.firstChildIsContainer) {
                    widget.containerWidget = widget.getChildren()[0];
                }
            }));

            // handle on-demand creation of menu below combo button
            var addWidgetDropDown = function (rootWidget, widget) {
                var dropDown = rootWidget.get("dropDown");
                if (!dropDown) {
                    dropDown = new Menu();
                    rootWidget.set("dropDown", dropDown);
                }
                dropDown.addChild(widget);
                // Ensure that menu items support an appropriate separator.
                if (!widget.separator) {
                    widget.set("separator", "dijit/MenuSeparator");
                }
            };
            this._widgetFactory.addHandler("dijit/form/ComboButton", addWidgetDropDown);
        },

        buildRendering: function () {
            this.inherited(arguments);
            dom.setSelectable(this.domNode, false);
        },

        _toComponentDefinition: function (definition) {
            // transforms a definition in the added format to a format supported by the widget factory
            var componentDefinition = this._getComponentDefinitionTemplate(definition);
            componentDefinition.name = definition.name;
            // map specific from the definition directly to settings to make the api easier to use
            componentDefinition.settings = lang.mixin({
                label: definition.label || "",
                showLabel: definition.label,
                title: definition.title || "",
                disabled: definition.disabled || false
            }, definition.settings);

            if (definition.iconClass) {
                componentDefinition.settings.iconClass = definition.iconClass;
            }

            // Default connections
            var defaultConnections = {
                onClick: definition.action
            };

            // Mix connections together
            componentDefinition.connections = lang.mixin(defaultConnections, definition.connections);

            return componentDefinition;
        },

        _getComponentDefinitionTemplate: function (definition) {
            // creates an object supported by the widget factory
            var componentDefinition = lang.mixin({}, this._widgetTypeTemplates[definition.type] || this._widgetTypeTemplates["button"]);
            if (definition.widgetType) {
                componentDefinition.widgetType = definition.widgetType;
            }
            return componentDefinition;
        },

        _getWidget: function (name) {
            // gets a previously added item
            return this._widgetMap[name];
        },

        _addSingle: function (definition) {
            // summary:
            //    Adds a single item from a widget definition.
            // tags:
            //    private

            if (this._getWidget(definition.name)) {
                return;
            }

            var parent = this._getWidget(definition.parent) || this;
            var componentDefinition = this._toComponentDefinition(definition);

            var def = new Deferred();
            when(this._widgetFactory.createWidgets(parent, componentDefinition), lang.hitch(this, function (widgets) {
                var widget = widgets[0];

                if (definition.tooltip) {
                    var html = definition.tooltip;
                    var show = function (e) {
                        dijit.showTooltip(html, e.target);
                    };
                    var hide = function (e) {
                        dijit.hideTooltip(e.target);
                    };

                    this.connect(widget.domNode, "onmouseenter", show);
                    this.connect(widget.domNode, "onmouseleave", hide);
                }

                this._addSeparators(widget);

                def.resolve();

            }), function (e) {
                console.error(e.stack || e);

                def.reject(e);
            });

            return def.promise;
        },

        _addSeparators: function (widget) {
            // summary:
            //    Run when a widget is added to the toolbar, adding separators according to the
            //    placing and definition of the widgets involved.
            // tags:
            //    private

            var parent = widget.getParent();
            if (!parent) {
                return;
            }

            var siblings = parent.getChildren();
            var i = array.indexOf(siblings, widget);

            // If this or previous sibling want a separator and none exists then add one.
            var previous = (i > 0) ? siblings[i - 1] : null;
            if (previous && !this._isSeparator(previous)) {
                if (widget.separate) {
                    this.addSeparator(widget, "before");
                } else if (previous.separate) {
                    this.addSeparator(previous, "after");
                }
            }

            // If this or next sibling want a separator and none exists then add one.
            var next = (siblings.length > i) ? siblings[i + 1] : null;
            if (next && !this._isSeparator(next) && (widget.separate || next.separate)) {
                this.addSeparator(widget, "after");
            }
        },

        _getSiblingOfWidget: function (/*dijit/_Widget*/widget, /*String*/dir) {
            // summary:
            //    Get the next or previous widget sibling of child
            // dir:
            //    One of 'nextSibling' or 'previousSibling'
            // tags:
            //    private

            var node = widget.domNode;
            do {
                node = node[dir];
            } while (node && (node.nodeType !== 1 || !dijit.byNode(node)));
            return node && dijit.byNode(node); // dijit/_Widget
        },

        add: function (/* Object|Array */definitions) {
            // summary:
            //    Adds an item or an array of items to the toolbar.
            //
            // definitions:
            //      A toolbar definition, or an array of toolbar definitions to add to the toolbar.
            //
            //      Example of adding a single button:
            //      | // buttons
            //      | toolbar.add({
            //      |     name:"doit",
            //      |     label:"DoIt!",
            //      |     // fallback type:button,
            //      |     action:console.log
            //      | });
            //      |
            //
            //      Example of adding a combo button with a sub menu option:
            //      | toolbar.add([
            //      |     {
            //      |         name: "publish",
            //      |         label: "Publish",
            //      |         type: "combo",
            //      |         action: console.log
            //      |     },
            //      |     {
            //      |         parent: "publish",
            //      |         name: "save",
            //      |         label: "Save",
            //      |         type: "menuitem",
            //      |         action: console.log
            //      |     }]);
            //
            //      Example of adding a drop down with two menu options:
            //      | toolbar.add([
            //      |     {
            //      |         name: "misc",
            //      |         label: "misc stuff",
            //      |         type: "dropdown"
            //      |     },
            //      |     {
            //      |         parent: "misc",
            //      |         name: "hello",
            //      |         label: "hello",
            //      |         type: "menuitem",
            //      |         action: console.log
            //      |     },
            //      |     {
            //      |         parent: "misc",
            //      |         name: "world",
            //      |         label: "world",
            //      |         type: "menuitem",
            //      |         action: console.log
            //      |     }]);
            //
            //
            //      Example adding a custom widget type to the toolbar.
            //      | toolbar.add({
            //      |     name: "custom",
            //      |     label: "Custom widget",
            //      |     widgetType: "dijit/form/ToggleButton",
            //      |     action: console.log,
            //      |     settings: { checked: false },
            //      |     connections: {
            //      |         onChange: function(val) {
            //      |             console.log(this.get("checked"));
            //      |         }
            //      |     }
            //      | });
            //
            //      Example of defining a custom separator type to a toolbar widget.
            //      | toolbar.add({
            //      |     name: "button",
            //      |     label: "Space Cadet",
            //      |     action: console.log,
            //      |     settings: {
            //      |         separate: true,
            //      |         separator: 'epi/shell/widget/SpaceToolbarSeparator'
            //      |     }
            //      | });
            //
            // tags:
            //      public

            var self = this;
            //Chain the deferreds so we call them in a sequence
            var addItem = function (items) {

                var item = items.shift();
                if (!item) {
                    return null;
                }
                return when(self._addSingle(item), function () {
                    return addItem(items);
                });
            };

            if (lang.isArray(definitions)) {
                return addItem(definitions);
            } else {
                this._addSingle(definitions);
            }
        },

        addSeparator: function (/* String|DomNode|_Widget */reference, /* String?|Int? */position) {
            // summary:
            //    Add a separator to the toolbar based on standard domConstruct.place conventions,
            //    or passing a Widget reference. If no reference is given the separator is added to the end of the toolbar.
            // tags:
            //    protected

            var getSeparator = function () {
                if (reference.separator) {
                    var moduleName = reference.separator.replace(/\./g, "/"),
                        deferred = new Deferred();

                    require([moduleName], function (separatorClass) {
                        deferred.resolve(new separatorClass());
                    });

                    return deferred.promise;
                }
                return new ToolbarSeparator();
            };

            when(getSeparator(), lang.hitch(this, function (separator) {
                var refNode = reference ? reference.domNode : this.domNode;
                domConstruct.place(separator.domNode, refNode, position);
            }));
        },

        _removeSingle: function (name) {
            // Removes a single widget using its name.
            var widget = this._widgetMap[name];

            delete this._widgetMap[name];
            if (widget) {
                this._removeSeparators(widget);
                widget.destroy();
            }
        },

        _removeSeparators: function (widget) {
            // summary:
            //    Removes neighboring separators from the widget if required. This is used
            //    when the widget is being removed.
            // tags:
            //    private

            if (!widget.domNode) {
                return;
            }

            var parent = widget.getParent();
            if (!parent) {
                return;
            }

            var separator;
            var siblings = parent.getChildren();
            var i = array.indexOf(siblings, widget);

            var next = (siblings.length > i) ? siblings[i + 1] : null;
            var previous = (i > 0) ? siblings[i - 1] : null;

            // If there is separator between this and the next 'real' sibling, evaluate whether to keep it.
            if (next && this._isSeparator(next) && siblings.length >= i + 2) {
                separator = next;
                next = siblings[i + 2];
                // Check if next wants to separate and this is not the first item.
                if (next.separate && i > 0) {
                    // Remove any previous separator to avoid double separators.
                    if (previous && this._isSeparator(previous)) {
                        previous.destroy();
                        return;
                    }
                } else {
                    separator.destroy();
                }
            }

            // If there is separator between this and the previous 'real' sibling, evaluate whether to keep it.
            if (previous && this._isSeparator(previous) && i - 2 >= 0) {
                separator = previous;
                previous = siblings[i - 2];
                if (!previous.separate) {
                    separator.destroy();
                }
            }
        },

        _isSeparator: function (widget) {
            return widget instanceof ToolbarSeparator || widget instanceof MenuSeparator;
        },

        remove: function (names) {
            // summary:
            //		Removes an item or an array of items from within the toolbar.
            //
            // names:
            //      A string representing the name or an array of names of widgets to be removed.
            //
            // tags:
            //      protected

            if (lang.isArray(names)) {
                array.forEach(names, lang.hitch(this, this._removeSingle));
            } else {
                this._removeSingle(names);
            }
        },

        clear: function () {
            // summary:
            //		Removes all items from the toolbar.
            // tags:
            //      protected

            for (var name in this._widgetMap) {
                this._removeSingle(name);
            }
        },

        destroy: function () {
            this.clear();

            this.inherited(arguments);
        },

        setItemProperty: function (/*String|Array*/names, /*String*/property, /*Object*/value) {
            // summary:
            //    Sets a value to a property of a toolbar item or a collection of toolbar items.
            // tags:
            //    protected

            if (lang.isArray(names)) {
                array.forEach(names, function (name) {
                    this._setInternal(name, property, value);
                });
            } else {
                this._setInternal(names, property, value);
            }
        },

        setItemVisibility: function (/*String*/name, /*Boolean*/visible) {
            // summary:
            //    Sets item visibility.
            // tags:
            //    protected

            var widget = this._widgetMap[name];
            if (widget) {
                domStyle.set(widget.domNode, { display: (visible ? "" : "none") });
                widget.set("itemVisibility", visible);
            }
        },

        _setInternal: function (/*String*/name, /*String*/property, /*Object*/value) {
            var widget = this._widgetMap[name];
            if (widget) {
                widget.set(property, value);
            }
        }
    });
});
