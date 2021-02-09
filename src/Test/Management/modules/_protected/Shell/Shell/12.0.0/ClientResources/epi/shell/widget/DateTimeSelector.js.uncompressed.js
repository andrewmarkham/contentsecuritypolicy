require({cache:{
'url:epi/shell/widget/templates/DateTimeSelector.html':"﻿<div style=\"position: relative;\" class=\"epi-dateTimeWrapper\">\r\n    <div data-dojo-attach-point=\"calendar\" data-dojo-type=\"dijit/Calendar\"  data-dojo-attach-event=\"onChange: _onChange, onKeyPress:_onCalendarKeyPress\" ></div>\r\n    <div data-dojo-attach-point=\"calendarOverlay\" style=\"position: absolute; left: 0; top: 0;\"></div>\r\n    <div style=\"text-align: center; padding: 5px\" class=\"epi-timePickerWrapper\">\r\n        <div class=\"dijitInline dijitIcon epi-iconClock\"></div><div data-dojo-attach-point=\"timePicker\" data-dojo-type=\"epi/shell/widget/TimeSpinner\" data-dojo-attach-event=\"onKeyPress:_onTimePickerKeyPress, onChange: _onChange\"></div>\r\n        <div data-dojo-attach-point=\"timeZoneInfo\" data-dojo-type=\"epi/shell/widget/TimeZoneInfo\"></div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi/shell/widget/DateTimeSelector", [
    "dojo/_base/declare",
    "dojo/keys",
    "dojo/aspect",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/Calendar",
    "epi/shell/widget/TimeSpinner",
    "epi/datetime",
    "dojo/text!./templates/DateTimeSelector.html",
    "epi/shell/widget/TimeZoneInfo"],

function (declare, keys, aspect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Calendar, EPiTimeSpinner, datetime, template) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //    Datetime selector widget.
        //
        // description:
        //    Used for editing PropertyPage properties in flyout editor.
        //
        // tags:
        //    public

        // templateString: [protected] String
        //    Widget's template string.
        templateString: template,

        // value: [public] String
        //    The widget's value.
        value: null,

        postCreate: function () {
            this.inherited(arguments);

            //Select the value when moving around in the calendar
            aspect.after(this.calendar, "handleKey", function (evt) {
                switch (evt.keyCode) {
                    case keys.RIGHT_ARROW:
                    case keys.LEFT_ARROW:
                    case keys.DOWN_ARROW:
                    case keys.UP_ARROW:
                        this.set("value", this.currentFocus);
                        return true;
                    default:
                        return true;
                }
            }, true);
            this.timeZoneInfo.updateOffset(this.calendar.get("value"));
        },

        _setValueAttr: function (value) {
            //summary:
            //    Value's setter.
            //
            // value: String
            //    Value to be set.
            //
            // tags:
            //    protected

            this.calendar.set("value", value, false);
            this.timePicker.set("value", value, false);
        },

        _onCalendarKeyPress: function (e) {
            if (e.keyCode === keys.TAB) {
                this.timePicker.focus();
            }
        },

        _onTimePickerKeyPress: function (e) {
            if (e.keyCode === keys.TAB) {
                this.calendar.focus();
            }
        },

        _getValueAttr: function () {
            //summary:
            //    Value's getter
            // tags:
            //    protected

            var selectedDate = this.calendar.get("value");
            var selectedTime = this.timePicker.get("value");

            if (!selectedDate && !selectedTime) {
                return null;
            }
            if (!selectedDate) {
                this.calendar.goToToday();
                selectedDate = this.calendar.get("value");
            }
            if (!selectedTime) {
                selectedTime = new Date(0, 0, 0, 0, 0, 0, 0);
                this.timePicker.set("value", selectedTime, false);
            }
            return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
                selectedTime.getHours(), selectedTime.getMinutes(), selectedTime.getSeconds(), selectedTime.getMilliseconds());
        },

        _onChange: function (value) {
            // summary:
            //    Handle the inner widgets change event.
            //
            // tags:
            //    private
            var combinedValue = this.get("value");
            this.onChange(combinedValue);
            this.timeZoneInfo.updateOffset(combinedValue);
        },

        onChange: function (value) {
            // summary:
            //    Fired when value is changed.
            //
            // pageId:
            //    The page's id
            // tags:
            //    public, callback
        },

        focus: function () {
            // summary:
            //    Set focus on the widget.
            //
            // tags:
            //    public
            this.calendar.focus();
        }
    });
});
