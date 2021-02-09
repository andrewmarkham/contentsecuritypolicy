define("epi/shell/layout/LayoutContainer", [
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/_Contained",
    "dijit/_TemplatedMixin",
    "epi/shell/layout/SimpleContainer"
],

function (
    declare,
    _WidgetBase,
    _Container,
    _Contained,
    _TemplatedMixin,
    SimpleContainer
) {

    var fieldItem = declare([_WidgetBase, _Container, _Contained, _TemplatedMixin], {
        templateString: "<li class=\"epi-form-container__section__row\">\
                                            <label style=\"display: none\"><span data-dojo-attach-point=\"readonlyIcon\"></span></label> \
                                        </li>"
    });

    return declare([SimpleContainer], {
        // summary:
        //     Widget that contains an empty layout widgets, aimed to apply the html formatting specific to a group
        //
        // tags:
        //      internal

        _setTitleAttr: function () {},

        _FieldItem: fieldItem

    });
});
