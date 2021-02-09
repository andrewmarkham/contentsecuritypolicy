define("epi/shell/ClipboardManager", ["dojo/_base/declare", "dojo/Stateful"], function (declare, Stateful) {

    return declare(Stateful, {
        // summary:
        //    The clipboard object that stores copy and cut data.
        // tags:
        //    internal

        copy: true,

        data: null,

        constructor: function () {
            this.data = [];
        },

        clear: function () {
            // summary:
            //    Clears the clipboard.
            // tags:
            //    public

            this.set("data", null);
        },

        isCopy: function () {
            // summary:
            //    Determines if the last action is copy or not.
            // tags:
            //    public

            return this.get("copy");
        },

        setDataObject: function (object, copy) {
            // summary:
            //    Set data object that is copied or cut to clipboard.
            // copy:
            //    Indicates the mode is copy or cut.
            // tags:
            //    public

            this.set("copy", copy);
            this.set("data", object);
        },

        getDataObject: function () {
            // summary:
            //    Get the data object from the clipboard.
            // tags:
            //    public

            return this.data;
        },

        containsData: function () {
            // summary:
            //    Determines if clipboard contains any data or not.
            // tags:
            //    public

            return !!this.data;
        }
    });

});
