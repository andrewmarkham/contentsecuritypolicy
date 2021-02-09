define("epi-cms/contentediting/FormEditing", [
    "dojo/_base/declare",
    "dojo/dom-class",

    "dijit/layout/ContentPane",

    "epi-cms/contentediting/_FormEditingMixin",
    "epi-cms/contentediting/_ValidationMixin",
    "epi-cms/contentediting/EditingBase"
],

function (
    declare,
    domClass,

    ContentPane,

    _FormEditingMixin,
    _ValidationMixin,
    EditingBase
) {
    return declare([EditingBase, _FormEditingMixin, _ValidationMixin], {
        // summary:
        //		Form editing controller.
        //
        // tags:
        //      internal xproduct

        // createOverlays: [Boolean]
        //      Indicate that the overlays should be created.
        createOverlays: false,

        // selectFormOnCreation: Boolean
        //      Indicate that the form should be set as selected child after being added to edit layout.
        selectFormOnCreation: true,

        placeForm: function (form) {
            // summary:
            //		Setup the edit form.
            // tags:
            //		protected

            form.set("transitionMode", "reveal");
            form.set("fitContainer", true);

            this.editLayoutContainer.addChild(form, 0);
        },

        removeForm: function (form) {
            // summary:
            //		Remove the edit form.
            // tags:
            //		protected

            // if leftover is already assigned, destroy it so we don't leak
            this.editLayoutContainer.leftOver && this._removeLeftOver();

            this.editLayoutContainer.leftOver = form;

            // HACK: Fix for SH7.1 RTM
            // Even though the iframe with overlay would become visible when OPE completely loaded, we need to make it visible a little bit earlier
            // because setting up overlays would fail on FF if the underneath iframe is invisible
            // This workaround is due to a timing problem that overlay is set up at the same time with form, and often finish before.
            // At the moment, it is difficult to have overlay setup to wait for form setup because EditingBase has no idea about form.
            // These things should be refactor after the RTM. (single edit view with mixins instead of OPE and FE).
            // Related work item: #95682
            domClass.replace(this.iframeWithOverlay.domNode, "dijitVisible", "dijitHidden");

            return false;
        },

        _reloadPropertyPreview: function () {
            // We do not want to reload the preview in forms mode
        }
    });
});
