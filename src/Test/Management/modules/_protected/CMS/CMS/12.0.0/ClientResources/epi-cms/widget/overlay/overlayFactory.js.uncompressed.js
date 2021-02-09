define("epi-cms/widget/overlay/overlayFactory", [
// Dojo
    "dojo/_base/lang",
    "dojo/_base/Deferred",

    "epi-cms/widget/overlay/Property"
], function (
// Dojo
    lang,
    Deferred
) {
    return {
        // tags:
        //      internal

        defaultType: "epi-cms/widget/overlay/Property",

        create: function (editableNode) {
            var createOverlayDeferred = new Deferred();
            var customType = editableNode.property.metadata.overlaySettings && editableNode.property.metadata.overlaySettings.customType;

            var property = editableNode.property,
                overlayType = customType || this.defaultType,
                allowedTypeAttribute = {},
                metadata = property.metadata && property.metadata.settings || {};
            allowedTypeAttribute.allowedTypes = metadata.allowedTypes || [];
            allowedTypeAttribute.restrictedTypes = metadata.restrictedTypes || [];

            require([overlayType], lang.hitch(this, function (overlayClass) {
                var settings = lang.mixin(
                    {
                        name: property.name,
                        description: lang.getObject("settings.tooltip", false, property.metadata),
                        contentModel: property.contentModel,
                        displayName: property.metadata.displayName,
                        disabled: editableNode.disabled,
                        sourceItemNode: editableNode.node
                    },
                    property.overlayParams,
                    allowedTypeAttribute);

                var overlay = new overlayClass(settings);
                createOverlayDeferred.resolve(overlay);
            }));

            return createOverlayDeferred;
        },

        createByDimensions: function (overlayArgs) {
            // TODO: Support custom overlay types, e.g. content area.
            overlayArgs.property.metadata.overlaySettings.customType = this.defaultType;
            return this.create(overlayArgs).then(function (overlay) {
                overlay.updatePosition(overlayArgs.node);
                return overlay;
            });
        }
    };
});
