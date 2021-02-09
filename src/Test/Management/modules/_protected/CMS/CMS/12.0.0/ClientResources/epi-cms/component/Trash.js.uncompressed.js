define("epi-cms/component/Trash", [
// dojo
    "dojo/_base/declare",
    "dojo/dom-construct",
    // dijit
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    // epi
    "epi/shell/widget/_FocusableMixin",
    "epi-cms/widget/Trash",
    "epi-cms/widget/viewmodel/TrashViewModel"
], function (
// dojo
    declare,
    domConstruct,
    // dijit
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    // epi
    _FocusableMixin,
    Trash,
    TrashViewModel
) {

    // Declare "epi-cms/component/Trash" in order to tell WidgetSwitcher create only one instance of this.
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _FocusableMixin], {
        // summary:
        //      A component to display trash page.
        //
        // tags:
        //      internal

        templateString: "<div class=\"epi-trashComponent\"><div data-dojo-type='epi-cms/widget/Trash' data-dojo-attach-point='trash'></div></div>",

        updateView: function (data) {
            // summary:
            //		This will be invoked by WidgetSwitcher when displaying Trash component.
            //      Implement this to refresh the model, to refresh data.
            // tags:
            //		public
            if (data) {
                this.trash.set("typeIdentifiers", data.typeIdentifiers);
            }

            if (this._trashModel) {
                this._trashModel.destroy();
            }

            this.trash.set("model", this._trashModel = new TrashViewModel());
        },

        destroy: function () {
            this._trashModel.destroy();

            this.inherited(arguments);
        }
    });
});
