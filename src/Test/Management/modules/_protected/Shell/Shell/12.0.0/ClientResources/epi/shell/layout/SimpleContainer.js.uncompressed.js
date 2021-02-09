define("epi/shell/layout/SimpleContainer", [
    "dojo/_base/declare",
    "dojo/dom-construct",

    "../form/formFieldRegistry",

    "../form/Field",
    "../form/HiddenField",
    "../form/Group",

    "dijit/_TemplatedMixin",
    "dijit/layout/_LayoutWidget"
],
function (
    declare,
    domConstruct,

    registry,

    Field,
    HiddenField,
    Group,

    _TemplatedMixin,
    _LayoutWidget
) {

    var module = declare([_LayoutWidget, _TemplatedMixin], {
        // summary:
        //     Widget that contains form items widgets, aimed to apply the html formatting
        //
        // tags:
        //      internal xproduct

        templateString: "<ul class=\"epi-form-container__section\"></ul>",

        _FieldItem: Field,
        _HiddenFieldItem: HiddenField,
        _ParentItem: Group,
        _GroupItem: Group,

        addChild: function (child) {

            var wrapper,
                factory = registry.get(child._type, child._hint);

            if (factory) {
                this.own(wrapper = factory(child, this));
                this._addChildToWrapper(wrapper, child);
                !factory.preventAdd && this.inherited(arguments, [wrapper]);
            } else {
                wrapper = domConstruct.create("li", { "class": "epi-form-container__section__row epi-form-container__section__row--" + child._type });
                wrapper.appendChild(child.domNode);
                domConstruct.place(wrapper, this.containerNode, "last");

                if (this._started && !child._started) {
                    child.startup();
                }
            }
        },

        _addChildToWrapper: function (wrapper, child) {
            // summary:
            //      Add a child to wrapper. Overwrite to customize how a child is put into the wrapper.
            // wrapper: dijit/_WidgetBase
            //      The wrappper
            // child: dijit/_WidgetBase
            //      The child

            wrapper.addChild(child);
        },

        layout: function () {
            var children  = this.getChildren();

            children && children.forEach(function (wrapper) {
                var child = wrapper.getChildren()[0];
                if (child && child.resize) {
                    // Let all children take whatever size they need.
                    child.resize();
                }
            });
        },

        _setTitleAttr: function (title) {
            this._set("title", title);
        }
    });

    return module;

});
