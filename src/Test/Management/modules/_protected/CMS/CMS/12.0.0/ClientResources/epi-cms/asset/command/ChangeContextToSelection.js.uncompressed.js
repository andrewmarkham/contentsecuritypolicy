define("epi-cms/asset/command/ChangeContextToSelection", [
    "dojo/_base/declare",
    "dojo/topic",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/shell/command/_Command",
    "epi/shell/command/_SelectionCommandMixin",
    "epi/shell/TypeDescriptorManager",
    "epi/i18n!epi/cms/nls/episerver.shared.action"
], function (
    declare,
    topic,
    ContentActionSupport,
    _Command,
    _SelectionCommandMixin,
    TypeDescriptorManager,
    actionStrings) {

    return declare([_Command, _SelectionCommandMixin], {
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

        // typeIdentifiers: [public] Array
        //      Optional parameter if only specific type identifiers should be allowed to change context to.
        typeIdentifiers: null,

        postscript: function () {
            this.inherited(arguments);
            this.contentActionSupport = this.contentActionSupport || ContentActionSupport;
        },

        _execute: function () {
            // summary:
            //		Executes this command; publishes a context change request to change to the model item.
            // tags:
            //		protected
            var target = this._getSingleSelectionData();
            topic.publish("/epi/shell/context/request", { uri: target.uri }, {
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

            var target = this._getSingleSelectionData();
            if (!target) {
                this.set("canExecute", false);
                this.set("isAvailable", false);
                return;
            }

            var hasReadAccess = this.contentActionSupport.hasAccess(target.accessMask, this.contentActionSupport.accessLevel.Read);
            var isAvailable = this._isTargetOfCorrectType(target);

            this.set("isAvailable", isAvailable);
            this.set("canExecute", isAvailable && hasReadAccess);

            if (this.contentActionSupport.hasAccess(target.accessMask, this.contentActionSupport.accessLevel.Edit)) {
                this.set("label", actionStrings.edit);
                this.set("iconClass", "epi-iconPen");
            } else {
                this.set("label", actionStrings.view);
                this.set("iconClass", "epi-iconSearch");
            }
        },

        _isTargetOfCorrectType: function (target) {
            // summary:
            //      If this.typeIdentifiers is defined we will check if the model is of correct type,
            //      otherwise we will always return true.
            // tags:
            //      private

            if (!this.typeIdentifiers) {
                return true;
            }
            return this.typeIdentifiers.some(function (type) {
                return TypeDescriptorManager.isBaseTypeIdentifier(target.typeIdentifier, type);
            }, this);
        }
    });
});
