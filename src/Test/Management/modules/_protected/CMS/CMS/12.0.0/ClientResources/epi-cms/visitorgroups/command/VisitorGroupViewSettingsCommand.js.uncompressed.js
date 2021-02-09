define("epi-cms/visitorgroups/command/VisitorGroupViewSettingsCommand", [
    "dojo/_base/declare",

    "dijit/Destroyable",

    "epi/shell/command/OptionCommand",
    "./VisitorGroupViewSettingsModel",

    "epi/i18n!epi/cms/nls/episerver.cms.widget.visitorgroupselector"
], function (
    declare,
    Destroyable,
    OptionCommand,
    VisitorGroupViewSettingsModel,
    res) {

    return declare([OptionCommand, Destroyable], {
        // summary:
        //      Command for the visitor groups view settings
        // tags: internal

        iconClass: "epi-iconUsers",
        model: null,
        optionsProperty: "options",
        property: "selectedGroup",
        optionsLabel: res.header,

        postscript: function () {
            this.inherited(arguments);

            this.set("model", this.model || new VisitorGroupViewSettingsModel());
            this.set("label", this.model.tooltip);

            this.set("active", !!this.model.selectedGroup);

            var self = this;
            this.own(this.model.watch("tooltip", function (property, oldValue, newValue) {
                self.set("label", newValue);
            }));

            this.own(this.model.watch("selectedGroup", function (property, oldValue, newValue) {
                self.set("active", !!newValue);
            }));
        }
    });
});
