define("epi/throttle", [
    "dgrid/util/misc"
], function (misc) {

    /*=====
    return function (cb, context, delay) {
        // summary:
        //      Returns a function which calls the given callback at most once per
        //      delay milliseconds.
        // tags:
        //      internal xproduct
    };
    =====*/

    return misc.throttle;
});
