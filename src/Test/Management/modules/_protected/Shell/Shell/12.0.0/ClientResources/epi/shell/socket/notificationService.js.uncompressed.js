define("epi/shell/socket/notificationService", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/shell/widget/dialog/Confirmation"
], function (
    declare,
    lang,
    Confirmation
) {
    var currentDialog,
        Alert = declare([Confirmation], {
            getActions: function () {
                return [{
                    name: this._okButtonName,
                    label: this.buttonOk,
                    title: null,
                    action: lang.hitch(this, this._onCancel)
                }];
            }
        });

    return {
        // summary:
        //      Service handling showing notifications in the UI.
        // tags: internal

        show: function (notification) {
            currentDialog && currentDialog.hide();
            currentDialog = new Alert(notification);

            currentDialog.show();
        }
    };
});
