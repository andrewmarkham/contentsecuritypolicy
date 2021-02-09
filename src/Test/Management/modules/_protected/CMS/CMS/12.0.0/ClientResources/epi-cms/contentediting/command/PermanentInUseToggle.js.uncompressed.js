define("epi-cms/contentediting/command/PermanentInUseToggle", [
    "dojo/_base/declare",
    "epi/dependency",
    "epi/shell/command/ToggleCommand",

    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.permanenteditindication"
],

function (declare, dependency, ToggleCommand, resources) {

    return declare([ToggleCommand], {
        // summary:
        //      Toggles permanent in use notification on/off.
        //
        // tags:
        //      internal

        name: "PermanentInUseNotification",
        label: resources.title,
        tooltip: resources.tooltip,

        inUseNotificationManager: null,

        postscript: function () {
            this.inherited(arguments);

            if (this.inUseNotificationManager === null) {
                this.inUseNotificationManager = dependency.resolve("epi.cms.contentediting.inUseNotificationManager");
            }

            this.set("canExecute", true);
            this.set("isAvailable", true);
        },

        _execute: function () {
            // summary:
            //		Toggles permanent editing indication on/off.
            // tags:
            //		protected

            this.inherited(arguments);

            var contentData = this.model.contentData;
            this.inUseNotificationManager.togglePermanentEditIndication(contentData, true);

            this._updateCanExecute();
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute and isAvailable after the model has been updated.
            // tags:
            //		protected

            var contentData = this.model.contentData,
                active = this.inUseNotificationManager.currentUserHasInUseNotification(contentData.inUseNotifications, true);

            this.set("active", active);

            this._updateCanExecute();
        },

        _updateCanExecute: function () {
            this.set("canExecute", this.active || this.model.canChangeContent());
        }
    });
});
