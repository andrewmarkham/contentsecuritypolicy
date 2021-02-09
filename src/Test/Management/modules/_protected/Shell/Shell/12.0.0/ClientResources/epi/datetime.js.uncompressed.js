define("epi/datetime", [
    "epi",
    "dojo/date",
    "dojo/date/stamp",
    "dojo/date/locale",
    "dojo/_base/lang",
    "dojo/i18n"],

function (epi, dojoDate, dateStamp, locale, lang, i18n) {

    function _friendlyTimeDiff(fromDate, toDate) {
        var dayStr = epi.resources.text.day;
        var daysStr = epi.resources.text.days;

        var hourStr = epi.resources.text.hour;
        var hoursStr = epi.resources.text.hours;

        var minuteStr = epi.resources.text.minute;
        var minutesStr = epi.resources.text.minutes;

        var secondStr = epi.resources.text.second;
        var secondsStr = epi.resources.text.seconds;

        var result = "";

        var totalDiff = toDate - fromDate;

        // If the date is in the future the totalDiff will be negative, return 1 second if that is the case
        if (totalDiff < 0) {
            return " 1 " + secondStr;
        }

        var days = Math.floor(totalDiff / 1000 / 60 / 60 / 24);
        var dateDiff = new Date(totalDiff);
        var hours = dateDiff.getUTCHours();
        var minutes = dateDiff.getMinutes();
        var seconds = dateDiff.getSeconds();

        if (days !== 0) {
            result = result + " " + days + " " + (days > 1 ? daysStr : dayStr);
        }

        if (hours !== 0) {
            result = result + " " + hours + " " + (hours > 1 ? hoursStr : hourStr);
        }

        if (minutes !== 0) {
            result = result + " " + minutes + " " + (minutes > 1 ? minutesStr : minuteStr);
        }

        if (result.length > 0) {
            return result;
        }

        return " " + seconds + " " + (seconds > 1 ? secondsStr : secondStr);
    }

    function _hasProperties(/*Object*/obj) {
        // summary:
        //    Helper function that determine if the object is a simple or complex object
        //
        // obj:
        //    Object to be tested.
        //
        // tags:
        //    internal
        if (lang.isObject(obj)) {
            for (var item in obj) {
                return true;
            }
        }
        return false;
    }

    function _transformDate(/*Object*/obj, /*boolean*/forceSimpleProperty) {
        // summary:
        //    Search property that are instance of Date
        //    in a object recursively.
        //
        // obj:
        //    The object the contain the data to be
        //    transformed.
        //
        // tags:
        //    internal
        if (forceSimpleProperty) {
            if (obj instanceof Date) {
                return dateStamp.toISOString(obj, { zulu: true });
            } else {
                return obj;
            }
        }

        var newObject = lang.clone(obj);

        for (var item in obj) {
            if (obj[item] instanceof Date) {
                newObject[item] = dateStamp.toISOString(obj[item], { zulu: true });
            } else {
                if (_hasProperties(obj[item])) {
                    newObject[item] = _transformDate(obj[item]);
                }
            }
        }
        return newObject;
    }

    function escapeFormat(format) {
        // summary:
        //      Escapes the given string so that it will be ignored by the date formatter.
        // tags:
        //      private

        return "'" + format + "'";
    }

    return epi.datetime = {
        // tags:
        //      public

        // serverTimeDelta: Integer
        //      Difference time between client and server
        serverTimeDelta: 0,

        transformDate: function (/*Object*/value) {
            // summary:
            //    Remove the padding server offset from the date and
            //    convert it to ISO String.
            //
            // value:
            //    The object to be converted.
            //
            // tags:
            //    public
            var isSimpleProperty = (_hasProperties(value) && !(value instanceof Date));
            var transformedValue = (isSimpleProperty ? _transformDate(value) : _transformDate(value, true));
            return transformedValue;
        },

        isDateValid: function (/*Object*/obj) {
            // summary:
            //    Check if the date object is valid.
            //
            // obj:
            //    Object to the tested.
            //
            // tags:
            //    private
            return ((obj && obj instanceof Date) && (!isNaN(obj.getTime())));
        },

        toUserFriendlyString: function (date, localeName, hideToday, excludeTime) {
            // summary:
            //      Converts a date object or a date formatted string to a user friendly string.
            // date: Date|String
            //      The date to convert.
            // localeName: String?
            //      The locale in which the date will be formatted.
            // hideToday: Boolean?
            //      Excludes the date portion from the returned date string when true and the given
            //      date is today.
            // excludeTime: Boolean?
            //      Excludes the time portion from the returned date string when true. This option
            //      is ignored in the case hideToday is true and the given date is today.
            // tags:
            //      public

            if (!date) {
                return "";
            }

            // "date" can be passed as a string, but needed as a Date object.
            if (!(date instanceof Date)) {
                date = new Date(date);

                // TODO: Throw exception instead once we release CMS UI 12.0.
            }

            //Get the gregorian settings for the current locale that specifies some specific locale formats.
            var bundle = i18n.getLocalization("dojo.cldr", "gregorian", localeName);

            var today = new Date(),
                comparisonDate = new Date(date),
                selector = excludeTime ? "date" : "",
                datePattern = "";

            today.setHours(0, 0, 0, 0);
            comparisonDate.setHours(0, 0, 0, 0);

            if (dojoDate.difference(today, date, "year") === 0) {
                // If the date is this year format the date with only month and day.
                datePattern = bundle["dateFormatItem-MMMd"];

                // Store the comparison date in a new variable since we need the original and
                // compare the difference in days.
                var difference = dojoDate.difference(today, comparisonDate, "day");

                switch (difference) {
                    case 0:
                        // Do an early exit with only the formatted time if hideToday is true.
                        if (hideToday) {
                            return locale.format(date, { selector: "time", locale: localeName });
                        }
                        datePattern = escapeFormat(bundle["field-day-relative+0"]);
                        break;
                    case 1:
                        datePattern = escapeFormat(bundle["field-day-relative+1"]);
                        break;
                    case -1:
                        datePattern = escapeFormat(bundle["field-day-relative+-1"]);
                        break;
                }
            }

            // Format the date based on the selector, date pattern and given locale.
            return locale.format(date, { selector: selector, datePattern: datePattern, locale: localeName });
        },

        toUserFriendlyHtml: function (date, localeName, hideToday, excludeTime) {
            // summary:
            //      Converts a date object or a date formatted string to a user friendly string
            //      contained within HTML, e.g. <span class="epi-timestamp">Today, 7:30 AM</span>.
            // date: Date|String
            //      The date to convert.
            // localeName: String?
            //      The locale in which the date will be formatted.
            // hideToday: Boolean?
            //      Excludes the date portion from the returned date string when true and the given
            //      date is today.
            // excludeTime: Boolean?
            //      Excludes the time portion from the returned date string when true. This option
            //      is ignored in the case hideToday is true and the given date is today.
            // tags:
            //      public

            var formattedDate = this.toUserFriendlyString(date, localeName, hideToday, excludeTime);
            if (formattedDate === "") {
                return formattedDate;
            }
            return "<span class='epi-timestamp'>" + formattedDate + "</span>";
        },

        timePassed: function (from, to) {
            // summary:
            //      Get the time passed between two dates
            //
            // from: Date
            //      Start date
            // to: Null|Date
            //      End date
            // tags:
            //      public

            to = to || new Date();
            return _friendlyTimeDiff(from, to);
        },

        timeToGo: function (/*Date*/date) {
            // summary:
            //      Get the time to go to the given time
            //
            // tags:
            //      public

            return _friendlyTimeDiff(this.serverTime(), date);
        },

        serverTime: function () {
            // summary:
            //      Get the current datetime from server
            //
            // tags:
            //      public

            return new Date(new Date().getTime() + this.serverTimeDelta);
        }
    };
});
