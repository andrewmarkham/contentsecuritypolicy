define("epi/shell/widget/WidgetFactory", [
    "dojo/_base/array",
    "dojo/_base/Deferred",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/promise/all",
    "dojo/when",
    "epi/dependency",

    // Default handlers added for these widgets in _addDefaultHandlers, added here to prevent incomplete layer builds
    "dijit/_Widget",
    "dijit/_Container",
    "dojox/layout/GridContainerLite",
    "epi/shell/widget/ToolbarDropDownButton",
    "epi/shell/widget/ToolbarSet"
], function (
    array,
    Deferred,
    declare,
    lang,
    win,
    dom,
    all,
    when,
    dependency
) {

    return declare(null, {
        // summary:
        //		Factory for creating widgets
        // tags:
        //      public

        // _domNodeName: [private] String
        // tags:
        //      const
        _domNodeName: "[domnode]",

        // _handlers: [private] String[]
        //      Array with handlers
        // tags:
        //      private
        _handlers: null,

        // moduleManager: [protected] epi.ModuleManager
        //
        moduleManager: null,

        // messageService: [protected] epi/shell/MessageService
        //      A service used for error notifications
        messageService: undefined,

        onWidgetHierarchyCreated: null,
        /*=====
        onWidgetHierarchyCreated: function(widget, componentDefinition){
        // summary:
        //		Called when a widget has been created and added to it's parent.
        //
        // widget: dijit/_Widget
        //		The created widget
        //
        // componentDefinition: Object
        //      Object with parameters for the widget
        //
        // tags:
        //		public callback
        },
        =====*/

        onWidgetCreated: null,
        /*=====
        onWidgetCreated: function(widget, componentDefinition){
        // summary:
        //		Called when a widget has been created.
        //
        // widget: dijit/_Widget
        //		The created widget
        //
        // componentDefinition: Object
        //      Object with parameters for the widget
        //
        // tags:
        //		public callback
        },
        =====*/

        constructor: function (params) {
            declare.safeMixin(this, params);

            // instantiate new array of handlers
            this._handlers = [];

            // add default handlers
            this._addDefaultHandlers();

            this.messageService = this.messageService || dependency.resolve("epi.shell.MessageService");

            this.moduleManager = this.moduleManager || dependency.resolve("epi.ModuleManager");

        },

        createWidgets: function (/* dijit/_Widget|DomNode|String */root, /* Object[] */componentsDefinition,/* bool? */startupWidgets) {
            // summary:
            //		Create widgets from componentDefinition and add them to root
            //
            // root:
            //      Where to place widgets
            //
            // componentsDefinition:
            //      Array of component definitions. Component definition must include properties `widgetType` and `settings` object (instance parameters).
            //      Optional property is `components` with an array of componentDefinitions. For example
            //  |   {
            //  |       widgetType: "dijit/ColorPalette",
            //  |       settings: {
            //  |           palette: "3x4"
            //  |       },
            //  |       anotherProperty: 1
            //  |   }
            //
            //      or:
            //  |   {
            //  |       widgetType: "dijit/layout/BorderContainer",
            //  |       settings: {
            //  |           design: "sidebar"
            //  |       },
            //  |       components: [
            //  |           {
            //  |               widgetType: "dijit/ColorPalette",
            //  |               settings: {
            //  |                   palette: "3x4",
            //  |                   region: center
            //  |               },
            //  |           }
            //  |       ]
            //  |   }
            //
            // example:
            //      Create widgets
            //  |   dojo.require("dijit/ColorPalette");
            //  |   var wf = new epi/shell/widget/WidgetFactory();
            //  |   var node = dojo.create("div");
            //  |   var widgets = wf.createWidgets(node, {
            //  |       widgetType: "dijit/ColorPalette",
            //  |       settings: {
            //  |           palette: "3x4"
            //  |       }
            //  |   });
            //
            // returns:
            //      Array of widgets.
            //
            // tags:
            //      public

            var syntheticRoot,
                getDep,
                widgetsTypes = [],
                moduleStartupDeferreds = [],
                createWidgetsDeferred = new Deferred(),
                errorHandle;

            startupWidgets === false ? startupWidgets = false : startupWidgets = true;

            if (typeof (root) === "string") {
                root = dom.byId(root);
            }

            // wrap definition in array if we only pass one object definition
            if (componentsDefinition && !lang.isArray(componentsDefinition)) {
                componentsDefinition = [componentsDefinition];
            }

            if (this.getHandler(root).type === this._domNodeName) {
                syntheticRoot = win.doc.createDocumentFragment();
                // _WidgetBase.placeAt assumes something without a tagname is a widget
                // so we add one to make it select the correct code path
                syntheticRoot.tagName = "documentFragment";
            }

            //Create a list of all dependencies for the component
            getDep = lang.hitch(this, function (components) {
                if (components instanceof Array) {
                    for (var i in components) {
                        getDep(components[i]);
                    }
                }
                if (components.components instanceof Array) {
                    getDep(components.components);
                }
                if (components.moduleName) {
                    //Startup the module
                    moduleStartupDeferreds.push(this.moduleManager.startModules(components.moduleName));
                }
                if (components.widgetPackage) {
                    widgetsTypes.push(components.widgetPackage);
                } else if (components.widgetType) {
                    widgetsTypes.push(components.widgetType);
                }
            });
            getDep(componentsDefinition);

            //List to errors on require
            errorHandle = require.on("error", function (error) {
                console.error(error.stack || error);

                //Remove error handle
                errorHandle.remove();

                //Reject the deferred and pass the error
                createWidgetsDeferred.reject(error);
            });

            //When all modules has been started, require the components
            all(moduleStartupDeferreds).then(lang.hitch(this, function () {

                //Require all dependencies for the component
                require(widgetsTypes, lang.hitch(this, function () {

                    // Remove error handle
                    // Important, otherwise memory will leak
                    errorHandle.remove();

                    this._createWidgets(syntheticRoot || root, componentsDefinition).then(function (widgets) {

                        // Startup widgets
                        try {

                            syntheticRoot && root.appendChild(syntheticRoot);

                            if (startupWidgets) {
                                array.forEach(widgets, function (w) {
                                    !w._started && w.startup && w.startup();
                                });
                            }
                            createWidgetsDeferred.resolve(widgets);
                        } catch (err) {
                            createWidgetsDeferred.reject(err);
                        }

                    }, createWidgetsDeferred.reject);
                }));
            }));

            return createWidgetsDeferred;
        },

        _createWidgets: function (/* dijit/_Widget|DomNode */root, /* Object[]? */componentsDefinition) {
            // summary:
            //		Create widgets from componentDefinition and add them to root
            //
            // tags:
            //      private
            //
            var dfd = new Deferred(),
                createdWidgets = [],
                handler = this.getHandler(root),
                deferreds;

            if (!handler || !lang.isArray(componentsDefinition)) {
                dfd.resolve(createdWidgets);
                return dfd;
            }

            deferreds = array.map(componentsDefinition, lang.hitch(this, function (componentDefinition) {
                // init modules
                var done = new Deferred(),
                    widgetCreated = this._createInternal(root, componentDefinition, handler);

                widgetCreated.then(function (widget) {
                    if (widget) {
                        createdWidgets.push(widget);
                    }
                    done.resolve(widget);

                }, function (e) {
                    console.error(e.stack || e);

                    done.reject(e);
                });

                return done;

            }));

            all(deferreds).then(
                function () {
                    dfd.resolve(createdWidgets);
                },
                function (result) {
                    console.error("WidgetFactory: Could not resolve one or more widgets");
                    dfd.reject(result);
                }
            );

            return dfd;
        },

        _createInternal: function (root, componentDefinition, handler) {
            var deferred = new Deferred();
            when(handler.instantiateWidgetFunction(componentDefinition), lang.hitch(this, function (widget) {
                if (widget) {

                    try {
                        if (typeof this.onWidgetCreated == "function") {
                            this.onWidgetCreated(widget, componentDefinition);
                        }

                        handler.addWidgetToRootFunction(root, widget);
                    } catch (e) {
                        deferred.reject(e);
                        return;
                    }

                    var childrenCreated = new Deferred();

                    if (componentDefinition.components && lang.isArray(componentDefinition.components) && componentDefinition.components.length > 0) {
                        childrenCreated = this._createWidgets(widget, componentDefinition.components);
                    } else {
                        childrenCreated.resolve();
                    }
                    childrenCreated.then(lang.hitch(this, function () {
                        try {
                            if (typeof this.onWidgetHierarchyCreated == "function") {
                                this.onWidgetHierarchyCreated(widget, componentDefinition);
                            }
                            deferred.resolve(widget);
                        } catch (e) {
                            deferred.reject(e);
                        }
                    }), deferred.reject);
                } else {
                    deferred.reject();
                }
            }), function (error) {
                console.error(error.stack || error);
                deferred.reject(error);
            });
            return deferred;
        },

        defaultWidgetInstantiator: function (/* Object */componentDefinition) {
            // summary:
            //		Instantiates a widget from a componentDefinition. See createWidgets() for info on componentDefinition properties.
            //
            // componentDefinition:
            //      A component definition
            //
            // tags:
            //      public
            //

            var def = new Deferred();

            var settings = lang.mixin({}, componentDefinition.settings, { componentId: componentDefinition.id });

            var widgetType = componentDefinition.widgetType;

            // declareds without define
            var widgetCtor = componentDefinition.widgetPackage && lang.getObject(componentDefinition.widgetType);

            //List to errors on require
            var errorHandle = require.on("error", function (error) {
                console.error(error.stack || error);

                //Remove error handle
                errorHandle.remove();

                //Reject the deferred and pass the error
                def.reject(error);
            });

            function constructorExecutor(ctor) {

                //Create the widget using the resolved widget type
                var widget = new ctor(settings);
                if (componentDefinition.connections) {
                    for (var evt in componentDefinition.connections) {
                        if (componentDefinition.connections[evt]) {
                            widget.connect(widget, evt, componentDefinition.connections[evt]);
                        }
                    }
                }
                errorHandle.remove();
                def.resolve(widget);
            }

            if (widgetCtor) {
                constructorExecutor(widgetCtor);
            } else {
                require([widgetType], lang.hitch(this, constructorExecutor));
            }
            return def;
        },

        _notifyError: function (msg) {
            if (this.messageService) {
                this.messageService.put("error", msg);
            }
        },

        _addDefaultHandlers: function () {
            // summary:
            //		Adds default handlers for most common widgets
            //
            // tags:
            //      private
            //

            // DomNode handler, to be used
            this.addHandler(this._domNodeName, function (rootWidget, widget) {
                widget.placeAt(rootWidget);
            }, null, function () {
                return true;
            });

            // Widgets
            this.addHandler("dijit/_Widget", function (rootWidget, widget) {
                rootWidget.set("content", widget);
            });
            this.addHandler("dijit/_Container", function (rootWidget, widget) {
                rootWidget.addChild(widget);
            });
            this.addHandler("dojox/layout/GridContainerLite", function (rootWidget, widget) {
                rootWidget.addChild(widget, widget.params.column);
            });

            // Implements addChild but does not inherit from _Container
            this.addHandler("epi/shell/widget/ToolbarDropDownButton", function (rootWidget, widget) {
                rootWidget.addChild(widget);
            });
            this.addHandler("epi/shell/widget/ToolbarSet", function (rootWidget, widget) {
                rootWidget.addChild(widget);
            });
        },


        addHandler: function (/* String */typeName, /* Function */addWidgetToRootFunction, /* Function? */instantiateWidgetFunction, /* Function? */canHandle) {
            // summary:
            //      Add a handler for a widget type
            //
            // description:
            //      The handler is an object which will create a widget and then add it to a root (domnode or widget).
            //
            // typeName:
            //      Name of a widget type
            //
            // addWidgetToRootFunction:
            //      A function which adds a widget to a root. For example:
            //  |    function (/* dijit/_Container */ rootWidget, /* dijit/_Widget */widget) {
            //  |       rootWidget.addChild(widget);
            //  |    }
            //
            // instantiateWidgetFunction:
            //      A function to creates and returns a widget. For example:
            //  |   function(componentDefinition) {
            //  |       dojo.require(componentDefinition.widgetType);
            //  |       var widgetConstructor = dojo.getObject(componentDefinition.widgetType);
            //  |       var widget = new widgetConstructor(componentDefinition.settings);
            //  |       return new MyWidget();
            //  |   }
            //
            // canHandle:
            //      Optional function which returns true if handler can handle the root. For example
            //  |   function (/* Object */ object, /* Class */ widgetConstructor) {
            //  |       if (typeof (object["isInstanceOf"]) === "function") {
            //  |           return object.isInstanceOf(aWidgetConstructor);
            //  |       }
            //  |       return false;
            //  |   }
            //
            // tags:
            //      public
            //

            // default handler function, check if handler is an instance of the aWidgetConstructor
            var defaultCanHandle = function (widget, constructor) {
                return constructor && lang.isFunction(widget.isInstanceOf) && widget.isInstanceOf(constructor);
            };

            var callback = lang.hitch(this, function (type) {
                var handler = this.getHandlerByTypeName(typeName);
                var canHandleFunction = canHandle || defaultCanHandle;
                var exists = handler ? true : false;

                if (!exists) {
                    handler = {};
                }

                var widgetInstantiator = instantiateWidgetFunction || lang.hitch(this, this.defaultWidgetInstantiator);

                handler.type = typeName;
                handler.instantiateWidgetFunction = widgetInstantiator;
                handler.addWidgetToRootFunction = addWidgetToRootFunction;
                handler.widgetConstructor = type;
                handler.canHandle = canHandleFunction;

                if (!exists) {
                    this._handlers.push(handler);
                }
            });

            if (typeName !== this._domNodeName) {
                require([typeName], callback);
            } else {
                callback();
            }
        },

        getHandler: function (/* DomNode|dijit/_Widget */root) {
            // summary:
            //		Gets the handler for a root
            //
            // description:
            //      Searches for the most specific handler, i.e. in reverse order of added handlers
            //
            // root:
            //      DomNode or a widget instance
            //
            // returns:
            //      A handler object
            //
            // tags:
            //      private
            //

            var handlers = this._handlers;

            for (var i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i].canHandle(root, handlers[i].widgetConstructor)) {
                    return handlers[i]; // Object
                }
            }
            return null; // Object
        },

        getHandlerByTypeName: function (/* String */typeName) {
            // summary:
            //      Gets a handler for a typeName with an exact match
            //
            // typeName:
            //      Name of the type
            //
            // returns:
            //      A handler object
            //
            // tags:
            //      public
            //
            var handlers = this._handlers;
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i].type === typeName) {
                    return handlers[i]; // Object
                }
            }
            return null; // Object
        },

        removeHandler: function (/* String */typeName) {
            // summary:
            //      Remove handler by type name
            //
            // typeName: String
            //      Name of the type
            //
            // tags:
            //      public
            //
            var handlers = this._handlers;
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i].type === typeName) {
                    handlers.splice(i, 1);
                }
            }
        },

        listHandlers: function () {
            // summary:
            //      List handler names
            //
            // returns:
            //      Array of strings
            //
            // tags:
            //      public
            //
            var handlers = this._handlers;

            return array.map(handlers, function (handler) {
                return handler.type;
            }); // String[]
        }
    });
});
