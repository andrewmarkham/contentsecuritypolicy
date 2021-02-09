define("epi-cms/widget/ViewSwitchButton", [
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/topic",

    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_CssStateMixin",
    "dijit/form/Button"
], function (
    declare,
    domClass,
    topic,

    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _CssStateMixin,
    Button
) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
        // summary:
        //      Constructs the two buttons used to switch between two views.
        // tags:
        //      internal

        baseClass: "epi-viewSwitchButton",

        templateString: "<span data-dojo-attach-point=\"stateNode\" class=\"epi-groupedButtonContainer\"></span>",

        _state: "",

        buildRendering: function () {
            this.inherited(arguments);

            this._firstButton = this._createButton();
            this._secondButton = this._createButton();

            this.set("isFirstButtonActive", true);
        },

        _createButton: function (value) {
            var button = new Button({
                showLabel: false,
                onClick: function () {
                    // This action may tear the current view down, including the button it self.
                    // Therefore it should be done when the event chain finished.
                    if (domClass.contains(this.domNode, "loading")) {
                        return;
                    }

                    domClass.toggle(this.domNode, "loading", true);
                    setTimeout(function () {
                        topic.publish("/epi/cms/action/switcheditmode", null, null, true);
                    }, 0);
                }
            });
            button.placeAt(this.domNode);
            return button;
        },

        _setFirstButtonSettingsAttr: function (value) {
            this._firstButton.set(value);
        },

        _setSecondButtonSettingsAttr: function (value) {
            this._secondButton.set(value);
        },

        _setIsFirstButtonActiveAttr: function (value) {
            this._firstButton.set("disabled", value);
            this._secondButton.set("disabled", !value);

            domClass.toggle(this._firstButton.domNode, "epi-button--pressed", value);
            domClass.toggle(this._secondButton.domNode, "epi-button--pressed", !value);

            domClass.toggle(this._firstButton.iconNode, "epi-icon--active", value);
            domClass.toggle(this._secondButton.iconNode, "epi-icon--active", !value);
        },

        _setStateAttr: function (value) {
            this.inherited(arguments);

            if (value === "") {
                domClass.toggle(this._firstButton.domNode, "loading", false);
                domClass.toggle(this._secondButton.domNode, "loading", false);
            }
        },

        _getStateAttr: function () {
            return this._state;
        }
    });
});
