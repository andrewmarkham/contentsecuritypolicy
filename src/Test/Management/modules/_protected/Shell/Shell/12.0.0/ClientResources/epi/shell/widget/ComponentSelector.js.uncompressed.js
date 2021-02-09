define("epi/shell/widget/ComponentSelector", [
    "epi",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/keys",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom-geometry",
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dgrid/Keyboard",
    "dgrid/extensions/DijitRegistry",
    "dijit/_Contained",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/MenuItem",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "dijit/form/TextBox",
    "dojo/store/Memory",
    "epi/routes",
    "epi/dependency",
    "epi/shell/ViewSettings",
    "epi/i18n!epi/shell/ui/nls/EPiServer.Shell.UI.Resources.ComponentSelection"],

function (epi, declare, Deferred, keys, array, lang, domGeometry,
    OnDemandGrid, Selection, Keyboard,DijitRegistry,
    _Contained, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin,
    MenuItem, ContentPane, BorderContainer, Button, TextBox,
    MemoryStore, routes, dependency, viewSettings, res) {

    var ComponentSelector = declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _Contained], {
        // summary:
        //    Widget for selecting components/gadgets with sorting/filtering capabilites
        //
        // example:
        //    Create a new Component Selector.
        // |    var componentSelector = new epi/shell/widget/ComponentSelector();
        //
        // tags:
        //    internal

        // templateString: [protected] String
        //    Template for the widget.
        templateString: "\
            <div>\
            <div class=\"dijitDialogPaneToolBar clearfix\">\
                    <div class=\"dijitDialogPaneLeading\">\
                    </div>\
                    <div class=\"dijitDialogPaneTrailing\">\
                        <input data-dojo-type=\"dijit/form/TextBox\" dojoAttachPoint=\"searchBox\" dojoAttachEvent=\"onKeyUp: _onSearchBoxChange\" placeHolder=\"${commonRes.action.search}\" class=\"epi-searchInput\" />\
                    </div>\
                </div>\
                <div class=\"dijitDialogPaneContentArea epi-wrapped\">\
                    <div data-dojo-type=\"dijit/layout/BorderContainer\" data-dojo-attach-point=\"container\" style=\"width: 100%; height: 330px;\">\
                        <div data-dojo-type=\"dijit/layout/ContentPane\" region=\"left\" splitter=\"false\" class=\"epi-dialog-resourcePane epi-dijitMenuDisableIcon\" style=\"width: 160px;\" >\
                            <div data-dojo-type=\"dijit/Menu\" dojoAttachPoint=\"categoryMenu\" dojoAttachEvent=\"onItemClick: _onCategoryMenuClick\" style=\"width:160px;\"></div>\
                        </div>\
                            <div data-dojo-attach-point=\"grid\"></div>\
                    </div>\
                </div>\
                <div class=\"dijitDialogPaneActionBar\">\
                    <button data-dojo-type=\"dijit/form/Button\" type=\"submit\" data-dojo-props=\"'class':'default'\" data-dojo-attach-event=\"onClick:onClose\">${commonRes.action.close}</button>\
                </div>\
             </div>",

        // res: [private] Object
        //    Localization resources for the component selector.
        res: res,

        // commonRes: [private] Object
        //    Common localization resources,
        commonRes: epi.resources,

        // selectedCategory: [public] String
        //    Specify which category to get the components from. If '*' is set, components from all
        //    categories will be returned.
        selectedCategory: "*",

        // componentCategories: String
        //    Set category on which to filter available components.
        componentCategories: null,

        // _selectedCategoryMenuItem: [private] dijit/MenuItem
        //    The select item on the category menu.
        _selectedCategoryMenuItem: null,

        // categoryStore: [private] dojo/store/JsonRest
        //  Store for component categories
        categoryStore: null,

        // componentDefinitionStore: [private] dojo/store/JsonRest
        //  Store for component definitions
        componentDefinitionStore: null,

        // _sortableColumns: [private] Array
        //  Specify the grid columns that can be sorted.
        _sortableColumns: [1],

        // _gridClass: [private] Object
        //      The class to construct the grid with.
        _gridClass: declare([OnDemandGrid, DijitRegistry, Selection, Keyboard], {
            resize: function (size) {
                if (!size) {
                    return;
                }
                domGeometry.setMarginBox(this.domNode, {w: size.w, h: size.h});

                this.inherited(arguments);
            }
        }),

        postMixInProperties: function () {
            // tags:
            //      protected

            this.inherited(arguments);

            this.categoryStore = this.categoryStore || this._getStore("epi.shell.componentcategory");
            this.componentDefinitionStore = this.componentDefinitionStore || this._getStore("epi.shell.componentdefinition");
            this.componentCategories = viewSettings.settings.componentCategories;
        },

        buildRendering: function () {
            this.inherited(arguments);

            this.grid = new this._gridClass({
                region: "center",
                columns: {
                    title: { label: this.commonRes.header.name },
                    description: { label: " "}
                },
                selectionMode: "single",
                sort: [{ attribute: "title", descending: false}],
                query: lang.hitch(this, function (item) {
                    if (this.selectedCategory !== "*") {
                        if (!item.categories) {
                            return false;
                        }
                        var selectedCategory = this.selectedCategory;

                        var matchesCategory = array.some(item.categories, function (category) {
                            //If we have a match on any category we return true.
                            return category === selectedCategory;
                        });

                        if (!matchesCategory) {
                            return;
                        }
                    }

                    var name = this.searchBox.get("value").toLowerCase();
                    if (name.length > 0 && (item.title && item.title.toLowerCase().indexOf(name))) {
                        return false;
                    }

                    return true;
                })
            }, this.grid);

            this.grid.on(".dgrid-row:click", lang.hitch(this, this._onGridRowSelected));
            this.grid.on(".dgrid-row:keydown", lang.hitch(this, this._onGridRowSelected));
        },

        _getStore: function (name) {
            var registry = dependency.resolve("epi.storeregistry");
            return registry.get(name);
        },

        onComponentSelected: function () {
            // summary:
            //    Callback method to get notified when a component is selected.
            //
            // tags:
            //    public callback
        },

        onClose: function () {
            // summary:
            //    Callback method to get notified when the user wants to close the dialog.
            //
            // tags:
            //    public callback
        },

        _onGridRowSelected: function (e) {
            // summary:
            //    Raised when a grid row is selected.
            //
            // row:
            //    Event fired when a row on the grid is clicked.
            //
            // tags:
            //    private
            if (e.keyCode && e.keyCode !== keys.ENTER) {
                return;
            }

            var row = this.grid.row(e);
            if (!row || !row.data) {
                return;
            }

            var component = row.data.component;
            this.onComponentSelected(component);
        },

        dataBind: function (reload) {
            // summary:
            //    Sets up the grid and category menu with correct data.
            //
            // tags:
            //    public

            if (this.grid.store !== null && reload !== true) {
                return;
            }

            if (reload) {
                array.forEach(this.categoryMenu.getChildren(), function (child) {
                    this.categoryMenu.removeChild(child);
                }, this);
            }

            var grid = this.grid;

            Deferred.when(this.componentDefinitionStore.query(), lang.hitch(this, function (data) {

                var filteredData = array.filter(data, function (item) {
                    return this._inCategoryFilter(item.categories);
                }, this);

                this._populateCategoryMenu(filteredData);

                var memoryStore = new MemoryStore({ data: filteredData });
                grid.set("store", memoryStore);
            }));
        },

        show: function (reload) {
            // summary:
            //    Performs databinding and triggers a layout rendering of the widgets.
            //
            // tags:
            //    public
            this.inherited(arguments);
            this.dataBind(reload);
            this.resize();
        },

        resize: function () {
            // summary:
            //    Resizes the child widgets
            //
            // tags:
            //    public
            this.inherited(arguments);

            this.container.resize();
        },

        _populateCategoryMenu: function (components) {
            // summary:
            //    Populate the category menu.
            //
            // categoryStore:
            //    Store containing the categories.
            //
            // tags:
            //    private

            this._selectedCategoryMenuItem = new MenuItem({ label: this.commonRes.header.all, selected: true, value: "*" });
            this.categoryMenu.addChild(this._selectedCategoryMenuItem);

            var categoryQuery = this.categoryStore.query();

            Deferred.when(categoryQuery, lang.hitch(this, function (categories) {
                array.forEach(categories, function (category) {
                    var exists = array.some(components, function (component) {
                        return array.indexOf(component.categories, category.name) >= 0;
                    });
                    if (exists) {
                        this.categoryMenu.addChild(new MenuItem({
                            label: category.displayName,
                            value: category.name
                        }));
                    }
                }, this);
            }));
        },

        _inCategoryFilter: function (categories) {
            var suggestedCategories = this.componentCategories;

            return suggestedCategories === null || array.some(categories, function (c) {
                return array.some(suggestedCategories, function (suggestedCategory) {
                    //If we have a match on any category we return true.
                    return suggestedCategory === c;
                });
            });
        },

        _onCategoryMenuClick: function (/*dijit/MenuItem*/item, /*MouseEvent*/e) {
            // summary:
            //    Raised when a category is selected.
            //
            // item:
            //    The selected menu item.
            //
            // e:
            //    Mouse event that has been fired by the menu item.
            //
            // tags:
            //    private callback
            this._selectedCategoryMenuItem.set("selected", false);
            item.set("selected", true);
            this._selectedCategoryMenuItem = item;

            this.selectedCategory = item.value;
            this.searchBox.reset();

            this.grid.refresh();
        },

        _onSearchBoxChange: function (/*KeyboardEvent*/e) {
            // summary:
            //    Raised when the search textbox changed.
            //
            // e:
            //    Keyboard event that has been fired by the search textbox.
            //
            // tags:
            //    private callback
            this.grid.refresh();
        }
    });

    return ComponentSelector;
});
