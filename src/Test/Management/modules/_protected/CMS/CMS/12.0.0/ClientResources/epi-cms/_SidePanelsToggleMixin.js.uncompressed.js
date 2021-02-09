define("epi-cms/_SidePanelsToggleMixin", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/promise/all",
    "dojo/when",
    "dojo/topic",

    // epi
    "epi/dependency"
],

function (
// dojo
    declare,
    lang,
    all,
    when,
    topic,

    // epi
    dependency

) {

    return declare([], {
        // summary:
        //      Provides functionality for hiding and restoring side panels
        // tags:
        //      internal abstract

        // The profile obj
        _profile: null,

        // The state of navigation panel
        _isNavigationVisible: null,

        // The state of tools panel
        _isToolsVisible: null,

        constructor: function () {
            // resolve the _profile dependency if not given
            if (!this._profile) {
                this._profile = dependency.resolve("epi.shell.Profile");
            }

            // sets the side panels original values on initialization
            this._storePanelVisibility();
        },

        _restoreSidePanels: function () {
            // summary:
            //      Restores the side panels to their original visibility
            // tags:
            //      protected
            topic.publish("/epi/layout/pinnable/navigation/toggle", this._isNavigationVisible);
            topic.publish("/epi/layout/pinnable/tools/toggle", this._isToolsVisible);
        },

        _hideSidePanels: function () {
            // summary:
            //      hides the navigation and tools side bars
            // tags:
            //      protected

            // Store the previous panels settings before hiding them
            this._storePanelVisibility().then(function () {
                topic.publish("/epi/layout/pinnable/navigation/toggle", false);
                topic.publish("/epi/layout/pinnable/tools/toggle", false);
            });
        },

        _storePanelVisibility: function () {
            // summary:
            //      Gets the panels visibility from the profile and stores it on the instance
            // tags:
            //    private

            return all([
                when(this._profile.get("navigation"), lang.hitch(this, function (navigationSetting) {
                    this._isNavigationVisible = navigationSetting ? navigationSetting.visible : false;
                })),
                when(this._profile.get("tools"), lang.hitch(this, function (toolsSetting) {
                    this._isToolsVisible = toolsSetting ? toolsSetting.visible : false;
                }))
            ]);
        }

    });

});
