define("epi/shell/widget/ComponentSelectorDialog", [
    "epi",
    "dojo/_base/declare",
    "dojo/dom-style",
    "dijit/Dialog",
    "epi/shell/widget/ComponentSelector",
    "epi/i18n!epi/shell/ui/nls/EPiServer.Shell.UI.Resources.ComponentSelection"],

function (epi, declare, domStyle, Dialog, ComponentSelector, res) {

    return declare([Dialog], {
        // summary:
        //    Shows the component selector dialog inside a dijit/Dialog.
        //
        // example:
        //    Create a new componentSelectorDialog instance.
        // |    var componentSelector = new epi/shell/widget/ComponentSelectorDialog({
        // |        autofocus: true // true|false,
        // |        size: {width: "650px", height: "380px"}
        // |    });
        // |    // Display the dialog.
        // |    componentSelector.show();
        //
        // tags:
        //    internal

        // _componentSelector: [private] epi/shell/widget/ComponentSelector
        //    Holds the componetSelector widget added to the dialog.
        _componentSelector: null,

        // autofocus: [public] Boolean
        //    A Toggle to modify the default focus behavior of a Dialog, which
        //    is to focus on the first dialog element after opening the dialog.
        autofocus: false,

        // size: [public] Object
        //    Sets the dialog's dimensions.
        size: { width: "650px", height: "" },

        // res: [private] Object
        //    Localization resources for the dialog.
        res: res,

        onComponentSelected: function () {
            // summary:
            //    Callback method to get notified when a component is selected
            //
            // tags:
            //    public callback
        },

        postMixInProperties: function () {
            this.inherited(arguments);
            this.buttonCancel = epi.resources.action.close;
        },

        postCreate: function () {
            // summary:
            //    Executed after the widget has been created. Sets the widget's title and size.
            //
            // tags:
            //    protected
            this.inherited(arguments);

            this.set("title", this.res.dialogtitle);
            domStyle.set(this.domNode, this.size);
        },

        show: function () {
            // summary:
            //    Show the component selector dialog
            //
            // tags:
            //    public
            this.inherited(arguments);

            this._ensureComponentSelectorCreated();
            this._componentSelector.show();
        },

        _ensureComponentSelectorCreated: function () {
            // summary:
            //    Creates the component selector and assigns it to this._componentSelector if it hasn't been created.
            //
            // tags:
            //    private
            if (this._componentSelector) {
                return;
            }

            // Prevent double parsing
            this._contentSetterParams = { parseContent: false };
            this._componentSelector = new ComponentSelector();
            this.own(this._componentSelector);

            this.set("content", this._componentSelector);
            this.connect(this._componentSelector, "onComponentSelected", this.onComponentSelected);
        }
    });
});
