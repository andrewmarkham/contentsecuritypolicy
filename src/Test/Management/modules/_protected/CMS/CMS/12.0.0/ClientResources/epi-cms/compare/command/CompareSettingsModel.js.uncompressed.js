define("epi-cms/compare/command/CompareSettingsModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/Stateful",
    "dojo/when",
    "dijit/Destroyable",
    "epi/dependency",
    "epi/i18n!epi-cms/nls/episerver.cms.compare.mode"
], function (
    declare,
    lang,
    topic,
    Stateful,
    when,
    Destroyable,
    dependency,
    res
) {

    return declare([Stateful, Destroyable], {
        // summary:
        //      Model for settings related to property compare view settings
        // tags: internal

        // enabled: [public] Boolean
        //      A flag telling whether compare mode is enabled
        enabled: false,

        // mode: [public] String
        //      The currently active mode
        mode: "allpropertiescompare",

        _selectedCompareModeProfileKey: "epi.selected-comparemode-id",

        // modeOptions: [readonly] Array[object]
        //      An array of the available compare modes
        modeOptions: [
            { label: res.allpropertiescompare, value: "allpropertiescompare", iconClass: "epi-iconForms" },
            { label: res.sidebysidecompare, value: "sidebysidecompare", iconClass: "epi-iconLayout" }
        ],

        constructor: function () {
            var self = this;

            this.profile = this.profile || dependency.resolve("epi.shell.Profile");

            when(this._loadSelectedModeFromProfile(), lang.hitch(this, function (mode) {
                if (mode) {
                    this.set("mode", mode);
                }
            }));

            this.own(
                topic.subscribe("/epi/shell/action/viewchanged", function (type, args, data) {
                    // Deactivate compare if the view changes something other than compare.
                    var view = data && (data.viewName || (data.sender && data.sender.viewName));
                    var isCompareMode = self.modeOptions.some(function (option) {
                        return option.value === view;
                    });
                    self.set("enabled", isCompareMode, false);
                }),
                topic.subscribe("/epi/cms/action/switcheditmode", function () {
                    self.set("enabled", false, false);
                }),
                topic.subscribe("/epi/cms/action/eyetoggle", function (enabled) {
                    // Deactivate compare if the view settings are toggled on.
                    if (enabled) {
                        self.set("enabled", false, false);
                        topic.publish("/epi/shell/action/changeview/updatestate", { viewName: null });
                    }
                })
            );
        },

        _enabledSetter: function (value, raiseEvent) {
            if (this.enabled !== value) {
                this.enabled = value;
                (raiseEvent !== false) && this._onChange();
            }
        },

        _modeSetter: function (value) {
            // TODO: Try to remove, required to not get change events when clicking the dropdownbutton since the _CommandModelBindinMixing wires up onClick
            if (this.mode !== value) {
                this.mode = value;
                this.get("enabled") && this._onChange();
                // Store the selected mode.
                this.profile.set(this._selectedCompareModeProfileKey, value, { location: "server" });
            }
        },

        _onChange: function () {
            // summary:
            //      Publish view change topics when the state changes
            // tags:
            //      private
            topic.publish("/epi/shell/action/changeview", this.get("enabled") ? this.get("mode") : null, null, { forceReload: true });
        },


        _loadSelectedModeFromProfile: function () {
            // summary:
            //      Load the selected mode from the user profile
            // returns: Promise
            //      The compare mode that was stored in the profile
            // tags:
            //      internal

            //Load the selected mode from the profile
            return when(this.profile.get(this._selectedCompareModeProfileKey), function (mode) {
                if (!mode) {
                    return null;
                }
                return mode;
            });
        }
    });

});
