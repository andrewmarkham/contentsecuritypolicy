define("epi/shell/dgrid/_MetadataMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/string"
],
function (
    array,
    declare,
    lang,
    epiString
) {
    return declare([], {
        // tags:
        //      internal

        metadata: null,

        postMixInProperties: function () {
            this.inherited(arguments);
            this.metadata = this.metadata || {};
            this.metadata.gridIncluded = this.metadata.gridIncluded || [];
            this.metadata.placeColumns = this.metadata.placeColumns || "prepending";
            this.columns = this.columns && this.columns instanceof Array ? this._columnsArrayToObject(this.columns) : this.columns || {};
        },

        postCreate: function () {
            this.inherited(arguments);
            // Where to put the metadata created columns (useful when mixing normal columns and metadata columns)
            if (this.metadata.placeColumns === "appending") {
                lang.mixin(this.columns, this._metadataPropertiesToColumnsDefinition(this.metadata.properties, this.metadata.gridIncluded));
            } else {
                this.columns = lang.mixin(this._metadataPropertiesToColumnsDefinition(this.metadata.properties, this.metadata.gridIncluded), this.columns);
            }
        },

        _columnsArrayToObject: function (columnsArray) {
            // summary:
            //      Creates a columns object from a columns array
            // tags:
            //      private
            var columnsObject = {};
            for (var i = 0,j = columnsArray.length; i < j; i += 1) {
                columnsObject[columnsArray[i].field] = columnsArray[i];
            }
            return columnsObject;
        },

        _metadataPropertiesToColumnsDefinition: function (properties, include) {
            // summary:
            //		Get columns definition from metadata properties
            // tags:
            //		private
            var colDefs = {},
                filteredProperties = this._filterProperties(properties, include);

            for (var i = 0,j = filteredProperties.length; i < j; i += 1) {
                var definition = this.getColumnDefinition(filteredProperties[i]);
                colDefs[definition.field] = definition;
            }

            return colDefs;
        },

        _filterProperties: function (properties, include) {
            // summary:
            //      Filter included properties
            // tags:
            //      private

            if (include.length > 0) {
                return array.filter(properties, function (property) {
                    return array.indexOf(include, property.name) > -1;
                });
            }
            return [];
        },

        getColumnDefinition: function (property) {
            // summary:
            //      Returns a basic column definition
            return {
                label: property.displayName,
                field: epiString.pascalToCamel(property.name),
                sortable: false
            };
        }
    });
});
