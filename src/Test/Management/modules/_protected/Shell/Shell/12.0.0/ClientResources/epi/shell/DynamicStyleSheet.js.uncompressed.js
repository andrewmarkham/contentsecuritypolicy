define("epi/shell/DynamicStyleSheet", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/dom-construct"
],

function (
    array,
    declare,
    domConstruct
) {

    return declare(null, {
        // summary:
        //      Injects a style block into the indicated document
        // tags:
        //      internal

        // doc: [public] Object
        //      Document object that wanted to inject the dynamic styles
        doc: null,

        // _styleSheet: [private] Object
        //      Dynamic style sheet object
        _styleSheet: null,

        // _ruleIndexes: [private] Array
        //      Store to hold rule indexes
        _ruleIndexes: null,

        // _newRules: [private] Array
        //      CSS stylesheet rules will be injected to document
        _addedRules: null,

        constructor: function (/*Object*/params) {

            if (!params || !params["doc"]) {
                throw new Error("No doc parameter specified");
            }

            this._doc = params["doc"];

            this._addedRules = [];
            this._ruleIndexes = [];

            var rules = params["rules"];
            if (rules && rules.length > 0) {
                this.addRules(rules);
            }
        },

        destroy: function () {
            delete this._styleSheet;
            delete this._doc;
        },

        addRules: function (/*Array*/rules) {
            // summary:
            //      Adds an array of rules to the stylesheet.
            //      The format needs to be [{selector: ".selector", css: "color: red"}]
            // tags:
            //      public

            var returnValues = [];

            array.forEach(rules, function (rule) {
                returnValues.push(this.addRule(rule.selector, rule.css));
            }, this);

            return returnValues;
        },

        addRule: function (/*String*/selector, /*String*/css) {
            // summary:
            //      Add rule to the created stylesheet object.
            //      in case the
            // selector:
            //      CSS selector
            // css:
            //      CSS styles
            // tags:
            //      public

            var self,
                stylesheet = this._getStyleSheet();

            function removeRule(indexToRemove) {
                var realIndex = self._ruleIndexes[indexToRemove],
                    length = self._ruleIndexes.length;

                if (realIndex === undefined) {
                    return;
                } // already removed

                // remove rule indicated in internal array at index
                stylesheet.deleteRule
                    ? stylesheet.deleteRule(realIndex)
                    : stylesheet.removeRule(realIndex); // IE < 9

                // Clear internal array item representing rule that was just deleted.
                // NOTE: we do NOT splice, since the point of this array is specifically
                // to handle the splicing that occurs in the stylesheet itself!
                self._ruleIndexes[indexToRemove] = undefined;

                // Then update array items as necessary to downshift remaining rule indices.
                // Can start at index, since array is sparse but strictly increasing.
                for (var i = indexToRemove; i < length; i++) {
                    if (self._ruleIndexes[i] > realIndex) {
                        self._ruleIndexes[i]--;
                    }
                }

                stylesheet = null; // Possible leak by closure
            }

            var index = this._ruleIndexes.length;
            if (stylesheet) {
                this._ruleIndexes[index] = (stylesheet.cssRules || stylesheet.rules).length;

                stylesheet.addRule
                    ? stylesheet.addRule(selector, css)
                    : stylesheet.insertRule(selector + "{" + css + "}", this._ruleIndexes[index]);
            }
            return {
                remove: function () {
                    removeRule(index);
                }
            };
        },

        _getStyleSheet: function () {

            if (this._styleSheet) {
                return this._styleSheet;
            }

            var cssNode = domConstruct.create("style", { type: "text/css" }, this._doc.getElementsByTagName("head")[0]);

            // Keep reference to actual StyleSheet object (.styleSheet for IE < 9)
            return this._styleSheet = cssNode.sheet || cssNode.styleSheet;
        }
    });
});
