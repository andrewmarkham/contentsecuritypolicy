define("epi-cms/compare/viewmodels/CompareViewModel", [
    "dojo/_base/declare",
    "dojo/aspect",
    "dojo/topic",
    "dojo/_base/lang",
    "dojo/Stateful",
    "dojo/when",
    "epi/shell/DestroyableByKey",
    "epi/dependency",
    "epi-cms/core/ContentReference",
    "epi-cms/compare/viewmodels/CompareToolbarViewModel"
], function (
    declare,
    aspect,
    topic,
    lang,
    Stateful,
    when,
    DestroyableByKey,
    dependency,
    ContentReference,
    CompareToolbarViewmodel
) {
    return declare([Stateful, DestroyableByKey], {
        // summary:
        //      View model for the compare views.
        //
        // tags:
        //      internal

        // contentLink: [public] String
        //      The content link of the content to be compared.
        contentLink: null,

        // languages: [public] Array
        //      An array of languages supported by the current content. An empty array or null indicates
        //      that the current content does not support localization.
        languages: null,

        // typeIdentifier: [public] String
        //      The type identifier for the content to be compared
        typeIdentifier: null,

        // leftVersion: [public] Object
        //      The version data for the version appearing in the left compare panel.
        leftVersion: null,

        // rightVersion: [public] Object
        //      The version data for the version appearing in the right compare panel.
        rightVersion: null,

        // leftVersionUri: String
        //      Uri of the left version. The left version is context bound, so we need to use URI.
        leftVersionUri: null,

        // rightVersionUrl: String
        //      Preview url of the right version. The right version is not context bound, so we handle preview URL directly.
        rightVersionUrl: null,

        // hasAccess: [public] Boolean
        //      A flag which indicates whether the current user has access to view versions.
        hasAccess: true,

        // contentDataStore: [readonly] epi/shell/RestStore
        //      The content data store
        contentDataStore: null,

        // contentVersionStore: [readonly] epi/shell/RestStore
        //      The content version store
        contentVersionStore: null,

        // orientation: [public] String
        //      Orientation of the split panels
        orientation: "vertical",

        compareToolbarViewModel: null,

        _rightVersionDeferred: null,

        postscript: function () {
            // summary:
            //      Setup mixed in properties
            // tags:
            //      protected
            this.inherited(arguments);
            this.contentDataStore = this.contentDataStore || dependency.resolve("epi.storeregistry").get("epi.cms.contentdata");
            this.contentVersionStore = this.contentVersionStore || dependency.resolve("epi.storeregistry").get("epi.cms.contentversion");


            this._setupCompareToolbarViewModel();

            // When a publish occurs we need to refresh the left and rightversion to get the new text to display
            this.own(
                topic.subscribe("/epi/cms/content/statuschange/", lang.hitch(this, "_refresh"))
            );
        },

        _refresh: function () {
            // summary:
            //      Refreshes the left and right versions with the latest data from the server
            // tags:
            //      private

            var store = this.contentVersionStore;

            when(store.refresh(this.leftVersion.contentLink), lang.hitch(this, function (version) {
                this.set("leftVersion", version);
            }));

            if (this.rightVersion) {
                when(store.refresh(this.rightVersion.contentLink), lang.hitch(this, function (version) {
                    this.set("rightVersion", version);
                }));
            }
        },

        _contentLinkSetter: function (contentLink) {
            this.contentLink = contentLink;

            var store = this.contentVersionStore;

            if (this._rightVersionDeferred && !this._rightVersionDeferred.isFulfilled()) {
                this._rightVersionDeferred.cancel();
            }

            when(store.get(contentLink), lang.hitch(this, function (version) {
                this.set("leftVersion", version);

                if (!this.rightVersion || !ContentReference.compareIgnoreVersion(this.leftVersion.contentLink, this.rightVersion.contentLink)) {
                    var queryParams = {
                        contentLink: contentLink,
                        language: this.leftVersion.language,
                        query: "getcompareversion"
                    };

                    this._rightVersionDeferred = store.query(queryParams);

                    when(this._rightVersionDeferred, lang.hitch(this, function (versions) {
                        this.set("hasAccess", true);
                        this.set("rightVersion", versions && versions.length ? versions[0] : null);
                    }), lang.hitch(this, function (error) {
                        this.set("hasAccess", error.status !== 403);
                        this.set("rightVersion", null);
                    }));
                }
            }));
        },

        _leftVersionSetter: function (version) {
            // summary:
            //      Sets the version data for the left compare panel.
            // tags:
            //      protected
            this.leftVersion = version;

            if (this.compareToolbarViewModel) {
                if (this.compareToolbarViewModel.leftVersion !== version) {
                    this.compareToolbarViewModel.set("leftVersion", version);
                }
            }

            this.set("leftVersionUri", version.uri);
        },

        _rightVersionSetter: function (version) {
            // summary:
            //      Sets the version data for the right compare panel.
            // tags:
            //      protected

            var ownKey = "removeAfter";
            this.rightVersion = version;

            this.destroyByKey(ownKey);
            if (version) {
                this.ownByKey(ownKey, aspect.after(this.contentVersionStore, "remove", lang.hitch(this, function (contentLink) {
                    if (version.contentLink === contentLink) {
                        // When the version shown in the right panel is deleted; reset.
                        this.set("rightVersion", null);
                    }
                }), true));
            }

            if (this.compareToolbarViewModel) {
                if (this.compareToolbarViewModel.rightVersion !== version) {
                    this.compareToolbarViewModel.set("rightVersion", version);
                }
            }

            // If the version is null then set the rightVersionUrl to null and do an early exit.
            if (version === null) {
                this.set("rightVersionUrl", "about:blank");
                this.set("rightVersionContentLink", null);
                return;
            }

            // Update the URL for the right panel when the version changes.
            when(this.contentDataStore.get(version.contentLink), lang.hitch(this, function (content) {
                // When the versions are being set and both left and right versions are the same it is
                // because the document content has been updated, in order to force a reload in this case
                // we first clear the right pane, since the original url is identical
                if (this.leftVersion === this.rightVersion) {
                    this.set("rightVersionUrl", "about:blank");
                }
                this.set("rightVersionUrl", content.editablePreviewUrl);
                this.set("rightVersionContentLink", content.contentLink);
            }));
        },

        _typeIdentifierSetter: function (typeIdentifier) {
            // summary:
            //      Sets the curremt content's type identifier.

            this.typeIdentifier = typeIdentifier;

            if (this.compareToolbarViewModel) {
                this.compareToolbarViewModel.set("typeIdentifier", typeIdentifier);
            }
        },

        _languagesSetter: function (languages) {
            // summary:
            //      Sets the languages available for the current content.

            this.languages = languages;

            if (this.compareToolbarViewModel) {
                this.compareToolbarViewModel.set("languages", languages);
            }
        },

        _hasAccessSetter: function (hasAccess) {
            // summary:
            //      Sets the hasAccess flag.

            this.hasAccess = hasAccess;

            if (this.compareToolbarViewModel) {
                this.compareToolbarViewModel.set("hasAccess", hasAccess);
            }
        },

        _setupCompareToolbarViewModel: function () {
            // summary:
            //      Setup the view model for the compare toolbar which is a child view.
            // tags:
            //      private

            this.compareToolbarViewModel = this.compareToolbarViewModel || new CompareToolbarViewmodel({
                contentVersionStore: this.contentVersionStore,
                leftVersion: this.leftVersion,
                rightVersion: this.rightVersion,
                typeIdentifier: this.typeIdentifier,
                hasAccess: this.hasAccess,
                languages: this.languages
            });

            this.own(this.compareToolbarViewModel.watch("leftVersion", lang.hitch(this, function (propertyName, oldValue, newValue) {
                if (this.leftVersion !== newValue) {
                    this.set("leftVersion", newValue);
                }
            })));

            this.own(this.compareToolbarViewModel.watch("rightVersion", lang.hitch(this, function (propertyName, oldValue, newValue) {
                if (this.rightVersion !== newValue) {
                    this.set("rightVersion", newValue);
                }
            })));
        }
    });
});
