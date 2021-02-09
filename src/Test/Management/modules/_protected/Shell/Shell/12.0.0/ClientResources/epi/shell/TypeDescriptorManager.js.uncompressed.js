define("epi/shell/TypeDescriptorManager", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/promise/all",
    "dojo/when",
    // epi
    "epi/dependency",
    "epi/i18n!epi/shell/ui/nls/contenttypes"
], function (
// dojo
    array,
    declare,
    lang,
    all,
    when,

    // epi
    dependency,
    typeResources
) {
    return {
        // summary:
        //    This class manages ui behavior for classes including resolving inherited values.
        // tags:
        //    public

        // _uiDescriptors: [private] Array
        //    An array of descriptors
        _uiDescriptors: {},

        resources: typeResources,

        store: null,

        initialize: function () {
            this.store = this.store || dependency.resolve("epi.storeregistry").get("epi.shell.uidescriptor");

            return when(this.store.query()).then(this.registerTypeSettings.bind(this));
        },

        clear: function () {
            // summary:
            //    Clears all registered settings.
            this._uiDescriptors = {};
        },

        registerTypeSettings: function (uiDescriptors) {
            var types = this._uiDescriptors = {};

            function getOrCreateDeclaration(typeKey) {
                var type = types[typeKey],
                    uiDescriptor = type.descriptor,
                    baseTypes = uiDescriptor.baseTypes || [];

                if (type.ctor) {
                    return type.ctor;
                }

                if (type.visited) {
                    throw new Error("Cyclic dependency detected in descriptor: " + typeKey);
                }

                type.visited = true;
                type.ctor = declare(baseTypes.map(getOrCreateDeclaration), uiDescriptor);
                type.instance = new type.ctor();

                return type.ctor;
            }

            uiDescriptors.forEach(function (uiDescriptor) {
                types[uiDescriptor.typeIdentifier] = this._prepareDescriptor(uiDescriptor);
            }, this);

            Object.keys(types).forEach(getOrCreateDeclaration);

            return types;
        },

        registerTypeSetting: function (name, setting) {
            // summary:
            //    Gets a given setting for a type

            setting.typeIdentifier = name;
            this.registerTypeSettings([setting]);
        },

        getValue: function (type, settingName) {
            // summary:
            //    Gets a given setting for a type
            //
            // type: string
            //    The type that you want to fetch the settings for.
            //
            // settingName: string
            //    The settings that you want to fetch.

            var typeDescriptor = this._uiDescriptors[type];

            return typeDescriptor ? typeDescriptor.instance[settingName] : undefined;
        },

        getResourceValue: function (type, resourceName, primaryType) {
            // summary:
            //      Gets a resource for a given type.
            // type: [String]
            //      The type that you want to fetch the settings for.
            // resourceName: [String]
            //      The settings that you want to fetch.
            // primaryType: [Boolean]
            //      Flag indicates that needed to get resources from primary type or not
            // tags:
            //      public

            var typeDescriptor = this._uiDescriptors[type];

            return typeDescriptor ? typeDescriptor.instance.getResource(resourceName, primaryType) : undefined;
        },

        getAndConcatenateValues: function (type, settingName) {
            // summary:
            //    Gets a given setting for a type and it's ancestors returning an array with all values.
            //
            // type: string
            //    The type that you want to fetch the settings for.
            //
            // settingName: string
            //    The settings that you want to fetch.

            var values = [],
                typeDescriptor = this._uiDescriptors[type];

            typeDescriptor && typeDescriptor.instance.getRecursive(settingName, values);

            return values;
        },

        getInheritanceChain: function (type) {
            // summary:
            //    Returns an array containing the type identifiers for the given type and it's inherited types.
            //
            // type: string
            //    The type that you want to fetch the inheritance chain for.

            var value = [],
                typeDescriptor = this._uiDescriptors[type];

            if (!typeDescriptor) {
                return value;
            }

            typeDescriptor.instance.constructor._meta.bases.forEach(function (base) {
                value.push(base._meta.hidden.typeIdentifier);
            });

            return value;
        },

        isBaseTypeIdentifier: function (childType, parentType) {
            // summary:
            //      Test if parent type is base of child type/
            // childType: String
            //      the child type
            // parentType: String
            //      the parent type

            childType = this._uiDescriptors[childType];
            parentType = this._uiDescriptors[parentType];

            if (!childType || !parentType) {
                return false;
            }

            return childType.instance.isInstanceOf(parentType.ctor);
        },

        removeIntersectingTypes: function (allowedTypes, restrictedTypes) {
            // summary:
            //      Returns the list of types which are present in allowedTypes but not in restrictedTypes or their children
            // allowedTypes: Array
            //      the allowed types
            // restrictedTypes: restrictedTypes
            //      the restricted types
            // tags:
            //      public

            var result = [];

            if (allowedTypes) {
                allowedTypes.forEach(function (allowed) {

                    // allowedTypes should not be part of restricted or its child
                    if (array.indexOf(restrictedTypes, allowed) === -1 && array.some(restrictedTypes, function (restricted) {
                        return this.isBaseTypeIdentifier(allowed, restricted);
                    }, this) === false) {
                        result.push(allowed);
                    }
                }, this);
            }

            return result;
        },

        getValidAcceptedTypes: function (allAvailableTypes, allowedTypes, restrictedTypes) {
            // summary:
            //      Returns a filtered list of given by availableTypes and the filter criteria is based on given allowed and restricted types.
            // allAvailableTypes: Array
            //      The available types
            // allowedTypes: Array
            //      the allowed types
            // restrictedTypes: Array
            //      the restricted types
            // tags:
            //      public

            var allowed = allowedTypes || [];
            var restricted = restrictedTypes || [];
            var available = allAvailableTypes || [];

            // if there are no allowed/restricted types then no need to perform any filtering
            if (allowed.length === 0 && restricted.length === 0) {
                return available;
            }

            var isAnyElementSameOrParent = function (child /* typeIdentifier as string */, parents /* array of typeIdentifiers */) {
                return array.some(parents, function (parent) {
                    return this.isBaseTypeIdentifier(child, parent);
                }, this);
            };

            var filteredTypes = array.filter(available, function (availableType) {
                return (!(isAnyElementSameOrParent.call(this, availableType, restricted)) && isAnyElementSameOrParent.call(this, availableType, allowed));
            }, this);

            return filteredTypes;
        },

        _prepareDescriptor: function (uiDescriptor) {

            var resource,
                languageKey = uiDescriptor.languageKey;

            Object.keys(uiDescriptor).forEach(function (key) {
                var prop = uiDescriptor[key];
                if (prop === null || prop === undefined) {
                    delete uiDescriptor[key];
                }
            });

            if (languageKey) {
                resource = this.resources[languageKey];
            }

            lang.mixin(uiDescriptor, {
                getRecursive: function (key, values) {
                    var value = uiDescriptor[key];
                    if (value) {
                        if (value instanceof Array) {
                            value.forEach(function (v) {
                                values.push(v);
                            });
                        } else {
                            values.push(value);
                        }
                    }

                    this.inherited(arguments);
                },
                getResource: function (key, getPrimary) {

                    var resources = uiDescriptor.resource,
                        resource;

                    if (resources) {
                        if (!getPrimary || (getPrimary && uiDescriptor.isPrimaryType)) {
                            try {
                                resource = lang.getObject(key, false, resources);
                            } catch (error) {
                                // resource will be undefined
                            }
                            if (resource !== undefined) {
                                return resource;
                            }
                        }
                    }

                    return this.inherited(arguments);
                },
                resource: resource
            });

            return {
                instance: null,
                ctor: null,
                descriptor: uiDescriptor,
                visited: false
            };
        }
    };
});
