define("epi/string", [
// dojo
    "dojo/_base/lang",
    "dojox/html/entities"
],

function (
// dojo
    lang,
    entities
) {

    var nonEvaluatingBodyTag = document.implementation.createHTMLDocument("nonEvaluating").body;

    return {
        // tags:
        //      public

        pascalToCamel: function (/*String*/input) {
            // summary:
            //      Convert a pascal cased string into a camel cased one.
            // tags:
            //      public

            var parts = input.split(".");
            var output = this._toCamelCase(parts[0]);
            for (var i = 1; i < parts.length; i++) {
                output += "." + this._toCamelCase(parts[i]);
            }

            return output;
        },

        _toCamelCase: function (input) {

            if (!input) {
                return "";
            }

            if (input[0] === input[0].toLowerCase()) {
                return input;
            }

            var output = "";
            //Use the same algorithm as Newtonsoft Json.NET
            for (var i = 0; i < input.length; i++) {
                var hasNext = (i + 1 < input.length);
                if ((i === 0 || !hasNext) || input[i + 1] === input[i + 1].toUpperCase()) {
                    output += input[i].toLowerCase();
                } else {
                    output += input.substring(i);
                    break;
                }
            }
            return output;
        },

        stripHtmlTags: function (/*String*/input) {
            // summary:
            //      Get text data from the given HTML string
            //      Trim all spaces in the return value
            // tags:
            //      public

            if (this.isNullOrEmpty(input)) {
                return "";
            }

            nonEvaluatingBodyTag.innerHTML = input.replace(/&/gim, "&amp;");
            return this.removeAllCarriageReturns(nonEvaluatingBodyTag.textContent);
        },

        removeAllCarriageReturns: function (/*String*/input) {
            // summary:
            //      Remove all carriage returns from the input string
            // input: [String]
            //      Input string that wanted to remove all carriage returns
            // tags:
            //      public

            if (this.isNullOrEmpty(input)) {
                return "";
            }

            var output = input.replace(/\t|\r|\n/gim, "");

            // Best performance for each browser
            // Refer: http://jsperf.com/removing-multiple-spaces
            return output.replace(/ {2,}/gim, " ");
        },

        encodeForWebString: function (/*String*/input, /*Array*/uiSafeHtmlTags) {
            // summary:
            //      Encode text to display as Html.
            //      Not allowed html tags (not in uiSafeHtmlTags) will be rendered as text.
            // tags:
            //      public

            if (this.isNullOrEmpty(input)) {
                return "";
            }

            var safeString = entities.encode(input);
            if (!uiSafeHtmlTags || uiSafeHtmlTags.length === 0) {
                return safeString;
            }

            var pattern = new RegExp("&lt;(/?(" + uiSafeHtmlTags.join("|") + ")/?\\s*)&gt;", "gim");
            return safeString.replace(pattern, "<$1>");
        },

        isNullOrEmpty: function (/*String*/input) {
            // summary:
            //      Checks if the value is null, undefined, empty or whitespace.
            // tags:
            //      public

            return !input || (/^\s*$/).test(input);
        },

        toHTML: function (/*String*/input) {
            // summary:
            //      Replace line breaks with HTML breaks.
            // tags:
            //      public

            if (this.isNullOrEmpty(input)) {
                return "";
            }
            return input.replace(/\r\n|\n|\r|\\n/g, "<br/>");
        },

        toTooltipText: function (/* String */input) {
            // summary:
            //      Normalize text to display correctly as the value of HTML tooltip attribute.
            // tags:
            //      public

            if (this.isNullOrEmpty(input)) {
                return "";
            }

            return input.replace(/\\n/gim, "\n");
        },

        appendTrailingSlash: function (/*String*/url) {
            // summary:
            //      Appends a trailing / if it does not exists
            // tags:
            //      public

            return url.replace(/\/?$/, "/");
        },

        truncateMiddle: function (words, maxLength, ellipsisChar) {
            // summary:
            //      Truncates a list of words to the max length given
            // words: Array|String
            //      The words to truncate
            // maxLength: Number
            //      The max length (number of characters)
            // ellipsisChar: String?
            //      The characters to use as the ellipsis, default is '&hellip;'
            // returns:
            //      A truncated list of words with the ellipsis in the middle
            // tags:
            //      internal

            if (typeof words === "string") {
                words = words.split(/\s+/g);
            } else {
                //Clone the array
                words = words.concat();
            }

            //If it fits just return
            if (words.join("").length <= maxLength) {
                return words;
            }

            var splitOnWord = function (words, maxLength, fromLeft) {
                if (fromLeft) {
                    //Reverse the array to get the the words from the end
                    return splitOnWord(words.reverse(), maxLength).reverse();
                }
                var count = 0;
                return words.filter(function (word) {
                    count += word.length;
                    return count <= maxLength;
                });
            };

            var lengthFirstPart = Math.ceil(maxLength / 2);
            var lengthSecondPart = Math.floor(maxLength / 2);

            var firstPart = splitOnWord(words, lengthFirstPart);

            //Add the ellipsis character
            ellipsisChar = ellipsisChar || "&hellip;";
            firstPart.push(ellipsisChar);

            //Combine the first part and the second part
            return firstPart.concat(splitOnWord(words, lengthSecondPart, true));
        }

    };

});
