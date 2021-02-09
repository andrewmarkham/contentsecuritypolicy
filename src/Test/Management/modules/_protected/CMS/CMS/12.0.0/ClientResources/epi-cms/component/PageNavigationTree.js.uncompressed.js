define("epi-cms/component/PageNavigationTree", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/when",

    "epi-cms/ApplicationSettings",
    "../command/NewContent",
    "./command/ViewTrash",
    "./ContentNavigationTree",

    "epi/i18n!epi/cms/nls/episerver.cms.components.createpage"
],

function (
    array,
    declare,
    lang,
    topic,
    when,

    ApplicationSettings,
    NewContentCommand,
    ViewTrashCommand,
    ContentNavigationTree,

    resCreatePage
) {

    return declare([ContentNavigationTree], {
        // summary:
        //    Main navigation for pages.
        //
        // description:
        //    Extends epi-cms/component/ContentNavigationTree with some customizations for pages.
        //
        // tags:
        //    internal

        // betweenThreshold: [public] Integer
        //     Gets propagated to dndSource, to be able to drop between nodes to sort.
        betweenThreshold: 5,

        // expandExtraNodeItems: [public] Array|Integer
        //     Expand the startPage.
        expandExtraNodeItems: ApplicationSettings.startPage,

        // allowSorting: [public] Boolean
        //     Allows sorting of items in the tree through DnD. When false it restricts sorting but allows items to be
        //     moved into other items or content areas.
        allowSorting: true,

        postMixInProperties: function () {
            // summary:
            //      Post mixin initializations.
            // tags:
            //      protected

            this.inherited(arguments);

            // make sure these get called with this class as context
            // otherwise context will be the dndController for the tree
            this.checkAcceptance = lang.hitch(this, this.checkAcceptance);
            this.checkItemAcceptance = lang.hitch(this, this.checkItemAcceptance);
        },

        checkAcceptance: function (source, nodes) {
            //Special handling for the page tree. We only accept internal dnd operations and don't have to check types since all content are pages.
            return source === this.tree.dndController;
        },

        checkItemAcceptance: function (target, source, position) {
            //Special handling for the page tree. We can disallow sorting but allow moving through DnD.
            return this.allowSorting || position === "over";
        },

        _startupCommands: function () {
            // summary:
            //    Add command buttons to the Toolbar.
            //
            // tags:
            //    private

            this.inherited(arguments);

            this._createCommand = new NewContentCommand({
                order: 10,
                contentType: this.settings.containedTypes[0],
                iconClass: "epi-iconPlus",
                label: resCreatePage.command.label,
                resources: resCreatePage
            });

            this.commands = array.filter(this.commands, lang.hitch(this, function (command) {
                return !(command instanceof NewContentCommand);
            }));

            this._viewTrashCommand = new ViewTrashCommand({ typeIdentifiers: this.typeIdentifiers, order: 100 });

            this.commands.push(this._createCommand);
            this.commands.push(this._viewTrashCommand);
        },

        _setShowAllLanguagesAttr: function (value) {
            this.inherited(arguments);
            this.allowSorting = !!value;
        },

        getIconClass: function (/*dojo/data/Item*/item, /*Boolean*/opened) {
            // summary:
            //      Overridable function to return CSS class name to display icon,
            // item:
            //      The current contentdata.
            // opened:
            //      Indicate the node is expanded or not.
            // tags:
            //      extension
            var isRoot = array.some(this.model.roots, function (root) {
                return root === this.model.getIdentity(item);
            }, this);

            if (isRoot) {
                return "epi-iconObjectRoot";
            } else if (item.isStartPage) {
                return "epi-iconObjectStart";
            } else {
                return this.inherited(arguments);
            }
        }
    });
});
