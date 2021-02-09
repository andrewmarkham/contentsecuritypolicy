define("epi-cms/widget/_ContentTreeNodeMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",

    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-construct",

    "epi-cms/ContentLanguageHelper"
],

function (
    declare,
    lang,
    when,

    domAttr,
    domClass,
    domConstruct,

    ContentLanguageHelper
) {

    return declare(null, {
        // summary:
        //      Stubs to handler common functions for tree
        // tags:
        //      internal mixin

        _missingLanguageCssClass: "epi-ct-missingLanguageRow",

        // =======================================================================
        // Protected overridden functions

        _updateItemClasses: function (/*Item*/item) {
            // summary:
            //      Override dijit/_TreeNode._updateItemClasses function
            //
            //      Set appropriate CSS classes for icon and label dom node
            //      (used to allow for item updates to change respective CSS)
            // tags:
            //      protected, override

            this.inherited(arguments);

            this._updateLayout();
        },

        _updateLayout: function () {
            // summary:
            //      Override dijit/_TreeNode._updateLayout function
            //
            //      Set appropriate CSS classes for this.domNode
            // tags:
            //      protected, override

            this.inherited(arguments);

            this._updateLanguageIndicator();
            this._updateIndividualLayout();
        },

        // =======================================================================
        // Protected functions

        _updateIndividualLayout: function () {
            // summary:
            //      Update tree node layout for individual case
            // tags:
            //      protected, extension
        },

        _addLanguageIndicatorForItem: function (item) {
            // summary:
            //      Setup missing language branch indicator UI for item parameter
            // item: [Object]
            //      Content item
            // tags:
            //      protected

            var missingLanguageBranch = this.item.missingLanguageBranch;

            if (this.iconNodeLanguage) {
                this.iconNodeLanguage.innerHTML = missingLanguageBranch.language || "";
                when(ContentLanguageHelper.getMissingLanguageMessage(item), lang.hitch(this, function (message) {
                    domAttr.set(this.iconNodeLanguage, "title", message || "");
                }));
            }

            domClass.add(this.rowNode, this._missingLanguageCssClass);
        },

        _addLanguageIndicator: function () {
            // summary:
            //      Setup missing language branch indicator UI
            // tags:
            //      protected

            this._addLanguageIndicatorForItem(this.item);
        },

        _removeLanguageIndicator: function () {
            // summary:
            //      Remove all settings for language indicator
            // tags:
            //      protected

            if (this.iconNodeLanguage) {
                domConstruct.empty(this.iconNodeLanguage);
                domAttr.remove(this.iconNodeLanguage, "title");
            }
            domClass.remove(this.rowNode, this._missingLanguageCssClass);
        },

        _updateLanguageIndicator: function () {
            // summary:
            //      Set language indicator for the tree node
            // tags:
            //      protected

            if (!this._isTypeOfRoot() && this.item.missingLanguageBranch) {
                this._addLanguageIndicator();
            } else {
                this._removeLanguageIndicator();
            }

        },

        _isTypeOfRoot: function () {
            // summary:
            //      Verifies the current tree node item data object is type of root or not
            // returns: [Boolean]
            // tags:
            //      protected

            if (!this.tree.model || typeof this.tree.model.isTypeOfRoot !== "function") {
                return false;
            }

            return this.tree.model.isTypeOfRoot(this.item);
        }

    });

});
