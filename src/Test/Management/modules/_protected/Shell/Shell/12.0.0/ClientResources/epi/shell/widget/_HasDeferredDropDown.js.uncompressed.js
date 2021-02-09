define("epi/shell/widget/_HasDeferredDropDown", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/on",
    // Parent class
    "dijit/_HasDropDown"
], function (
    declare,
    lang,
    Deferred,
    on,
    // Parent class
    _HasDropDown
) {

    return declare([_HasDropDown], {
        // tags:
        //    internal

        // _loaded: [protected] Boolean
        //      Flag indicating whether the drop down content has loaded.
        _loaded: false,

        // loadEvent: [readonly] String
        //      The event that the drop down will raise when it has finished loading.
        loadEvent: "loaded",

        isLoaded: function () {
            // summary:
            //      Indicates whether the drop down content has loaded.
            // tags:
            //      public
            return this._loaded && !!this.dropDown;
        },

        loadDropDown: function () {
            // summary:
            //      Loads the drop down asynchronously and resolves when the load is complete.
            // returns: Promise
            //      Promise for the drop down widget that resolves when
            //      the drop down is loaded.
            // tags:
            //      protected
            var self = this,
                dropDown = this.dropDown,
                deferred = new Deferred();

            on.once(dropDown, this.loadEvent, function () {
                self._loaded = true;
                deferred.resolve();
            });

            dropDown.startup();

            return deferred.promise;
        },

        loadAndOpenDropDown: function () {
            // summary:
            //      Creates the drop down if it doesn't exist and then opens the drop down.
            // returns: Promise
            //      Promise for the drop down widget that resolves when
            //      the drop down is created and loaded.
            // tags:
            //      protected
            var self = this,
                dropDown = this.dropDown;

            if (this.isLoaded()) {
                return new Deferred().resolve(this.openDropDown());
            }

            return this.loadDropDown().then(function () {
                self.openDropDown();
                if (dropDown.focus) {
                    self.defer(lang.hitch(dropDown, "focus"), 1);
                }
            });
        }
    });
});
