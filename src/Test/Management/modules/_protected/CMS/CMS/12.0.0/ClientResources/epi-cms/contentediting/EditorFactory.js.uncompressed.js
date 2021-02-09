define("epi-cms/contentediting/EditorFactory", [
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/_base/lang",
    "epi-cms/ApplicationSettings"],

function (declare, Deferred, lang, ApplicationSettings) {

    return declare(null, {
        // summary:
        //		Factory class, responsible for creating appropriate editor wrapper.
        //
        // tags:
        //      public

        // defaultWrapperType: [public] String
        //      Default wrappert type
        defaultWrapperType: null,

        // _registeredEditorWrappers: [private] Array
        //      Registered editors array
        _registeredEditorWrappers: null,

        onEditorCreated: function (/*dijit/_Widget*/editorWidget) {
            // summary:
            //    Triggered when the editor widget is created
            // editorWidget:
            //    The newly created widget
            // tags:
            //    public callback
        },

        onEditorResolved: function (/*Object*/data, /*Object*/property) {
            // summary:
            //		Set this handler to be notified when editing and editor wrapper has been resolved.
            //      This might be used to change editor or editor wrapper before the actual instantiation.
            // data:
            //      The resolved settings. Can be changed by listener.
            // property:
            //		The settings for the property that is to be edited.
            // tags:
            //		callback
        },

        constructor: function () {
            // summary:
            //		Sets up private arrays etc.
            // tags:
            //		private
            var uiDefaults = ApplicationSettings.uiDefaults;

            this._registeredEditorWrappers = {};
            this.defaultWrapperType = (uiDefaults && uiDefaults.defaultEditorWrapper) || "floating";
        },

        registerEditorWrapper: function (/*String*/wrapperType, /*Function|String*/wrapperClassType, initializer) {
            // summary:
            //		Create the property editor.
            // wrapperType:
            //      The way the editor is shown: inline or dialog
            // wrapper:
            //      Can either be wrapper class or wrapper class name. Wrapper class must implement epi.cms.contentediting._EditorWrapperBase
            // tags:
            //		public

            this._registeredEditorWrappers[wrapperType] = {
                wrapperClassType: wrapperClassType,
                initializer: initializer
            };
        },

        _handleContentEditable: function (editorWidgetType, wrapperType, metadataUiType) {
            // summary:
            //      ContentEditableEditor only works with contenteditable, so if trying to use it in any other wrapper
            //      type fall back to an editor that works in properties mode.
            //      This is because StringEditorDescriptor isn't working as floating or flyout.
            // tags:
            //      private

            var contentEditableEditor = "epi-cms/contentediting/editors/ContentEditableEditor";

            if (editorWidgetType !== contentEditableEditor || wrapperType === "contenteditable") {
                return editorWidgetType;
            }

            // When UIHint is a Textarea or similar we should use the metadata.uiType, otherwise fall back to a standard textbox.
            var isBaseEditorTypeSafe = metadataUiType && metadataUiType !== contentEditableEditor;
            return isBaseEditorTypeSafe ? metadataUiType : "dijit/form/ValidationTextBox";
        },

        _getWrapperAndEditor: function (/*Object*/property) {
            // summary:
            //		Get wrapper and editor parameter based on the property settings
            // property:
            //      Property object
            // tags:
            //		private

            var wrapperType = property.wrapperType;
            var editorParams = property.editorParams || {};
            var editorWidgetType = property.editorWidgetType;

            if (!wrapperType) {
                if (property.metadata.customEditorSettings && property.metadata.customEditorSettings.uiWrapperType) {
                    wrapperType = property.metadata.customEditorSettings.uiWrapperType;
                } else {
                    //Fallback to default wrapper type.
                    wrapperType = this.defaultWrapperType;
                }
            }

            if (!editorWidgetType) {
                if (property.metadata.customEditorSettings && property.metadata.customEditorSettings.uiType) {
                    editorWidgetType = property.metadata.customEditorSettings.uiType;
                } else if (property.metadata.uiType) {
                    editorWidgetType = property.metadata.uiType;
                } else {
                    editorWidgetType = "epi/shell/widget/FormContainer";
                    lang.mixin(editorParams, {
                        metadata: property.metadata,
                        onFieldCreated: function (fieldName, widget) {

                        }
                    });
                }
            }

            // In case of choosing ContentEditableEditor with any wrapper other than contenteditable, change the editor.
            editorWidgetType = this._handleContentEditable(editorWidgetType, wrapperType, property.metadata.uiType);

            if (!editorWidgetType) {
                throw ("Could not resolve editor widget for property: " + property.name);
            }

            var data = {
                editorWidgetType: editorWidgetType,
                editorParams: editorParams
            };

            if (property.metadata.customEditorSettings && property.metadata.customEditorSettings.uiParams) {
                lang.mixin(editorParams, property.metadata.customEditorSettings.uiParams);
            }

            // get the registered item
            var registeredItem = this._registeredEditorWrappers[wrapperType];

            if (!registeredItem) {
                throw ("No suitable editor wrapper found for type: " + wrapperType);
            }

            if (property.metadata.customEditorSettings && property.metadata.customEditorSettings.uiWrapper) {
                data.wrapperInitializer = null;
                data.wrapperType = property.metadata.customEditorSettings.uiWrapper;
            } else {
                data.wrapperInitializer = registeredItem.initializer;
                data.wrapperType = registeredItem.wrapperClassType;
            }

            this.onEditorResolved(data, property);

            if (wrapperType) {
                return data;
            }
            throw ("No suitable editor found");
        },

        createEditor: function (/*Object*/property, /*DomNode*/node, /*String|Object*/value, /*Object*/options) {
            // summary:
            //		Create the property editor.
            // property:
            //      The property
            // node:
            //      The source node to attach to
            // value:
            //      Value to edit in the editor
            // tags:
            //		public
            var def = new Deferred();

            var wrapperAndEditor = this._getWrapperAndEditor(property);

            var wrapperType = wrapperAndEditor.wrapperType;
            var editorWidgetType = wrapperAndEditor.editorWidgetType;
            require([wrapperType, editorWidgetType], lang.hitch(this, function (wrapperClass) {

                var editorParams = options || {};

                if (property.metadata) {
                    lang.mixin(editorParams, property.metadata.settings);
                    lang.mixin(editorParams, wrapperAndEditor.editorParams);
                    editorParams.selections = property.metadata.selections;
                }

                var initParams = {
                    wrapperType: wrapperAndEditor.wrapperType,
                    editorWidgetType: wrapperAndEditor.editorWidgetType,
                    editorParams: editorParams,
                    blockDisplayNode: node,
                    overlayItem: editorParams.overlayItem,
                    property: property,
                    propertyName: property.name,
                    propertyDisplayName: property.metadata.displayName,
                    value: value,
                    contentModel: property.contentModel
                };

                var wrapper = new wrapperClass(initParams);

                // call initializer function for wrapper, adding any additional settings
                var initializer = wrapperAndEditor.wrapperInitializer;
                if (initializer) {
                    lang.mixin(initParams.editorParams, { parent: wrapper });
                    initializer(wrapper, initParams);
                }

                this.onEditorCreated(wrapper.getEditorWidget());

                def.resolve(wrapper);
            }));

            return def;
        }
    });

});
