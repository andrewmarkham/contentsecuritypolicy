require({cache:{
'url:epi-cms/activity/templates/ActivityCommentForm.html':"<div class=\"epi-activity-comment-form\">\r\n    <div class=\"epi-activity-comment__message\"\r\n         data-dojo-attach-point=\"commentNode\"></div>\r\n    <div data-dojo-attach-point=\"_commentTextarea, focusNode\"\r\n         data-dojo-attach-event=\"onChange:_commentChanged, onFocus: _commentFocused\"\r\n         data-dojo-props=\"intermediateChanges: true, searchProperty: 'name', tagProperty: 'name', displayProperty: 'displayName'\"\r\n         data-dojo-type=\"epi/shell/widget/AutoCompleteTextarea\" class=\"epi-autocomplete-textarea--chat-icon\"></div>\r\n    <div class=\"epi-activity-comment-form__buttons dijitHidden\"\r\n         data-dojo-attach-point=\"_commentFormButtons\">\r\n        <span class=\"epi-activity-feed__error-message\"\r\n              data-dojo-attach-point=\"_errorMessage\"></span>\r\n        <button data-dojo-type=\"dijit/form/Button\"\r\n                class=\"epi-primary\"\r\n                data-dojo-attach-event=\"onClick:_postComment\"\r\n                data-dojo-props=\"disabled: true\"\r\n                data-dojo-attach-point=\"_postButton\"></button>\r\n        <button data-dojo-type=\"dijit/form/Button\"\r\n                class=\"epi-chromeless epi-chromeless--text-only\"\r\n                data-dojo-attach-point=\"_resetButton\"\r\n                data-dojo-attach-event=\"onClick: _reset\"></button>\r\n    </div>\r\n    <button data-dojo-type=\"dijit/form/Button\"\r\n            class=\"epi-chromeless epi-chromeless--text-only epi-text--small\"\r\n            data-dojo-attach-point=\"_editButton\"\r\n            data-dojo-attach-event=\"onClick: _toggleWriteComment\"></button>\r\n</div>\r\n"}});
define("epi-cms/activity/ActivityCommentForm", [
    "dojo/_base/declare",
    "dojo/dom-class",
    // Parent class and mixins
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_FocusMixin",
    "epi/shell/widget/_ModelBindingMixin",
    // Resources
    "dojo/text!./templates/ActivityCommentForm.html",
    // Widgets in template
    "epi/shell/widget/AutoCompleteTextarea",
    "dijit/form/Button"
],
function (
    declare,
    domClass,
    // Parent class and mixins
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _FocusMixin,
    _ModelBindingMixin,
    // Resources
    template
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _FocusMixin, _ModelBindingMixin], {
        // summary:
        //      A widget for the activity comment form
        // tags:
        //      internal

        // templatePath: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // readOnly: [public] boolean
        //      A flag indicating if the widget is read only
        readOnly: null,

        // hideOnPost: [public] boolean
        //      Hide buttons when post is triggered
        hideOnPost: null,

        // isEditEnabled: [public] boolean
        //      Show/Hide the Edit button depending on the value
        isEditEnabled: true,

        // errorMessage: [public] String
        //      Error message when post fails
        errorMessage: "",

        // Declare view model binding
        modelBindingMap: {
            readOnly: ["readOnly"],
            editLabel: ["editLabel"],
            isEditEnabled: ["isEditEnabled"],
            hideOnPost: ["hideOnPost"],
            errorMessage: ["errorMessage"],
            placeholderText: ["placeholder"],
            sendLabel: ["sendLabel"],
            resetLabel: ["resetLabel"],
            message: ["value"],
            formattedMessage: ["displayValue"],
            noNotificationUserMessage: ["noNotificationUserMessage"],
            notificationUserStore: ["notificationUserStore"]
        },

        postCreate: function () {
            // summary:
            //      Set the widget state after the view is available.
            // tags:
            //      protected

            this.inherited(arguments);

            this._commentChanged(this.get("value"));

            this._commentTextarea.on("save", this._postComment.bind(this));
        },

        _setModelAttr: function (model) {
            this.inherited(arguments);

            //If the model is not readOnly and there is an old value
            //show the forms buttons
            this._toggleFormsButtonVisibility(!model.readOnly && this.get("value") !== "");
        },

        _setErrorMessageAttr: function (errorMessage) {
            this._set("errorMessage", errorMessage);
            this._errorMessage.textContent = errorMessage;
        },

        _setSendLabelAttr: function (sendLabel) {
            this._set("sendLabel", sendLabel);
            if (sendLabel) {
                this._postButton.set("label", sendLabel);
            }
        },

        _setResetLabelAttr: function (resetLabel) {
            this._set("resetLabel", resetLabel);
            if (resetLabel) {
                this._resetButton.set("label", resetLabel);
            }
        },

        _setEditLabelAttr: function (editLabel) {
            this._set("editLabel", editLabel);
            if (editLabel) {
                this._editButton.set("label", editLabel);
            }
        },

        _setIsEditEnabledAttr: function (isEditEnabled) {
            this._set("isEditEnabled", isEditEnabled);

            if (this._editButton) {
                domClass.toggle(this._editButton.domNode, "dijitHidden", !this.isEditEnabled);
            }
        },

        _setNoNotificationUserMessageAttr: function (message) {
            this._commentTextarea.set("noDataMessage", message);
        },

        _setNotificationUserStoreAttr: function (store) {
            this._set("notificationUserStore", store);
            this._commentTextarea.set("store", store);
        },

        _setPlaceholderAttr: function (placeholder) {
            this._commentTextarea.set("placeholder", placeholder);
        },

        _setReadOnlyAttr: function (readOnly) {
            this._set("readOnly", readOnly);

            domClass.toggle(this._commentTextarea.domNode, "dijitHidden", this.readOnly);

            if (this.readOnly) {
                this._toggleFormsButtonVisibility(false);
            }
        },

        _setValueAttr: function (value) {
            this._set("value", value);
            this._commentTextarea.set("value", value);
        },

        _setDisplayValueAttr: function (valuePromise) {
            valuePromise.then(function (value) {
                this.commentNode.innerHTML = value;
            }.bind(this));
        },

        _getValueAttr: function () {
            return this._commentTextarea.get("value");
        },

        _commentChanged: function (comment) {
            // Disable the post button if the comment is empty or hasn't changed
            this._started && this._postButton.set("disabled", !comment || comment === this.model.message);
        },

        _commentFocused: function () {
            //When the user set the focus to the text area we show the post/cancel buttons
            this._toggleFormsButtonVisibility(true);
        },

        _reset: function () {
            // summary:
            //      reset form
            // tags:
            //      private

            //Early exit if the widget is destroyed.
            if (this._destroyed) {
                return;
            }
            this.hideOnPost && this._toggleWriteComment();
            this.model.set("errorMessage", "");
            this._commentTextarea.reset();

            this._toggleFormsButtonVisibility(false);
        },

        _postComment: function () {
            // summary:
            //      Save text area value if a save function is defined
            // tags:
            //      private

            var value = this._commentTextarea.get("value");

            if (value.trim().length === 0) {
                return;
            }

            // Do an early exit if the message is unchanged, or posting is disabled.
            if (value === this.model.message || this._postButton.get("disabled")) {
                this._reset();
                return;
            }

            // Disable posting so the user doesn't accidentally send multiple posts if the server is slow.
            this._postButton.set("disabled", true);

            // Delay so the user doesn't see the spinner directly if the server is fast.
            var delay = 10;

            this.defer(function () {
                domClass.add(this._postButton.domNode, "epi-button--loading");
            }.bind(this), delay);

            this.model.save(value)
                .then(this._reset.bind(this))
                .always(function () {
                    // When we add comments or replies the grid is refreshed and the widget is destroyed.
                    if (!this._destroyed) {
                        this._postButton.set("disabled", false);
                        domClass.remove(this._postButton.domNode, "epi-button--loading");
                    }
                }.bind(this));
        },

        _toggleWriteComment: function () {
            // summary:
            //      Toggles write comment area
            // tags:
            //      private

            domClass.toggle(this._commentTextarea.domNode, "dijitHidden");
            domClass.toggle(this._editButton.domNode, "dijitHidden");
            domClass.toggle(this.commentNode, "dijitHidden");

            // set focus to the comment text area if it is visible
            if (this._commentTextarea.isFocusable()) {
                this._commentTextarea.focus();

                //set caret last in the textarea
                this._commentTextarea.setCaretLast();
            }

            // set focus to the edit button if it is visible
            if (this._editButton.isFocusable()) {
                this._editButton.focus();
            }

        },

        _toggleFormsButtonVisibility: function (visible) {
            domClass.toggle(this._commentFormButtons, "dijitHidden", !visible);
        }

    });
});
