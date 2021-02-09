define("epi/shell/form/formFieldRegistry", [],
    function () {

        var registry = {},

            module = {
                // summary:
                //      Responsible for maintaining a registry of widgets for use by form containers separated by type and hint.
                //
                // tags:
                //      internal

                // type: [internal] Object
                //      Predefined strings to use as types for form containers.
                type: {
                    group: "group",
                    parent: "parent",
                    field: "field",
                    hiddenField: "hiddenfield"
                },

                add: function (registration) {
                // summary:
                //      Adds a factory function for the specified type and hint.
                //
                // registration: Object[] || Object
                //      Either an array of or a single registration object
                //          {
                //              type: registry.type.field,
                //              hint: "aString",
                //              factory: function factoryFunction () { }
                //          }
                // returns:
                //      A handle for handling removal for each registration.
                //
                // tags: public

                    var handles;

                    function addOne(reg) {
                        var key = reg.type + reg.hint;

                        registry[key] ?
                            registry[key].unshift(reg.factory) :
                            registry[key] = [reg.factory];

                        return {
                            remove: function () {
                                module.remove(reg);
                                reg = null;
                            }
                        };
                    }

                    registration instanceof Array ?
                        handles = registration.map(addOne) :
                        handles = addOne(registration);

                    return handles;
                },

                remove: function (reg) {
                // summary:
                //      Removes a factory function for the specified type and hint.
                //
                // registration: Object
                //      A registration object
                //          {
                //              type: registry.type.field,
                //              hint: "aString",
                //              factory: function factoryFunction () { }
                //          }
                //
                // tags: public

                    var collection = registry[reg.type + reg.hint],
                        index = collection ? collection.indexOf(reg.factory) : -1;

                    if (index > -1) {
                        collection.splice(index, 1);
                    }
                },

                get: function (type, hint) {
                // summary:
                //      Removes a factory function for the specified type and hint.
                //
                // type: String
                //      String matching the field to get. Predefined values can be found at formFieldRegistry.type
                // hint: String
                //      A hint to find a specific factory for a type
                //
                // tags: public

                    var collection = registry[type + (hint || "")];

                    return (collection && collection.length) ? collection[0] : null;
                },

                clear: function () {
                // summary:
                //      Removes all factory functions from the registry.
                //
                // tags: public

                    registry = {};
                }

            };

        return module;
    });
