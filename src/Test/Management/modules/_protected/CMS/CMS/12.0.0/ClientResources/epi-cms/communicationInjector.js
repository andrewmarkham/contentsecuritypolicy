(function (scope, global) {
    // summary:
    //      Handles integration between site content in preview and the edit UI.
    // tags:
    //      private

    /* global self: true */

    "use strict";

    var keyPrefix = "epi::",
        messageHandlers = {},
        eventHandles = [],
        name = scope.name || "";

    function obsolete(/*String*/ behaviour, /*String?*/ extra, /*String?*/ removal) {
        // summary:
        //      Copied from epi/obsolete.
        //      Log a debug message to indicate that a behavior has been
        //      obsoleted.
        // behaviour: String
        //      The API or behavior being obsoleted. Usually in the form
        //      of "myApp.someFunction()".
        // extra: String?
        //      Text to append to the message. Often provides advice on a
        //      new function or facility to achieve the same goal during
        //      the obsolete period.
        // removal: String?
        //      Text to indicate when in the future the behavior will be
        //      removed. Usually a version number.
        // example:
        //  | obsolete("myApp.getTemp()", "use myApp.getLocaleTemp() instead", "1.0");

        var message = "OBSOLETE: " + behaviour;
        if (extra) {
            message += " " + extra;
        }
        if (removal) {
            message += " -- will be removed in version: " + removal;
        }
        console.warn(message);
    }

    function on(target, eventType, listener, capture) {
        // summary:
        //      Simple event handler registration. Returns a handle with a remove method.
        // target: Object
        //      the object to listen for events on. Must implement addEventListener.
        // eventType: String
        //      The message payload to send to the the topic listeners
        // listener: function
        //      The function to execute when the event is triggered

        var resolvedCapture = !!capture;

        target.addEventListener(eventType, listener, resolvedCapture);

        return {
            remove: function () {
                target.removeEventListener(eventType, listener, resolvedCapture);
                target = eventType = listener = capture = null;
            }
        };
    }

    function publish(topic, message) {
        // summary:
        //      Publishes a message using the postMessage hub.
        // topic: String
        //      The name of the topic to publish to
        // message: Object
        //      The message payload to send to the the topic listeners

        global.postMessage({ id: name + topic, message: message }, "*");
    }

    function subscribe(topic, handler) {
        // summary:
        //      Subscribes to a message on the postMessage hub.
        // topic: String
        //      The topic to subscribe to
        // handler: Function
        //      A function to call when a message is published to the given topic

        var key = keyPrefix + topic;

        messageHandlers[key] ? messageHandlers[key].push(handler) : messageHandlers[key] = [handler];

        if (topic === "beta/contentSaved") {
            obsolete("epi.subscribe('beta/contentSaved')", "use epi.subscribe('contentSaved') instead.", "12.0");
        }
        if (topic === "beta/epiReady") {
            obsolete("epi.subscribe('beta/epiReady')", "use epi.subscribe('epiReady') instead.", "12.0");
        }

        return {
            remove: function () {
                var i, topicHandlers = messageHandlers[key];

                if (topicHandlers) {
                    while ((i = topicHandlers.indexOf(handler)) !== -1) {
                        topicHandlers.splice(i, 1);
                    }
                }
                topic = handler = key = null;
            }
        };
    }

    function ready(fn) {
        // summary:
        //      Executes the provided function when the dom is ready.
        // fn: function
        //      The callback to execute when the dom is ready.

        var loadHandle;

        if (!fn) {
            return;
        }

        function load() {
            loadHandle.remove();
            fn();
            loadHandle = fn = null;
        }

        if (scope.document.readyState === "complete") {
            fn();
        } else {
            loadHandle = on(scope.document, "DOMContentLoaded", load);
        }
    }

    function destroy() {
        eventHandles.forEach(function (handle) {
            handle.remove();
        });

        delete scope.epi.publish;
        delete scope.epi.subscribe;
        delete scope.epi.inEditMode;
        delete scope.epi.isEditable;
        delete scope.epi.ready;
        delete scope.epi.beta.inEditMode;
        delete scope.epi.beta.isEditable;
        delete scope.epi.beta.ready;
        delete scope.epi.beta;

        scope = global = messageHandlers = eventHandles = null;
    }

    function initSizeListener() {

        var size;

        function getElement() {

            var doc = scope.document,
                elm = doc.getElementById("epi-bodysize");

            if (elm) {
                if (doc.body.lastChild === elm) {
                    return elm;
                }
                elm.parentNode.removeChild(elm);
                elm = null;
            }

            doc.body.style.overflow = "hidden";
            doc.body.insertAdjacentHTML("beforeend", "<div id='epi-bodysize' style='position: absolute; padding: 0; margin: 0;height: 0; width: 100%;'></div>");
            return doc.getElementById("epi-bodysize");
        }

        function sizeChecker() {
            var elm = getElement(),
                w = elm.offsetWidth,
                h = elm.offsetTop;

            if (!size || size.w !== w || size.h !== h) {
                size = {h: h, w: w };
                publish("/site/resize", size);
            }
        }

        eventHandles.push(subscribe("/site/checksize", sizeChecker));
    }

    // The user profile is not available in this context, so we just scope to `epi`.
    function initData() {
        var exports = scope.epi = (scope.epi || {});

        exports.beta = {
            // The "epieditmode" URL query is True when in edit mode and editing, and False when in edit mode and previewing, so it's presence means the view is in edit mode.
            inEditMode: scope.document.location.search.indexOf("epieditmode") >= 0,
            isEditable: false,
            ready: false
        };

        // The "epieditmode" URL query is True when in edit mode and editing, and False when in edit mode and previewing, so it's presence means the view is in edit mode.
        exports.inEditMode = scope.document.location.search.indexOf("epieditmode") >= 0;
        exports.isEditable = false;
        exports.ready = false;

        function setProperties(initialData) {
            exports.beta.isEditable = initialData.isEditable;
            exports.beta.ready = true;

            exports.isEditable = initialData.isEditable;
            exports.ready = true;
        }

        eventHandles.push(subscribe("epiReady", setProperties));
    }

    function initMessageHandler() {

        function handleMessage(msg) {
            var handlers,
                msgData = msg.data;

            if (msgData && msgData.id) {
                handlers = messageHandlers[keyPrefix + msgData.id];

                handlers && handlers.forEach(function (handler) {
                    try {
                        handler(msgData.data);
                    } catch (ex) { // eslint-disable-line no-empty
                    }
                });

                msgData = null;
            }
        }

        eventHandles.push(on(scope, "message", handleMessage));
    }

    function exposeMethods() {

        var exports = scope.epi = (scope.epi || {});

        exports.publish = publish;
        exports.subscribe = subscribe;
    }

    ready(function () {

        var message = { url: scope.location.href };

        initMessageHandler();
        initSizeListener();
        initData();
        exposeMethods();

        eventHandles.push(on(scope, "unload", function () {
            publish("/site/unload", message);
            destroy();
            message = null;
        }));

        eventHandles.push(on(scope, "mouseup", function () {
            publish("/site/mouseup", message);
        }));

        publish("/site/load", message);

    });

})(self, top);
