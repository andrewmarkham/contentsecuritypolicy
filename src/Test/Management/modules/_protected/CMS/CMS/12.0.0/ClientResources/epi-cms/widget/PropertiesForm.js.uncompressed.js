define("epi-cms/widget/PropertiesForm", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/when",

    "dijit/layout/_LayoutWidget",

    "epi/shell/widget/FormContainer"
], function (
    array,
    declare,
    lang,

    when,

    _LayoutWidget,

    FormContainer) {


    return declare([_LayoutWidget], {
        // summary:
        //      Required properties form used in create content component
        // tags:
        //      internal

        // metadata: Object
        //      Metadata of the selected content type
        metadata: null,

        // showAllProperties: Boolean
        //      Indicate that the form should display all properties
        showAllProperties: false,

        // propertyFiter: Function
        //      Filter used to show/hide properties displayed in the form
        propertyFilter: null,

        _setMetadataAttr: function (value) {
            this._set("metadata", value);

            // Break the long event handlers chain to make IE more responsive.
            setTimeout(lang.hitch(this, function () {
                this._setupForm();
            }), 0);
        },

        _setupForm: function () {
            // summary:
            //		Setup form container after the widget is created.
            // tags:
            //		private

            if (this._form) {
                this._form.destroy();
            }

            this._form = new FormContainer({
                metadata: this.metadata,
                doLayout: false,
                propertyFilter: lang.hitch(this, this.propertyFilter)
            });

            this.connect(this._form, "onFieldCreated", function (fieldName, widget) {
                this.own(widget.watch("state", lang.hitch(this, function (name, oldValue, value) {
                    if (oldValue === "Error" && value !== "Error") {
                        this.onPropertyValidStateChange(fieldName);
                    } else if (oldValue !== "Error" && value === "Error") {
                        this.onPropertyValidStateChange(fieldName, widget.getErrorMessage());
                    }
                })));
            });

            this._form.placeAt(this.domNode);
            // Since the same document is used and saves the scrollposition,
            // we make sure to reset scrollposition so the editor gets to start from the top.
            this.domNode.scrollTop = 0;
            this.own(this._form);
        },

        validate: function () {
            // summary:
            //		Validate the properties.
            // tags:
            //		public

            return this._form.validate();
        },

        onPropertyValidStateChange: function (propertyName, errorMessage) {
            // summary:
            //      Fired when a property become invalid or is valid again.
            // propertyName: String
            //      The property name
            // errorMessage: String
            //      The error message if any.
            // tags:
            //      public, callback
        },

        _getValueAttr: function () {
            // summary:
            //		Get properties form value.
            // tags:
            //		protected

            return this._form.get("value");
        }
    });
});
