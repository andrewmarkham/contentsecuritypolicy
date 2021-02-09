define("epi/shell/TaskQueue", [
    "dojo/_base/lang",
    "dojo/when"

], function (lang, when) {

    return function (task, options) {
        // summary:
        //    A simple message queue which accepts a function and then apply that on every incoming message sequentially
        //    Once the function applied to a message it gets removed from queue.
        //
        // task: Function
        //       A function applied on every message when processed
        // options: Object
        //		Option contains throttle
        //
        // tags:
        //      internal

        if ((typeof task !== "function")) {
            throw new Error("TaskQueue can't be created without providing a task processing callback.");
        }

        // throttle is used to only process message after a quiet period
        var throttle = (options && options.throttle) || 0;
        var processingInProgress = false;

        // contains all incoming messages
        var messageQueue = [];

        // processing of messages can be switched on/off via this flag.
        var enableProcessing = true;

        function processQueue() {
            // summary:
            //      Starts the message processing only if it is enabled.

            if (enableProcessing && !processingInProgress && messageQueue.length > 0) {
                processingInProgress = true;
                var currentMessage = messageQueue.shift();

                when(task(currentMessage)).always(function () {
                    processingInProgress = false;
                    setTimeout(processQueue, throttle);
                }).otherwise(function (err) {
                    console.error("Something went wrong while running provided function to TaskQueue. " + err);
                });
            }
        }

        this.start = function () {
            // summary:
            //      Enables the processing of queued messages and start the process.

            enableProcessing = true;
            processQueue();
        };

        this.stop = function () {
            // summary:
            //      Stops the processing of messages.
            enableProcessing = false;
        };

        this.enqueue = function (message) {
            // summary:
            //      Enques the given message in queue and start the processing
            // message:
            //       Any message. (Could be an object, an array etc. but null or undefined will not be processed)
            if (message) {
                messageQueue.push(message);
                processQueue();
            }
        };

        this.getLength = function () {
            // summary:
            //      Returns the length of message queue.
            return messageQueue.length;
        };

    };
});
