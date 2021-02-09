require({cache:{
'url:epi-cms/contentediting/editors/templates/CheckboxList.html':"﻿<div class=\"epi-selector-list epi-menu--inverted\">\r\n    <div class=\"epi-menuInverted epi-invertedTooltip\">\r\n        <div class=\"epi-tooltipDialogTop\">\r\n            <span data-dojo-attach-point=\"headerNode\"></span><div class=\"dijitTooltipConnector\"></div>\r\n        </div>\r\n        <button class=\"epi-selector-list-btn epi-chromeless\" data-dojo-attach-point=\"selectAll\" data-dojo-type=\"dijit/form/ToggleButton\" data-dojo-props=\"iconClass:'dijitcheckboxicon'\"></button>\r\n        <div data-dojo-attach-point=\"separatorNode\" class=\"epi-selector-list__separator dijitHidden\"></div>\r\n        <div data-dojo-attach-point=\"listNode\"></div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/contentediting/editors/CheckboxList", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/keys",
    "dojo/when",
    "dojo/dom-class",
    "dojox/html/entities",

    "epi/epi",

    // Resources
    "dojo/text!./templates/CheckboxList.html",
    "epi/i18n!epi/shell/ui/nls/episerver.shared.action",
    // Grid
    "dgrid/OnDemandList",
    "dgrid/extensions/DijitRegistry",
    "dgrid/Keyboard",
    "dgrid/Selection",
    "dgrid/util/mouse",
    "put-selector/put",
    "epi/shell/dgrid/Focusable",
    // Parent class and mixins
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_KeyNavContainer"
], function (
    declare,
    lang,
    keys,
    when,
    domClass,
    entities,

    epi,

    // Resources
    template,
    localizations,
    // Grid
    OnDemandList,
    DijitRegistry,
    Keyboard,
    Selection,
    mouse,
    put,
    Focusable,
    // Parent class and mixins
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _KeyNavContainer
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _KeyNavContainer], {
        // summary:
        //      Checkbox list
        //
        // tags:
        //      internal

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // store: [public] Store
        //      The store that will be queried for items.
        store: null,

        // query: [public] Object
        //      A query to use when fetching items from the store.
        query: null,

        // enableSelectAll: [public] Boolean
        //      Enable/Disable the possibility to select all values (empty array)
        enableSelectAll: true,

        // selectAllText: [public] String
        //      The text to display for the select all when enabled
        selectAllText: localizations.selectall,

        // header: [protected] String
        //      A string that will be displayed in the header of the selector.
        header: localizations.select,

        _setHeaderAttr: { node: "headerNode", type: "innerText" },

        buildRendering: function () {
            // summary:
            //      Construct the UI for this widget via dijit/_TemplatedMixin with the addition
            //      of a dgrid added via code.
            // tags:
            //      protected
            this.inherited(arguments);

            this.list = new (declare([OnDemandList, DijitRegistry, Selection, Keyboard, Focusable]))({
                className: "epi-grid--no-alternating-rows epi-grid-max-height--300",
                cleanEmptyObservers: false,
                deselectOnRefresh: false,
                selectionEvents: "click",
                selectionMode: "toggle",
                query: this.get("query"),
                renderRow: this.renderRow

            }, this.listNode);

            this.list.on("change", function (e) {
                // stop the change propagation from the checkboxes in the grid
                e.stopPropagation();
            });

            // Own the list and the event handlers.
            this.own(
                this.list,
                this.list.on("dgrid-select,dgrid-deselect", lang.hitch(this, "_itemsSelected")),
                this.list.on("dgrid-refresh-complete", lang.hitch(this, "_refreshComplete")),

                // Handle key events on the list in order to manage moving focus.
                this.list.addKeyHandler(keys.UP_ARROW, lang.hitch(this, "_listNavigateUp")),
                this.list.addKeyHandler(keys.PAGE_UP, lang.hitch(this, "_listNavigateUp")),
                // Handle mouse over events on the list in order to manage moving focus.
                this.list.on(mouse.enterRow, lang.hitch(this, "_listMouseover")),

                // Handle selection of the select all option.
                this.selectAll.on("click", lang.hitch(this, "_selectAllSelected")),
                // Handle key events on the default option in order to manage moving focus.
                this.selectAll.on("keypress", lang.hitch(this, "_selectAllKeypress")),
                // Handle mouse over events on the default option in order to manage moving focus.
                this.selectAll.on("mouseover", lang.hitch(this, "_selectAllMouseover"))
            );

            if (this.enableSelectAll) {
                // Override the default handler for HOME key event since we don't want to execute the default handler when defaultvalue is enabled.
                this.list.keyMap[keys.HOME] = lang.hitch(this, "_listNavigateHome");
            } else {
                domClass.add(this.selectAll.domNode, "dijitHidden");
            }

            this.selectAll.set({
                iconClass: "dijitCheckBoxIcon",
                label: entities.encode(this.selectAllText),
                title: this.selectAllText
            });
        },

        startup: function () {
            // summary:
            //      Processing after the widget and its children have been created and
            //      added to the DOM. Setup the initial query and store for the list.
            // tags:
            //      protected
            if (this._started) {
                return;
            }
            this.inherited(arguments);

            this.list.startup();
            this.list.set("store", this.store);
        },

        focus: function () {
            // summary:
            //      Override the default focus handling and set the focus to either the default options or the list
            // tags:
            //      public
            if (this.enableSelectAll) {
                this.selectAll.focus();
            } else {
                this.list.focus();
            }
        },

        resize: function () {
            // summary:
            //      Resize the version selector and its children.
            // tags:
            //      public
            this.inherited(arguments);
            this.list.resize();
        },

        renderRow: function (item, options) {
            // summary:
            //      Render row callback
            // tags:
            //      protected, virtual

            var selector = put("div.epi-selector-list__type-wrapper", put("span.dijit.dijitReset.dijitInline.dijitCheckBox"));
            var label = put("label.epi-selector-list__title.dojoxEllipsis", "span", {title: item.label, textContent: item.label});
            return put("div", [selector, label]);

        },

        refresh: function () {
            // summary:
            //      Refreshes the version selector to ensure the data displayed is up to date.
            // tags:
            //      public

            if (!this._started) {
                return;
            }

            return this.list.refresh();
        },

        _itemsSelected: function (e) {
            // summary:
            //      Extracts the version information and emits a change event.
            // tags:
            //      private

            var selection = [];
            Object.keys(e.grid.selection).forEach(function (key) {
                selection.push(key);
            });

            if (!epi.areEqual(selection, this.get("selectedItems"))) {
                this.set("selectedItems", selection, true);
                this.emit("change", { value: selection });
            }

            this._updateView();
        },

        _refreshComplete: function (evt) {
            // summary:
            //      Selects the current version and marks the marked version when a refresh occurs.
            // tags:
            //      private

            when(evt.results.total, lang.hitch(this, function (total) {
                this.emit("loaded");

                domClass.toggle(this.separatorNode, "dijitHidden", !total || !this.enableSelectAll);
            }));
        },

        _selectAllSelected: function () {
            // summary:
            //      The callback method for when the default option is selected. Set the
            //      selected items to null.
            // tags:
            //      private
            this.set("selectedItems", null);
        },

        _selectAllKeypress: function (e) {
            // summary;
            //      Event handler for key presses on the select all to take care of moving focus to the list.
            // tags:
            //      private
            var method;

            switch (e.keyCode) {
                case keys.DOWN_ARROW:
                    method = Keyboard.moveFocusHome;
                    break;
                case keys.PAGE_DOWN:
                    method = Keyboard.moveFocusPageDown;
                    break;
                case keys.END:
                    method = Keyboard.moveFocusEnd;
                    break;
                default:
                    return;
            }

            // Apply the correct method to the list giving the event as argument.
            method.apply(this.list, [e]);
        },

        _selectAllMouseover: function () {
            // summary:
            //      Event handler for mouse over on the select all
            //      to take care of moving focus to the button.
            // tags:
            //      private
            this.selectAll.focus();
        },

        _listNavigateUp: function (e) {
            // summary;
            //      Event handler for page up and arrow up key presses on the list to take care of
            //      moving focus to the select all when the first row is selected in the list.
            // tags:
            //      private
            var list = this.list,
                row = list.row(e),
                previousRow = list.up(row, 1, true);

            // If row and previous row are the same then the first row is selected.
            if (row.id === previousRow.id) {
                this.selectAll.focus();
            }
        },

        _listNavigateHome: function () {
            // summary:
            //      Event handler for a HOME key press on the list to take care of moving
            //      focus to the select all.
            // tags:
            //      private
            this.selectAll.focus();
        },

        _listMouseover: function (e) {
            // summary:
            //      Event handler for mouse over on the list to take care
            //      of moving focus to the hovered list item.
            // tags:
            //      private
            var row = this.list.row(e);
            this.list.focus(row);
        },

        _setSelectedItemsAttr: function (selectedItems, internal) {
            // summary:
            //      Sets the selected items and ensures the UI is in the correct state.
            // tags:
            //      protected
            this._set("selectedItems", selectedItems);

            // Clear the value regardless if there is a value or not. This ensures we don't
            // end up with multiple items selected.
            if (!internal) {
                this.list.clearSelection();
                if (selectedItems) {
                    selectedItems.forEach(function (item) {
                        this.list.select(item);
                    }.bind(this));
                }
            }

            this._updateView();
        },

        _updateView: function () {
            // summary:
            //      Updates the view to ensure it matches the current model state.
            // tags:
            //      private

            // The select all should be checked if there is no selected items.
            this.selectAll.set("checked", !this.selectedItems || this.selectedItems.length === 0);
        }
    });
});
