define("epi-cms/command/NewContent", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/topic",
    "dojo/when",
    "dojo/promise/all",

    "epi/dependency",
    "epi/shell/command/_Command",
    "epi/shell/TypeDescriptorManager",
    "epi-cms/contentediting/ContentActionSupport"
],

function (
    array,
    declare,
    lang,
    Deferred,
    topic,
    when,
    all,

    dependency,
    _Command,
    TypeDescriptorManager,
    ContentActionSupport
) {

    return declare([_Command], {
        // summary:
        //      A command that starts the create new content process when executed.
        //
        // tags:
        //      public

        // contentType: [public] String
        //      The type of the content that the create content view should display.
        contentType: null,

        // createAsLocalAsset: [public] Boolean
        //      Indicate if the content should be created as local asset of its parent.
        createAsLocalAsset: false,

        postscript: function () {
            this.inherited(arguments);

            var identifier = this.contentType;

            this.label = this.label || TypeDescriptorManager.getResourceValue(identifier, "create");
            this.tooltip = this.tooltip || TypeDescriptorManager.getResourceValue(identifier, "createdescription");
            this.iconClass = this.iconClass || TypeDescriptorManager.getValue(identifier, "commandIconClass");

            if (!this.store) {
                var registry = dependency.resolve("epi.storeregistry");
                this.store = registry.get("epi.cms.contenttype");
            }
        },

        _execute: function () {
            // summary:
            //      Executes this command; publishes a change view request to change to the create content view.
            // tags:
            //      protected

            topic.publish("/epi/shell/action/changeview", "epi-cms/contentediting/CreateContent", null, {
                requestedType: this.contentType,
                parent: this.model,
                createAsLocalAsset: this.createAsLocalAsset,
                view: TypeDescriptorManager.getValue(this.contentType, "createView")
            });
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected

            // the model can be an array of content, cause we can cut, copy or delete multiple items.
            // but creating new content accepts one content only, so we just get the first data if the input model is an array.
            if (this.model && this.model instanceof Array) {
                if (this.model.length === 1) {
                    this.model = this.model[0];
                } else { // model is an array that has more than one item, or empty.
                    this.model = null;
                }
            }

            this.set("canExecute", this._canExecute());

            var model = this.model;
            if (!model) {
                this.set("isAvailable", false);
                return;
            }

            when(this._getContentType(model), lang.hitch(this, function (contentType) {

                if (!contentType) {
                    this.set("isAvailable", false);
                    return;
                }

                when(this._checkAvailability(contentType.availableContentTypes), lang.hitch(this, function (isAvailable) {
                    this.set("isAvailable", isAvailable);
                }));
            }));
        },

        _canExecute: function () {
            // summary:
            //      Determines if the command can be executed
            // returns: Boolean
            //      True if the command can executed
            //      False if the command can't be executed
            // tags:
            //      protected virtual
            var model = this.model,
                createAction = ContentActionSupport.action.Create,
                createProviderCapability = ContentActionSupport.providerCapabilities.Create,
                canExecute = model && !(model.isWastebasket || model.isDeleted) &&  // Ensure a model is available and it isn't deleted
                    ContentActionSupport.hasLanguageAccess(model) &&  // Ensure the user has access in the current language.
                    ContentActionSupport.isActionAvailable(model, createAction, createProviderCapability, true);  // Ensure the action is available to the user.

            return !!canExecute;
        },

        _getContentType: function (model) {
            // summary:
            //      Query for available content types based on the type.
            // tags:
            //      private

            if (!model) {
                return null;
            }

            return this.store.get(model.contentTypeID);
        },

        _checkAvailability: function (availableContentTypes) {

            if (availableContentTypes.length === 0) {
                return false;
            }

            var deferred = new Deferred();

            var getRequests = array.map(availableContentTypes, lang.hitch(this, function (contentTypeID) {
                return this.store.get(contentTypeID);
            }));

            when(all(getRequests), lang.hitch(this, function (contentTypes) {
                var isAvailable = array.some(contentTypes, lang.hitch(this, function (contentType) {
                    return TypeDescriptorManager.isBaseTypeIdentifier(contentType.typeIdentifier, this.contentType);
                }));
                deferred.resolve(isAvailable);
            }));

            return deferred;
        }

    });

});
