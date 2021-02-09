define("epi/shell/dgrid/_EditorMetadataMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/promise/all",
    "dgrid/editor",
    "epi/string",
    "./_MetadataMixin"
],
function (
    array,
    declare,
    lang,
    Deferred,
    all,
    editor,
    epiString,
    _MetadataMixin
) {
    return declare([_MetadataMixin], {
        // tags:
        //      internal xproduct

        editableProperties: null,
        _editorWidgetsReady: null,
        editorSettings: { editOn: "click", autoSave: "true" },
        editorArgs: null,
        editorType: null,

        postMixInProperties: function () {
            this.inherited(arguments);
            this.metadata.gridEditable = this.metadata.gridEditable || [];
            this.editorType = this.editorType || editor;
            this._editorWidgetPromises = [];
        },

        _metadataPropertiesToColumnsDefinition: function (properties, include) {
            // summary:
            //		Get columns definition from metadata properties
            // tags:
            //		private

            var colDefs = this.inherited(arguments),
                filteredProps = this._filterProperties(properties, this.metadata.gridEditable),
                uiWidgets = [];

            for (var i = 0, j = filteredProps.length; i < j; i += 1) {
                var uiType = filteredProps[i].uiType;
                if (uiType) {
                    uiWidgets.push(uiType);
                }
            }

            this._editorWidgetsReady = new Deferred();
            require(uiWidgets, lang.hitch(this, function () {
                for (var i = 0, j = filteredProps.length; i < j; i += 1) {
                    var prop = filteredProps[i],
                        widget = arguments[array.indexOf(uiWidgets, prop.uiType)],
                        colName = epiString.pascalToCamel(prop.name),
                        selections = prop.selections && prop.selections.length > 0 ? { selections: prop.selections } : {};

                    colDefs[colName] = this.editorType(lang.mixin(
                        colDefs[colName],   // the column definition settings
                        this.editorSettings,
                        {
                            editor: widget,
                            editorArgs: lang.mixin(colDefs[colName].editorArgs,
                                this.editorArgs,    // grid.editorArgs settings
                                prop.settings,      // The "settings" property from the metadata object contains editor arguments
                                selections)         // Selections are mixed on to the editorArgs
                        }));
                }
                this._editorWidgetsReady.resolve();
            }));

            return colDefs;
        },

        startup: function () {
            // summary:
            //		Startup function delaying execution until widgets are resolved

            var inherited = this.getInherited(arguments),
                args = arguments;

            return this._editorWidgetsReady.then(lang.hitch(this, function () {
                this.set("columns", this.columns);
                return inherited.apply(this, args);
            }));
        }
    });
});
