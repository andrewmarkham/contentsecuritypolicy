define("epi/shell/socket/hub", [
    "epi/routes",
    "./MessageHub",
    "./notificationService",
    "epi/i18n!epi/shell/ui/nls/episerver.shell.ui.resources.socket.connectionmessages"
], function (
    routes,
    MessageHub,
    notificationService,
    res
) {
    /*=====
    return {
        // summary:
        //      Returns an active epi/shell/socket/MessageHub instance
        // tags:
        //      internal
    };
    =====*/
    var messageHub;

    function handleConnectionFailure(message) {
        var description = null;

        if (!message.hasBeenConnected && message.lastAttempt) {
            description = res.noconnection;
        } else if (message.hasBeenConnected) {
            // Wait a few re-connect attempts before showing a notification.
            // The 3rd attempt will be after 25 seconds with the default re-connect delay.
            if (message.connectionAttempts === 3) {
                description = res.reconnect;
            }
            if (message.lastAttempt) {
                description = res.reconnectfailed;
            }
        }

        description && notificationService.show({
            title: res.title,
            description: description
        });
    }

    messageHub = new MessageHub(function () {
        return routes.getActionPath({ moduleArea: "Shell", controller: "socket", action: "endpoint" });
    });
    messageHub.subscribe("/epi/socket/connectionfailed", handleConnectionFailure);

    return messageHub;
});
