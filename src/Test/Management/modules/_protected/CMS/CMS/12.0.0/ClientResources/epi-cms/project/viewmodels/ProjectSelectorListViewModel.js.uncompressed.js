define("epi-cms/project/viewmodels/ProjectSelectorListViewModel", [
    // dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Evented",
    "dojo/Stateful",
    "dojo/when",
    // dijit
    "dijit/Destroyable",

    //epi
    "epi/dependency",
    "epi/shell/command/OptionCommand",
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command.sort"
], function (
    // dojo
    declare,
    lang,
    Evented,
    Stateful,
    when,
    // dijit
    Destroyable,

    // epi
    dependency,
    OptionCommand,
    localizations
) {
    return declare([Stateful, Destroyable, Evented], {
        // summary:
        //      The view model for the epi-cms/project/ProjectSelectorList
        // tags:
        //      internal

        // namedCommands: [readonly] Object
        //      Way to access commands using named keys.
        namedCommands: null,

        // profile: [readonly] Profile
        //      The current user profile
        profile: null,

        // projectSortOrder: [public] Object
        //      The order to sort project items by.
        //
        projectSortOrder: null,

        // _commands: [readonly] epi/shell/command/_Command[]
        //      Commands to be consumed by the view.
        // tags:
        //      private
        _commands: null,

        _sortOrderProfileKey: "epi.project-sort-order",

        constructor: function () {
            // Initialize default value
            this.projectSortOrder = [{ attribute: "name", descending: false }];
        },
        postscript: function () {
            this.inherited(arguments);

            this.profile = this.profile || dependency.resolve("epi.shell.Profile");

            this._createCommands();
        },

        initialize: function () {
            // summary:
            //
            // returns: Promise
            //
            // tags:
            //      public

            return when(this.profile.get(this._sortOrderProfileKey), lang.hitch(this, function (sort) {
                var option = this._findSortOption("key", sort) || this.namedCommands.sortProject.options[0]; // default to name ascending
                this._changeAttrValue("projectSortOrder", option.value); // use the internal setter to not trigger a profile save
            }));
        },

        getCommands: function () {
            // summary:
            //      Returns all available commands
            // tags:
            //      public

            return this._commands;
        },

        _projectSortOrderSetter: function (sortOrder) {
            // summary:
            //      Store the sort order in the user profile
            //
            var option,
                key;

            if (sortOrder === null || (sortOrder && sortOrder === this.projectSortOrder)) {
                return;
            }

            this.projectSortOrder = sortOrder;

            option = this._findSortOption("value", sortOrder);
            key = option && option.key || null;

            this.profile.set(this._sortOrderProfileKey, key, {
                location: "server"
            });

        },

        _findSortOption: function (key, term) {

            var options = this.namedCommands.sortProject.options,
                option = null;

            term && options.some(function (item) {
                if (term === item[key]) {
                    option = item;
                    return true;
                }
            });

            return option;
        },

        _createCommands: function () {

            // TODO:
            // CSS classes to be used for toggleable sort options
            // .epi-iconSort
            // .epi-iconSortDescending
            // .epi-iconSortAscending

            var sortProject = new OptionCommand({
                model: this,
                category: "context",
                label: "label",
                property: "projectSortOrder",
                options: [{
                    label: localizations.nameascending,
                    key: "+Name",
                    value: [{
                        attribute: "name",
                        descending: false
                    }]
                }, {
                    label: localizations.namedescending,
                    key: "-Name",
                    value: [{
                        attribute: "name",
                        descending: true
                    }]
                }, {
                    label: localizations.createddescending,
                    key: "-DateCreated",
                    value: [{
                        attribute: "created",
                        descending: true
                    }, {
                        attribute: "name",
                        descending: false
                    }]
                }, {
                    label: localizations.createdascending,
                    key: "+DateCreated",
                    value: [{
                        attribute: "created",
                        descending: false
                    }, {
                        attribute: "name",
                        descending: false
                    }]
                }]
            });

            this.set("_commands", [
                sortProject
            ]);

            this.set("namedCommands", {
                sortProject: sortProject
            });
        }
    });
});
