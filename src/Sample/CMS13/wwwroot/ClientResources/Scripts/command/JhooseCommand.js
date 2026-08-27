define([
        "dojo/_base/declare",
        "epi/shell/command/_Command",

        "epi/shell/widget/dialog/Dialog",
        "dijit/form/TextBox"

        //"alloy/command/_ContentOverrideCommandMixin",
        //"epi/i18n!epi/cms/nls/jhoose.epi.security.contentoverridecommand"
],
    function(
        declare,
        _ContentOverrideCommandMixin,

        Dialog, 
        TextBox
        //resources
    ) {
        return declare("alloy/command/ContentOverrideCommand", 
            [_ContentOverrideCommandMixin],
            {
            name: "ContentOverrideCommand",
            label: "Jhoose Security Content Override", //resources.label,
            tooltip: "Overrides security settings for this content item",//resources.tooltip,
            //includeDescendants: false,
            //force: true,
            canExecute: true,
            order: 10000,
            constructor: function() {
                //var _1b = _18.resolve("epi.storeregistry");
                //this.store = this.store || _1b.get("epi-contentgraph.contentindexing");
            },
            _execute: function() {
                //alert("this.getCurrentContext(): " + JSON.stringify(this.model));

                var dialog = new Dialog({
                    title: "Jhoose Security Content Override",
                    heading: "heading",
                    content: new TextBox({
                    label: "Text 1",
                    _type: "field"
                    }),
                    description: "description",
                    iconClass: "epi-iconDownload"
                });
                dialog.on("execute", function () {
                    // run custom needed logic
                    dialog.hide();
                });
                dialog.show();
                //_15(this.getCurrentContext(), _16.hitch(this, function(_1c) {
                //    _15(this.store.executeMethod("SynchronizeContent", null, _1c.id), this.updateSyncStatus.bind(this));
                //}));
            },
            _onModelChange: function() {
                //this.updateSyncStatus();
            }
            //resources: resources
        });
    });