define("epi-cms/project/ProjectSchedulingDialog", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/on",
    "epi-cms/contentediting/ScheduledPublishSelector",
    "epi/shell/widget/DelayableStandby",
    "epi/shell/widget/dialog/Dialog",
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command.scheduleproject"
], function (
    declare,
    lang,
    Deferred,
    on,
    ScheduledPublishSelector,
    DelayableStandby,
    Dialog,
    res
) {

    return declare([Dialog], {
        // summary:
        //      Custom dialog for scheduling a project. The dialog will show a standby spinner if loading takes time
        // tags:
        //      internal

        dialogClass: "epi-dialog-contentReferences",

        title: res.label,

        // defaultActionsVisible:
        //      Set to false to hide the default actions
        defaultActionsVisible: false,

        // _contentLoaded: [private] Deferred
        //      A deferred resolved when the already scheduled items in the dialog has been loaded
        _contentLoaded: null,

        constructor: function () {
            this._contentLoaded = new Deferred();
        },

        buildRendering: function () {
            // summary:
            //      Overridden to create the publish selector and the standby spinner shown when loading takes time
            this.inherited(arguments);

            this.own(
                this.content = new ScheduledPublishSelector({ model: this.model }),
                this._standby = new DelayableStandby({target: document.body, zIndex: 999}).placeAt(document.body),
                on.once(this.content, "contentreferencegrid-loading-complete", this._contentLoaded.resolve)
            );
        },

        show: function () {
            // summary:
            //      Show the dialog and

            var showArgs = arguments;

            // Start loading data
            if (!this._started) {
                this.startup();
            }

            this._standby.show();

            return this._contentLoaded.then(lang.hitch(this, function () {
                // Once the grid has finished loading the dialog can be shown.
                this._standby.hide();
                return this.inherited(showArgs);
            }));
        }
    });
});
