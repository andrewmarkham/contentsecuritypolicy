define("epi/shell/widget/DateRangePicker", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/_base/window",
    "dojo/has",
    "dojo/topic",
    "dijit/popup",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_HasDropDown",
    "epi/shell/widget/DateRange",
    "epi/i18n!epi/shell/ui/nls/EPiServer.Shell.UI.Resources.ComponentSelection"
], function (declare, lang, domStyle, win, has, topic, popup, _Widget, _TemplatedMixin, _HasDropDown, DateRange, res) {

    return declare([_Widget, _TemplatedMixin, _HasDropDown], {
        // summary:
        //      contain two dijit/form/DateTextBox to pick a date range
        //
        // tags:
        //      public

        // templateString: String
        //  the template
        templateString: "<div>\
                             <a class=\"epi-iconToolbar-item-link epi-iconToolbar-calendar\" href=\"#\" title=\"${res.selectdateinterval}\" data-dojo-attach-point=\"_buttonNode, focusNode\"></a>\
                         </div>",

        // res: Object
        //  get the labels in the right language
        res: res,

        // startDate: Object
        //  date of the date range picker
        //  date value set and retrieve with dojo/date.locale.parse and dojo.date.locale.format respectively,
        //  so we can use different date format
        startDate: new Date(),

        // endDate: Object
        //  date of the date range picker
        //  date value set and retrieve with dojo/date.locale.parse and dojo.date.locale.format respectively,
        //  so we can use different date format
        endDate: new Date(),

        openDropDown: function () {
            // summary:
            //      Open the drop down
            // description:
            //		Open the drop down (with dijit.popup.open) when inherits from the parent class
            //      Before inheritance, set the widget to display inside the drop down (epi/shell/widget/DateRange)
            //      Connect the button's onlick event of the DateRange widget to methods of the current class
            //      Set the default value of the start date and end date calendars
            //      After inheritance, set the width, because dijit/_HasDropDown seems to override the on set before
            // tags:
            //		protected

            if (this.dropDown) {
                this.dropDown.destroy();
            }
            this.dropDown = new DateRange();
            this.dropDown.startDateInput._setValueAttr(this.startDate);
            this.dropDown.endDateInput._setValueAttr(this.endDate);
            this.connect(this.dropDown.chooseButton, "onClick", lang.hitch(this, "_onChooseClick"));
            // for some reasons it doesn't work to call directly this.closeDropDown() (of parent class) below
            this.connect(this.dropDown.cancelButton, "onClick", lang.hitch(this, "_closeDropDown"));
            this.connect(this.dropDown, "onMouseLeave", lang.hitch(this.dropDown, "allowCloseParent"));
            //add the event: wheel and run _closeDropDown() then,
            //because the date picker remains at the same place if we scroll inside the page this way
            this.connect(win.body(), (!has("mozilla") ? "onmousewheel" : "DOMMouseScroll"), lang.hitch(this, "_closeDropDown"));
            this.inherited(arguments);
            domStyle.set(this.dropDown.domNode, "width", "390px");
        },

        _onBlur: function () {
            // summary:
            //      fix for ie: prevent the DateRange drop down to close if we trigger one of the inner DateTextBox drop down
            if (this.dropDown && this.dropDown.closeParent) {
                popup.close(this.dropDown);
                this._opened = false;
            }
        },

        _closeDropDown: function () {
            // summary:
            //      close the drop down
            this.closeDropDown();
        },

        _onChooseClick: function () {
            // summary:
            //      set the new start and end date, publish the fact that the interval has been set, and close the drop down
            this.startDate = this.dropDown.startDateInput.get("value");
            this.endDate = this.dropDown.endDateInput.get("value");
            this.closeDropDown();
            topic.publish("intervalHasBeenSet", this.id);
        }
    });
});
