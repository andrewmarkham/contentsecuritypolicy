define("epi-cms/widget/LinkEditor", [
//dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-class",
    //dijit
    "dijit/_CssStateMixin",
    //epi
    "epi",
    "epi/dependency",
    "epi/shell/widget/dialog/_DialogContentMixin",
    "epi/shell/widget/FormContainer",
    "epi/shell/widget/_ActionProviderWidget",
    "epi/shell/widget/_ModelBindingMixin",
    // EPi CMS
    "epi-cms/widget/viewmodel/LinkEditorViewModel",
    "epi-cms/widget/HyperLinkSelector"
],
function (
//dojo
    array,
    declare,
    lang,
    domStyle,
    domClass,
    //dijit
    _CssStateMixin,
    //epi
    epi,
    dependency,
    _DialogContentMixin,
    FormContainer,
    _ActionProviderWidget,
    _ModelBindingMixin,
    // EPi CMS
    LinkEditorViewModel,
    HyperLinkSelector
) {
    return declare([FormContainer, _ActionProviderWidget, _DialogContentMixin, _CssStateMixin, _ModelBindingMixin], {
        // summary:
        //    The dialog to insert or edit a link item.
        // tags:
        //    public

        _metadataManager: null,

        // modelClassName: [public] Class
        //      Represents the model class name that will be used for this widget.
        modelClassName: LinkEditorViewModel,

        // hiddenFields: Array
        //      The list of fields will be hidden from editing.
        hiddenFields: [],

        postMixInProperties: function () {
            // summary:
            //		Initialize properties
            // tags:
            //    protected
            this.inherited(arguments);

            this.doLayout = false;

            this._metadataManager = this._metadataManager || dependency.resolve("epi.shell.MetadataManager");

            if (!this.model && this.modelClassName) {
                var modelClass = declare(this.modelClassName);
                this.model = new modelClass();
            }

            this._actions = [
                {
                    name: "ok",
                    label: epi.resources.action.ok,
                    settings: { type: "button", "class": "Salt" },
                    action: lang.hitch(this, function () {
                        if (this.validate()) {
                            this.executeDialog({ action: "ok" });
                        }
                    })
                },
                {
                    name: "delete",
                    label: epi.resources.action.deletelabel,
                    settings: { type: "button", disabled: true }, // Default disable Delete button until the value is valid
                    action: lang.hitch(this, function () {
                        // if we return the null object, FormContainer will ignore of setting its value.
                        // So we need to return the object with empty properties, in order to clear data.
                        array.forEach(this.form._getDescendantFormWidgets(), function (widget) {
                            widget.set("value", "");
                        }, this);
                        this.executeDialog({ action: "delete" });
                    })
                },
                {
                    name: "cancel",
                    label: epi.resources.action.cancel,
                    settings: { type: "button" },
                    action: lang.hitch(this, function () {
                        this.cancelDialog();
                    })
                }
            ];
        },

        postCreate: function () {
            if (this.modelType) {
                this.metadata = this._metadataManager.getMetadataForType(this.modelType);
            }

            this.inherited(arguments);
        },

        _setValueAttr: function (value) {
            // summary:
            //    Set selected href.
            // tags:
            //    private
            this.inherited(arguments);
            this._handleActions(value);
        },

        onFormCreated: function (widget) {
            array.forEach(this.form._getDescendantFormWidgets(), function (widget) {

                if (this.hiddenFields && this.hiddenFields.indexOf(widget.name) > -1) {
                    var parent = this._getAncestorNode(widget.domNode, "epi-form-container__section__row");
                    domStyle.set(parent, { display: "none" });
                    widget.set("required", false); // disable required validation for hidden field
                }
            }, this);

            // Set state of delete button when form created
            this._handleActions(this.value);
        },

        _handleActions: function (value) {
            if (this.hasAction("delete")) {
                this.setActionProperty("delete", "disabled", this.model._isEmptyObject(value));
            }
        },

        getFormWidget: function (widgetName) {
            // Summary
            //      Gets form widget by name.
            // widgetName: String
            //      Name of the form widget to get.
            // tag
            //      Public

            var widgets = array.filter(this.form._getDescendantFormWidgets(), function (widget) {
                return widget && widget.name === widgetName;
            }, this);

            return widgets ? widgets[0] : null;
        },

        _getAncestorNode: function (node, classAttr) {
            // Summary
            //      Get ancestor node which has class classAttr
            // node: DomNode
            //      The domNode which need to get ancestor.
            // classAttr: String
            //      The class attribute.
            // tag
            //      Private

            var parentNode = node ? node.parentNode : null;
            if (!parentNode) {
                return null;
            }

            if (!domClass.contains(parentNode, classAttr)) {
                return this._getAncestorNode(parentNode, classAttr);
            }

            return parentNode;
        },

        getActions: function () {
            // summary:
            //      Overridden from _ActionProvider to get the select current content action added to the containing widget
            //
            // returns:
            //      An array containing a select page action definition, if it is not a shared block
            return this._actions;
        },


        isValidValue: function () {
            // Summary
            //      Indicator that value of widgets which set required are valid
            // tag
            //      Public
            return array.every(this.form._getDescendantFormWidgets(), function (widget) {
                return widget.get("required") ? !!widget.get("value") : true;
            });
        }
    });
});
