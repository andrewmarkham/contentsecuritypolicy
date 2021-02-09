define("epi/shell/StickyViewSelector", [
    "epi/dependency",
    "dojo/Deferred",
    "dojo/when",
    "epi/shell/TypeDescriptorManager"
], function (
    dependency,
    Deferred,
    when,
    TypeDescriptorManager) {

    var savedViewKey = "_savedView";
    var isEnabled = false;

    function StickyViewSelector(profile, typeDescriptorManager) {
        // summary:
        //      Manages the sticky view setting in the profile.
        // tags:
        //      internal xproduct

        this._profile = profile || dependency.resolve("epi.shell.Profile");
        this._typeDescriptorManager = typeDescriptorManager || TypeDescriptorManager;
    }

    StickyViewSelector.prototype.get = function (hasTemplate, dataType) {
        // summary:
        //      Gets the saved view name from user profile.
        // tags:
        //      public

        if (!isEnabled) {
            return null;
        }

        var def = new Deferred();
        when(this._profile.get(savedViewKey))
            .then(function (viewName) {
                if (!viewName) {
                    def.resolve(null);
                    return;
                }

                if (!this._isViewAvailable(hasTemplate, dataType, viewName)) {
                    def.resolve(null);
                    return;
                }

                def.resolve(viewName);
            }.bind(this));
        return def.promise;
    };

    StickyViewSelector.prototype.save = function (hasTemplate, dataType, viewName) {
        // summary:
        //      Saves the selected view in the user profile.
        // tags:
        //      public

        if (!isEnabled) {
            return null;
        }

        if (!this._isViewAvailable(hasTemplate, dataType, viewName)) {
            return null;
        }

        return this._profile.set(savedViewKey, viewName);
    };

    StickyViewSelector.prototype._isViewAvailable = function (hasTemplate, dataType, viewName) {
        if (viewName === "onpageedit" && !hasTemplate) {
            return false;
        }

        var enableStickyView = this._typeDescriptorManager.getValue(dataType, "enableStickyView");
        if (!enableStickyView) {
            return false;
        }

        var availableViews = this._getAvailableViews(dataType);
        if (availableViews.indexOf(viewName) === -1) {
            return false;
        }

        return true;
    };

    StickyViewSelector.prototype._getAvailableViews = function (dataType) {
        var availableViews = this._typeDescriptorManager.getAndConcatenateValues(dataType, "availableViews");

        if (!availableViews || availableViews.length === 0) {
            return [];
        }

        var disabledViews = this._typeDescriptorManager.getValue(dataType, "disabledViews");

        var filteredViews;
        if (disabledViews) {
            filteredViews = availableViews.filter(function (availableView) {
                return disabledViews.every(function (disabledView) {
                    return availableView.key !== disabledView;
                });
            });
        } else {
            filteredViews = availableViews;
        }

        return filteredViews.map(function (v) {
            return v.key;
        });
    };

    StickyViewSelector.enable = function () {
        // summary:
        //      Enables the component, it will save and load sticky views
        // tags:
        //      public

        isEnabled = true;
    };

    StickyViewSelector.disable = function () {
        // summary:
        //      Enables the component, it will save and load sticky views
        // tags:
        //      public

        isEnabled = false;
    };

    return StickyViewSelector;
});
