define("epi/shell/widget/CheckBox", [
    "dojo/_base/declare",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/CheckBox"],

function (declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //    Checkbox widget which presents 2 states values.
        //
        // description:
        //   Works with single boolean value instead of array like HTML or dijit Checkbox.
        //
        // tags:
        //    public

        // templateString: [protected] String
        //    Widget's template string.
        templateString: "<div class=\"dijit dijitReset dijitInline\"><input data-dojo-type=\"dijit/form/CheckBox\" data-dojo-attach-point=\"checkbox\" data-dojo-attach-event=\"onChange: _onChange\"></div>",

        // value: [public] String
        //    The widget's value.
        value: null,

        _setValueAttr: function (value) {
            //summary:
            //    Value's setter.
            //
            // value: String
            //    Value to be set.
            //
            // tags:
            //    protected

            this.value = value;
            this.checkbox.set("checked", !!value);
        },

        _setReadOnlyAttr: function (readOnly) {
            this.checkbox.set("readOnly", readOnly);
        },

        _getReadOnlyAttr: function () {
            return this.checkbox.set("readOnly");
        },

        _getValueAttr: function () {
            //summary:
            //    Value's getter
            // tags:
            //    protected

            return this.checkbox.get("checked");
        },

        _onChange: function (value) {
            // summary:
            //    Handle the inner widgets change event.
            //
            // tags:
            //    private

            this.value = value;
            this.onChange(value);
        },

        onChange: function (value) {
            // summary:
            //    Fired when value is changed.
            //
            // pageId:
            //    The page's id
            // tags:
            //    public, callback
        },

        focus: function () {
            //summary:
            //    Focus on the wrapped checkbox.
            // tags:
            //    protected

            this.checkbox.focus();
        }
    });
});
