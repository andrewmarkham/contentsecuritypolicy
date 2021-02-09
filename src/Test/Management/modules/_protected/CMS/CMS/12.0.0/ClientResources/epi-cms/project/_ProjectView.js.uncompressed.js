define("epi-cms/project/_ProjectView", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/on",
    "dojo/when",

    // dijit
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/_LayoutWidget",

    // epi
    "epi/shell/command/builder/MenuAssembler",
    "epi/shell/command/builder/ButtonBuilder",
    "epi/shell/widget/_ModelBindingMixin",
    "./CreateNewDraftConfirmationDialog",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project"
],

function (
// dojo
    declare,
    lang,
    aspect,
    domClass,
    domGeometry,
    on,
    when,

    // dijit
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _LayoutWidget,

    // epi
    MenuAssembler,
    ButtonBuilder,
    _ModelBindingMixin,
    CreateNewDraftConfirmationDialog,

    // Resources
    res
) {

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //
        // tags:
        //      internal

        model: null,

        commandProvider: null,

        res: res,

        // _menuAssembler: [private] Object
        //      Instance of menu assembler
        _menuAssembler: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.model) {
                this.own(
                    this.model = this.commandProvider = this._createViewModel()
                );
            }
        },

        _createViewModel: function () {
            // summary:
            //    Setting up the view model
            // tags:
            //    protected abstract
        },

        buildRendering: function () {
            this.inherited(arguments);
            this._setupList();
            this._setupProjectMenu();
        },

        startup: function () {
            if (this._started) {
                return;
            }
            this.inherited(arguments);
            this.model.initialize();
        },

        _setupList: function () {
            // summary:
            //    Setting up the list
            // tags:
            //    private
            var model = this.model,
                itemList = this.itemList;

            //Callback method to execute when the canAddContent promise gets resolved
            function addContent(result) {
                if (result.existingProjectItems.length !== 0) {
                    new CreateNewDraftConfirmationDialog({
                        projectItems: result.existingProjectItems,
                        contentReferences: result.contentReferences,
                        onAction: function (dialogOk) {
                            if (dialogOk) {
                                model.addProjectItems(result.contentReferencesToAdd)
                                    .then(itemList.setSelection.bind(itemList));
                            }
                        }
                    }).show();

                } else if (result.contentReferencesToAdd.length > 0) {
                    model.addProjectItems(result.contentReferencesToAdd);
                }
            }

            this.own(
                // listen to view model for request to refresh the list
                on(this.model, "refresh", itemList.refresh.bind(itemList)),
                on(this.model, "selected-project-items-updated", function (updatedItems) {
                    // a remote user can update an item which was selected for this user
                    // in that case we need to select them again since Realtime store has already run refresh/notify & remove the selection.
                    itemList.selectItems(updatedItems);
                }),
                on(this.domNode, "selection-changed", function (e) {
                    // selection-changed is only emited when user interaction with grid items
                    // so we need to update the activity feed based on items being selected/deslected
                    model.updateActivityFeed(e.items);
                }),
                on(this.domNode, "active-items-changed", function (e) {
                    // activit-items-changed happens when an items gets added,updated or deleted via any means (i.e another user deletes an items and Realtime invokes notify)
                    // we don't need to touch activityFeed but only left panel selected items
                    model.set("selectedProjectItems", e.items);
                }),
                on(this.domNode, "itemaction", function (e) {
                    model.namedCommands.editProjectItem.execute();
                }),
                on(this.domNode, "itemremove", function () {
                    model.namedCommands.removeProjectItem.execute();
                }),
                on(this.domNode, "itemsdropped", function (e) {
                    model.canAddContent(e.items).then(addContent);
                }),
                on(this.model, "clear-selection", function () {
                    itemList.clearSelection();
                }),
                on(this.model, "item-removed", function () {
                    // Clear Selection after removing selected project items
                    itemList.clearSelection();
                    // Remove the project item and then set focus back to the grid since it
                    // would have been moved to the confirmation dialog.
                    itemList.focus();
                })
            );
        },

        _setupProjectMenu: function () {
            // summary:
            //    Setting up the project menu
            // tags:
            //    private
            this.own(
                this._menuAssembler = new MenuAssembler({
                    configuration: [{
                        builder: new ButtonBuilder({
                            settings: {
                                "class": "epi-disabledDropdownArrow",
                                showLabel: false
                            }
                        }),
                        category: "projectButton",
                        target: this.toolbarGroupNode
                    },
                    {
                        builder: new ButtonBuilder({
                            settings: {
                                "class": "epi-floatRight",
                                showLabel: false
                            }
                        }),
                        category: "project-comments",
                        target: this.projectCommentsToolbar
                    },
                    {
                        builder: new ButtonBuilder(),
                        category: "project-activities",
                        target: this.toolbarGroupNode
                    }],
                    commandSource: this.model
                })
            );
        },

        _publishMenuClickHandler: function () {
            // summary:
            //    Click handler for publish menu
            // tags:
            //    private
            this.model.refreshProject(false);
        },

        _setCreatedAttr: { node: "createdNode", type: "innerText" },

        _setCreatedByAttr: { node: "createdByNode", type: "innerText" },

        _setDndEnabledAttr: function (/*Boolean*/value) {
            // summary:
            //    Enable the dnd
            // tags:
            //    private
            this.itemList.set("dndEnabled", value);
        },

        _setProjectItemQueryAttr: function (value) {
            // summary:
            //      Updates the query on the list
            // value: Object
            //      Query
            // tags:
            //      private

            // Set store to null if query is null to stop list updates
            var store = value ? this.model.projectItemStore : null;
            this.itemList.updateQuery(store, value);
        },

        _setProjectItemSortOrderAttr: function (value) {
            // summary:
            //    Changes the sort order'
            // value: Object
            //      Sort order
            // tags:
            //    private
            this.itemList.set("sortOrder", value);
        },

        _setNotificationMessageAttr: function (value) {
            // summary:
            //      Sets the notification message
            // value: String
            //      Message
            // tags:
            //      private
            this.itemList.set("notificationMessage", value);
        },

        _setProjectStatusAttr: function (value) {
            // summary:
            //      Sets project status message
            // value: String
            //      Message
            // tags:
            //      private
            this.projectStatusMessageNode.textContent = value;
            domClass.toggle(this.projectStatusMessageNode, "dijitHidden", !value);
        },

        _setContentLanguageAttr: function (value) {
            // summary:
            //      Sets the contentLanguage
            // value: String
            //      Language
            // tags:
            //      private
            this.itemList.set("contentLanguage", value);
        }
    });
});
