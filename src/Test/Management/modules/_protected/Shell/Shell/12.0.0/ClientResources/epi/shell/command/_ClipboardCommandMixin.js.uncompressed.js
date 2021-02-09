define("epi/shell/command/_ClipboardCommandMixin", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang"
],

function (
// dojo
    declare,
    lang
) {

    return declare(null, {
        // summary:
        //      Stub to handles content copy/paste for an instance of "epi/shell/command/_Command" object
        // tags:
        //      internal mixin


        // clipboard: [public] Object
        //      Hold information about copy/paste content
        clipboard: null,

        // =======================================================================
        // Public overrided functions

        postscript: function () {
            // summary:
            //      Register a watch hanlder when the command change its model
            //      Watch model and initialize model dependent properties.
            // tags:
            //      public overrides

            this.inherited(arguments);

            this.watchClipboardChange();
        },

        // =======================================================================
        // Public functions

        onRefreshClipboard: function () {
            // summary:
            //      Stub to do somethings when clipboard refreshed
            // tags:
            //      public callback
        },

        watchClipboardChange: function () {
            // summary:
            //      Register a watch hanlder when the command change its model
            // tags:
            //      public

            this._clipboardChangeWatcher = this.clipboard.watch("data", lang.hitch(this, this._onModelChange));
        },

        unwatchClipboardChange: function () {
            // summary:
            //      Clear the registered watch handler for command model change
            // tags:
            //      public

            this._clipboardChangeWatcher && this._clipboardChangeWatcher.unwatch();
        },

        // =======================================================================
        // Protected functions

        _clipboardDataGetter: function () {
            // summary:
            //      Return clipboard content item data
            // tags:
            //      protected

            return this._getClipboardData();
        },

        _clipboardTypeGetter: function () {
            // summary:
            //      Return clipboard content type
            // tags:
            //      protected

            return this._getClipboardData().type;
        },

        // =======================================================================
        // Private functions

        _getClipboardData: function () {
            // summary:
            //      Return clipboard data
            // tags:
            //      private

            if (!this.clipboard || !(this.clipboard.data instanceof Array)) {
                return null;
            }

            return this.clipboard.data;
        }

    });

});
