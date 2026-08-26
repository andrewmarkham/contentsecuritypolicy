define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "epi",
        "epi/dependency",
        "epi/shell/command/_Command",
        "epi/shell/widget/dialog/Dialog",
        "epi/shell/TypeDescriptorManager",
        //"geta-epi-indexcontentinfind/widget/IndexContentInFindInfo"
],
    function (
        declare,
        lang,
        epi,
        dependency,
        _Command,
        Dialog,
        TypeDescriptorManager,
        //IndexContentInFindInfo
    ) {
        return declare("alloy/command/_ContentOverrideCommandMixin", [_Command], {
            canExecute: true,
            includeDescendants: false,
            force: false,
            resources: null,

            _execute: function () {

                /*
                var storeRegistry = dependency.resolve("epi.storeregistry");
                var store = storeRegistry.get("indexcontentstore");
                var contentData = this.model.contentData;

                var dialogContent = new IndexContentInFindInfo({
                    recursive: this.includeDescendants
                });

                dialogContent.startup();

                var dialog = new Dialog({
                    defaultActionsVisible: false,
                    focusActionsOnLoad: true,
                    destroyOnHide: true,
                    dialogClass: "epi-dialog-indexContentInFind",
                    title: this.resources.label,
                    content: dialogContent
                });

                dialog.definitionConsumer.add({
                    name: "close",
                    label: epi.resources.action.close,
                    action: dialog.onCancel
                });

                dialog.show();

                store.put({
                    'contentLink': contentData.contentLink,
                    'includeDescendants': this.includeDescendants,
                    'force': this.force
                }).then(lang.hitch(this, function (response) {
                    dialog.hide();

                    dialogContent = new IndexContentInFindInfo({
                        recursive: this.includeDescendants
                    });

                    dialogContent.startup();
                    dialogContent.showResult(response);

                    dialog = new Dialog({
                        defaultActionsVisible: false,
                        focusActionsOnLoad: true,
                        destroyOnHide: true,
                        dialogClass: "epi-dialog-indexContentInFind",
                        title: this.resources.label,
                        content: dialogContent
                    });

                    dialog.definitionConsumer.add({
                        name: "close",
                        label: epi.resources.action.close,
                        action: dialog.onCancel
                    });

                    dialog.show();
                }), lang.hitch(this, function (err) {
                    window.console && console.log(err);
                }));*/
            }
        });
    });