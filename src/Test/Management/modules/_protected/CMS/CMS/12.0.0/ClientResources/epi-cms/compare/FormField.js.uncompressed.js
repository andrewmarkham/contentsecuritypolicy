define("epi-cms/compare/FormField", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",

    "dojo/dom-style",

    // dijit
    "dijit/form/Button",

    // epi
    "epi/shell/form/Field",
    "epi/shell/form/formFieldRegistry",

    "epi/i18n!epi/cms/nls/episerver.cms.compare"
],
function (
// dojo
    declare,
    lang,
    domClass,
    domConstruct,

    domStyle,

    // dijit
    Button,

    // epi
    Field,
    registry,
    res
) {

    var module = declare([Field], {
        //  tags:
        //      internal

        _copyButton: null,

        buildRendering: function () {

            this.inherited(arguments);

            this.own(this._copyButton = new Button({
                "class": "epi-form-container__section__row__copy-button epi-chromeless",
                iconClass: "epi-icon-compare--copy",
                label: res.copy.label,
                title: res.copy.tooltip
            }).placeAt(this.domNode, "last"));

            this._copyButton.on("click", lang.hitch(this, function () {
                this.model.copy(this.params.name);
            }));
        },

        addChild: function (child, index) {

            var labelNode,
                wrapperNode = domConstruct.create(
                    "div",
                    { "class": "epi-form-container__section__row__editor--" + child._type },
                    this.domNode
                );

            if (child.checkbox) {
                labelNode = (child._type === "compare")
                    ? domConstruct.create("label", { innerHTML: child.label }, wrapperNode)
                    : domConstruct.place(this.labelNode, wrapperNode);

                this._addCheckboxChild(child, labelNode);

            } else {
                child.placeAt(wrapperNode);
            }
        },

        destroy: function () {
            this.inherited(arguments);

            if (this._comparisonWatch) {
                this._comparisonWatch.remove();
                this._comparisonWatch = null;
            }
        },

        _setReadonlyIconDisplayAttr: function (readonlyIconDisplay) {

            this.inherited(arguments);

            if (this._copyButton) {
                domStyle.set(this._copyButton.domNode, "display", readonlyIconDisplay ? "none" : "");
            }
        },

        _setModelAttr: function (model) {
            this._set("model", model);

            if (this._comparisonWatch) {
                this._comparisonWatch.remove();
            }

            this._updateChangedState();
            this._comparisonWatch = model.watch("comparison", lang.hitch(this, "_updateChangedState"));
        },

        _updateChangedState: function () {
            var comparison = this.model.comparison,
                group = comparison && comparison[this.groupName],
                hasChange = group && group.indexOf(this.name.toLowerCase()) >= 0;

            domClass.toggle(this.domNode, "epi-form-container__section__row--has-changes", hasChange);
        }
    });

    function fieldFactory(widget, parent) {

        var wrapper = new module({
            labelTarget: widget.checkbox ? widget.checkbox.id : widget.id,
            label: widget.label,
            tooltip: widget.tooltip,
            name: widget.name,
            groupName: widget.groupName.toLowerCase(),
            readonlyIconDisplay: widget.readOnly,
            hasFullWidthValue: widget.useFullWidth
        });

        wrapper.own(widget.watch("readOnly", function (name, oldValue, newValue) {
            wrapper.set("readonlyIconDisplay", newValue);
        }));

        return wrapper;
    }

    function compareFactory(widget, parent) {
        var wrapper = parent.getChildren().pop();
        wrapper.set("model", widget.compareViewModel);

        return wrapper;
    }

    compareFactory.preventAdd = true;

    registry.add([
        {
            type: registry.type.field,
            hint: "compare",
            factory: fieldFactory
        },
        {
            type: "compare",
            hint: "",
            factory: compareFactory
        }
    ]);

    return module;
});
