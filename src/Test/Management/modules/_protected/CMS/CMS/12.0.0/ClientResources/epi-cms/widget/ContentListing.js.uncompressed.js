require({cache:{
'url:epi-cms/widget/templates/ContentListing.html':"﻿<div>\r\n    <h1 data-dojo-attach-point=\"header\"></h1>\r\n    <div data-dojo-type=\"epi-cms/component/ContentQueryGrid\" data-dojo-attach-point=\"contentQuery\">\r\n    </div>\r\n</div>"}});
﻿define("epi-cms/widget/ContentListing", [
// Dojo
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/html",

    // Dijit
    "dijit/_TemplatedMixin",
    "dijit/_Widget",
    "dijit/_WidgetsInTemplateMixin",

    // EPi CMS
    "epi-cms/_ContentContextMixin",
    "epi-cms/component/ContentQueryGrid",
    "dojo/text!./templates/ContentListing.html"
], function (
// Dojo
    dojo,
    declare,
    Deferred,
    html,

    // Dijit
    _TemplatedMixin,
    _Widget,
    _WidgetsInTemplateMixin,

    // EPi CMS
    _ContentContextMixin,
    ContentQueryGrid,
    template
) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _ContentContextMixin], {
        // summary:
        //      This component enabled searching of content where the results will be displayed in a grid.
        //
        // tags:
        //      internal

        templateString: template,

        startup: function () {

            this.inherited(arguments);

            Deferred.when(this.getCurrentContext(), dojo.hitch(this, function (context) {
                this.contextChanged(context);
            }));
        },

        contentContextChanged: function (context, callerData, request) {

            html.set(this.header, context.name);
            this.contentQuery.set("queryParameters", { referenceId: context.id });
            this.contentQuery.set("queryName", "getchildren");
        }
    });
});
