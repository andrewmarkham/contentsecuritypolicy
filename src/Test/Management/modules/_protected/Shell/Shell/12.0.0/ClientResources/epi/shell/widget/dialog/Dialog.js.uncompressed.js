define("epi/shell/widget/dialog/Dialog", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/promise/all",

    "epi",
    "epi/shell/widget/dialog/_DialogBase",
    "epi/shell/widget/_ActionConsumerWidget",
    "epi/shell/widget/Toolbar",
    "epi/shell/widget/ToolbarSet"
], function (
    array,
    declare,
    lang,
    domClass,
    domStyle,
    promiseAll,

    epi,
    _DialogBase,
    _ActionConsumerWidget,
    Toolbar,
    ToolbarSet
) {

    return declare([_DialogBase, _ActionConsumerWidget], {
        // summary:
        //		A modal dialog widget.
        //
        // tags:
        //      public

        // confirmActionText: [public] String
        //		Label to be displayed for the confirm (positive) action.
        confirmActionText: epi.resources.action.ok,

        // cancelActionText: [public] String
        //		Label to be displayed for the cancel (negative) action.
        cancelActionText: epi.resources.action.cancel,

        // contentClass: [protected] String
        //		Class to apply to the container DOMNode of the dialog.
        contentClass: "",

        // dialogClass: [protected] String
        //		Class to apply to the root DOMNode of the dialog. Defaults to "epi-dialog-landscape".
        dialogClass: "epi-dialog-landscape",

        // defaultActionsVisible: [public] Boolean
        //		Flag which indicates whether the default confirm and cancel
        //		actions should be visible. This can only be set in the constructor.
        defaultActionsVisible: true,

        // setFocusOnConfirmButton: [public] Boolean
        //		Flag which indicates whether the Ok button need to be set as focused
        setFocusOnConfirmButton: true,

        _preferredHeight: 0,

        _validators: null,

        _okButtonName: "ok",
        _cancelButtonName: "cancel",

        postMixInProperties: function () {
            // summary:
            //		Initiates collections.
            // tags:
            //		protected
            this.inherited(arguments);

            this._validators = [];

            if (this.content && this.content.onSubmit) {
                this.connect(this.content, "onSubmit", this._onSubmit);
            }
        },

        postCreate: function () {
            // summary:
            //    Post widget creation.
            //
            // tags:
            //    public

            this.inherited(arguments);
            this.set("definitionConsumer", new ToolbarSet({ baseClass: "dijitDialogPaneActionBar", layoutContainerClass: Toolbar }, this.actionContainerNode));
        },

        _size: function () {
            var preferredHeight = this.get("_preferredHeight");

            if (preferredHeight) {
                // Rig the containerNode style to get the sizing algorithm to take css-class set height into account
                domStyle.set(this.containerNode, {
                    minHeight: preferredHeight + "px",
                    maxHeight: preferredHeight + "px"
                });
            }

            this.inherited(arguments);

            // Remove the rigging to get the resulting sizing to apply
            domStyle.set(this.containerNode, { minHeight: "", maxHeight: "" });

            // The dialog implementation explicitly sets width and height to auto which overrides
            // any explicit width and height set in css classes.
            array.forEach(["height", "width"], function (prop) {
                if (this[prop] === "auto") {
                    this[prop] = "";
                }
            }, this.containerNode.style);

        },

        addValidator: function (/*function */validator) {
            // summary:
            //      Adds a validator to the validators collection.
            //      Each validator should be a function that returns a Deferred object
            this._validators.push(validator);
        },

        getActions: function () {
            // summary:
            //      Overridden from _ActionConsumer mixin to assemble the action collection
            // returns:
            //		A collection of action definitions that can be added to the action pane.
            // tags:
            //      protected

            var buttons = this.inherited(arguments);

            if (this.defaultActionsVisible) {

                var okButton = {
                        name: this._okButtonName,
                        label: this.confirmActionText,
                        title: null,
                        settings: { type: "submit" }
                    },

                    cancelButton = {
                        name: this._cancelButtonName,
                        label: this.cancelActionText,
                        title: null,
                        action: lang.hitch(this, this._onCancel)
                    };

                if (this.setFocusOnConfirmButton) {
                    okButton.settings["class"] = "Salt";
                } else {
                    cancelButton.settings = { "class": "Salt", firstFocusable: true };
                }

                buttons.push(okButton, cancelButton);
            }

            return buttons;
        },

        _onCancel: function () {
            // summary:
            //		Called when user has triggered the dialog's cancel action.
            // type:
            //		callback

            this.onCancel();
        },

        _onSubmit: function () {
            // summary:
            //		Called when user has triggered the dialog's submit action.
            // type:
            //      callback

            // regular validation first
            if (!this.validate()) {
                return;
            }

            // if no custom validators - continue with submit
            if (this._validators.length === 0) {
                this.inherited(arguments);
                return;
            }

            // getting deferreds for each validator
            var validationDeferreds = array.map(this._validators, function (item) {
                return item();
            });

            var submitArgs = arguments;
            var deferred = new promiseAll(validationDeferreds);
            deferred.then(lang.hitch(this, function (results) {
                // if any of the validators fail - do not continue
                if (array.some(results, function (result) {
                    return !result[0];
                })) {
                    return;
                }
                // proceed with submit
                this.inherited(submitArgs);
            }));

        },

        _setContentClassAttr: function (value) {
            domClass.remove(this.containerNode, this.contentClass);
            this._set("contentClass", value);
            domClass.add(this.containerNode, this.contentClass);
        },

        _get_preferredHeightAttr: function () {
            if (!!this.dialogClass && this._preferredHeight < 25) {
                this._preferredHeight = domStyle.get(this.containerNode, "height");
            }

            return this._preferredHeight;
        }
    });
});
