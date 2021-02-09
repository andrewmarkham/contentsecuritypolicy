define("epi-cms/notification/command/ViewNotifications", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "epi/dependency",
    // Parent class and mixins
    "dijit/Destroyable",
    "epi/shell/command/_Command",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.notification.command"
], function (
    declare,
    lang,
    on,
    dependency,
    // Parent class and mixins
    Destroyable,
    _Command,
    // Resources
    res
) {
    return declare([_Command, Destroyable], {
        // summary:
        //      A command for the badge-button
        // tags:
        //      internal

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconBell epi-icon--medium",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: "",

        // isAvailable: [public] Boolean
        //      Flag which indicates whether this command is available in the current context.
        isAvailable: true,

        // canExecute: [public] Boolean
        //      Flag which indicates whether this command is able to be executed.
        canExecute: true,

        // badgeValue: [public] String
        //    Value for the badge
        badgeValue: "",

        // _unreadCount: [private] Number
        //    Unread number of notifications
        _unreadCount: 0,

        postscript: function () {
            this.inherited(arguments);

            this.service = this.service || dependency.resolve("epi.cms.NotificationService");

            this.own(
                this.service.on("notification-updated", function (notification) {
                    if (!notification.hasRead) {
                        this.set("_unreadCount", this._unreadCount + 1);
                    }
                }.bind(this))
            );

            // Set initial value
            this._updateUnreadCount();
        },

        _execute: function () {
            // Reset the counter when opening the notifications list
            this.set("_unreadCount", 0);
        },

        _updateUnreadCount: function () {
            this.service.getUnreadNotificationCount().then(function (count) {
                this.set("_unreadCount", count);
            }.bind(this));
        },

        __unreadCountSetter: function (value) {
            var labelValue = value > 0 ?  "(" + value + ")" : "";

            this._unreadCount = value;
            this.set({
                badgeValue: value > 0 ? value : null,
                label: lang.replace(res.viewnotifications, { unreadcount: labelValue })
            });
        }
    });
});
