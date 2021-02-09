define("epi/obsolete", [],
    function () {
        return function (/*String*/ behaviour, /*String?*/ extra, /*String?*/ removal) {
            // summary:
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
            // tags:
            //      public

            var message = "OBSOLETE: " + behaviour;
            if (extra) {
                message += " " + extra;
            }
            if (removal) {
                message += " -- will be removed in version: " + removal;
            }
            console.warn(message);
        };
    });
