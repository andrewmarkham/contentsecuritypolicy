define("epi-cms/compare/viewmodels/AllPropertiesCompareViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/when",
    "epi",
    "epi/dependency",
    "epi/string",
    "epi-cms/core/ContentReference",
    // Parent class and mixins
    "dojo/Stateful",
    "dijit/Destroyable"
], function (
    declare,
    lang,
    aspect,
    when,
    epi,
    dependency,
    string,
    ContentReference,
    // Parent class and mixins
    Stateful,
    Destroyable
) {

    return declare([Stateful, Destroyable], {
        // summary:
        //      The view model for the all properties compare view.
        // tags:
        //      internal

        _metadataManager: null,

        // contentViewModel: [public] Object
        //      The view model for the current content.
        contentViewModel: null,

        // leftMetadata: [readonly] Object
        //      The metadata for the left hand version.
        leftMetadata: null,

        leftPropertyMap: null,

        // rightMetadata: [readonly] Object
        //      The metadata for the right hand version.
        rightMetadata: null,

        rightPropertyMap: null,

        postscript: function () {
            // summary:
            //      Setup mixed in properties
            // tags:
            //      protected
            this.inherited(arguments);

            this._metadataManager = this._metadataManager || dependency.resolve("epi.shell.MetadataManager");

            this.initialize();
        },

        initialize: function () {

            var updateMetadata = lang.hitch(this, function (name, oldValue, newValue) {
                var version = this.model.rightVersion;

                // If set to null or no change do an early exit
                if (!version || (oldValue === newValue)) {
                    return;
                }

                when(this._metadataManager.getMetadataForType(
                    "EPiServer.Core.ContentData",
                    { contentLink: version.contentLink }
                ), lang.hitch(this, function (metadata) {
                    this.set("rightMetadata", metadata);
                }));
            });

            updateMetadata("rightVersionContentLink", null,  this.model.rightVersionContentLink);
            this.own(
                this.model.watch("rightVersionContentLink", updateMetadata),
                this.model.watch("contentLink", lang.hitch(this, function (name, oldContentLink, contentLink) {
                    // Reset the left and right metadata to null when changing to a different
                    // content so that we do not generate any erroneous comparisons.
                    if (!ContentReference.compareIgnoreVersion(oldContentLink, contentLink)) {
                        this.set({
                            leftMetadata: null,
                            leftPropertyMap: null,
                            rightMetadata: null,
                            rightPropertyMap: null
                        });
                    }
                }))
            );
        },

        generateComparison: function () {
            // summary:
            //      Generate a new comparison based on the left and right metadata.
            // tags:
            //      internal
            var comparison = {},
                metadata = this.rightMetadata;

            if (!this.leftPropertyMap || !this.rightPropertyMap) {
                this.set("comparison", null);
                return;
            }

            // Create arrays for each group
            metadata.groups.forEach(function (group) {
                comparison[group.name.toLowerCase()] = [];
            });

            // Find all the properties that are different between to two versions.
            metadata.properties.forEach(lang.hitch(this, function (propertyMetadata) {
                this._addPropertyToComparison(comparison, propertyMetadata, propertyMetadata.groupName);
            }));

            this.set("comparison", comparison);
        },

        copy: function (propertyName) {
            // summary:
            //      Copy the old property value
            // propertyName: String
            //      The name of the property to copy from

            if (!propertyName) {
                throw new Error("propertyName is required");
            }

            var contentViewModel = this.contentViewModel,
                oldValue = lang.getObject(propertyName, false, this.rightPropertyMap);

            if (contentViewModel && oldValue !== undefined) {
                contentViewModel.setProperty(propertyName, lang.clone(oldValue));
                contentViewModel.save();
            }
        },

        _addPropertyToComparison: function (comparison, property, groupName, prefix) {
            // summary:
            //      Recursively add properties to the comparison. Sub-properties will have their
            //      name appended to the prefix and have their group overridden by that given.
            // tags:
            //      internal
            var propertyName = string.pascalToCamel((prefix || "") + property.name),
                leftValue = lang.getObject(propertyName, false, this.leftPropertyMap),
                rightValue = lang.getObject(propertyName, false, this.rightPropertyMap);

            if (property.showForEdit && !epi.areEqual(leftValue, rightValue, epi.compareOptions.treatFalsyAsEquals |  epi.compareOptions.skipEmptyProperties)) {
                // If the property is an inline block and has sub properties then we should compare
                // the sub properties instead.
                if (property.properties.length) {
                    property.properties.forEach(lang.hitch(this, function (subproperty) {
                        this._addPropertyToComparison(comparison, subproperty, groupName, propertyName + ".");
                    }));
                } else {
                    // If it is not an inline block then add the property to the comparison.
                    comparison[groupName.toLowerCase()].push(propertyName.toLowerCase());
                }
            }
        },

        _contentViewModelSetter: function (viewModel) {
            this.contentViewModel = viewModel;

            this.set({
                leftMetadata: viewModel.metadata,
                leftPropertyMap: viewModel.contentData.properties
            });

            this.own(
                viewModel.watch("contentData", lang.hitch(this, function (name, oldContentData, contentData) {
                    this.set("leftPropertyMap", contentData.properties);
                })),
                aspect.after(viewModel, "onPropertySaved", lang.hitch(this, "_onPropertySaved"), true)
            );
        },

        _leftPropertyMapSetter: function (properties) {
            this.leftPropertyMap = lang.clone(properties);
            this.generateComparison();
        },

        _rightPropertyMapSetter: function (properties) {
            this.rightPropertyMap = lang.clone(properties);
            this.generateComparison();
        },

        _rightMetadataSetter: function (metadata) {
            this.rightMetadata = metadata;

            if (this.rightMetadata) {
                when(this.model.contentDataStore.get(this.model.rightVersion.contentLink))
                    .then(lang.hitch(this, function (contentData) {
                        this.set("rightPropertyMap", contentData.properties);
                    }));
            }
        },

        _onPropertySaved: function (propertyName, value) {
            var comparison = this.comparison;

            if (this.leftPropertyMap) {
                lang.setObject(propertyName, value, this.leftPropertyMap);
            }

            // Early exit if there is no comparison generated.
            if (!comparison) {
                return;
            }

            var parentMetadata = this.rightMetadata.getPropertyMetadata(propertyName.split(".")[0]),
                propertyMetadata = this.rightMetadata.getPropertyMetadata(propertyName),
                oldValue = this.rightPropertyMap && lang.getObject(propertyName, false, this.rightPropertyMap);

            // Early exit if this property should not displayed in edit mode.
            if (!propertyMetadata.showForEdit) {
                return;
            }

            var group = comparison[parentMetadata.groupName.toLowerCase()],
                name = propertyName.toLowerCase(),
                index = group.indexOf(name),
                areEqual = epi.areEqual(value, oldValue, epi.compareOptions.treatFalsyAsEquals |  epi.compareOptions.skipEmptyProperties);

            if (index >= 0 && areEqual) {
                group.splice(index, 1);
            } else if (index < 0 && !areEqual) {
                group.splice(0, 0, name);
            }

            this.set("comparison", comparison);
        }
    });
});
