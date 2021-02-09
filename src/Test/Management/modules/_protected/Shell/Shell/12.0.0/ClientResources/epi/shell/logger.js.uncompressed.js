define("epi/shell/logger", [], function () {
    // summary:
    //  Use to add console logging in a handled manner that can be used even
    //  with built versions of the client modules.
    // tags:
    //      internal
    //
    // example:
    //      |   var handle = logger.timedGroup("myLabel");
    //      |   // do some operations
    //      |   handle.end()

    var noop = function () { },
        c    = console,
        uid  = 1,
        logger;

    function timedGroup(label) {

        var id = uid++;

        label = id + ": " + label;

        c.group(label);
        c.time(id);

        return {
            end: function () {
                c.timeEnd(id);
                c.groupEnd(label);
                id = label = null;
            }
        };
    }

    function setConsole(value) {
        c = value;
    }

    if (!c || !c.group || !c.time) {
        c = {
            log: noop,
            info: noop,
            time: noop,
            timeEnd: noop,
            group: noop,
            groupEnd: noop
        };
    }

    logger = {
        // tags:
        //      internal

        timedGroup: timedGroup,
        setConsole: setConsole
    };

    ["log", "info", "time", "timeEnd", "group", "groupEnd"].forEach(function (method) {
        logger[method] = function () {
            c[method].apply(c, arguments);
        };
    });

    return logger;
});
