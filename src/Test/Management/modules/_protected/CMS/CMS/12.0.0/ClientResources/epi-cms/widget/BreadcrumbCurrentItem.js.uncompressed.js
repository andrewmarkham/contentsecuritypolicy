require({cache:{
'url:epi-cms/widget/templates/BreadcrumbCurrentItem.html':"﻿<div>\r\n    <div class=\"epi-breadCrumbs-title-wrapper\"><span data-dojo-attach-point=\"iconNode\" class=\"dijitInline dijitIcon epi-breadCrumbsCurrentItem-icon\"></span><h1 data-dojo-attach-point=\"heading\" class=\"epi-breadcrumbContentItem dojoxEllipsis\"></h1></div>\r\n</div>"}});
﻿define("epi-cms/widget/BreadcrumbCurrentItem", [
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/Evented",
    "dojo/topic",
    "dojo/dom-construct",

    "dijit/_TemplatedMixin",
    "dijit/_WidgetBase",

    "epi/string",

    "epi/shell/TypeDescriptorManager",

    "dojo/text!./templates/BreadcrumbCurrentItem.html"
],

function (
    declare,
    domClass,
    Evented,
    topic,
    domConstruct,

    _TemplatedMixin,
    _WidgetBase,

    epiString,

    TypeDescriptorManager,

    template
) {

    return declare([_WidgetBase, _TemplatedMixin], {
        // tags:
        //      internal xproduct

        templateString: template,

        // _currentIconClass: [String]
        //      The private variable to safe class of current context
        _currentIconClass: null,

        _setCurrentItemInfoAttr: function (/* context */value) {
            // summary:
            //   The context for a content.
            //
            // value:
            //    The current item info object, containing name and dataType.
            //
            // tags:
            //    private

            if (!value) {
                return;
            }

            this.heading.innerHTML = epiString.encodeForWebString(value.name);

            if (value.dataType) {
                var currentIconClass = TypeDescriptorManager.getValue(value.dataType, "iconClass");
                if (currentIconClass && currentIconClass !== this._currentIconClass) {

                    // Remove current class and then add new class
                    domClass.remove(this.iconNode, this._currentIconClass);
                    domClass.add(this.iconNode, currentIconClass);
                    this._currentIconClass = currentIconClass;
                }
            }
        }
    });
});
