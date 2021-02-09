define("epi-cms/compare/AllPropertiesTransformer", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/string",
    "epi/shell/MetadataTransformer",

    "epi/i18n!epi/cms/nls/episerver.cms.compare"
],
function (
    declare,
    lang,
    string,
    MetadataTransformer,

    res
) {

    return declare([MetadataTransformer], {
        // summary:
        //     Transforms property metadata to support the compare view
        //
        // tags:
        //     internal

        // model: [readonly] Object
        //      The model used to setup the compare editors.
        model: null,

        // _map: [private]  Object
        //      Map based on the full name of a metadata property
        _map: null,

        _getProperty: function (fullName) {
            // summary:
            //      Tries to get a property metadata matching the full name.
            //
            // fullName: string
            //      The hierarchical name of the property to get.
            // tags:
            //      private

            function populateMap(map, metadataProperties, path) {
                metadataProperties.forEach(function (property) {
                    var name = (!path ? property.name : path + "." + property.name).toLowerCase();

                    map[name] = property;
                    property.properties.length && populateMap(map, property.properties, name);
                });

                return map;
            }

            if (!this.model.rightMetadata) {
                return null;
            }

            if (!this._map) {
                this._map = populateMap({}, this.model.rightMetadata.properties);
            }

            return this._map[fullName.toLowerCase()];
        },

        _getComponentDefinitions: function (propertyDefinitions, groupDefinitions, nameBase, useDefaultValue, readOnly) {
            // summary:
            //      Modify the group definitions before creating the component definitions

            //Modify the groupDefinitions
            if (groupDefinitions instanceof Array) {
                var defaultSingleGroupType = this.defaultSingleGroupType;
                groupDefinitions.forEach(function (group) {
                    if (group.name === "EPiServerCMS_SettingsPanel") {
                        delete group.options.region;
                        group.options.title = res.settingspaneltabname;
                        group.uiType = defaultSingleGroupType;
                    }
                });
            }

            return this.inherited(arguments);
        },

        transformPropertySettings: function (property, nameBase, useDefaultValue, readOnly, modelTypeIdentifier) {
            // summary:
            //      Transforms property and compared property settings into a format that epi/shell/widget/WidgetFactory can process.
            // tags:
            //      public (inherited)

            var editor = this.inherited(arguments),
                compareProperty = this._getProperty(nameBase + property.name),
                compareEditor;

            editor.settings._hint = "compare";
            editor.settings.groupName = property.groupName;

            if (compareProperty) {
                var propertyName = string.pascalToCamel(nameBase + property.name),
                    value = this.model && lang.getObject(propertyName, false, this.model.rightPropertyMap);

                // Don't use the initial value for the compare property. Instead set the value based on what is stored
                // in the content data object which is available in the right property map.
                compareEditor = this.inherited(arguments, [compareProperty, "compare." + nameBase, false, true, modelTypeIdentifier]);
                compareEditor.settings._type = "compare";
                compareEditor.settings.compareViewModel = this.model;
                compareEditor.settings.value = value;

                return [editor, compareEditor];
            }

            return editor;
        },

        _createGroupContainer: function (group, readOnly) {
            var editor = this.inherited(arguments);
            editor.settings._hint = "compare";
            return editor;
        },

        _createParentContainer: function (property) {
            // Set the group name for any sub-properties to be the same as its parent
            // so that comparison information appears on the correct tab.
            property.properties.forEach(function (subproperty) {
                subproperty.groupName = property.groupName;
            });

            return this.inherited(arguments);
        }
    });
});
