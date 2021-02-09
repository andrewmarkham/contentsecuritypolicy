define("epi/shell/messaging", ["dojo/_base/lang", "dojo/topic", "epi"], function (lang, topic, epi) {

    //Object that holds the registered libraries to pass messages to
    var libraries = {};

    var messaging = {
        // summary:
        //      Responsible for connecting dojo publish/subscribe with messaging capabilities of external libraries, such as jQuery.
        //      Automatically connects to dojo/topic messaging as well as jQuery.trigger if the global epiJQuery object is available.
        // tags:
        //      internal

        subscribe: function (subject, context, method) {
            // summary:
            //      Sets up a subscription
            // subject: String
            //      The signature to listen for
            // context: Object
            //      Scope in which method will be invoked, or null for default scope
            // method: String|Function
            //      The name of a function in context, or a function reference. This is the function that is invoked when topic is published

            return topic.subscribe(topic, lang.hitch(context, method));
        },

        unsubscribe: function (handle) {
            // summary:
            //      Remove a subscription
            // handle: Handle
            //      The handle returned from a call to subscribe.

            if (handle) {
                handle.remove();
            }
        },

        publish: function (topic, args /*, string libName */) {
            // summary:
            //      Invoke all listener method subscribed to the topic.
            // topic: String
            //      The name of the topic to publish.
            // args: Array
            //      An array of arguments. The arguments will be applied to each topic subscriber.

            var libName = arguments[2] || null;
            for (var i in libraries) {
                var lib = libraries[i];
                if (lib.name !== libName) {
                    lib.context[lib.publishMethod]({ data: topic, __epiPublished: true }, args);
                }
            }
        },

        registerLibrary: function (name, context, publishMethod, publishFilter) {
            // summary:
            //      Registers JavaScript library to enable sharing of messages.
            // name: String
            //      Name of the library
            // context: Object
            //      Namespace object for the publish method in the library (dojo, jQuery.event etc)
            // publishMethod: String
            //      Name of the publishing method on the context object (publish, trigger etc)
            // publishFilter: function
            //      Function that enables of filtering of which messages to pass on from the library.
            //      Can be good to use if the message bus is chatty.

            libraries[name] = { name: name, publishMethod: publishMethod };
            libraries[name].context = context;
            libraries[name].originalPublish = context[publishMethod];

            context[publishMethod] = function (topic, args) {
                var newArguments = Array.prototype.slice.call(arguments);

                if (!topic.__epiPublished) {
                    if (!publishFilter || (publishFilter.apply(this, arguments))) {
                        messaging.publish(topic, args, name);
                    }
                } else {
                    newArguments[0] = topic.data;
                }
                libraries[name].originalPublish.apply(this, newArguments);
            };
        },

        unRegisterLibrary: function (name) {
            // summary:
            //      Removes the JavaScript library from message sharing.
            // name: String
            //      Name of the library

            var lib = libraries[name];
            lib.context[lib.publishMethod] = lib.originalPublish;
            delete libraries[name];
        }

    };

    //Registers dojo for message sharing
    messaging.registerLibrary("dojo", topic, "publish");

    lang.setObject("epi.shell.messaging", messaging);

    return messaging;
});
