define("epi-cms/widget/MediaSelector", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/when",
    "epi-cms/widget/ContentSelector",
    "epi-cms/widget/SelectableMediaComponent"
], function (
    declare,
    on,
    when,
    ContentSelector,
    SelectableMediaComponent
) {

    return declare([ContentSelector], {
        // summary:
        //      Represents a widget to select Media files.
        // tags:
        //      internal

        // contentClass: [public] String
        //      The content class to be set on the epi-cms/widget/ContentSelectorDialog.
        contentClass: "epi-wrapped epi-mediaSelector",

        // dialogClass: [public] String
        //      The dialog class to be set on the epi-cms/widget/ContentSelectorDialog.
        dialogClass: null,

        createDialogContent: function () {
            // summary:
            //    Create custom dialog content with an instance of the custom SelectableMediaComponent
            // tags:
            //    protected

            var mediaComponent = new SelectableMediaComponent({
                repositoryKey: this.repositoryKey,
                allowedTypes: this.allowedTypes
            });

            this.own(
                on(mediaComponent, "data-changed", function (contentLink) {
                    this._setDialogButtonState(contentLink);
                }.bind(this))
            );

            return mediaComponent;
        },

        setInitialValue: function () {
            this.contentSelectorDialog.setInitialValue();
        }
    });
});
