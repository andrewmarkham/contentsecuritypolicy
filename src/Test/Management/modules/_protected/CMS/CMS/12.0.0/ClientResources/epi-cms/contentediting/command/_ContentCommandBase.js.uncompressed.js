define("epi-cms/contentediting/command/_ContentCommandBase", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/shell/command/_PropertyWatchCommand"
],

function (
    declare,
    lang,
    _PropertyWatchCommand
) {

    return declare([_PropertyWatchCommand], {
        // summary:
        //      Base class for any content manipulation command, like: Reject, Publish, ...
        //      canExecute is updated to false if the content is changing its status, and restore when done.
        // tags:
        //      internal abstract

        _isChangingContentStatusHandle: null,

        // checkDeleted: [Boolean]
        //      Indicated that need check content is deleted or not before execute command
        // tags:
        //      public
        checkDeleted: true,

        propertiesToWatch: ["isChangingContentStatus"],

        _canExecuteGetter: function () {
            // summary:
            //      Check content is deleted or not
            // tags:
            //      protected

            if (!this.model || !this.model.contentData) {
                return false;
            }

            var contentData = this.model.contentData;
            return this.canExecute && (!this.checkDeleted || (contentData && !contentData.isDeleted));
        },

        _onPropertyChanged: function () {
            // summary:
            //      This is called whenever the specified property in propertiesToWatch
            //      is changed on the model and sets canExecute.
            // tags:
            //      protected

            this.set("canExecute", this.get("canExecute"));
        }
    });
});
