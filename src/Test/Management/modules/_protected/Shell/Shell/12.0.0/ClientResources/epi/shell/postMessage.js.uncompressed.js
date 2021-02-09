define("epi/shell/postMessage", [
    "dojo/Evented",
    "dojo/on"
], function (
    Evented,
    on
) {

    var hub = new Evented(),
        messageHandler,
        context;

    function getContext() {
        return context || window.top;
    }

    function setupListener() {

        messageHandler && messageHandler.remove();

        messageHandler = on(getContext(), "message", function (evt) {
            var data = evt.data;
            data && data.id && hub.emit.apply(hub, [data.id, data.message]);
        }, false);
    }

    var module = {
        // summary:
        //      Adds the possibility to post messages to other windows and frames.
        //
        // example:
        //      |   postMessage.subscribe("some/topic", function(data) {
        //      |   ... do something with event
        //      |   });
        //      |   postMessage.publish("some/topic", {name:"some data", ...});
        //
        // tags:
        //      internal

        setContext: function (/* window */ctx) {
            // summary:
            //      Set to which window object messaging should take place.
            // ctx: Window/object
            //      An object implementing at least on, frames and postMessage

            context = ctx;

            setupListener();
        },

        publish: function (topic, message, targets) {
            // summary:
            //      Publishes a message to a topic on the postMessage hub.
            // topic: String
            //      The name of the topic to publish to
            // message: Object
            //      An event to distribute to the topic listeners
            // targets: window? || window[]?
            //      If set, the message will be passed only to the targets specified

            var i = 0;

            if (targets) {
                targets = targets instanceof Array ? targets : [targets];
            } else {
                targets = getContext().frames;
            }

            for (; i < targets.length; i++) {
                try {
                    targets[i].postMessage({ id: topic, data: message }, "*");
                } catch (ex) {
                    console.error(ex);
                }

            }
        },

        subscribe: function (topic, listener) {
            // summary:
            //      Subscribes to a topic on postMessage hub.
            // topic: String
            //      The topic to subscribe to
            // listener: Function
            //      A function to call when a message is published to the given topic

            return hub.on.apply(hub, arguments);
        }

    };

    setupListener();

    return module;
});
