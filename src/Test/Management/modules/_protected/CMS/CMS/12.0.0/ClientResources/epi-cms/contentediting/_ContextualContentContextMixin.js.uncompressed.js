// We need to disable eqeqeq in this file because we need to do == comparisons because some components are sending the ids as int and some as strings
/*eslint eqeqeq:0*/

define("epi-cms/contentediting/_ContextualContentContextMixin", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/when",
    // epi
    "epi-cms/_ContentContextMixin",
    "epi/shell/TypeDescriptorManager",

    "epi-cms/ApplicationSettings",
    "epi-cms/contentediting/PseudoContextualCommandDecorator",
    "epi-cms/core/ContentReference"
],

function (
// dojo
    array,
    declare,
    lang,

    when,
    // epi
    _ContentContextMixin,
    TypeDescriptorManager,

    // EPi CMS
    ApplicationSettings,
    PseudoContextualCommandDecorator,
    ContentReference) {

    return declare([_ContentContextMixin], {
        // summary:
        //      Provides stubs to interacts with contextual content of the current context.
        // tags:
        //      public

        // _commandDecorator: [private] "epi-cms/contentediting/PseudoContextualCommandDecorator"
        //      Decorates commands for a pseudo contextual content
        _commandDecorator: null,

        // =======================================================================
        // Public overrided functions

        postscript: function () {

            this.inherited(arguments);

            this._commandDecorator = this._commandDecorator || new PseudoContextualCommandDecorator();
        },

        destroy: function () {

            this._commandDecorator && this._commandDecorator.destroy();

            this.inherited(arguments);
        },

        // =======================================================================
        // Public functions

        isTypeOfRoot: function (/*dojo/data/Item*/contentItem) {
            // summary:
            //      Checks to see if the item is type of root node such as: root, sub root, context root
            // contentItem: [dojo/data/Item]
            //      The given data item object that wanted to verify
            // returns: [Boolean]
            // tags:
            //      public, extension

            var inherited = this.inherited(arguments),
                isContextualRoot = this.isContextualContent(contentItem);

            return inherited != null ? !!(inherited || isContextualRoot) : !!(contentItem && isContextualRoot);
        },

        isContextualContent: function (/*dojo/data/Item*/contentItem) {
            // summary:
            //      Verifies the given content item data is contextual or not
            // contentItem: [dojo/data/Item]
            //      The given data item object that wanted to verify
            // returns: [Boolean]
            // tags:
            //      public

            return this.isContextualRoot(contentItem) || this.isPseudoContextualRoot(contentItem);
        },

        isContextualRoot: function (/*dojo/data/Item*/contentItem) {
            // summary:
            //      Checks to see the given data item object is contextual root or not
            // contentItem: [dojo/data/Item]
            //      The given data item object that wanted to verify
            // returns: [Boolean]
            // tags:
            //      public

            return contentItem.parentLink == this._getPseudoContextualContent();
        },

        isPseudoContextualRoot: function (/*dojo/data/Item*/contentItem) {
            // summary:
            //      Checks to see if the item is a pseudo contextual content
            // contentItem: [dojo/data/Item]
            //      The given data item object that wanted to verify
            // returns: [Boolean]
            // tags:
            //      public

            var contentReference = ContentReference.toContentReference(contentItem.contentLink);
            return !contentReference.providerName && contentReference.id == this._getPseudoContextualContent();
        },

        hasContextual: function (/*Array*/contentAncestors) {
            // summary:
            //      Verifies the given tree node has a ancestor is contextual or not
            // contentAncestors: [Array]
            //      A collection of "dijit/_TreeNode" item object (dojo/data/Item) that are ancestors of the given selected content
            // returns: [Boolean]
            // tags:
            //      public

            if (!(contentAncestors instanceof Array) || contentAncestors.length <= 0) {
                return false;
            }

            return array.some(contentAncestors, this.isContextualContent, this);
        },

        canHaveContextualContent: function (/*dojo/data/Item*/contentItem) {
            // summary:
            //      Verifies the given object allowed to show contextual content or not
            // contentItem: [dojo/data/Item]
            //      Content item data object
            // returns: [Boolean]
            // tags:
            //      public

            var contentReference = ContentReference.toContentReference(contentItem.contentLink);
            return !array.some(this.notSupportContextualContents, function (id) {
                return !contentReference.providerName && contentReference.id == id;
            });
        },

        getContextualRoot: function (/*dojo/data/Item*/contentItem) {
            // summary:
            //      Get contextual content from the given content item data
            // contentItem: [dojo/data/Item]
            //      Content item data object
            // returns: [dojo/data/Item]
            //      A clone object that acts as a contextual content (local content assets folder for the current content context)
            // tags:
            //      public

            if (typeof contentItem !== "object") {
                return null;
            }

            var modifiedItem = lang.clone(contentItem);

            // Change the original name of the content (in this case is "Content Assets" root folder) based on the current content context's type identifier
            // Will be (core content data types):
            //      "For This Page" for the "episerver.core.pagedata" type identifier
            //      "For This Block" for the "episerver.core.blockdata" type identifier
            //      "For This {0}" if the given type identifier not found
            modifiedItem.name = this.getContextualRootName(modifiedItem);

            // Set "hasChildren" property to FALSE in order to hides collapsed icon for pseudo contextual content.
            if (this.isPseudoContextualRoot(modifiedItem)) {
                modifiedItem.hasChildren = false;
            }

            return modifiedItem;
        },

        getContextualRootName: function (/*dojo/data/Item?*/contentItem) {
            // summary:
            //      Get contextual root name based on the current content context data type.
            // contentItem: [dojo/data/Item?]
            //      Content item data object
            // returns: [String]
            //      "For This Page" for the "episerver.core.pagedata" type
            //      "For This Block" for the "episerver.core.blockdata" type
            //      "For This {0}" if the given type identifier not found
            // tags:
            //      public

            var ownerTypeIdentifier = contentItem && contentItem.ownerTypeIdentifier,
                typeIdentifier = ownerTypeIdentifier || (this._currentContext && this._currentContext.dataType) || "",
                typeName = TypeDescriptorManager.getResourceValue(typeIdentifier, "name", true);

            var label =  TypeDescriptorManager.getResourceValue(typeIdentifier, "forthis", false);

            return typeName ? lang.replace(label, [typeName]) : label;
        },

        decoratePseudoContextualCommands: function (/*Arrays*/commands) {
            // summary:
            //      Converts the given commands to work in case pseudo contextual content
            // commands: [Array]
            //      A collection of object that is instance of "epi/shell/command/_Command" class
            // tags:
            //      public

            when(this.getCurrentContent()).then(lang.hitch(this, function (contentItem) {
                this._commandDecorator.decorateCommands(commands, contentItem, /*pseudoContextualRootFilter*/lang.hitch(this, this.isPseudoContextualRoot));
            })).otherwise(function () {});
        },

        // =======================================================================
        // Protected functions

        _getPseudoContextualContent: function () {
            // summary:
            //      Get pseudo contextual content
            // returns: [Integer]
            //      The content link
            // tags:
            //      protected

            return ApplicationSettings.contentAssetsFolder;
        }

    });

});
