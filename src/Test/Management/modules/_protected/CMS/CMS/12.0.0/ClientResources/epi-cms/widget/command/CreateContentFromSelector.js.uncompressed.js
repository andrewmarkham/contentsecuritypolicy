define("epi-cms/widget/command/CreateContentFromSelector", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/on",
    "dojo/topic",
    "dojo/when",

    // Shell
    "epi/dependency",
    "epi/shell/command/_Command",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/widget/dialog/Dialog",

    // CMS
    "epi-cms/core/ContentReference",
    "epi-cms/ApplicationSettings",
    "epi-cms/contentediting/_ContextualContentContextMixin",
    "epi-cms/widget/ContentSelectorDialog",
    "epi-cms/widget/ContentForestStoreModel",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.createcontentselector"
],

function (
    array,
    declare,
    lang,
    aspect,
    on,
    topic,
    when,

    // Shell
    dependency,
    _Command,
    TypeDescriptorManager,
    Dialog,

    // CMS
    ContentReference,
    ApplicationSettings,
    _ContextualContentContextMixin,
    ContentSelector,
    ContentForestStoreModel,
    ContentActionSupport,
    createcontentselectorresources
) {

    return declare([_Command, _ContextualContentContextMixin], {
        // tags:
        //      internal

        // canExecute: [Boolean]
        //      Default value indicate that command can execute
        canExecute: true,

        // canSelectOwnerContent:
        //      Indicate that command can select owner content
        canSelectOwnerContent: false,

        // showButtons:
        //      Indicate that command show buttons
        showButtons: false,

        // value: [String]
        //      Default select content
        value: null,

        // showRoot: [Boolean]
        //      True if show root on dialog, otherwise don't show root
        showRoot: false,

        // roots: [Array]
        //      The roots to show in the selector.
        roots: null,

        // creatingTypeIdentifier: [String]
        //      Type identifier of the content which is being created.
        creatingTypeIdentifier: null,

        // containerTypeIdentifiers: [Array]
        //      Type identifiers of content
        containerTypeIdentifiers: null,

        // modelContent: [Widget]
        //      That model selector dialog
        modelContent: null,

        // confirmActionText: [String]
        //      Confirm action text in dialog
        confirmActionText: createcontentselectorresources.buttons.confirmation,

        // description: [String]
        //      Description in dialog
        description: null,

        // title: [String]
        //      Title in dialog
        title: null,

        // createAsLocalAsset: [Boolean]
        //      Indicate if the content should be created as local asset of its parent.
        createAsLocalAsset: false,

        // autoPublish: Boolean
        //     Indicates if the content should be published automatically when created if the user has publish rights.
        autoPublish: false,

        // addToParentsAssetsFolder: [Boolean]
        //      Indicate if the command should attach content to the parent's assets folder.
        addToParentsAssetsFolder: false,

        typeDescriptorManager: null,

        contentRepositoryDescriptors: null,

        // allowedTypes: [public] Array
        //      The types which are allowed for the given property. i.e used for filtering based on AllowedTypesAttribute
        allowedTypes: null,

        // restrictedTypes: [public] Array
        //      The types which are restricted.
        restrictedTypes: null,

        postscript: function () {
            // summary:
            //    Initial settings value.
            //
            // tags:
            //    public

            this.inherited(arguments);
            this._initialize();
        },

        _initialize: function () {
            // summary:
            //    Initial application setting
            //
            // tags:
            //    private
            if (!this.creatingTypeIdentifier) {
                throw "You need to specify a creatingTypeIdentifier";
            }

            if (this._initialized) {
                return;
            }
            var registry = dependency.resolve("epi.storeregistry");
            this.contentStore = this.contentStore || registry.get("epi.cms.content.light");
            this.contextService = this.contextService || dependency.resolve("epi.shell.ContextService");
            this.contentTypeStore = this.contentTypeStore || registry.get("epi.cms.contenttype");

            this.contentRepositoryDescriptors = this.contentRepositoryDescriptors || dependency.resolve("epi.cms.contentRepositoryDescriptors");

            var repositoryDescriptor,
                matchType = function (type) {
                    return type === this.creatingTypeIdentifier;
                };
            for (var index in this.contentRepositoryDescriptors) {
                var descriptor = this.contentRepositoryDescriptors[index];
                //use the first descriptor that matches the creating type identifier.
                if (array.some(descriptor.containedTypes, matchType, this)) {
                    repositoryDescriptor = descriptor;
                    break;
                }
            }
            if (repositoryDescriptor) {
                var containerTypeIdentifiers = TypeDescriptorManager.getValue(this.creatingTypeIdentifier, "containerTypes");
                this.containerTypeIdentifiers = containerTypeIdentifiers ?
                    containerTypeIdentifiers :
                    [this.creatingTypeIdentifier];
                this.roots = this.roots || repositoryDescriptor.roots;
            }

            this.modelContent = new ContentForestStoreModel({
                roots: this.roots,
                additionalQueryOptions: {
                    sort: [{ attribute: "name", descending: false }]
                }
            });

            this.preventContextualContentFor = repositoryDescriptor.preventContextualContentFor;

            this.label = this.label || TypeDescriptorManager.getResourceValue(this.creatingTypeIdentifier, "create");
            this.title = this.title || TypeDescriptorManager.getResourceValue(this.creatingTypeIdentifier, "selectparent");
            this.description = this.description || TypeDescriptorManager.getResourceValue(this.creatingTypeIdentifier, "createdescription");
            this.iconClass = this.iconClass || TypeDescriptorManager.getValue(this.creatingTypeIdentifier, "commandIconClass");
            this._initialized = true;
        },

        contextChanged: function (ctx, callerData) {
            // summary:
            //      On context change
            // tags:
            //      protected
            this.set("isAvailable", this._isContentContext(ctx));
            this.inherited(arguments);
        },
        _execute: function () {
            // summary:
            //		Executes this command; ...
            // tags:
            //		protected

            when(this.getCurrentContent(), lang.hitch(this, function (currentContent) {
                if (!currentContent) {
                    return;
                }

                // Get the context store for more information about the model
                // We need to append the ?uri= because the request chain can not handle URI's in URI's
                when(this.contextService.query({uri: "epi.cms.contentdata:///" + currentContent.contentLink}), lang.hitch(this, function (context) {
                    if (!context) {
                        return;
                    }
                    var languageContext = context.languageContext;

                    // languageContext is null if the content or content provider does not have multi language support
                    // in this case allow creating a new page no matter which language is active
                    var hasAccessToLanguage = !languageContext || (languageContext.hasTranslationAccess && languageContext.isPreferredLanguageAvailable);

                    var isWastebasket = ContentReference.compareIgnoreVersion(currentContent.contentLink, ApplicationSettings.wastebasketPage);

                    var isEnableMenu = !(isWastebasket || currentContent.isDeleted) && hasAccessToLanguage &&
                    ContentActionSupport.isActionAvailable(currentContent, ContentActionSupport.action.Create, ContentActionSupport.providerCapabilities.Create, true);

                    when(this._getAvailableContentTypes(currentContent.contentLink), lang.hitch(this, function (availableContentTypes) {

                        var contentTypeCanBeChildToCurrentContext = this._isContentTypeAllowedAsChildToCurrentContext(availableContentTypes, currentContent);

                        // Show location selector dialog when current context is a valid location to store the one we are about to create.
                        if ((!contentTypeCanBeChildToCurrentContext && !this.createAsLocalAsset) ||
                            !isEnableMenu) {

                            this._createDialog();
                            this._setDialogButtonState(this.selector.get("value"));
                        } else {
                            this._switchView(currentContent);
                        }
                    }));
                }));
            }));
        },

        _getAvailableContentTypes: function (contentLink) {
            return this.contentTypeStore.query({
                query: "getavailablecontenttypes",
                localAsset: this.createAsLocalAsset,
                parentReference: contentLink
            });
        },

        _isContentTypeAllowedAsChildToCurrentContext: function (availableContentTypes, currentContent) {
            var anyAvailableContentTypeOfCorrectType = array.some(availableContentTypes, function (contentType) {
                return TypeDescriptorManager.isBaseTypeIdentifier(contentType.typeIdentifier, this.creatingTypeIdentifier);
            }, this);

            var currentContentIsAValidContainerType = array.some(this.containerTypeIdentifiers, function (type) {
                return TypeDescriptorManager.isBaseTypeIdentifier(currentContent.typeIdentifier, type);
            });

            return anyAvailableContentTypeOfCorrectType && currentContentIsAValidContainerType;
        },

        _createDialog: function () {
            // summary:
            //    Create selector dialog.
            //
            // tags:
            //    protected

            this.selector = new ContentSelector({
                canSelectOwnerContent: this.canSelectOwnerContent,
                showButtons: this.showButtons,
                value: this.value,
                showRoot: this.showRoot,
                multiRootsMode: true,
                allowedTypes: this.containerTypeIdentifiers,
                model: this.modelContent,
                showContextualContent: true,
                preventContextualContentFor: this.preventContextualContentFor
            });

            this.dialog = new Dialog({
                confirmActionText: this.confirmActionText,
                description: this.description,
                title: this.title,
                content: this.selector
            });

            this.selector.on("change", lang.hitch(this, this._setDialogButtonState));
            this.dialog.own(
                aspect.after(this.dialog, "hide", lang.hitch(this, function (result) {
                    this.hideDeferred = result;
                })));
            this.dialog.on("execute", lang.hitch(this, this._onContentSelected));

            this.dialog.show();
        },

        _onContentSelected: function () {
            // summary:
            //    When selected parent content, it should be hide dialog and change view.
            //
            // tags:
            //    protected

            var contentLink = this.selector.get("value");

            when(this.hideDeferred, lang.hitch(this, function () {
                when(this.contentStore.get(contentLink), lang.hitch(this, function (content) {
                    this._switchView(content);
                }));
            }));
        },

        _switchView: function (content) {
            // summary:
            //    Change view to Create Content with parent content
            //
            // tags:
            //    protected

            when(this.getCurrentContent(), lang.hitch(this, function (contextContent) {
                var createAsLocalAsset = this.isPseudoContextualRoot(content) || this.createAsLocalAsset;

                topic.publish("/epi/shell/action/changeview", "epi-cms/contentediting/CreateContent", null, {
                    requestedType: this.creatingTypeIdentifier,
                    parent: createAsLocalAsset ? contextContent : content,
                    editAllPropertiesOnCreate: this.editAllPropertiesOnCreate,
                    addToDestination: this.model,
                    createAsLocalAsset: createAsLocalAsset,
                    treatAsSecondaryView: this.createAsLocalAsset,
                    view: TypeDescriptorManager.getValue(this.creatingTypeIdentifier, "createView"),
                    autoPublish: this.autoPublish,
                    allowedTypes: this.allowedTypes,
                    restrictedTypes: this.restrictedTypes
                });
            }));
        },

        _setDialogButtonState: function (contentLink) {
            // summary:
            //    Set state of dialog button.
            //
            // tags:
            //    protected

            if (!contentLink) {
                this.dialog.definitionConsumer.setItemProperty(this.dialog._okButtonName, "disabled", true);
                return;
            }

            when(this.contentStore.get(contentLink), lang.hitch(this, function (content) {
                when(this.isPseudoContextualRoot(content) ? this.contextService.query({uri: "epi.cms.contentdata:///" + this._currentContext.id}) : content, lang.hitch(this, function (target) {
                    // language is null if the content or content provider does not have multi language support
                    // in this case allow creating a new block no matter which language is active
                    var hasAccessToLanguage = ContentActionSupport.hasLanguageAccess(target),
                        canCreate = hasAccessToLanguage && ContentActionSupport.hasAccess(content.accessMask, ContentActionSupport.accessLevel.Create);

                    this.dialog.definitionConsumer.setItemProperty(this.dialog._okButtonName, "disabled", !canCreate);
                }));
            }));
        }

    });

});
