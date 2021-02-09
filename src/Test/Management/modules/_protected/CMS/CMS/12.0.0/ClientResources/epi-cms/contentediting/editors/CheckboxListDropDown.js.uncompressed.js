define("epi-cms/contentediting/editors/CheckboxListDropDown", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",

    "dojox/html/entities",

    "epi/epi",

    // Resources
    "epi/i18n!epi/nls/episerver.shared.action",
    // CheckboxList
    "./CheckboxList",

    // Parent class and mixins
    "dijit/form/_FormValueWidget",
    "epi/shell/widget/DeferredDropDownButton",

    // Widgets in template
    "dijit/form/ToggleButton"
],
function (
    declare,
    lang,
    on,

    entities,

    epi,

    // Resources
    localizations,
    // CheckboxList
    CheckboxList,

    // Parent class and mixins
    _FormValueWidget,
    DeferredDropDownButton
) {
    return declare([DeferredDropDownButton, _FormValueWidget], {
        // summary:
        //      Drop down button for the checkbox list
        // tags:
        //      internal

        value: null,

        // store: [public] Store
        //      A store to query for the list of options.
        store: null,

        // sort: [public] Object
        //      How the items are sorted in the drop down.
        sort: null,

        // query: [public] Object
        //      A query to use when fetching items from the store.
        query: null,

        // enableSelectAll: [public] Boolean
        //      Enable/Disable the possibility to select all values (empty array)
        enableSelectAll: true,

        // selectAllText: [public] String
        //      The text to display for the select all if enabled
        selectAllText: localizations.selectall,

        // header: [protected] String
        //      A string that will be displayed in the header of the selector.
        header: localizations.select,

        buildRendering: function () {
            this.own(
                this.dropDown = new CheckboxList({
                    baseClass: "dijitMenu",
                    header: this.header,
                    enableSelectAll: this.enableSelectAll,
                    selectAllText: this.selectAllText,
                    onExecute: function () {
                        // Override the onExecute method to stop the popup
                        // to close the drop down when an item is selected
                    }
                }),
                on(this.dropDown, "change", lang.hitch(this, function (e) {
                    this.set("value", e.value, true);
                }), true)
            );
            this.inherited(arguments);
        },

        startup: function () {
            if (this._started) {
                return;
            }
            this.inherited(arguments);

            this.dropDown.startup();

            // Set initial value to null if no value has been specified and default values are enabled
            // Set the value after the widget has started to avoid setting the label twice
            // once from the value property setter and one time from the _CssStateMixin
            if (this.enableSelectAll && !this.value) {
                this.set("value", null);
            }
        },

        compare: function (value1, value2) {
            // summary:
            //      Compare two values (as returned by get("value") for this widget).
            // tags:
            //      protected
            return epi.areEqual(value1, value2) ? 0 : -1;
        },

        loadAndOpenDropDown: function () {
            // summary:
            //      Opens the drop down and refreshes the content.
            // returns: Promise
            //      Promise for the drop down widget that resolves when
            //      the drop down is created and loaded.
            // tags:
            //      protected
            var args = arguments;

            //Refresh the drop down before opening it
            var promise = this.dropDown.refresh();

            return promise.then(lang.hitch(this, function () {
                return this.inherited(args);
            }));
        },

        isLoaded: function () {
            // summary:
            //      Make sure the drop down is always considered not loaded
            //      if we have defaultValue enabled, to keep the auto focus
            //      on defaultValue working with the dropDown list
            // tags:
            //      protected
            if (this.enableSelectAll) {
                return false;
            }
            return this.inherited(arguments);
        },

        _getQueryAttr: function () {
            return this.query || {};
        },

        _setQueryAttr: function (value) {
            this._set("query", value);
            if (this.dropDown) {
                this.dropDown.set("query", value);
            }
        },

        _setStoreAttr: function (store) {
            this._set("store", store);
            if (this.dropDown) {
                this.dropDown.set("store", store);
            }
        },

        _setLabelAttr: function (value) {
            // Override the default set label and encode all values before passing them to the drop down
            this.inherited(arguments, [entities.encode(value || "")]);
        },

        _setValueAttr: function (value, internal) {

            !internal && this.dropDown && this.dropDown.set("selectedItems", value);

            this.inherited(arguments);
        }
    });
});
