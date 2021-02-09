define("epi-cms/visitorgroups/command/VisitorGroupViewSettingsModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/Stateful",
    "dojo/when",
    "dijit/Destroyable",
    "epi/dependency",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.visitorgroupsbutton",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.visitorgroupselector"
], function (
    declare,
    lang,
    topic,
    Stateful,
    when,
    Destroyable,
    dependency,
    buttonRes,
    res
) {

    return declare([Stateful, Destroyable], {
        // summary:
        //      Model for settings related to visitor groups view settings
        // tags: internal

        // selectedGroup: [public] string
        //      The currently selected visitor group
        selectedGroup: null,

        tooltip: buttonRes.defaulttooltip,

        defaultItem: {
            value: null,
            label: res.defaultitem
        },

        // options: [public] Array
        //      The available visitor groups to select from
        options: [],

        postscript: function () {
            this.inherited(arguments);

            if (!this._store) {
                var registry = dependency.resolve("epi.storeregistry");
                this._store = registry.get("epi.cms.visitorgroup");
            }

            if (!this._viewSettingsManager) {
                this._viewSettingsManager = dependency.resolve("epi.viewsettingsmanager");
            }

            //Get the currently selected group from the view settings manager
            var selectedVisitorGroup = this._viewSettingsManager.getSettingProperty("visitorgroup");

            var self = this;
            when(this._store.query()).then(function (visitorGroups) {
                if (!(visitorGroups instanceof Array)) {
                    visitorGroups = [];
                }

                var options = visitorGroups.map(function (item) {
                    return {label: item.name, value: item.id};
                });

                options.unshift(self.defaultItem);
                self.set("options", options);

                self.set("selectedGroup", selectedVisitorGroup, false);
            });

        },
        _selectedGroupSetter: function (selectedGroup, raiseEvent) {

            if (this.selectedGroup === selectedGroup) {
                return;
            }

            // Set the selected group to -1 if no one was provided
            this.selectedGroup = selectedGroup;

            this._setTooltip();

            if (raiseEvent === false) {
                return;
            }

            topic.publish("/epi/cms/action/viewsettingvaluechanged", "visitorgroup", this.selectedGroup);
        },

        _setTooltip: function () {
            // summary:
            //      Combine a new tooltip using the selected group and the tooltip
            // tags:
            //      internal

            var group = this._getGroup(this.selectedGroup);

            if (group) {
                this.set("tooltip", lang.replace(buttonRes.tooltip, { visitorgroup: group.label}));
            } else {
                this.set("tooltip", buttonRes.defaulttooltip);
            }
        },

        _getGroup: function (id) {
            // summary:
            //      Get the group object using the selected group id
            // tags:
            //      internal

            if (id === this.defaultItem.value) {
                return null;
            }

            for (var idx in this.options) {
                if (this.options[idx].value === id) {
                    return this.options[idx];
                }
            }

            return null;
        }
    });
});
