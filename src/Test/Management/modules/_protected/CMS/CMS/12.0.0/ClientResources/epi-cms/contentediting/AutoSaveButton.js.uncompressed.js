define("epi-cms/contentediting/AutoSaveButton", [
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/string",
    "dijit/_WidgetBase",
    "epi/datetime",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons.autosave"
], function (
    array,
    connect,
    declare,
    lang,
    domClass,
    domStyle,
    string,
    _WidgetBase,
    epiDate,
    res) {

    var ButtonStates = { Saving: 0, Offline: 1, Saved: 2 };

    return declare([_WidgetBase], {
        // tags:
        //      internal


        _state: null,

        button: undefined,

        lastSaved: undefined,

        model: null,

        _currentlySavingClass: "epi-autosave-saving",
        _errorClass: "epi-autosave-error",
        _savedClass: "epi-autosave-saved",
        _hoverClass: "epi-autosave-hover",

        _modelHandles: null,
        _updateTimeHandle: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            this._modelHandles = [];
        },

        postCreate: function () {
            this.inherited(arguments);

            if (!this.button) {
                return;
            }

            this.connect(this.button.domNode, "onmouseover", this._addHoverClass);
            this.connect(this.button.domNode, "onmouseout", this._removeHoverClass);
        },

        destroy: function () {
            // disconnect existing observers and events
            array.forEach(this._modelHandles, function (handle) {
                handle.unwatch();
            });

            this._updateTimeHandle && clearTimeout(this._updateTimeHandle);
            this._updateTimeHandle = null;

            this.inherited(arguments);
        },

        _setModelAttr: function (model) {

            // disconnect existing observers and events
            array.forEach(this._modelHandles, function (handle) {
                handle.unwatch();
            });

            this._set("model", model);

            // connect events
            if (model) {
                this._modelHandles = [
                    model.watch("isOnline", lang.hitch(this, "_isOnlineChanged")),
                    model.watch("lastSaved", lang.hitch(this, "_lastSavedChanged")),
                    model.watch("isSaved", lang.hitch(this, "_isSavedChanged")),
                    model.watch("isSaving", lang.hitch(this, "_isSavingChanged")),
                    model.watch("hasErrors", lang.hitch(this, "_hasErrorsChanged")),
                    model.watch("disableUndo", lang.hitch(this, this._disableUndo))
                ];

                this.set("lastSaved", model.lastSaved);

                if (this.lastSaved) {
                    this.updateButton();
                } else {
                    this._setVisibility(false);
                }
            }

        },

        _setLastSavedAttr: function (lastSaved) {
            this._set("lastSaved", lastSaved);
            this.updateLastSaveTime();
        },

        _disableUndo: function (propertyName, oldValue, value) {
            this._isUndoDisabled = value;

            // Update the button status
            this.updateButton();
        },

        _isOnlineChanged: function (name, oldVal, newVal) {

            if (newVal === oldVal) {
                return;
            }

            if (newVal) {
                this.revertToLastAutoSaveTime();
            } else {
                this.showOfflineStatus();
            }
        },

        _lastSavedChanged: function (name, oldVal, newVal) {
            this.set("lastSaved", newVal);
        },

        _isSavedChanged: function (name, wasSaved, isSaved) {
            if (isSaved) {
                this.updateLastSaveTime();
            }
        },

        _isSavingChanged: function (name, wasSaving, isSaving) {

            if (isSaving) {
                this.showSavingStatus();
            } else {
                if (!this.model.isSaved) {
                    this.revertToLastAutoSaveTime();
                }
            }
        },

        _hasErrorsChanged: function (name, valueBefore, valueNow) {
            if (valueBefore === valueNow) {
                return;
            }

            if (!valueNow) {
                this.revertToLastAutoSaveTime();
            } else {
                // publish event to show error on NotificationStatusBar
                connect.publish("/epi/cms/action/showerror");
            }
        },

        _animateSaving: function () {
            domClass.replace(this.button.domNode, this._currentlySavingClass, [this._errorClass, this._savedClass]);
            this._removeHoverClass();
        },

        _animateOffline: function () {
            domClass.replace(this.button.domNode, this._errorClass, [this._currentlySavingClass, this._savedClass]);
            this._removeHoverClass();
        },

        _animateSaved: function () {
            domClass.replace(this.button.domNode, this._savedClass, [this._currentlySavingClass, this._errorClass]);
            this._removeHoverClass();
        },

        _addHoverClass: function () {
            // summary:
            //    Show border and background for the widget
            // tags:
            //    private

            if (this._state == null || this._state === ButtonStates.Saving || this._hasDropDownOpen()) {
                return;
            }
            if (this._state === ButtonStates.Saved) {
                domClass.add(this.button.domNode, this._hoverClass);
            }

        },

        _removeHoverClass: function () {
            // summary:
            //    Hide border and background for widget
            // tags:
            //    private

            if (!this._hasDropDownOpen()) {
                domClass.remove(this.button.domNode, this._hoverClass);
            }
        },

        _updateState: function (text) {
            // summary:
            //      - Change label of button
            //      - Set disabled or not for button
            // tages:
            //      private

            this.button.set("label", text);
            this.button.set("disabled", this._isUndoDisabled || this._state !== ButtonStates.Saved);
        },

        _setVisibility: function (/* Boolean */value) {
            // summary:
            //    Sets the visibility
            // tags:
            //    private

            if (value !== this._visible) {
                this._visible = value;

                if (this.button) {
                    domStyle.set(this.button.domNode, { display: value ? "" : "none" });
                    this.button.set("itemVisibility", value && !this.button.disabled);
                    if (this.button.isInNarrowToolbar) {
                        this.onLayoutChanged();
                    }
                }
            }
        },

        onLayoutChanged: function () {
            // summary:
            //      Notify layout change when the button is toggled on or off.
            // tags:
            //      public, callback
        },

        _hasDropDownOpen: function () {
            // summary:
            //      - Check button items are expanded or not
            // tags:
            //      private

            return this.button._popupStateNode ? domClass.contains(this.button._popupStateNode, "dijitHasDropDownOpen") : false;
        },

        revertToLastAutoSaveTime: function () {
            // summary:
            //      show time of the last successful saving or blank if there wasn't one

            if (this.lastSaved === undefined) {
                this._setVisibility(false);
                return;
            }

            this.updateLastSaveTime();
        },

        updateLastSaveTime: function () {
            // summary:
            //      Update the last auto save time

            if (!this.lastSaved) {
                return;
            }

            if (!this.model.isOnline) {
                return;
            }

            this._updateTimeHandle && clearTimeout(this._updateTimeHandle);

            // Only change the time of last save when saving successful
            this._updateTimeHandle = setTimeout(lang.hitch(this, function () {
                if (this.model.isOnline) {
                    this.updateButton();
                    this._animateSaved();
                }
            }), 1000);

            this._setVisibility(true);
        },

        showSavingStatus: function () {
            // summary:
            //  Show saving status

            this._setVisibility(true);
            this._state = ButtonStates.Saving;
            this._updateState(res.savinglabel);
            this._animateSaving();
        },

        showOfflineStatus: function () {
            // summary:
            //      show offline message when cannot save to server

            this._state = ButtonStates.Offline;
            this._updateState(res.offlinelabel);
            this._animateOffline();
        },

        updateButton: function () {
            // If there is no lastSaved, e.g. user's already published the content but due to annimation
            // this method in invoked after the content has been reloaded, autosave button should be hidden.
            // In case the content has been moved to trash, autosave button should be hidden, too.
            // Also hide the autosave button when the can not be edited, i.e. read-only.
            if (!this.lastSaved || !this.model.canChangeContent() || (this.model.contentData && this.model.contentData.isDeleted)) {
                this._setVisibility(false);
                return;
            }

            if (this.model.isSaving) {
                this._state = ButtonStates.Saving;
                return;
            }

            this._state = ButtonStates.Saved;
            var template = "<span class=\"dijitReset dijitInline clearfix\">${autosavelabel} ${timestamp}</span>&nbsp;<span class=\"epi-inlineButtonLink\">${undolabel}</span>";
            var replaceMap = {
                autosavelabel: res.autosavelabel,
                undolabel: this.model.undoManager.get("hasUndoSteps") && !this._isUndoDisabled ? res.undolabel : "", //if undo is disabled hide the "Undo" text
                timestamp: epiDate.toUserFriendlyHtml(this.lastSaved, null, true)
            };
            this._updateState(string.substitute(template, replaceMap));
        }
    });
});
