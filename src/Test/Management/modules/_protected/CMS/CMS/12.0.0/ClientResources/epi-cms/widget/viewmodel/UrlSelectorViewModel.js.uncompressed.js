define("epi-cms/widget/viewmodel/UrlSelectorViewModel", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/lang",
    "dojo/io-query",
    "dojo/topic",
    "dojo/Stateful",
    "dojo/when",

    // EPi CMS
    "epi-cms/core/PermanentLinkHelper"
],

function (
// Dojo
    array,
    declare,
    Deferred,
    lang,
    ioQuery,
    topic,
    Stateful,
    when,

    // EPi CMS
    PermanentLinkHelper
) {
    return declare([Stateful], {
        // summary:
        //    Represents the view model for UrlSelector
        // tags:
        //    internal

        _valueGetter: function () {
            if (typeof this.internalValue === "string" || !this.internalValue) {
                return this.internalValue;
            } else { // in case we have this.internalValue as an object with href attribute
                return this.internalValue.href;
            }
        },

        _valueSetter: function (value) {
            if (typeof value === "string") {
                // value here is the raw link, let's wrap it in a object in order to pass it to LinkEditor dialog
                value = { href: value };
            }

            if (!value || !value.href) {
                this.set("internalValue", null);
                this.set("isEmpty", true);
                return;
            }

            this.set("isEmpty", false);

            when(PermanentLinkHelper.getContent(value.href, { allLanguages: true }), lang.hitch(this, function (content) {
                value.name = content ? content.name : value.href;
                this.set("internalValue", value);
            }));
        }
    });
});
