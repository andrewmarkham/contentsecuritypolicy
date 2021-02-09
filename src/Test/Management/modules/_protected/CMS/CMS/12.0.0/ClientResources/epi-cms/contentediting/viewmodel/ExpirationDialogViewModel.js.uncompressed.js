define("epi-cms/contentediting/viewmodel/ExpirationDialogViewModel", [
// Dojo
    "dojo/_base/declare",
    "dojo/Stateful",
    "dojo/string",

    //EPi
    "epi/epi",
    "epi/datetime",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.expirationeditor",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.versionstatus"
],

function (
// Dojo
    declare,
    Stateful,
    dojoString,

    // EPi
    epi,
    epiDatetime,

    // Resources
    expirationeditorResources,
    versionstatusResources
) {

    return declare([Stateful], {
        // tags:
        //      internal xproduct

        value: null,

        intermediateValue: null,

        contentLink: null,

        contentName: null,

        // View model binding properties
        enableSaveButton: null,

        showRemoveButton: null,

        infoText: null,

        state: null,

        postscript: function () {
            this.inherited(arguments);

            this.set("intermediateValue", this.value);
            this.set("minimumExpireDate", this.minimumExpireDate);
        },

        _intermediateValueSetter: function (value) {
            this.intermediateValue = value;

            this.set("enableSaveButton", !epi.areEqual(this.intermediateValue, this.value));

            if (value && value.stopPublish) {
                var stopPublish = value.stopPublish instanceof Date ? value.stopPublish : new Date(value.stopPublish);

                this.set("showRemoveButton", true);

                this.set("infoText", stopPublish < epiDatetime.serverTime() ?
                    versionstatusResources.expired :
                    dojoString.substitute(expirationeditorResources.expiretimetext, [epiDatetime.timeToGo(stopPublish)]));

                this.set("state", "Expiring");

            } else {
                this.set("showRemoveButton", false);
                this.set("infoText", expirationeditorResources.neverexpiretext);
                this.set("state", "NotExpiring");
            }
        },

        _valueSetter: function (value) {
            this.value = value;

            this.set("enableSaveButton", false);

        },

        _minimumExpireDateSetter: function (value) {
            var date = new Date(value);
            this.minimumExpireDate = epiDatetime.isDateValid(date) ? date : null;
            this.set("minimumExpireDateMessage", expirationeditorResources.minimumdatevalidation);
        },

        save: function () {
            // summary:
            //      Save the pending changes

            this.set("value", this.intermediateValue);
        },

        reset: function () {
            // summary:
            //      Reset the pending changes

            this.set("intermediateValue", this.value);
        }
    });
});
