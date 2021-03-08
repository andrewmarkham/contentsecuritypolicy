define([
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/when",

    "epi/dependency",
    "epi-cms/widget/_HierarchicalModelMixin",
    "epi-cms/contentediting/_ContextualContentContextMixin",
    "epi-cms/core/PermanentLinkHelper"
], function (
    declare,
    Deferred,
    when,

    dependency,
    _HierarchicalModelMixin,
    _ContextualContentContextMixin,
    PermanentLinkHelper
) {
    var HierarchicalModelClass = declare([_HierarchicalModelMixin, _ContextualContentContextMixin]);

    var createDefaultHierarchicalModel = function (store) {
        return new HierarchicalModelClass({ store: store });
    };

    function ContentService(hierarchicalModel, permanentLinkHelper, store) {
        // summary:
        //      A service for interacting with content in epi-addon-tinymce.
        // tags:
        //      internal
        this._store = store || dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
        this.hierarchicalModel = hierarchicalModel || createDefaultHierarchicalModel(this._store);
        this.permanentLinkHelper = permanentLinkHelper || PermanentLinkHelper;
    }

    function hasAccessRightsToContent(content) {
        if (content.hasOwnProperty("statusCode") && (content.statusCode === 401 || content.statusCode === 403)) {
            return false;
        }
        return true;
    }

    // hierarchicalModel: [readonly] Object
    //      A model that can get the ancestors of an content
    ContentService.prototype.hierarchicalModel = null;

    // permanentLinkHelper: [readonly] epi-cms/core/PermanentLinkHelper
    //      A permanent link helper to get an Episerver content from the url to an content.
    ContentService.prototype.permanentLinkHelper = null;

    ContentService.prototype.getContentFromUrl = function (url) {
        // summary:
        //      Gets content from the specified url.
        // tags:
        //      internal
        var deferred = new Deferred();

        when(this.permanentLinkHelper.getContent(url)).then(function (content) {
            return content ? deferred.resolve(content) : deferred.reject();
        });
        return deferred.promise;
    };

    ContentService.prototype.getPathToContent = function (content) {
        // summary:
        //      Resolves a path to the supplied content by looking up its ancestors and returning the first root.
        // tags:
        //      internal

        var deferred = new Deferred();

        try {
            this.hierarchicalModel.getAncestors(content, function (ancestors) {

                var filteredAncestors = [];
                for (var index = ancestors.length - 1; index >= 0; index--) {
                    if (!hasAccessRightsToContent(ancestors[index])) {
                        break;
                    }
                    filteredAncestors.unshift(ancestors[index]);
                    if (this.hierarchicalModel.isTypeOfRoot(ancestors[index])) {
                        break;
                    }
                }

                filteredAncestors.push(content);

                var ancestorNames = filteredAncestors.map(function (ancestor) {
                    return ancestor.name;
                });

                // If there are more than 4 ancestors replace the ones in the middle with ...
                if (ancestorNames.length > 4) {
                    ancestorNames = ancestorNames.slice(0, 2).concat("...", ancestorNames.slice(-2));
                }

                deferred.resolve(ancestorNames.join(" > "));
            }.bind(this));
        } catch (error) {
            deferred.reject(error);
        }

        return deferred.promise;
    };

    ContentService.prototype.getContent = function (contentLink) {
        // summary:
        //      Gets content from the specified contentLink.
        // tags:
        //      internal
        var deferred = new Deferred();

        when(this._store.get(contentLink)).then(function (content) {
            if (!hasAccessRightsToContent(content)) {
                return deferred.reject();
            }
            return content ? deferred.resolve(content) : deferred.reject();
        }).otherwise(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    return ContentService;
});
