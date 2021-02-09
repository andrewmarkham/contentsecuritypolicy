require({cache:{
'url:epi-cms/project/templates/ProjectSelectorList.html':"﻿<div class=\"epi-selector-list epi-menu--inverted\">\r\n    <div class=\"epi-menuInverted epi-invertedTooltip\">\r\n        <div class=\"epi-tooltipDialogTop\">\r\n            <span data-dojo-attach-point=\"headerNode\"></span>\r\n        </div>\r\n        <div data-dojo-type=\"dijit/Toolbar\" data-dojo-attach-point=\"toolbar\" class=\"epi-flatToolbar\">\r\n            <div data-dojo-attach-point=\"toolbarGroupNode\" class=\"epi-floatRight\"></div>\r\n        </div>\r\n        <button class=\"epi-selector-list-btn epi-chromeless\" data-dojo-attach-point=\"defaultOption\" data-dojo-type=\"dijit/form/ToggleButton\" data-dojo-props=\"iconClass:'dijitRadioIcon'\"></button>\r\n        <div data-dojo-attach-point=\"separatorNode\" class=\"epi-selector-list__separator dijitHidden\"></div>\r\n        <div data-dojo-attach-point=\"listNode\"></div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/project/ProjectSelectorList", [
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/keys",
    "dojo/when",
    "dojo/dom-class",
    "dojox/html/entities",

    "dijit/form/RadioButton",
    "dijit/Menu",

    "epi/epi",
    "epi/shell/command/_WidgetCommandBinderMixin",
    "epi/shell/command/builder/MenuAssembler",
    "epi/shell/command/builder/ExpandoMenuBuilder",
    "epi/shell/command/builder/OptionsBuilderMixin",
    "epi/datetime",
    "epi/username",
    "./viewmodels/ProjectSelectorListViewModel",

    // Resources
    "dojo/text!./templates/ProjectSelectorList.html",
    "epi/i18n!epi/shell/ui/nls/episerver.shared.header",
    "epi/i18n!epi/cms/nls/episerver.cms.components.project",
    // Grid
    "dgrid/OnDemandList",
    "dgrid/extensions/DijitRegistry",
    "dgrid/Keyboard",
    "dgrid/Selection",
    "dgrid/util/mouse",
    "put-selector/put",
    "epi/shell/dgrid/Focusable",
    "epi/shell/dgrid/selection/Exclusive",
    "epi/shell/dgrid/util/misc",
    // Parent class and mixins
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_KeyNavContainer",
    // Widgets in template
    "dijit/Toolbar"
], function (
    declare,
    event,
    lang,
    keys,
    when,
    domClass,
    entities,

    RadioButton,
    Menu,

    epi,
    _WidgetCommandBinderMixin,
    MenuAssembler,
    ExpandoMenuBuilder,
    OptionsBuilderMixin,
    epiDatetime,
    epiUsername,


    ProjectSelectorListViewModel,

    // Resources
    template,
    localizations,
    res,
    // Grid
    OnDemandList,
    DijitRegistry,
    Keyboard,
    Selection,
    mouse,
    put,
    Focusable,
    Exclusive,
    misc,
    // Parent class and mixins
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _KeyNavContainer
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _KeyNavContainer, _WidgetCommandBinderMixin], {
        // summary:
        //      Sortable project selector
        //
        // tags:
        //      internal

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // store: [public] Store
        //      The store that will be queried for projects.
        store: null,

        // query: [public] Object
        //      A query to use when fetching items from the store.
        query: null,

        // markedContentLink: [public] String
        //      The content link of the version which should be marked as in use.
        selectedProject: null,

        // enableDefaultValue: [public] Boolean
        //      Enable/Disable the possiblity to select a default value (null)
        enableDefaultValue: false,

        // defaultValueText: [public] String
        //      The text to display for the default value if enabled
        defaultValueText: res.preview.defaultoption,

        // header: [protected] String
        //      A string that will be displayed in the header of the selector.
        header: res.title,

        // loadStoreOnStartup: [protected] Boolean
        //      Load the store immediately instead of waiting for interaction.
        loadStoreOnStartup: false,

        _setHeaderAttr: { node: "headerNode", type: "innerText" },

        _optionsMenuClass: declare([Menu, OptionsBuilderMixin]),

        postMixInProperties: function () {
            // summary:
            //      Called after the parameters to the widget have been read-in,
            //      but before the widget template is instantiated. The column
            //      definitions are setup at this time.
            // tags:
            //      protected
            this.inherited(arguments);

            if (!this.model) {
                this.own(
                    this.model = new ProjectSelectorListViewModel()
                );
            }
        },

        buildRendering: function () {
            // summary:
            //      Construct the UI for this widget via dijit/_TemplatedMixin with the addition
            //      of a dgrid added via code.
            // tags:
            //      protected
            this.inherited(arguments);

            this._setupProjectSortMenu();

            this.list = new (declare([OnDemandList, DijitRegistry, Selection, Keyboard, Focusable, Exclusive]))({
                sort: [{ attribute: "created", descending: true }],
                className: "epi-grid--no-alternating-rows epi-grid-max-height--300",
                cleanEmptyObservers: false,
                deselectOnRefresh: false,
                selectionMode: "exclusive",
                selectionEvents: "click",
                query: this.get("query"),
                renderRow: this.renderRow
            }, this.listNode);

            // Own the list and the event handlers.
            this.own(
                this.list,
                this.list.on("dgrid-select", lang.hitch(this, "_projectSelected")),
                this.list.on("dgrid-refresh-complete", lang.hitch(this, "_refreshComplete")),
                this.list.addKeyHandler(keys.ENTER, lang.hitch(this, "_listEnterKeypress")),
                this.model.watch("projectSortOrder", lang.hitch(this, "_sortChanged")),

                // Handle key events on the list in order to manage moving focus.
                this.list.addKeyHandler(keys.UP_ARROW, lang.hitch(this, "_listNavigateUp")),
                this.list.addKeyHandler(keys.PAGE_UP, lang.hitch(this, "_listNavigateUp")),
                // Handle mouse over events on the list in order to manage moving focus.
                this.list.on(mouse.enterRow, lang.hitch(this, "_listMouseover")),

                // Handle selection of the default option.
                this.defaultOption.on("click", lang.hitch(this, "_defaultOptionSelected")),
                // Handle key events on the default option in order to manage moving focus.
                this.defaultOption.on("keypress", lang.hitch(this, "_defaultOptionKeypress")),
                // Handle mouse over events on the default option in order to manage moving focus.
                this.defaultOption.on("mouseover", lang.hitch(this, "_defaultOptionMouseover"))
            );

            if (this.enableDefaultValue) {
                // Override the default handler for HOME key event since we don't want to execute the default handler when defaultvalue is enabled.
                this.list.keyMap[keys.HOME] = lang.hitch(this, "_listNavigateHome");
            } else {
                domClass.add(this.defaultOption.domNode, "dijitHidden");
            }

            this.defaultOption.set({
                iconClass: "dijitRadioIcon",
                label: entities.encode(this.defaultValueText)
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

            this.model.initialize();

            this.list.startup();

            if (this.loadStoreOnStartup) {
                this.list.set("store", this.store);
            }
        },

        focus: function () {
            // summary:
            //      Override the default focus handling and set the focus to either the default options or the list
            // tags:
            //      public
            if (this.enableDefaultValue) {
                this.defaultOption.focus();
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

            var selector = put("div.epi-selector-list__type-wrapper", put("span.dijit.dijitReset.dijitInline.dijitRadio"));
            var label = put("label.epi-selector-list__title.dojoxEllipsis", put("strong[title=$]", item.name, item.name));
            var state = put("div.epi-selector-list__description.dojoxEllipsis", epiDatetime.toUserFriendlyString(new Date(item.created)) + ", " + epiUsername.toUserFriendlyString(item.createdBy));
            return put("div", [selector, label, state]);
        },

        refresh: function () {
            // summary:
            //      Refreshes the version selector to ensure the data displayed is up to date.
            // tags:
            //      public

            if (!this._started) {
                return;
            }

            if (!this.list.get("store")) {
                this.list.set("store", this.store);
            }

            return this.list.refresh().then(
                lang.hitch(this, function (projects) {
                    var selectedProject = this.get("selectedProject"),
                        projectExists = selectedProject && projects.some(function (item) {
                            if (item.id === selectedProject.id) {
                                selectedProject = item;
                                return true;
                            }
                            return false;
                        }, this);

                    this.set("selectedProject", projectExists ? selectedProject : null);
                })
            );
        },

        _projectSelected: function (e) {
            // summary:
            //      Extracts the version information and emits a change event.
            // tags:
            //      private

            var value = e && e.rows && e.rows[0].data;

            if (!epi.areEqual(value, this.get("selectedProject"))) {
                this.set("selectedProject", value);
                this.emit("change", { value: value });
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

                domClass.toggle(this.separatorNode, "dijitHidden", !total || !this.enableDefaultValue);
            }));
        },

        _defaultOptionSelected: function () {
            // summary:
            //      The callback method for when the default option is selected. Set the
            //      selected project to null.
            // tags:
            //      private
            this.set("selectedProject", null);
            this.emit("change", null);
        },

        _defaultOptionKeypress: function (e) {
            // summary;
            //      Event handler for key presses on the default option to take care of moving focus to the list.
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

        _defaultOptionMouseover: function () {
            // summary:
            //      Event handler for mouse over on the default option
            //      to take care of moving focus to the button.
            // tags:
            //      private
            this.defaultOption.focus();
        },

        _listEnterKeypress: function (e) {
            // summary:
            //      Select the given row when the enter key is pressed.
            // tags:
            //      private

            // Clear the selection first. This ensures we don't end up with multiple items selected.
            this.list.clearSelection();
            this.list.select(e);
        },

        _listNavigateUp: function (e) {
            // summary;
            //      Event handler for page up and arrow up key presses on the list to take care of
            //      moving focus to the default option when the first row is selected in the list.
            // tags:
            //      private
            var list = this.list,
                row = list.row(e),
                previousRow = list.up(row, 1, true);

            // If row and previous row are the same then the first row is selected.
            if (row.id === previousRow.id) {
                this.defaultOption.focus();
            }
        },

        _listNavigateHome: function () {
            // summary:
            //      Event handler for a HOME key press on the list to take care of moving
            //      focus to the default option.
            // tags:
            //      private
            this.defaultOption.focus();
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

        _sortChanged: function (evt) {
            //Only set value if its different from the model value
            var value = this.model[evt];
            if (this.list.get("sort") !== value) {
                this.list.set("sort", value);
            }
        },

        _setSelectedProjectAttr: function (selectedProject) {
            // summary:
            //      Sets the selected project and ensures the UI is in the correct state.
            // tags:
            //      protected
            this._set("selectedProject", selectedProject);

            // Clear the value regardless if there is a value or not. This ensures we don't
            // end up with multiple items selected.
            this.list.clearSelection();
            if (selectedProject) {
                this.list.select(selectedProject.id);
            }

            this._updateView();
        },

        _updateView: function () {
            // summary:
            //      Updates the view to ensure it matches the current model state.
            // tags:
            //      private

            // The default option should be checked if there is no selected project.
            this.defaultOption.set("checked", !this.selectedProject);
        },

        _setupProjectSortMenu: function () {
            // summary:
            //      Set up the project sort menu
            // tags:
            //      private

            var configuration = [{
                builder: new ExpandoMenuBuilder({
                    settings: {
                        "class": "epi-flat epi-chromeless",
                        iconClass: "epi-iconSort",
                        showLabel: false,
                        label: res.command.sort.label
                    }
                }),
                category: "context",
                target: this.toolbarGroupNode
            }
            ];

            this.own(
                new MenuAssembler({
                    configuration: configuration,
                    commandSource: this.model
                })
            );
        }
    });
});
