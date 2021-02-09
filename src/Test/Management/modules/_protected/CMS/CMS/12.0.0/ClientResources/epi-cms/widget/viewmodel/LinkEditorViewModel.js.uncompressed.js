define("epi-cms/widget/viewmodel/LinkEditorViewModel", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/lang",
    "dojo/io-query",
    "dojo/topic",
    "dojo/Stateful",
    "dojo/when",

    // EPi Framework
    "epi/dependency"
],

function (
// Dojo
    array,
    declare,
    Deferred,
    lang,
    ioQuery,
    topic,
    Stateful,
    when,

    // EPi Framework
    dependency
) {
    return declare([Stateful], {
        // summary:
        //    Represents the view model for LinkEditor
        // tags:
        //    internal

        _isEmptyObject: function (obj) {
            // Summary
            //      Check empty object
            // obj: object
            //      The object which need to check for empty.
            // tag
            //      Private

            for (var i in obj) {
                if (obj[i] && obj[i] !== "") {
                    return false;
                }
            }
            return true;
        }
    });
});

