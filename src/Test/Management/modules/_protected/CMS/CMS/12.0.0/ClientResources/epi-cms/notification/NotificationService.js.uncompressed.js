define("epi-cms/notification/NotificationService", [
    "dojo/_base/declare",
    "dojo/when",
    "dojo/Deferred",
    "dojo/Stateful",
    "dojo/Evented",
    "dijit/Destroyable",

    "epi/shell/xhr/errorHandler",
    "epi/dependency"
], function (
    declare,
    when,
    Deferred,
    Stateful,
    Evented,
    Destroyable,

    errorHandler,
    dependency
) {
    return declare([Stateful, Evented, Destroyable], {
        // summary:
        //      A service for interacting with notifications
        // tags:
        //      internal

        // notificationStore: [readonly] Store
        //      A REST store for interacting with notifications
        notificationStore: null,

        postscript: function () {
            this.inherited(arguments);
            this.notificationStore = this.notificationStore || dependency.resolve("epi.storeregistry").get("epi.cms.notification");

            this.own(
                this.notificationStore.on("add", this._onNotificationUpdated.bind(this)),
                this.notificationStore.on("update", this._onNotificationUpdated.bind(this))
            );
        },

        _onNotificationUpdated: function (event) {
            // summary:
            //      Emits notification-comment-updated when a notification is saved
            // tags:
            //      private

            this.emit("notification-updated", event.target);
        },

        getUnreadNotificationCount: function () {
            // summary:
            //      Gives us the total count of unread notification for a user.
            // tags:
            //      internal

            return errorHandler.wrapXhr(this.notificationStore.executeMethod("GetUnreadCount"));
        },

        markAsRead: function (notificationId) {
            // summary:
            //     Marks notification as read
            //
            // notificationId: Number
            //      Id of the notification
            // tags:
            //      internal

            if (!notificationId) {
                return new Deferred().reject();
            }

            return errorHandler.wrapXhr(this.notificationStore.executeMethod("MarkAsRead", notificationId))
                .then(this.notificationStore.refresh.bind(this.notificationStore, notificationId));
        },

        markAllAsRead: function () {
            // summary:
            //     Marks all users notifications as read
            //
            // tags:
            //      internal

            return errorHandler.wrapXhr(this.notificationStore.executeMethod("MarkAllAsRead"));
        }
    });
});
