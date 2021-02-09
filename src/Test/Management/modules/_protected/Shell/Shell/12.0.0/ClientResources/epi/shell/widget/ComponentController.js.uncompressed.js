define("epi/shell/widget/ComponentController", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/has",
    "dojo/promise/all",
    "dojo/when",
    "dojo/store/JsonRest",
    "dojo/store/Memory",

    "dijit/_WidgetBase",

    "epi/dependency",
    "epi/routes",
    "require",
    "epi/shell/ViewSettings",
    "epi/shell/widget/WidgetFactory"
],

function (
    array,
    declare,
    Deferred,
    lang,
    aspect,
    has,
    all,
    when,
    JsonRestStore,
    MemoryStore,

    _WidgetBase,

    dependency,
    routes,
    logger,
    viewSettings,
    WidgetFactory
) {

    return declare([_WidgetBase], {
        // summary:
        //      ComponentController widget. Responsible for components handling
        //
        // tags:
        //      internal

        // moduleArea: String
        //  Current module area
        moduleArea: null,

        // widgetFactory: Object
        //  Widget factory. Resolved from epi.dependency as `epi/shell/widget/WidgetFactory`
        widgetFactory: null,

        // _componentsMemoryStore: [private] dojo/store/Memory
        //  Store for created components
        _componentsMemoryStore: null,

        // _componentsStore: [private] dojo/store/JsonRest
        //  Store for components
        _componentsStore: null,

        // _componentsSortOrderStore: [private] dojo/store/JsonRest
        //  Store for component sorting
        _componentsSortOrderStore: null,

        // _saveComponentRequestQueue: [private] Array
        //  Queue for saveComponent requests
        _saveComponentRequestQueue: [],

        // _isSaveComponentRequestInProgress: [private] Boolean
        //  Switch to represents whether a save component request is going on or not
        _isSaveComponentRequestInProgress: false,

        postMixInProperties: function () {
            // tags:
            //      protected

            var registry;

            this.inherited(arguments);

            // create widget factory
            this.widgetFactory = this.widgetFactory || dependency.resolve("epi.shell.widget.WidgetFactory");

            registry = dependency.resolve("epi.storeregistry");
            this._componentsStore = this._componentsStore || registry.get("epi.shell.component");
            this._componentsSortOrderStore = this._componentsSortOrderStore || registry.get("epi.shell.componentsortorder");

            // create mappings store
            this._componentsMemoryStore = new MemoryStore();

            // attach callback
            this.own(
                aspect.after(this.widgetFactory, "onWidgetCreated", lang.hitch(this, this.onComponentCreated), true)
            );
        },

        onComponentCreated: function (/* dijit/_Widget */widget, /* Object */componentDefinition) {
            // summary:
            //      Callback to be called when a component is created
            //
            // widget:
            //      The widget instance
            //
            // componentDefinition:
            //      Component deifinition for the created widget instance
            //
            // tags:
            //      public
            //

            var cd = lang.clone(componentDefinition);

            cd._widgetId = widget.get("id");

            this._componentsMemoryStore.put(cd);
        },

        _queryComponentDefinitions: function (/* Object */query) {
            // summary:
            //      Query the component definitions store
            //
            // query:
            //      The query
            //
            // tags:
            //      private
            //
            return this._componentsMemoryStore.query(query);
        },

        _runSaveComponentRequest: function (/* Boolean */ forceRun) {
            // summary:
            //      runs the saveComponent requests (already pushed to saveComponentQueue)
            //      each request will be performed one by one each after other
            // forceRun:
            //      must always be false when call this function from another function
            // tags:
            //      private

            var self = this,
                runIt;

            // if its a forced call or another call isn't in progress then keep making calls
            if (forceRun || !this._isSaveComponentRequestInProgress) {
                this._isSaveComponentRequestInProgress = true;


                // pull the first item from queue and make put request
                runIt = this._saveComponentRequestQueue.shift();
                if (runIt) {
                    this._componentsStore.executeMethod("save", "", runIt.items).then(function (result) {
                        // resolve the promise here
                        if (runIt.promise) {
                            runIt.promise.resolve(result);
                        }

                        // continue sending all the requests pushed in the queue
                        self._runSaveComponentRequest(true);

                    }, function (error) {
                        // in case of error, just continue processing the next items in queue while reject the current promise
                        // reject the promise here
                        if (runIt.promise) {
                            runIt.promise.reject(error);
                        }

                        self._runSaveComponentRequest(true);
                    });
                } else {
                    // finish the process when the queue is empty
                    this._isSaveComponentRequestInProgress = false;
                }
            }
        },

        getComponentDefinition: function (/* String */widgetId) {
            // summary:
            //      Get the component definition for a widget instance id
            //
            // widgetId:
            //      Id of the of the widget
            //
            // tags:
            //      public
            //
            return this._queryComponentDefinitions({ _widgetId: widgetId })[0];
        },

        getComponentDefinitionById: function (id) {
            // summary:
            //      Get the component definition using the component id
            // id: Guid
            //      Component id
            // tags:
            //      public
            return this._queryComponentDefinitions({ id: id })[0];
        },

        getEmptyComponentDefinition: function (/* String */typeName, /* Function */callback) {
            // summary:
            //      Get an empty component definition
            //
            // typeName:
            //      Id of the component
            //
            // callback:
            //      Function to call when done
            //
            // tags:
            //      public
            //

            when(this._componentsStore.query({ componentTypeName: typeName }), callback);
        },

        getComponentsForContainer: function (/* dijit/_Widget */container) {
            // summary:
            //      Get component definitions for specified container
            //
            // container:
            //      container to get child components for
            //
            // tags:
            //      public
            //
            var parentId = this.getComponentDefinition(container.id).id;

            return this._componentsStore.query({ viewName: viewSettings.viewName, parentId: parentId });
        },

        getComponentsForView: function (/* String */view, /* Function */callback) {
            // summary:
            //      Get component definitions for specified view
            //
            // view:
            //      name of a view
            //
            // tags:
            //      public
            //
            return this._componentsStore.query({ viewName: view });
        },

        removeComponent: function (/* String */identity) {
            // summary:
            //      Remove a component
            //
            // identity:
            //      Id of the component
            //
            // tags:
            //      public
            //
            var self = this;
            //HACK: we combine the id and viewName since we need both to be able to personalize the view.
            return when(this._componentsStore.remove(identity + "?viewName=" + viewSettings.viewName), function () {
                self._componentsMemoryStore.remove(identity);
            });
        },

        saveComponents: function (components) {

            components = components.map(function (component) {
                var simpleComponent = lang.clone(component);
                delete simpleComponent["components"];

                return simpleComponent;
            });

            // create a promise and return it, in the meanwhile push the request to queue and start the queue run process
            var deferred = new Deferred();

            if (components.length < 1) {
                deferred.resolve();
                return deferred.promise;
            }

            this._saveComponentRequestQueue.push({ items: components, promise: deferred });

            this._runSaveComponentRequest(false);

            return deferred.promise;
        },

        sortComponents: function (/* dijit/_Widget */container, /* Object[] */components, /* Function */callback) {
            // summary:
            //      Sort components
            //
            // container:
            //      Parent widget
            //
            // components:
            //      List of components (id and column)
            //
            // callback:
            //      Function to call when server has been updated
            //
            // tags:
            //      public
            //

            var parentId = this.getComponentDefinition(container.id).id;
            when(this._componentsSortOrderStore.put({ id: parentId, viewName: viewSettings.viewName, components: components }), callback);
        },

        addComponent: function (/* dijit/_Widget */container, /* object */component, /* Boolean */createComponent, /* Function? */callback) {
            // summary:
            //      Add component to a parent component
            //
            // container:
            //      Parent component
            //
            // component:
            //      An instance of the component that can be used to create widgets of.
            //
            // callback:
            //      Function to call when server has been updated
            //
            // tags:
            //      public
            //

            var parentId = this.getComponentDefinition(container.id).id;

            var newItem = lang.clone(component);
            delete newItem["id"];

            newItem.parentId = parentId;
            newItem.viewName = viewSettings.viewName;

            var self = this;

            when(this._componentsStore.put(newItem),
                function () {
                    // The store has automatically updated newItem.id
                    if (newItem.settings["routeData"]) {
                        newItem.settings.routeData.gadgetId = newItem.id;
                    }

                    // add component with widget factory
                    if (createComponent) {
                        when(self.createComponents([newItem], container), function (def) {
                            if (def) {
                                if (typeof callback == "function") {
                                    callback(true, newItem);
                                }
                            }
                        });
                    }
                },
                function () {
                    alert("Error: could not add component");
                    if (typeof callback == "function") {
                        callback(false, newItem);
                    }
                }
            );
        },

        loadComponents: function (/* DomNode|DomNode[] */nodes) {
            // summary:
            //      Load components and append to nodes
            //
            // tags:
            //      public
            //

            var self = this,
                def = new Deferred();

            if (!(nodes instanceof Array)) {
                nodes = [nodes];
            }

            when(this.getComponentsForView(viewSettings.viewName),
                function (data) {

                    if ( false ) {
                        var timeLog = logger.timedGroup("ComponentController::loadComponents");
                    }

                    var treeData = self._convertListToHierarchyByMatchingParent(data, "id", "parentId", "components");

                    // Create components
                    when(self.createComponents(treeData, nodes), function (components) {
                        if ( false ) {
                            timeLog.end();
                        }
                        def.resolve(components);
                    }, function (e) {

                        console.error(e.stack || e);
                        def.reject(e);
                    });
                },
                function () {
                    console.log("Error fetching components");

                    def.reject();
                }
            );

            return def;
        },

        _convertListToHierarchyByMatchingParent: function (items, idProp, parentIdProp, childrenProp) {

            var map = {};
            var roots = [];

            // map items
            array.forEach(items, function (item) {
                var id = item[idProp];
                map[id] = item;
            });

            array.forEach(items, function (item) {

                var parent;
                var parentId = item[parentIdProp];

                if (!(childrenProp in item)) {
                    item[childrenProp] = [];
                }

                // get parent
                parent = map[parentId];

                if (!parent || parent === item) {
                    // add item to root array if not already done so
                    if (array.indexOf(roots, item) < 0) {
                        roots.push(item);
                    }
                } else {
                    // get parents children array
                    if (!parent[childrenProp]) {
                        parent[childrenProp] = [];
                    }

                    // add item to parents children
                    parent[childrenProp].push(item);
                }
            });

            return roots;
        },

        createComponents: function (/* Object[] */data, /* DomNode|DomNode[] */nodes) {
            // summary:
            //      Create widgets and add them to the dom nodes
            //
            // data:
            //      Array of component definitions
            //
            // nodes:
            //      Single domNode or array of domNodes to place widgets
            //
            // tags:
            //      public
            //

            var factory = this.widgetFactory,
                items = data,
                componentsDefinition,
                node;

            if (items instanceof Array && items.length > 0) {

                if (items[0] instanceof Array) {
                    var promises = [];

                    // assume we have an array of arrays, insert widgets into multiple nodes
                    // @UL: the return of the array widgets has not been tested
                    for (var i = 0; i < items.length; i++) {
                        componentsDefinition = items[i];

                        promises.push(factory.createWidgets(nodes[i], componentsDefinition));
                    }

                    return all(promises);
                } else {

                    // use one insertion point
                    node = nodes;

                    if (node instanceof Array) {
                        node = node[0];
                    }
                    return factory.createWidgets(node, items);
                }
            }
            return [];
        }
    });
});
