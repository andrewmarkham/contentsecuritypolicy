define("epi-cms/component/command/GlobalToolbarCommandProvider", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",

    "dijit/Destroyable",
    "dijit/form/ToggleButton",

    "epi/dependency",
    "epi/shell/command/ToggleCommand",
    "epi/shell/ViewSettings",
    "epi-cms/widget/command/CreateContentFromSelector",
    "epi-cms/component/command/_GlobalToolbarCommandProvider",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting"
], function (
    array,
    declare,
    lang,
    topic,

    Destroyable,
    ToggleButton,

    dependency,
    ToggleCommand,
    ViewSettings,
    CreateContentFromSelector,
    _GlobalToolbarCommandProvider,

    resources
) {

    var _ToggleNavigationPaneCommand = declare([ToggleCommand, Destroyable], {
        iconClass: "epi-iconTree",
        tooltip: resources.toolbar.buttons.togglenavigationpane,
        label: resources.toolbar.buttons.togglenavigationpane,
        order: -10000, //Give it a low nr to make it more probable that it is always the first button
        canExecute: true,
        constructor: function () {
            this.own(
                topic.subscribe("/epi/layout/pinnable/navigation/visibilitychanged", lang.hitch(this, function (visible) {
                    this.set("active", visible);
                }))
            );
        },
        _execute: function () {
            topic.publish("/epi/layout/pinnable/navigation/toggle");
        }

    });

    var _ToggleAssetsPaneCommand = declare([ToggleCommand, Destroyable], {
        iconClass: "epi-iconFolder",
        tooltip: resources.toolbar.buttons.toggleassetspane,
        label: resources.toolbar.buttons.toggleassetspane,
        order: 10000, //Give it a high nr to make it more probable that it is always the last button
        canExecute: true,
        constructor: function () {
            this.own(
                topic.subscribe("/epi/layout/pinnable/tools/visibilitychanged", lang.hitch(this, function (visible) {
                    this.set("active", visible);
                }))
            );
        },
        _execute: function () {
            topic.publish("/epi/layout/pinnable/tools/toggle");
        }
    });

    return declare([_GlobalToolbarCommandProvider], {
        // summary:
        //      Default command provider for the epi-cms/component/GlobalToolbar
        // tags:
        //      internal

        contentRepositoryDescriptors: null,
        viewName: null,

        postscript: function () {
            // summary:
            //      Ensure that an array of commands has been initialized.
            // tags:
            //      public
            this.inherited(arguments);

            this.contentRepositoryDescriptors = this.contentRepositoryDescriptors || dependency.resolve("epi.cms.contentRepositoryDescriptors");
            this.viewName = this.viewName || ViewSettings.viewName;
            this._addLeadingCommands();

            this._addCreateCommands();

            this._addTrailingCommands();
        },

        _addLeadingCommands: function () {
            this.addToLeading(new _ToggleNavigationPaneCommand(), {
                widget: ToggleButton,
                "class": "epi-leadingToggleButton epi-mediumButton"
            });
        },

        _addCreateCommands: function () {

            var currentView = this.viewName;
            var descriptorsForCurrentView = [];
            var isCurrentView = function (view) {
                return view === currentView;
            };

            for (var index in this.contentRepositoryDescriptors) {
                var descriptor = this.contentRepositoryDescriptors[index];
                if (array.some(descriptor.mainViews, isCurrentView)) {
                    descriptorsForCurrentView.push(descriptor);
                }
            }

            array.forEach(descriptorsForCurrentView, function (descriptor) {
                array.forEach(descriptor.creatableTypes, function (type) {
                    this.addCommand(this._createCommand(type), { category: "create" });
                }, this);
            }, this);
        },

        _createCommand: function (type) {
            return new CreateContentFromSelector({
                creatingTypeIdentifier: type
            });
        },

        _addTrailingCommands: function () {
            this.addToTrailing(new _ToggleAssetsPaneCommand(), {
                widget: ToggleButton,
                "class": "epi-trailingToggleButton epi-mediumButton"
            });
        }
    });
});
