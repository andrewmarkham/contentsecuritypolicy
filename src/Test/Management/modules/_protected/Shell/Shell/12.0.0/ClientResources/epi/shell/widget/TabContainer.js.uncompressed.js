define("epi/shell/widget/TabContainer", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/lang",

    "dojo/aspect",

    "dojo/dom-class",
    // dijit
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "dijit/registry",
    // epi
    "epi",
    "epi/dependency",

    "epi/shell/widget/layout/ComponentContainer",
    "epi/shell/widget/TabController",
    "epi/shell/widget/_ActionConsumerWidget",
    "epi/shell/DialogService",
    // resources
    "epi/i18n!epi/shell/ui/nls/EPiServer.Shell.UI.Resources.TabContainer"
],

function (
// dojo
    array,
    declare,
    Deferred,
    lang,

    aspect,

    domClass,
    // dijit
    ContentPane,
    TabContainer,
    registry,
    // epi
    epi,
    dependency,

    ComponentContainer,
    TabController,
    _ActionConsumerWidget,
    dialogService,
    // resources
    res
) {

    return declare([TabContainer, _ActionConsumerWidget], {
        // summary:
        //    A custom implementation of a Tab Container.
        //
        // description:
        //    Creates a tab container. If the container doesn't contain any tab,
        //    a first one will be automatically created on startup.
        //
        // example:
        //    Create a new tab container.
        // |    var container = new epi/shell/widget/TabContainer();
        //
        // tags:
        //    internal

        // controllerWidget: [const] String
        //    Specify the TabContainer's controller.
        controllerWidget: TabController,

        // _selectedPage: [private] dijit/_Widget
        //    The current selected page.
        _selectedPage: null,

        // _componentsController: [private] epi/shell/widget/Application
        //    Holds the tab container dependency controller.
        _componentsController: null,

        // res: [private] Object
        //    Localization resources for the tab container.
        res: res,

        // confirmationBeforeRemoval: [public] boolean
        //    States if tab removal needs confirmation.
        confirmationBeforeRemoval: true,

        startup: function () {
            // summary:
            //    Start up the widget. Wire up events, resolve dependencies and create a first tab on the container if there isn't one.
            //
            // tags:
            //    public
            if (this._started) {
                return;
            }

            this.inherited(arguments);

            // wire up the events on the tab list.
            this.connect(this.tablist, "onLayoutChanged", this._changeLayout);
            this.connect(this.tablist, "onTabTitleChanged", this._changeName);
            this.connect(this.tablist, "onAddNewTab", this._createTab);

            this._componentsController = dependency.resolve("epi.shell.controller.Components");

            if (this.getChildren().length <= 0) {
                this._createTab();
            }

        },

        postCreate: function () {
            this.inherited(arguments);
            domClass.add(this.domNode, "epi-mainApplicationArea");
        },

        _makeController: function () {
            // summary:
            //    Attach the drop down button on the right side of the tab list.
            //
            // tags:
            //    private
            var tabController = this.inherited(arguments);
            this.connect(tabController, "onSelectChild", this._pageSelected);

            var menuItems = [
                {
                    label: this.res.addgadget,
                    onClick: lang.hitch(this, this._showComponentDialog)
                },
                {
                    label: this.res.createtab,
                    onClick: lang.hitch(this, this._createTab)
                },
                {
                    label: this.res.rearrangegadget,
                    onChange: lang.hitch(this, this._rearrangeGadgets),
                    type: "checkedmenuitem",
                    checked: false,
                    rearrangeGadgets: function (isUnlocked) {
                        this.set("checked", isUnlocked);
                    }
                }
            ];

            array.forEach(menuItems, tabController.addAddMenuItem, tabController);

            return tabController;
        },

        _rearrangeGadgets: function (isUnlocked) {
            // summary:
            //    Raised by the locker button and it will lock or unlock component removal and drag and drop.
            //
            // isUnlocked:
            //    Flag determining whether the container is locked or unlocked.
            //
            // tags:
            //    private

            if (this._selectedPage) {
                this._selectedPage.changeLockButtonState(isUnlocked);
            }
        },

        _showComponentDialog: function () {
            // summary:
            //    Shows the component selector dialog when the add gadget menu option is clicked.
            //
            // tags:
            //    private

            if (this._selectedPage) {
                this._selectedPage.showComponentSelector();
            }
        },

        _componentSelected: function () {
            // summary:
            //    Add a new widget to the current tab.
            //
            // tags:
            //    private

            // Get the currently active component container
            var componentContainer = this._selectedPage;

            // Call the addComponent method with the arguments from selector dialog
            componentContainer.addComponent.apply(componentContainer, arguments);
        },

        _pageSelected: function (/*dijit/_Widget*/page) {
            // summary:
            //     Sets the _selectedPage property.
            //
            // page:
            //    The current tab on the tab container.
            //
            // tags:
            //     private
            this._selectedPage = page;
        },

        _createTab: function () {
            // summary:
            //    Create a new tab on the container.
            //
            // tags:
            //    private

            this._componentsController.getEmptyComponentDefinition("EPiServer.Shell.ViewComposition.Containers.ComponentContainer", lang.hitch(this, function (componentDefinition) {
                var comp = componentDefinition[0];
                comp.settings.numberOfColumns = 2;
                comp.settings.containerUnlocked = true;
                comp.settings.closable = true;

                this._componentsController.addComponent(this, comp, lang.hitch(this, function (resp) {
                    var children = this.getChildren();
                    this.selectChild(children[children.length - 1]);
                }));
            }));

        },

        _changeName: function (/*dijit/_Widget*/page, /*String*/value) {
            // summary:
            //    Raised when the name of one tab has changed.
            //
            // page:
            //    The current tab on the tab container.
            //
            // value:
            //    The new tab name.
            //
            // tags:
            //    private

            if (this._isEmpty(value)) {
                this._showMessageDialog(this.res.tabnamecannotbeemptymessage).then(function () {
                    page.controlButton.tabName.innerHTML = page.controlButton.tabCurrentName;
                    page.controlButton._setTabTitleEditable(true);
                });
            } else {

                var oldValue = String(page.title);
                var item = this._componentsController.getComponentDefinition(page.id);
                page.title = value;
                page.tabCurrentName = value;

                if (item) {
                    item.settings.personalizableHeading = value;
                    this._componentsController.saveComponents(
                        [item],
                        function () { }, // Do nothing on success
                        lang.hitch(this, function () { // onErrorCallback
                            this._showMessageDialog(this.res.tabnamecouldnotbesaved).then(function () {
                                page.set("title", oldValue);
                                page.set("tabCurrentName", oldValue);
                                page.controlButton.revertTabTitleChanges(true, oldValue, value);
                            });
                        })
                    );
                } else {
                    console.log("Error fetching item by id");
                }
            }
        },

        _getNumberOfColumns: function (/*Object*/evt) {
            // summary:
            //      Get the selected number of column(s)
            // tags:
            //      private

            if (!evt || !evt.target) {
                return 1;
            }

            var widget = registry.getEnclosingWidget(evt.target);

            // the _TabButton template contains the 'column' property as number of column
            if (!widget || !widget.column) {
                return 1;
            }

            return widget.column;
        },

        _changeLayout: function (/*dijit/_Widget*/page, /*Event*/evt) {
            // summary:
            //    Raised when the layout is changed.
            //
            // page:
            //    The current tab on the tab container.
            //
            // evt:
            //    Event fired by the layout menu item.
            //
            // tags:
            //    private

            var numColumns = this._getNumberOfColumns(evt),
                item = null;

            if (typeof page.setColumns == "function") {
                page.setColumns(numColumns);
            }

            item = this._componentsController.getComponentDefinition(page.id);

            if (item) {
                item.settings.numberOfColumns = numColumns;
                this._componentsController.saveComponents([item]);
            } else {
                console.log("Error fetching item by id");
            }

        },

        closeChild: function (/*dijit/_Widget*/page) {
            // summary:
            //    Raised when closing a tab.
            //
            // page:
            //    The current tab on the tab container.
            //
            // tags:
            //    protected

            if (this.getChildren().length === 1) {
                //Prevent deleting a non deletable tab through keyboard shortcuts.
                return;
            }

            if (!this.confirmationBeforeRemoval) {
                this.inherited(arguments);
                this._removeTab(page);
            } else {
                return this._showRemovalConfirmationDialog().then(function () {
                    TabContainer.prototype.closeChild.apply(this, [page]);
                    this._removeTab(page);
                }.bind(this));
            }
        },

        _removeTab: function (page) {
            // summary:
            //     Remove the selected tab.
            //
            // page:
            //    The tab to be removed.
            //
            // tags:
            //    private.

            // remove the item from the store.
            var item = this._componentsController.getComponentDefinition(page.id);
            this._componentsController.removeComponent(item.id);

            var numberOfTabs = this.getChildren().length;

            if (numberOfTabs === 1) {
                for (var button in this.tablist.pane2button) {
                    this.tablist.pane2button[button].closeTabMenuItem.set("disabled", true);
                }
            }
        },

        _showRemovalConfirmationDialog: function () {
            // summary:
            //    Configure and open the removal confirmation dialog.
            //
            // tags:
            //    private
            return dialogService.confirmation({
                description: this.res.removetabquestion,
                title: epi.resources.header.episerver
            });
        },

        _showMessageDialog: function (/*String*/message) {
            // summary:
            //    Display a message dialog.
            // message:
            //    Message to be displayed on the dialog.
            //
            // tags:
            //    private

            return dialogService.alert(message);
        },

        _isEmpty: function (/*String*/tabName) {
            // summary:
            //    Check if the tab name is empty
            //
            // tabName:
            //    The tab name
            //
            // tags:
            //    private
            //
            // returns:
            //    true if the tabName is empty, otherwise false.

            return (lang.trim(tabName) === "" ? true : false); //Boolean
        }

    });

});
