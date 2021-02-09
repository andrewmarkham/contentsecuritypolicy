define("epi-cms/contentediting/ShortcutNotification", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    // epi
    "epi/string",

    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.shortcutnotification"
],

function (
// dojo
    declare,
    lang,
    Stateful,
    // epi
    epiString,

    // resources
    resources
) {

    // linkTypes should match the EPiServer.Core.LinkTypes enum
    var linkTypes = ["normal",
        "shortcut",
        "external",
        "inactive",
        "fetchdata"];

    return declare([Stateful], {
        // summary:
        //      Helper class to translate pageShortcutTypes
        //      into warning notifications for the notification bar.
        // tags:
        //      internal

        // order: [public] Number
        //      Sort order of notification
        order: 20,

        _valueSetter: function (/*Object*/value) {
            // summary:
            //      Updates the notification when the property changes.
            // tags:
            //      private

            var shortcut = value.contentViewModel.contentModel.get("iversionable_shortcut");
            if (shortcut) {
                this._updateNotification(shortcut.pageShortcutType);
            }

            if (this._contentModelWatch) {
                this._contentModelWatch.unwatch();
            }

            this._contentModelWatch = value.contentViewModel.contentModel.watch("iversionable_shortcut", lang.hitch(this, function (name, oldValue, newValue) {
                this._updateNotification(newValue && newValue.pageShortcutType);
            }));
        },


        _updateNotification: function (shortcutType) {
            // summary:
            //      Maps the shortcutType enum value to a translated message
            // shortcutType: Number
            //      The value to set a message for
            // tags:
            //      private

            var shortcutName,
                message = null;

            if (shortcutType > 0) {
                shortcutName = linkTypes[shortcutType];
                message = epiString.toHTML(resources[shortcutName]);
            }

            this.set("notification", { content: message });
        }
    });
});
