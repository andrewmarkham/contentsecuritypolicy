define("epi/shell/widget/TimeZoneInfo", [
    "dojo/_base/declare",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "epi/shell/TimeZoneUtils"
],

function (declare, _Widget, _TemplatedMixin, TimeZoneUtils) {

    return declare([_Widget, _TemplatedMixin], {
        // summary:
        //    Time zone info widget.
        //
        // description:
        //    Displays the time zone offset in relation to GMT
        //    and, when possible, the name of the time zone
        //
        // tags:
        //    public

        templateString: "<div data-dojo-attach-point='timeZone' class='epi-timeZoneInfo'></div>",

        updateOffset: function (date) {
            date = date ? date : new Date();
            var location = Intl.DateTimeFormat().resolvedOptions().timeZone; // not supported by IE11
            var timeZoneOffset = TimeZoneUtils.getOffset(date);
            this.timeZone.innerText = (location ? location.replace("_", " ") + " " : "") + "(" + timeZoneOffset + ")";
        }
    });
});
