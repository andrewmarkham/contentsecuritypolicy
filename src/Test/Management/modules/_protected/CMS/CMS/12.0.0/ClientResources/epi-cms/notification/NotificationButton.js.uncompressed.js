define("epi-cms/notification/NotificationButton", [
    "dojo/_base/declare",
    "dojo/on",
    "epi/shell/widget/DeferredDropDownButton",
    "epi/shell/widget/_ButtonBadgeMixin",
    "./NotificationList"
], function (
    declare,
    on,
    DeferredDropDownButton,
    _ButtonBadgeMixin,
    NotificationList
) {
    return declare([DeferredDropDownButton, _ButtonBadgeMixin], {
        // summary:
        //      Button that opens a notification list
        // tags:
        //      internal

        // dropDownPosition: [const] String[]
        //		This variable controls the position of the drop down.
        dropDownPosition: ["below-alt", "below"],

        // showLabel: [public] Boolean
        //      Flag which indicates if the label should be shown
        showLabel: false,

        postMixInProperties: function () {

            this.inherited(arguments);

            //Add badgeValue attr to existing modelbinding map in _CommandModelBindingMixin
            if (this.modelBindingMap) {
                this.modelBindingMap.badgeValue = ["badgeValue"];
            }

            this.dropDown = this.dropDown || new NotificationList();

            this.own(
                on(this.dropDown, "change", function () {
                    this.closeDropDown(true);
                }.bind(this), true)
            );
        },

        closeDropDown: function () {
            this.inherited(arguments);
            this.dropDown.model.markAllAsRead();
        }
    });
});
