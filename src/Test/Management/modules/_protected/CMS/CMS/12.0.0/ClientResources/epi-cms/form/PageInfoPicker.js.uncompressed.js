define("epi-cms/form/PageInfoPicker", [
    "epi",
    "dojo/_base/declare",
    "dojo/i18n",
    "dijit/form/TextBox"],

function (epi, declare, i18n, TextBox) {

    /* global EPi: true */

    return declare([TextBox], {
        // tags:
        //      internal

        title: "PageReference Picker",

        isContainer: true,

        templateString: "<div class=\"dijit dijitReset dijitInline dijitLeft\" id=\"widget_${id}\" waiRole=\"presentation\" \
            ><div class=\"dijitReset dijitInputField dijitInputContainer\" \
                ><input name=\"${id}PageLink\" id=\"${id}PageLink\" type=\"hidden\" dojoAttachPoint=\"pageLinkNode\" value=\"0\" \
                /><input dojoAttachEvent=\"click:openDialog\" readonly=\"readonly\" disabled=\"disabled\" class=\"dijitReset dijitInputInner\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\" ${!nameAttrSetting} type='${type}' \
                /><input dojoAttachEvent=\"click:openDialog\" style=\"position:absolute; top:0;right:0; height:100%; font-size:7px;\" type=\"button\" dojoAttachPoint=\"clickNode\" value=\"...\" \
                /></div \
            ></div>",

        openDialog: function () {
            var url = EPi.ResolveUrlFromUI("edit/pagebrowser.aspx");
            var id = this._getValue().PageLink;
            EPi.CreatePageBrowserDialog(url, id,
                true/*disableCurrentPageOption*/,
                false/*displayWarning*/,
                this.textbox.id/*info*/,
                this.pageLinkNode.id/*value*/,
                null/*language*/,
                null/*callbackMethod*/,
                null/*callbackArguments*/,
                true/*requireUrlForSelectedPage*/);
        },

        _getValue: function () {
            return {
                PageName: this.textbox.value.replace(/^(.*?) \[.+?\]$/, "$1") || "",
                PageLink: this.pageLinkNode.value
            };
        },

        _setValue: function (value) {
            this.textbox.value = this.format(value);
            this.pageLinkNode.value = value.PageLink;
        },

        get: function (name) {
            if (name === "value") {
                return this._getValue();
            }
            return this.inherited(arguments);
        },

        set: function (name, value) {
            if (name === "value") {
                this._setValue(value);
                return;
            }
            this.inherited(arguments);
        },

        format: function (value, constraints) {
            if (value.PageLink === "0" || !value.PageLink) {
                return "";
            }
            return value.PageName + " [" + value.PageLink + "]";
        },

        isValid: function (/*Boolean*/isFocused) {
            if (this.params.required) {
                var value = this._getValue();
                if (value.PageLink === "0" || !value.PageLink) {
                    return false;
                }
            }
            return true;
        },

        getErrorMessage: function () {
            if (this.isValid()) {
                return "";
            }
            if (!this.messages) {
                this.messages = i18n.getLocalization("dijit.form", "validate", this.lang);
            }
            return this.messages.missingMessage;
        }
    });
});
