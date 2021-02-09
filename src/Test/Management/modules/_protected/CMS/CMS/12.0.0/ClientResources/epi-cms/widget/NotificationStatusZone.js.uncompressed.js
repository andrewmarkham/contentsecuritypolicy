define("epi-cms/widget/NotificationStatusZone", [
    "dojo",
    "dojo/_base/declare",
    "dijit/_Widget",
    "dijit/_TemplatedMixin"
],
function (dojo, declare, _Widget, _TemplatedMixin) {

    return declare([_Widget, _TemplatedMixin], {
        // summary:
        //      This widget only use for [epi/cms/widget/NotificationStatusBar]
        //
        // tags:
        //      internal

        templateString: "\
            <div>\
                <div class=\"epi-dijitTooltipNotificationBlock epi-dijitTooltipBlock${TypeName}\" data-dojo-attach-point=\"Zone\">\
                    <span class=\"epi-notificationTypeTitle\"><span class=\"dijitIcon dijitInline epi-dijitTooltip${TypeName}Icon\"></span>${title}</span>\
                    <ul data-dojo-attach-point=\"contentContainer\"></ul>\
                </div>\
            </div>",
        title: "", // String: Title of the zone
        type: "", // String: Type of the zone,
        TypeName: "", // String: Name of Type of the zone with title casing

        _hiddenCssClass: "epi-dijitTooltipBlockHidden",

        postMixInProperties: function () {
            this.TypeName = this.type.charAt(0).toUpperCase() + this.type.slice(1);
        },

        empty: function () {
            // summary:
            //    Clears content of the area.
            // tags:
            //    public
            dojo.empty(this.contentContainer);
        },

        addRow: function (itemHTML, position) {
            // summary:
            //    Adds new row to area content.
            // itemHTML: String
            //    HTML string of row will be added to area
            // position: String
            //    Position of row was added ("begin", "last")
            // tags:
            //    public
            dojo.place(itemHTML, this.contentContainer, position);
        },

        show: function () {
            // summary:
            //    Shows the area content.
            // tags:
            //    public
            dojo.removeClass(this.Zone, this._hiddenCssClass);
        },

        hide: function () {
            // summary:
            //    Hides the area content.
            // tags:
            //    public
            dojo.addClass(this.Zone, this._hiddenCssClass);
        }
    });
});
