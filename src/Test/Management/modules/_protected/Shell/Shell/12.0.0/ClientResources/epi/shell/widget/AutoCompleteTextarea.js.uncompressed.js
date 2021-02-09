define("epi/shell/widget/AutoCompleteTextarea", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/keys",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "dijit/form/_FormValueWidget",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/_TextBoxMixin",
    "dgrid/OnDemandList",
    "dgrid/Selection",
    "epi/debounce",
    "put-selector/put",
    "dijit/popup",
    "epi/shell/dgrid/selection/Extensions",
    // Widgets in template
    "dijit/form/Textarea"
], function (
    declare,
    lang,
    keys,
    domStyle,
    domGeometry,
    _FormValueWidget,
    _WidgetsInTemplateMixin,
    _TextBoxMixin,
    OnDemandList,
    Selection,
    debounce,
    put,
    popup,
    SelectionExtensions
) {

    // Create a custom list class for the suggestion list.
    var SuggestionList = declare([OnDemandList, Selection, SelectionExtensions]);

    return declare([_FormValueWidget, _WidgetsInTemplateMixin], {
        // tags:
        //      internal

        templateString: "<div><div data-dojo-type='dijit/form/Textarea' data-dojo-attach-point='_textArea, focusNode'></div><div data-dojo-attach-point='_listNode'></div></div>",
        baseClass: "epi-autocomplete-textarea",
        value: null,
        store: null,
        placeholder: "",

        // searchProperty: [public] String
        //      The name of the query parameter to use when querying for usernames.
        searchProperty: "query",

        // tagProperty: [public] String
        //      The name of the property to use as the data source for the tag value. This will be
        //      inserted into the text area.
        tagProperty: "",

        // displayProperty: [public] String
        //      The name of the property to use as the data source for the display value. This will
        //      be shown in the list.
        displayProperty: "",

        // noDataMessage: [public] String
        //      The message to show when there are no suggestions that match the tag.
        noDataMessage: "",

        // Override _FormWidgetMixin mapping id to this.focusNode since focus node is also a widget
        // and changing its id will break widget destruction.
        _setIdAttr: "domNode",

        buildRendering: function () {
            this.inherited(arguments);

            var textarea = this._textArea;

            this.own(
                textarea.on("keyup", lang.hitch(this, "_onKeyUp")),
                textarea.on("keydown", lang.hitch(this, "_onKeyDown")),
                textarea.on("change", lang.hitch(this, "_handleOnChange")),
                // Close the popup when the widget loses focus.
                this.on("blur", this._closePopup.bind(this)),

                this._selectList = new SuggestionList({
                    className: "epi-autocomplete-list",
                    selectionMode: "single",
                    renderRow: this._renderRow.bind(this)
                }, this._listNode),

                this._selectList.on(".dgrid-row:click", this._insertSelection.bind(this)),
                this._selectList.on("dgrid-refresh-complete", lang.hitch(this._selectList, "moveSelectionDown"))
            );

            //Move the popup content off screen
            popup.moveOffScreen(this._selectList);
        },

        startup: function () {
            this.inherited(arguments);

            this._selectList.startup();
        },

        focus: function () {
            // summary:
            //		Put focus on this widget
            // remarks:
            //      Check if the widget is focusable before trying to set focus
            // tags:
            //      public overridden
            if (this.isFocusable()) {
                this.inherited(arguments);
            }
        },

        setCaretLast: function () {
            // summary:
            //      Set caret last
            // tags:
            //      public
            if (this._textArea.value) {
                _TextBoxMixin.selectInputText(this._textArea.domNode, this._textArea.value.length);
            }
        },

        reset: function () {
            this._textArea.reset();
        },

        _setIntermediateChangesAttr: function (intermediateChanges) {
            // summary:
            //      Sets whether the textarea should fire onChange events for each value change.
            // tags:
            //      protected

            this._set("intermediateChanges", intermediateChanges);
            this._textArea.set("intermediateChanges", intermediateChanges);
        },

        _setNoDataMessageAttr: function (message) {
            this._selectList.set("noDataMessage", message);
        },

        _setPlaceholderAttr: function (placeholder) {
            // summary:
            //      Sets the hint text to display in the textarea.
            // tags:
            //      protected

            this._set("placeholder", placeholder);
            this._textArea.set("placeholder", placeholder);
        },

        _setValueAttr: function (value) {
            this._set("value", value);

            // Set the new value on the textarea and update the _resetValue
            // in order to be able to handle multiple edits
            this._textArea.set({
                value: value,
                _resetValue: value
            });
        },

        _getValueAttr: function () {
            return this._textArea.get("value");
        },

        _onKeyUp: function (e) {

            // If the store hasn't been defined do not trigger the popup
            if (!this.store) {
                return;
            }

            var key = e.keyCode;

            // Exit early if the user is navigating or if this is a modifier key event.
            switch (key) {
                // The user is navigating within the textarea.
                case keys.LEFT_ARROW:
                case keys.RIGHT_ARROW:
                case keys.HOME:
                case keys.END:
                    // Up and down will be handled by select list. (falls through)
                case keys.UP_ARROW:
                case keys.DOWN_ARROW:
                    // Determine if the key pressed is a modifier key. (falls through)
                case keys.CTRL:
                case keys.ALT:
                case keys.SHIFT:
                    return;
            }

            var textbox = this._textArea.textbox,
                caretPosition = textbox.selectionStart,
                value = textbox.value;

            // open the popup when @ is pressed, but only if it is at the beginning or trailing a space
            if (value[caretPosition - 1] === "@" && (caretPosition === 1 || /\s/.test(value[caretPosition - 2]))) {
                this._tagStart = caretPosition - 1;
                this._openPopup();
            }

            if (this._isPopupOpen) {
                var isEscape = key === keys.ESCAPE,
                    isAtRemoved = typeof this._tagStart == "number" && value[this._tagStart] !== "@";

                // Close the popup if ESC is pressed or if the @ has been removed.
                if (isEscape || isAtRemoved) {
                    this._closePopup();
                    return;
                }

                // Insert the selected list value on enter.
                if (key === keys.ENTER || key === keys.TAB) {
                    this._insertSelection();
                    return;
                }

                // Update the end of the tag to be the current caret position.
                this._tagEnd = caretPosition;

                // Update the query with the current tag value.
                var query = value.substring(this._tagStart + 1, caretPosition);
                this._setQuery(query);
            }
        },

        _setQuery: function (query) {
            // summary:
            //      Sets the query for the suggestion list, debouncing if needed.
            // tags:
            //      private

            // Trim whitespace from the query to ensure we don't send blank queries to the store.
            query = (query || "").trim();

            // Clear suggestion list and do an early exit if the query string is null or empty.
            if (!query) {
                this._selectList.set("store", null);
                return;
            }

            // Configure the debounced query function if it is not configured already.
            if (!this._queryFunction) {
                var queryCallback = function (query) {
                    this._selectList.set("store", this.store, query);
                };
                this._queryFunction = debounce(queryCallback.bind(this), null, 200);
            }

            // Create a query object that uses the search property.
            var queryObject = {};
            queryObject[this.searchProperty] = query;

            // Set the query.
            this._queryFunction(queryObject);
        },

        _onKeyDown: function (e) {
            var selectList = this._selectList,
                key = e.keyCode;

            if (this._isPopupOpen) {
                switch (key) {
                    case keys.UP_ARROW:
                        // Move the selection up in the suggestion list and prevent it from moving
                        // in the text area.
                        e.preventDefault();
                        selectList.moveSelectionUp();
                        break;
                    case keys.DOWN_ARROW:
                        // Move the selection down in the suggestion list and prevent it from moving
                        // in the text area.
                        e.preventDefault();
                        selectList.moveSelectionDown();
                        break;
                    case keys.ESCAPE:
                    case keys.ENTER:
                    case keys.TAB:
                        // Prevent the default browser behaviour for escape (clears textarea in IE),
                        // enter (new line in textarea), and tab (focus next element) when the popup
                        // is open.
                        e.preventDefault();
                        break;
                }

                // Exit early so as not to emit a save event when the suggestion list is open.
                return;
            }

            // Emit a save event when the enter key is pressed. Enter key plus shift modifier should
            // append a new line as usual.
            if (key === keys.ENTER && !e.shiftKey) {
                this.emit("save");
                e.preventDefault();
            }
        },

        _insertSelection: function () {
            var textbox = this._textArea.textbox,
                selectList = this._selectList,
                selectionEnd = this._tagEnd,
                value = textbox.value;

            //Insert the selected value
            var selection = null;
            for (var id in selectList.selection) {
                if (selectList.selection[id]) {
                    selection = selectList.row(id).data;
                    break;
                }
            }

            if (!selection) {
                this._closePopup();
                return;
            }

            var selectedValue = selection[this.tagProperty];

            //Depending on whether trailing char is a space or not we either
            //add a space or modify the caret position after inserting the value
            var spaceAdd = "";
            var caretAdd = 0;
            (value.charAt(selectionEnd) !== " " ? spaceAdd = " " : caretAdd = 1);

            var valueToInsert = value.slice(0, this._tagStart + 1) + selectedValue + spaceAdd;
            var newCaretPos = valueToInsert.length + caretAdd;
            valueToInsert += value.slice(selectionEnd);

            textbox.value = valueToInsert;

            //Set the caret position right after inserted value
            textbox.setSelectionRange(newCaretPos, newCaretPos);
            this._closePopup();
        },

        _renderRow: function (item) {
            // summary:
            //      Creates a row for the grid setting the content to the display property, or
            //      falling back to the tag property if the display property is null or whitespace.
            // tags:
            //      private

            return put("div", "" + item[this.displayProperty]);
        },

        _openPopup: function () {
            // summary:
            //      Opens the suggestion list as a popup and positions it relative to the textarea.
            // tags:
            //      private

            var selectList = this._selectList,
                contentBox = domGeometry.getContentBox(this.domNode),
                closeFunction = this._closePopup.bind(this);

            // Set the width of the popup to be the same as the text area.
            domStyle.set(selectList.domNode, "width", contentBox.w + "px");
            popup.open({
                parent: this,
                popup: selectList,
                around: this.domNode,
                onExecute: closeFunction,
                onCancel: closeFunction
            });
            this._isPopupOpen = true;
        },

        _closePopup: function () {
            // summary:
            //      Closes the suggestion list popup and clears any suggestion data.
            // tags:
            //      private

            this._isPopupOpen = false;
            this._tagStart = null;
            this._tagEnd = null;
            // Set store to null to clear results until next query.
            this._selectList.set("store", null);
            popup.close(this._selectList);
        }
    });
});
