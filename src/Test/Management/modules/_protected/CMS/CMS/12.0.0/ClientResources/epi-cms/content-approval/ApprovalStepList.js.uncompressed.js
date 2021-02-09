require({cache:{
'url:epi-cms/content-approval/templates/ApprovalStepList.html':"<div class=\"epi-approval-step-list\">\r\n    <div class=\"epi-approval-step-list__status\">\r\n        <span class=\"epi-approval-step-list__status-icon epi-approval-step-list__status-icon--review\"></span><h2 class=\"dijitInline\">${resources.readytoreview}</h2>\r\n    </div>\r\n    <div data-dojo-attach-point=\"listNode\"></div>\r\n\r\n    <div class=\"epi-approval-step-list__status\">\r\n        <span class=\"epi-approval-step-list__status-icon epi-approval-step-list__status-icon--publish\"></span><h2 class=\"dijitInline\">${resources.readytopublish}</h2>\r\n    </div>\r\n</div>\r\n"}});
define("epi-cms/content-approval/ApprovalStepList", [
    "dojo/_base/declare",
    "dojo/keys",
    "epi-cms/content-approval/ApprovalStep",
    // Parent class and mixins
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "epi/shell/widget/_ModelBindingMixin",
    // List modules
    "dgrid/List",
    "dgrid/Keyboard",
    "dgrid/extensions/DijitRegistry",
    "dgrid/extensions/DnD",
    "epi/shell/dgrid/SingleQuery",
    "epi/shell/dgrid/WidgetRow",
    // Resources
    "dojo/text!./templates/ApprovalStepList.html",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.steplist"
], function (
    declare,
    keys,
    ApprovalStep,
    // Parent class and mixins
    _WidgetBase,
    _TemplatedMixin,
    _ModelBindingMixin,
    // List modules
    List,
    Keyboard,
    DijitRegistry,
    DnD,
    SingleQuery,
    WidgetRow,
    // Resources
    template,
    localization
) {

    var StepList = declare([List, SingleQuery, DnD, Keyboard, DijitRegistry, WidgetRow]);

    return declare([_WidgetBase, _TemplatedMixin, _ModelBindingMixin], {
        // summary:
        //      The view for the content approval component; responsible for creating the content
        //      approval view model and creating child view components.
        // tags:
        //      internal

        // model: [public] ContentApprovalViewModel
        //      The model containing the approval steps to be listed.
        model: null,

        // modelBindingMap: Object
        //      The binding mappings from model properties to local properties.
        modelBindingMap: {
            approvalSteps: ["approvalSteps"]
        },

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // resources: [protected] Object
        //      An object containing resource strings in the current language.
        resources: localization,

        buildRendering: function () {
            // summary:
            //      Build the approval component rendering from the template and then create buttons
            //      for the commands.
            // tags:
            //      protected

            this.inherited(arguments);

            this.list = new StepList({
                className: "epi-chromeless",
                dndParams: { withHandles: true, creator: this._createAvatar.bind(this), skipForm: true },
                maintainOddEven: false,
                renderRow: this._renderRow.bind(this),
                selectionMode: "single",
                //Added sort because without sort you get console logs
                sort: "default"
            }, this.listNode);

            this.own(
                this.list.addKeyHandler(keys.DELETE, this._removeStep.bind(this)),
                this.list.addKeyHandler(keys.DOWN_ARROW, this._moveStep.bind(this, false)),
                this.list.addKeyHandler(keys.UP_ARROW, this._moveStep.bind(this, true)),
                this.list.on(".dgrid-row:keypress", this._createStep.bind(this))
            );
        },

        startup: function () {
            // summary:
            //      Processing after the DOM fragment is added to the document.
            // tags:
            //      protected

            this.inherited(arguments);

            this.list.startup();
        },

        _createAvatar: function (item) {
            // summary:
            //      Create an avatar for the approval step. Do this by creating a new widget based
            //      on the same model, since the default behavior of Avatar is to clone the existing
            //      widget which causes the inner list ids to be duplicated and this leads to errors
            //      when trying to remove rows.
            // tags:
            //      private

            // Create a new approval step based on the same model as the one being moved.
            var step = new ApprovalStep({ model: item });
            step.startup();

            // Clone the node so that we have a copy that is not bound to a widget and can be
            // removed later.
            var node = step.domNode.cloneNode(true);

            // Destroy the widget to ensure we don't leak memory.
            step.destroyRecursive();

            return {
                node: node,
                type: this.list.dndSourceType,
                data: item
            };
        },

        _createStep: function (event) {
            // summary:
            //      Create a step after the step associated with the event.
            // tags:
            //      private

            if (!event.ctrlKey && String.fromCharCode(event.which) === "+") {
                var row = this.list.row(event);
                this.model.createApprovalStep(row.data);
            }
        },

        _moveStep: function (moveUp, event) {
            // summary:
            //      Move the step associated with the event up or down.
            // tags:
            //      private

            if (event.ctrlKey) {
                var row = this.list.row(event);

                this.list.focus(row);
                this.model.moveApprovalStep(row.data, moveUp);
            }
        },

        _removeStep: function (event) {
            // summary:
            //      Remove the step associated with the event.
            // tags:
            //      private

            var row = this.list.row(event);

            this.model.removeApprovalStep(row.data);
        },

        _renderRow: function (viewModel) {
            // summary:
            //      Renders an approval step widget for the row and returns its DOM node.
            // tags:
            //      private

            var languageOptions = this.model.get("languageOptions");

            var step = new ApprovalStep({
                model: viewModel,
                languageOptions: languageOptions
            });

            return step.domNode;
        },

        _setApprovalStepsAttr: function (approvalSteps) {
            this._set("approvalSteps", approvalSteps);
            this.list.set("store", approvalSteps);
        }
    });
});
