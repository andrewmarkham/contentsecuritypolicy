define("epi-cms/component/command/ChangeContext", [
    "dojo/_base/declare",
    "dojo/topic",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/shell/command/_Command",
    "epi/i18n!epi/cms/nls/episerver.shared.action"
], function (declare, topic, ContentActionSupport, _Command, actionStrings) {

    return declare([_Command], {
        // summary:
        //      A command that issues a request to change the context to the model.
        //
        // tags:
        //      public

        // contentActionSupport: [public] object
        contentActionSupport: null,

        // forceContextChange: [protected] boolean
        //      Force reload context if current contentLink are the same contentLink.
        forceContextChange: false,

        // forceReload: [protected] boolean
        //      Force reload unconditionally
        forceReload: false,

        // viewType: [public] String
        //      Optional parameter if there is a specific view type that should be requested
        viewType: null,

        // viewName: [public] String
        //      Optional parameter if there is a specific view name that should be requested
        viewName: null,

        postscript: function () {
            this.inherited(arguments);
            this.contentActionSupport = this.contentActionSupport || ContentActionSupport;
        },

        _execute: function () {
            // summary:
            //		Executes this command; publishes a context change request to change to the model item.
            // tags:
            //		protected

            topic.publish("/epi/shell/context/request", { uri: this.model.uri }, {
                sender: null,
                forceReload: this.forceReload,
                forceContextChange: this.forceContextChange,
                viewType: this.viewType,
                viewName: this.viewName
            });
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            // In case when input model is an array. Can excute command only when array model have only 1 item
            // Command is not support for multiple items.

            if (!this.model) {
                this.set("canExecute", false);
                return;
            }

            if (this.model.length === 1) {
                this.model = this.model[0];
            }

            var isArray = this.model instanceof Array;

            var hasReadAccess = this.contentActionSupport.hasAccess(this.model.accessMask, this.contentActionSupport.accessLevel.Read);

            this.set("canExecute", !isArray && hasReadAccess);

            if (!isArray) {
                if (this.contentActionSupport.hasAccess(this.model.accessMask, this.contentActionSupport.accessLevel.Edit)) {
                    this.set("label", actionStrings.edit);
                    this.set("iconClass", "epi-iconPen");
                } else {
                    this.set("label", actionStrings.view);
                    this.set("iconClass", "epi-iconSearch");
                }
            }
        }
    });
});
