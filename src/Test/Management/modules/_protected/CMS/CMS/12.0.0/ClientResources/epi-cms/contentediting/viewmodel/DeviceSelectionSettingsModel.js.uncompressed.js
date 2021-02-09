define("epi-cms/contentediting/viewmodel/DeviceSelectionSettingsModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    "dojo/topic",
    "epi/dependency",
    "epi-cms/ApplicationSettings",
    "epi/shell/command/OptionGroup",
    "epi/i18n!epi/cms/nls/episerver.cms.widget"
], function (
    declare,
    lang,
    Stateful,
    topic,
    dependency,
    ApplicationSettings,
    OptionGroup,
    resources
) {

    return declare([Stateful], {
        // summary:
        //      Settings model for channel and resolution view settings
        // tags: internal

        // resolution: [public] Boolean
        //      A string in the format "[width]x[height]" indicating the current view resolution; or null if none is set.
        resolution: null,

        // channel: [public] String
        //      A string indicating the current display channel; or null if none is active.
        channel: null,

        postscript: function () {
            this.inherited(arguments);

            this._updateLabel();

            if (!this.get("viewSettingsManager")) {
                this.set("viewSettingsManager", dependency.resolve("epi.viewsettingsmanager"));
            }

            if (!this.get("channelStore")) {
                var registry = dependency.resolve("epi.storeregistry");
                this.set("channelStore", registry.get("epi.cms.displaychannels"));
            }
        },

        _resolutionSetter: function (resolution) {
            // summary:
            //      Sets a new display resolution.
            //      The /epi/cms/action/viewsettingvaluechanged will be published when the value changes.

            if (resolution !== this.resolution) {
                this.resolution = resolution;
                this._onChange();
            }
        },

        _channelSetter: function (channel) {
            // summary:
            //      Sets a new display channel.
            //      The /epi/cms/action/viewsettingvaluechanged will be published when the value changes.

            if (channel !== this.channel) {
                this.channel = channel;
                this.set("resolution", this._getDefaultResolutionForChannel(channel));
                this._onChange();
            }
        },

        _viewSettingsManagerSetter: function (viewSettingsManager) {
            // summary:
            //      Sets the resolution and channel property when the viewSettingsManager is changed

            this.viewSettingsManager = viewSettingsManager;

            this.set("resolution", viewSettingsManager.getSettingProperty("resolution"));
            this.set("channel", viewSettingsManager.getSettingProperty("epichannel"));
        },

        _channelStoreSetter: function (store) {
            // summary:
            //      Sets the channel store and initializes the options collection

            this.channelStore = store;
            this._initialize();
        },

        _onChange: function () {
            // summary:
            //      Updates the label property and publishes an /epi/cms/action/viewsettingvaluechanged topic
            //      with the current resolution and channel selection
            // tags: private

            this._updateLabel(this.get("resolution"), this.get("channel"));

            var messageData = [
                { key: "resolution", value: this.get("resolution") },
                { key: "epichannel", value: this.get("channel") }
            ];
            topic.publish("/epi/cms/action/viewsettingvaluechanged", messageData);
        },

        _updateLabel: function (resolution, channel) {
            // summary:
            //      Updates the label property with text informing about the currently selected resolution and channel
            // tags: private

            var tooltip = resources.channelbutton.defaulttooltip;
            if (resolution || channel) {
                tooltip = lang.replace(resources.channelbutton.tooltip, {
                    channel: this._getOptionLabel(this._availableChannels, channel),
                    resolution: this._getOptionLabel(this._availableResolutions, resolution)
                });
            }
            this.set("label", tooltip);
        },

        _getOptionLabel: function (options, value) {
            // summary:
            //      Gets the label from an option having a matching value in the options array
            // tags: private

            var match = this._find(options, function (item) {
                return item.value === value;
            });
            return match && match.label || "";
        },

        _initialize: function () {
            // summary:
            //      Updates the options collection with the available resolutions and channels

            this.channelStore.query({query: "getallregistered"}).then(lang.hitch(this, function (registeredChannels) {
                this._availableResolutions = this._getAvailableResolutions();
                this._availableChannels = [{ value: null, label: resources.channelselector.defaultitem }].concat(
                    registeredChannels.map(function (channel) {
                        return {
                            value: channel.channelName,
                            label: channel.name,
                            resolutionId: channel.resolutionId
                        };
                    }));

                var options = [];
                // Only add channels if the ui is not limited
                if (!ApplicationSettings.limitUI) {
                    options.push(
                        new OptionGroup({
                            property: "channel",
                            model: this,
                            label: resources.channelselector.header,
                            options: this._availableChannels
                        })
                    );
                }
                options.push(
                    new OptionGroup({
                        property: "resolution",
                        model: this,
                        label: resources.resolutionselector.header,
                        options: this._availableResolutions
                    })
                );
                this.set("options", options);
            }));
        },

        _getAvailableResolutions: function () {
            // summary:
            //      Returns an option group containing the available resolution options based on the Application settings
            // tags: private

            var resolutions = [{ value: null, label: resources.channelselector.defaultitem }];
            if (ApplicationSettings.displayResolutions) {
                resolutions = resolutions.concat(
                    ApplicationSettings.displayResolutions.map(function (r) {
                        return {
                            value: r.width + "x" + r.height,
                            label: r.name,
                            id: r.id
                        };
                    })
                );
            }
            return resolutions;
        },

        _getDefaultResolutionForChannel: function (/*Object*/channel) {
            // summary:
            //    Get the default resolution for a given a channel.
            //
            // tags:
            //    private

            var availableResolutions = this._availableResolutions;
            if (!(channel && lang.isArray(availableResolutions))) {
                return null;
            }

            channel = this._find(this._availableChannels, function (c) {
                return c.value === channel;
            });
            var resolution = this._find(availableResolutions, function (r) {
                return (r.id === channel.resolutionId);
            });

            return resolution ? resolution.value : null;
        },

        _find: function (array, criterion) {
            // summary:
            //      Returns the first matching element in an array based on the supplied criterion callback.

            var match = null;

            if (!lang.isArray(array)) {
                return null;
            }
            array.some(function (element) {
                if (criterion(element)) {
                    match = element;
                    return true;
                }
            });
            return match;
        }

    });
});
