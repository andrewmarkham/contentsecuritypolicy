define("epi-cms/contentediting/EditToolbar", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-class",
    "dojo/topic",
    "dojo/when",

    // EPi Framework
    "epi",

    // EPi CMS
    "epi-cms/contentediting/command/Editing",
    "epi-cms/contentediting/viewmodel/EditActionPanelViewModel",

    "epi-cms/contentediting/StandardToolbar",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editactionpanel.publishactionmenu",
    // Used by the toolbar
    "epi-cms/widget/NotificationStatusBar",
    "epi-cms/contentediting/EditActionPanel"
], function (
// Dojo
    declare,
    lang,
    array,
    domClass,
    topic,
    when,

    // EPi Framework
    epi,

    // EPi CMS
    EditingCommands,
    EditActionPanelViewModel,

    StandardToolbar,

    // Resources
    res,
    actionRes
) {

    return declare([StandardToolbar], {
        // tags:
        //      internal xproduct

        res: res,

        _isSavingHandle: null,
        _editActionViewModel: null, //FIXME: This will be a part of the upcoming EditToolbarViewModel.
        _commands: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            this._commands = EditingCommands;

            this.own(this._commands.revertToPublished.watch("canExecute", lang.hitch(this, function () {
                this.setItemProperty(this._commands.revertToPublished.name, "disabled", !this._commands.revertToPublished.canExecute);
            })));

            this._editActionViewModel = new EditActionPanelViewModel();
            this.own(this._editActionViewModel);
        },

        resize: function (changeSize) {
            this.inherited(arguments);
            if (changeSize) {
                domClass.toggle(this.domNode, "epi-editToolbarNarrow", changeSize.w < 620);
                domClass.toggle(this.domNode, "epi-editToolbarMedium", changeSize.w >= 620 && changeSize.w < 1000);
                domClass.toggle(this.domNode, "epi-editToolbarLarge", changeSize.w >= 1300);

                this._editActionViewModel.set("expanded", changeSize.w >= 1000);

                this.setItemProperty("autosave", "isInNarrowToolbar", changeSize.w < 1000);
            }
        },

        setupChildren: function (/* Array */ optionalToolbarGroups, /* Array */ optionalToolbarItems) {
            var toolbarItems = [{
                parent: "center",
                name: "autosave",
                label: this.res.autosave.savinglabel,
                type: "dropdown",
                settings: { "class": "epi-autosave-hidden" }
            }, {
                parent: "autosave",
                name: "undo",
                title: this.res.undo.title,
                label: epi.resources.action.undo,
                type: "menuitem",
                iconClass: "epi-iconUndo",
                settings: { disabled: true, showLabel: false },
                action: function () {
                    topic.publish("/epi/cms/action/undo", []);
                }
            }, {
                parent: "autosave",
                name: "redo",
                title: this.res.redo.title,
                label: epi.resources.action.redo,
                type: "menuitem",
                iconClass: "epi-iconRedo",
                settings: { disabled: true, showLabel: false },
                action: function () {
                    topic.publish("/epi/cms/action/redo", []);
                }
            }, {
                parent: "autosave",
                name: "reverttopublished",
                title: this._commands.revertToPublished.tooltip,
                label: this._commands.revertToPublished.label,
                type: "menuitem",
                iconClass: "epi-iconRevert",
                settings: { separate: true },
                action: lang.hitch(this, function () {
                    this._commands.revertToPublished.execute();
                })
            }, {
                parent: "trailing",
                name: "notifications",
                widgetType: "epi-cms/widget/NotificationStatusBar"
            }, {
                name: "editactionpanel",
                label: epi.resources.action.publish,
                parent: "trailing",
                widgetType: "epi-cms/contentediting/EditActionPanel",
                settings: {
                    model: this._editActionViewModel
                }
            }];

            var toolbarGroups = optionalToolbarGroups ? optionalToolbarGroups : [];
            toolbarItems = optionalToolbarItems ? optionalToolbarItems.concat(toolbarItems) : toolbarItems;

            return this.inherited(arguments, [toolbarGroups, toolbarItems]);
        },

        _setContentViewModelAttr: function (value) {
            this._set("contentViewModel", value);

            when(this.isSetup(), lang.hitch(this, function () {
                this._updateToolbarItemsModel(value);
            }));
        },

        _updateToolbarItemsModel: function (contentViewModel) {
            // View mode changes, hide saving button
            if (!contentViewModel.isSaving) {
                this.setItemProperty("autosave", "label", "");
            }
            //The autosave button has epi-autosave-hidden class in order to be hidden when the toolbar is being rendered
            //here we change class for it to be shown
            this.setItemProperty("autosave", "class", "epi-autoSaveButton epi-disabledDropdownArrow");

            var contentData = contentViewModel.contentData;

            this.setItemProperty("notifications", "notificationContext", { contextTypeName: "epi.cms.contentdata", contextId: contentData.contentLink });

            this._editActionViewModel.set("dataModel", contentViewModel);

            if (this._isSavingHandle) {
                this._isSavingHandle.unwatch();
            }

            this._isSavingHandle = contentViewModel.watch("isSaving", function (name, oldValue, value) {
                this._widgetMap["editactionpanel"].toggleDropDownMenu(!value);
            }.bind(this));

            this.setItemProperty("viewselect", "viewName", contentViewModel.viewName);
        }
    });
});
