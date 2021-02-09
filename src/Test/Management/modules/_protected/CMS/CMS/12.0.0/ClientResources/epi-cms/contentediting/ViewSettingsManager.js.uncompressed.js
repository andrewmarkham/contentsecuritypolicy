define("epi-cms/contentediting/ViewSettingsManager", [
    // Dojo
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/when",
    "dojo/Stateful",

    // EPi Framework
    "epi/epi",
    "epi/dependency",
    "epi/UriParser",
    "epi/shell/_ContextMixin",
    "epi/shell/StickyViewSelector"
], function (
    // Dojo
    declare,
    array,
    lang,
    topic,
    when,
    Stateful,

    // EPi Framework
    epi,
    dependency,
    UriParser,
    _ContextMixin,
    StickyViewSelector
) {
    return declare([Stateful, _ContextMixin], {
        // summary:
        //      This class to manage view settings by manipulating a list of concrete view settings objects (for example: resolution, visitor group, ...).
        //      The class is responsible for updating URL hash to keep view settings state.
        //      onViewSettingChanged event is raised when one or more view settings are applied.
        //
        // tags:
        //      internal

        // _hashWrapper: epi/shell/HashWrapper
        //    The hash wrapper instance.
        _hashWrapper: null,

        // viewSettings: Array
        //    List of registered view setting items.
        viewSettings: null,

        // _viewSettingsMap: Hashtable
        //    Map of registered view setting items by their key.
        _viewSettingsMap: null,

        // viewSettingsHashValue: Array
        //    All view settings value which are parsed from or persisted to URL hash.
        viewSettingsHashValue: null,

        // _activeKey: String
        //      Key name for active state
        _activeKey: "active",

        // enabled: [Boolean]
        //      State of eye toggle button. True if it is expanded.
        enabled: false,

        previewParams: null,

        // _stickyViewSelector: epi/shell/StickyViewSelector
        //    Responsible for storing view selected by editor
        _stickyViewSelector: null,

        postscript: function () {
            // summary:
            //		Set up the instance after creation.

            this.inherited(arguments);

            this._stickyViewSelector = this._stickyViewSelector || new StickyViewSelector();

            this._hashWrapper = this._hashWrapper || dependency.resolve("epi.shell.HashWrapper");
            this.previewParams = {};
            this.viewSettingsHashValue = [];

            // Create _viewSettingsMap.
            this._viewSettingsMap = {};
            array.forEach(this.viewSettings, lang.hitch(this, function (viewSetting) {
                if (!this._viewSettingsMap[viewSetting.key]) {
                    this._viewSettingsMap[viewSetting.key] = viewSetting;
                } else {
                    throw "Duplicated view settings key.";
                }
            }));

            this.own(
                // Listen changed view setting, to apply view setting.
                topic.subscribe("/epi/cms/action/viewsettingvaluechanged", lang.hitch(this, this._viewSettingChanged)),
                // Listen changed eye toggle button, to enable/disable view setting.
                topic.subscribe("/epi/cms/action/eyetoggle", lang.hitch(this, this._viewSettingEnabledChanged))
            );

            // Parse url hash.
            var obj = this._hashWrapper.getHash();
            if (obj && obj.viewsetting) {
                this.viewSettingsHashValue = this._toObjects(obj.viewsetting);
            }

            this.enabled = this._loadProperty(this._activeKey) === "true";

            // Pass values to every view setting items and get previewParams.
            array.forEach(this.viewSettingsHashValue, lang.hitch(this, function (item) {
                var viewSetting = this._viewSettingsMap[item.type];
                if (viewSetting) {
                    viewSetting.set("enabled", this.get("enabled"));
                    viewSetting.value = item.id;
                    viewSetting.beforePreviewLoad(this.previewParams, this.get("enabled"));
                }
            }));
        },

        onPreviewReady: function (preview) {
            this._preview = preview;

            // Apply all the view setting.
            array.forEach(this.viewSettings, lang.hitch(this, function (viewSetting) {
                viewSetting.afterPreviewLoad(preview, this.get("enabled"));
            }));
        },

        getSettingProperty: function (/*String*/ property) {
            // summary:
            //      Get value of property from view setting object array.
            //
            // property:
            //    The property to get the value.
            //
            // tags:
            //      private
            var setting = array.filter(this.viewSettingsHashValue, function (dataItem) {
                return dataItem.type === property;
            });

            return setting.length > 0 ? setting[0].id : null;
        },

        hasVisitorGroup: function () {
            // summary:
            //      Indicates that in current view setting has visitor group or not
            // tags:
            //      Public

            return this.getSettingProperty("visitorgroup") !== null && this.getSettingProperty("visitorgroup").id !== null;
        },

        _enabledGetter: function () {
            // summary:
            //      Return the current status (Enable or Disable)

            return this.enabled;
        },

        _enabledSetter: function (value) {
            // summary:
            //		Enable or disable all view settings.
            //  value: Boolean
            //      If true, all view setting will be applied. Otherwise, none of them makes any effect.

            this.enabled = value;

            // If there are view settings, all of them are apply or removed accordingly.
            // reset preview params
            var previewParams = {};

            // Apply all the view setting.
            array.forEach(this.viewSettings, lang.hitch(this, function (viewSetting) {
                viewSetting.set("enabled", value);
                viewSetting.beforePreviewLoad(previewParams, value);
            }));

            if (!epi.areEqual(this.previewParams, previewParams)) {
                this.previewParams = previewParams;
            } else {
                array.forEach(this.viewSettings, lang.hitch(this, function (viewSetting) {
                    viewSetting.afterPreviewLoad(this._preview, value);
                }));
            }
        },

        _applyViewSettingValue: function (key, value) {
            // summary:
            //		Apply a view setting.
            // value: Boolean
            //      If true, all view setting will be applied. Otherwise, none of them makes any effect.

            var previewParams,
                viewSetting = this._viewSettingsMap[key];

            if (viewSetting) {
                previewParams = lang.clone(this.previewParams);

                // Assign setting value
                viewSetting.value = value;
                viewSetting.beforePreviewLoad(previewParams, true);

                if (!epi.areEqual(this.previewParams, previewParams)) {
                    this.previewParams = previewParams;
                } else {
                    viewSetting.afterPreviewLoad(this._preview, true);
                }
            }
        },

        _viewSettingChanged: function (key, value) {
            // summary:
            //		Apply view setting when option view setting changed.
            //
            // tags:
            //		private

            var self = this;

            when(this.getCurrentContext()).then(function (context) {
                if (key !== "viewlanguage") {
                    this._stickyViewSelector.save(context.hasTemplate, context.dataType, "onpageedit");
                }

                // commit all changes to the hash in one go.
                this._commitToHash(function () {

                    var settings = key;

                    if (!(key instanceof Array)) {
                        settings = [{ key: key, value: value }];
                    }

                    settings.forEach(function (setting) {
                        self._saveProperty(setting.key, setting.value);
                        self._applyViewSettingValue(setting.key, setting.value);
                    });
                });
            }.bind(this));
        },

        _viewSettingEnabledChanged: function (enabled) {
            // summary:
            //		Apply a preview resolution. If resolution null set size to full screen.
            //
            // enabled: [Boolean]
            //      True if eye button is expanded, a.k.a view setting is enabled.
            // tags:
            //		private

            var self = this;

            if (enabled) {
                when(this.getCurrentContext()).then(function (context) {
                    this._stickyViewSelector.save(context.hasTemplate, context.dataType, "onpageedit");

                    this._commitToHash(function () {
                        self._saveProperty(self._activeKey, "true");

                        self.set("enabled", enabled);
                    });
                }.bind(this));
            } else {
                this._commitToHash(function () {

                    var hasSetting = self._hasSetting();

                    // If haven't any view settings, it should be delete viewsetting URL when collapse eye toggle button.
                    self._saveProperty(self._activeKey, hasSetting ? false : null);

                    self.set("enabled", enabled);
                });
            }
        },

        _addProperty: function (property, value) {
            // summary:
            //      Adds view setting property.
            //
            // property: String.
            //      Name of view setting property.
            // value: String
            //      Value of view setting property.
            // tags:
            //      Private
            this.viewSettingsHashValue.push({
                type: property,
                id: value
            });
        },

        _updateProperty: function (property, value) {
            // summary:
            //      Updates an existing view setting property.
            //
            // property: String.
            //      Name of view setting property.
            // value: String
            //      Value of view setting property.
            // tags:
            //      Private

            // Get index of property
            var position = -1;
            array.forEach(this.viewSettingsHashValue, function (item, index) {
                if (item.type === property) {
                    position = index;
                    return;
                }
            });

            // Update if property exists
            if (position > -1) {
                this.viewSettingsHashValue[position].id = value;
            } else {
                // Otherwise add new property
                this._addProperty(property, value);
            }
        },

        _toObjects: function (url) {
            // summary:
            //      Cast url view settings to URI object.
            //
            // url: String
            //      This is view setting url.
            // tags:
            //      Private

            var uriObjects = [];

            array.forEach(url.split("|"), function (item, index) {
                var uri = new UriParser(item);
                uriObjects.push({
                    type: uri.getType(),
                    id: uri.getId()
                });
            });

            return uriObjects;
        },

        _deleteProperty: function (property) {
            // summary:
            //      Delete view setting property.
            //
            // property: String.
            //      Name of view setting property.
            // tags:
            //      Private
            var position = -1;

            array.forEach(this.viewSettingsHashValue, function (item, index) {
                if (item.type === property) {
                    position = index;
                    return;
                }
            });

            if (position > -1) {
                this.viewSettingsHashValue.splice(position, 1);
            }
        },

        _commitToHash: function (/*function*/unitOfWork) {
            // summary:
            //      Updates hash to reflect view setting changes.
            //
            // tags:
            //      Private

            var obj = this._hashWrapper.getHash();
            var settings = [];

            // Update the local hash value to what is set in the browser
            if (obj && obj.viewsetting) {
                this.set("viewSettingsHashValue", this._toObjects(obj.viewsetting));
            } else {
                this.set("viewSettingsHashValue", []);
            }

            // Make the necessary changes to the hash value
            unitOfWork();

            // Convert object settings to uri
            array.forEach(this.viewSettingsHashValue, function (item, index) {
                settings.push(item.type + ":///" + item.id);
            });

            // Join all settings if have, otherwise delete viewsetting in hash.
            if (settings.length > 0) {
                obj.viewsetting = settings.join("|");
            } else {
                delete obj.viewsetting;
            }

            this._hashWrapper.setHash(obj);
        },

        _saveProperty: function (property, value) {
            // summary:
            //      Save view setting property.
            //
            // property: String
            //      Name of setting property
            // value: String
            //      Value of setting property
            // tags:
            //      private

            if (this.get("viewSettingsHashValue")) {
                if (value != null) {
                    // Update view setting property
                    this._updateProperty(property, value);
                } else {
                    // Delete setting property default or invalid
                    this._deleteProperty(property);
                }
            } else {
                if (value != null) {
                    this._updateProperty(property, value);
                }
            }
        },

        _loadProperty: function (property) {
            // summary:
            //      Get id of view setting property from hash.
            //
            // property: String
            //      Name of setting property
            // tags:
            //      private
            var obj = this._hashWrapper.getHash();
            var value = null;

            if (obj && obj.viewsetting) {
                var viewSettings = this._toObjects(obj.viewsetting);

                var setting = array.filter(viewSettings, function (item) {
                    return item.type === property;
                })[0];

                if (setting) {
                    value = setting.id;
                }
            }
            return value;
        },

        _hasSetting: function () {
            // summary:
            //      Check have any view setting. Not include "active" property.
            //
            // tags:
            //      private
            var obj = this._hashWrapper.getHash();

            if (obj && obj.viewsetting) {
                if (obj.viewsetting.split("|").length > 1) {
                    return true;
                }
            }
            return false;
        },

        getRenderingViewSettings: function () {
            return array.filter(this.viewSettings, lang.hitch(this, function (viewSetting) {
                return viewSetting.usedForRendering;
            }));
        }
    });
});
