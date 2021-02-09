define("epi-cms/command/DeviceSelection", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/shell/DestroyableByKey",
    "epi/shell/command/OptionCommand",

    "epi-cms/contentediting/viewmodel/DeviceSelectionSettingsModel"
], function (declare,
    lang,
    DestroyableByKey,
    OptionCommand,
    DeviceSelectionSettingsModel) {
    return declare([OptionCommand, DestroyableByKey], {
        // summary:
        //      Command providing the channel and resolution selection for the top menu
        // tags:
        //      internal

        iconClass: "epi-iconDevice",
        optionsProperty: "options",
        canExecute: true,
        active: false,

        postscript: function () {
            this.inherited(arguments);
            if (!this.model) {
                this.set("model", new DeviceSelectionSettingsModel());
            }
        },

        _updateFromModel: function () {
            // summary:
            //      Update the state of the command from the current model state
            //
            // tags: private

            this.set("label", this.model.get("label"));
            this.set("active", !!(this.model.get("resolution") || this.model.get("channel")));
        },

        _onModelChange: function () {
            // summary:
            //      Watches the model for property changes and updates our state accordingly

            this.inherited(arguments);

            var modelWatchKey = "_ChannelCommandModelWatch";

            this.destroyByKey(modelWatchKey);

            if (this.model) {
                this._updateFromModel();
                this.ownByKey(modelWatchKey, this.model.watch(lang.hitch(this, function (name, oldValue, newValue) {
                    if (["label", "resolution", "channel"].indexOf(name) !== -1) {
                        this._updateFromModel();
                    }
                })));
            }
        }
    });
});
