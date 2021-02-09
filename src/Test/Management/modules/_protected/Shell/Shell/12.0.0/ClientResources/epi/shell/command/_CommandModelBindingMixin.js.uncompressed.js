define("epi/shell/command/_CommandModelBindingMixin", [
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/dom-class",
    "../widget/_ModelBindingMixin"
],
function (
    declare,
    domStyle,
    domClass,
    _ModelBindingMixin
) {

    return declare(_ModelBindingMixin, {
        // summary:
        //      A widget mixin for binding command properties to widget properties.
        //
        // tags:
        //      internal xproduct

        // viewModelBindingMap: [protected] Object
        //      Configuration of command property to widget property mappings.
        modelBindingMap: {
            label: ["label"],
            tooltip: ["tooltip"],
            iconClass: ["iconClass"],
            canExecute: ["canExecute"],
            isExecuting: ["isExecuting"],
            isAvailable: ["isAvailable"],
            active: ["checked", "isExpand"]
        },

        _setCanExecuteAttr: function (/*Boolean*/canExecute) {
            // summary:
            //      Sets the widget as enabled or disabled based on the value of canExecute
            // tags:
            //      private

            this.set("disabled", !canExecute);
        },

        _setIsAvailableAttr: function (/*Boolean*/isAvailable) {
            // summary:
            //      Sets the widget as visible or invisible based on the value of isAvailable
            // tags:
            //      private

            if (this.domNode) {
                domStyle.set(this.domNode, "display", isAvailable ? "" : "none");
            }
        },

        _setIsExecutingAttr: function (/*Boolean*/isExecuting) {
            // summary:
            //      Adds or removes a css class while the command is executing
            // tags:
            //      private

            this.isExecutingClass && domClass.toggle(this.domNode, this.isExecutingClass, isExecuting);
        },

        onClick: function () {
            // summary:
            //      Event raised when the button is clicked
            //
            // tags:
            //      public

            this.inherited(arguments);
            this.model && this.model.execute.apply(this.model, arguments);
        }
    });

});
