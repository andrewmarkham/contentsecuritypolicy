require({cache:{
'url:epi/shell/form/templates/Field.html':"<li class=\"epi-form-container__section__row epi-form-container__section__row--field\">\r\n    <label data-dojo-attach-point=\"labelNode\">\r\n        <span class=\"dijitInline dijitReset dijitIcon epi-iconPenDisabled\" data-dojo-attach-point=\"readonlyIcon\"></span>\r\n    </label>\r\n</li>"}});
define("epi/shell/form/Field", [
    "dojo/_base/declare",

    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",

    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/_Contained",
    "dijit/_TemplatedMixin",

    "./formFieldRegistry",

    "dojo/text!./templates/Field.html"
], function (
    declare,

    domClass,
    domConstruct,
    domStyle,

    _WidgetBase,
    _Container,
    _Contained,
    _TemplatedMixin,

    formFieldRegistry,

    template
) {
    var module = declare([_WidgetBase, _Container, _Contained, _TemplatedMixin], {
        // summary:
        //      Sets attributes on field
        // tags:
        //      internal

        labelTarget: "",
        label: "",
        readonlyIconDisplay: null,
        hasFullWidthValue: false,

        templateString: template,

        addChild: function (child, index) {
            if (child.checkbox) {
                this._addCheckboxChild(child, this.labelNode);
            } else {
                this.inherited(arguments);
            }
        },

        _addCheckboxChild: function (child, labelNode) {
            domClass.toggle(this.domNode, "epi-form-container__section__row--checkbox", true);
            domConstruct.place(child.domNode, labelNode, "before");

            if (this._started && !child._started) {
                child.startup();
            }
        },

        _setReadonlyIconDisplayAttr: function (/* Boolean */ value) {
            this._set("readonlyIconDisplay", value);
            domStyle.set(this.readonlyIcon, "display", value === true ? "" : "none");
        },

        _setLabelAttr: function (value) {
            this._set("label", value);
            this.labelNode.insertBefore(domConstruct.toDom(value), this.readonlyIcon);
            domClass.toggle(this.labelNode, "dijitHidden", !value);
        },

        _setLabelTargetAttr: {
            node: "labelNode",
            attribute: "for",
            type: "attribute"
        },

        _setTooltipAttr: {
            node: "labelNode",
            attribute: "title",
            type: "attribute"
        },

        _setHasFullWidthValueAttr: function (/* Boolean */ value) {
            value && domClass.add(this.containerNode, "epi-form-container__section__row--full-width");
        }
    });

    formFieldRegistry.add({
        type: formFieldRegistry.type.field,
        hint: "",
        factory: function (widget, parent) {
            var wrapper = new parent._FieldItem({
                labelTarget: widget.checkbox ? widget.checkbox.id : widget.id,
                label: widget.label,
                tooltip: widget.tooltip,
                readonlyIconDisplay: widget.readOnly,
                hasFullWidthValue: widget.useFullWidth
            });

            wrapper.own(widget.watch("readOnly", function (name, oldValue, newValue) {
                wrapper.set("readonlyIconDisplay", newValue);
            }));

            return wrapper;
        }
    });

    return module;
});
