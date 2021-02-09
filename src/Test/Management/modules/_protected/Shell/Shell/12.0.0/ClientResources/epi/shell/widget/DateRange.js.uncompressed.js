define("epi/shell/widget/DateRange", [
    "dojo",
    "dojo/i18n",
    "epi",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/DateTextBox"
], function (dojo, i18n, epi, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin) {

    return dojo.declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      contain two dijit/form/DateTextBox to pick a date range
        //
        // tags:
        //      public

        // templateString: String
        //  the template
        templateString: "<div class=\"ui-daterange-popup\" style=\"width:390px;\">\
            <div>\
                <div style=\"margin: 5px;\" data-dojo-type=\"dijit/form/DateTextBox\" dojoAttachPoint=\"startDateInput\" dojoAttachEvent=\"onMouseEnter: forbidCloseParent\"></div>\
                <div style=\"margin: 5px;\" data-dojo-type=\"dijit/form/DateTextBox\" dojoAttachPoint=\"endDateInput\" dojoAttachEvent=\"onMouseEnter: forbidCloseParent\"></div>\
            </div>\
            <div style=\"text-align: right;margin: 20px 7px 0 0;\">\
                <button data-dojo-type=\"dijit/form/Button\" type=\"button\" dojoAttachPoint=\"chooseButton\">${commonRes.action.choose}</button>\
                <button data-dojo-type=\"dijit/form/Button\" type=\"button\" dojoAttachPoint=\"cancelButton\">${commonRes.action.cancel}</button>\
            </div>\
        </div>",

        closeParent: true,

        // commonRes: Object
        //  get the labels in the right language
        commonRes: epi.resources,

        forbidCloseParent: function () {
            this.closeParent = false;
        },

        allowCloseParent: function () {
            this.closeParent = true;
        }
    });
});
