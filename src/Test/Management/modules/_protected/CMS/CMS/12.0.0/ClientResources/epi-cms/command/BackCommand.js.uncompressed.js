define("epi-cms/command/BackCommand", [
    "dojo/_base/declare",

    "dojo/topic",

    "epi/dependency",
    "epi/shell/command/_Command",
    "epi/i18n!epi/cms/nls/episerver.cms.command"
],
function (
    declare,

    topic,

    dependency,
    _Command,
    resources
) {
    return declare([_Command], {
        // tags:
        //      public

        label: resources.backtoprevious,

        tooltip: resources.backtoprevious,

        category: "leftAligned",

        iconClass: "epi-iconLeft",

        cssClass: "epi-chromelessButton epi-visibleLink",

        _previousContent: null,

        postscript: function () {
            this.inherited(arguments);
            this.contextHistory = this.contextHistory || dependency.resolve("epi.cms.BackContextHistory");
        },

        _execute: function () {
            topic.publish("/epi/shell/context/request", { uri: this._previousContent.uri }, { trigger: "back", sender: this });
        },

        _onModelChange: function () {
            this._previousContent = this.contextHistory.getPrevious();
            this.set("canExecute", this._previousContent != null);
        }
    });
});
