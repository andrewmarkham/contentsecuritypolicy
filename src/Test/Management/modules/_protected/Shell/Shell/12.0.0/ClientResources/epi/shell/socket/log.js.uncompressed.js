define("epi/shell/socket/log", [
    "dojo/_base/lang",
    "./hub",
    "../logger"
], function (
    lang,
    hub,
    logger
) {

    var listeners = null;

    var socketLog = {
        // summary:
        //      A socket message logger subscribing to all status topics of the epi/shell/socket/MessageHub and logs them
        //      to the console as info messages
        // description:
        //      The socket logger is not loaded by default, and must be explicitly required. This can be done by either
        //      a require statement, which will load and enable the logger, or by setting the epi-socket-log has flag.
        // example:
        //		To start the logging from code, for instance the browser debugger console, the logger must be loaded
        //      using require. The logger is enabled automatically when loaded.
        //	|	require(["epi/shell/socket/log"]);
        // example:
        //      To disable the logging again from code
        //  |   require(["epi/shell/socket/log"], function(log) { log.disable(); });
        // example:
        //      Enabling the socket debug logging in a server-side initializable module
        //  |   [InitializableModule]
        //  |   public class HasFlags: IInitializableModule {
        //  |   {
        //  |       public void Initialize(InitializationEngine context) {
        //  |       {
        //  |           DojoConfig.Serializing += (sender, e) => ((DojoConfig)sender).Has["epi-socket-logging"] = 1;
        //  |       }
        //  |
        //  |       public void UnInitialize() { }
        //  |   }
        //
        // tags:
        //      internal

        // enabled: [readonly] Boolean
        //      A value indicating whether socket logging is enabled
        enabled: false,

        enable: function () {
            // summary:
            //      Enable web socket message logging

            if (!listeners) {
                listeners = [];
                Object.keys(hub.statusTopic).forEach(function (key) {
                    var topic = hub.statusTopic[key];
                    listeners.push(hub.subscribe(topic, lang.hitch(logger, "info", topic)));
                });
                this.enabled = true;
            }
            return this;
        },

        disable: function () {
            // summary:
            //      Disable web socket message logging

            if (listeners) {
                listeners.forEach(function (listener) {
                    listener.remove();
                });
                listeners = null;
            }
            this.enabled = false;
            return this;
        }

    };

    socketLog.enable();

    return socketLog;
});
