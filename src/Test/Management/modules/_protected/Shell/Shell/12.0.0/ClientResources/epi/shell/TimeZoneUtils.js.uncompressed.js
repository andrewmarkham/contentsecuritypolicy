define("epi/shell/TimeZoneUtils", [], function () {
    return {
        getOffset: function (date) {
            // summary:
            //    Returns a time zone offset based on the given date
            //
            // date: Date
            //    The date the offset should be derived from
            //
            // returns: string
            //      The time zone offset with the form of GMT+10:30

            /*
            Input: Thu Jan 31 2019 22:26:13 GMT+1030 (Australian Central Daylight Time)
            Group 1:
                [A-Z]+  : Match one or more capital letters
                [\+-]   : Match either a '+' or '-'
                [0-9]{2}: Match two numbers
                Matched: GMT+10
            Group 2:
                [0-9]{2}: Match two numbers
                Matched: 30
            */
            var timeZoneOffsetRegex = new RegExp("([A-Z]+[\+-][0-9]{2})([0-9]{2})");
            var result = date.toString().match(timeZoneOffsetRegex);
            return result[1] + ":" + result[2];
        }
    };
});
