define("epi/shell/widget/_DynamicStyleSheetIframeMixin", [
// Dojo
    "dojo/_base/declare",
    "dijit/Destroyable",

    // EPi
    "epi/shell/DynamicStyleSheet"
],

function (
// Dojo
    declare,

    Destroyable,

    // EPi
    DynamicStyleSheet

) {

    return declare([Destroyable], {
        // summary:
        //      Adds the possibillity to inject style rules into the iframe document.
        //      Usable with the epi/shell/widget/Iframe widget
        //	example:
        //	|	declare([Iframe, _DynamicStyleSheetIframeMixin]);
        //
        // tags:
        //    internal

        // cssRules: Array
        //  A a collection of all rules added to the iframe
        cssRules: null,

        postMixInProperties: function () {

            this.inherited(arguments);

            this.cssRules = [];

        },

        postCreate: function () {

            this.inherited(arguments);

            this.own(this.watch("isLoading", this._isLoadingHandler));
            this._setup();
        },

        destroy: function () {
            if (this._css) {
                this._css.destroy();
            }

            this.inherited(arguments);
        },

        addCssRules: function (rules) {
            // summary:
            //      Adds a single or array of rules {selector: "div", rule: "color: red"}

            var isArray = rules instanceof Array;

            isArray ? this.cssRules = this.cssRules.concat(rules) :
                this.cssRules.push(rules);

            if (this._css) {
                isArray ? this._css.addRules(rules) :
                    this._css.addRule(rules);
            }
        },

        _isLoadingHandler: function (name, oldValue, isLoading) {
            if (isLoading) {
                if (this._css) {
                    this._css.destroy();
                }
            } else {
                this._setup();
            }
        },

        _setup: function () {
            if (this.isInspectable()) {
                this._css = new DynamicStyleSheet({ doc: this.getDocument(), rules: this.cssRules });
            }
        }

    });
});
