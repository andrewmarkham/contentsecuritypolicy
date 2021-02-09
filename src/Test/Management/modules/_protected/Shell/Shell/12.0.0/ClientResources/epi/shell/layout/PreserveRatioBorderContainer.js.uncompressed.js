define("epi/shell/layout/PreserveRatioBorderContainer", [
    "dojo/_base/declare",
    "dijit/layout/BorderContainer",
    "epi/shell/layout/_PreserveRatioMixin"
], function (
    declare,
    BorderContainer,
    _PreserveRatioMixin
) {
    return declare([BorderContainer, _PreserveRatioMixin], {
        // summary:
        //      A border container which will maintain the size ratio of the panels when the container is resized.
        // tags:
        //      internal
    });
});
