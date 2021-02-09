require({cache:{
'url:epi-cms/version/template/VersionSelector.html':"<div>\r\n    <div data-dojo-attach-point=\"languageSelectorContainer\" class=\"epi-flatToolbar\">\r\n        <select data-dojo-attach-point=\"languageSelector\" data-dojo-type=\"epi-cms/version/LanguageSelector\" class=\"epi-flat epi-chromeless epi-chromeless--with-arrow\"></select>\r\n    </div>\r\n    <div data-dojo-attach-point=\"gridNode\" class=\"epi-plain-grid epi-grid-max-height--300\"></div>\r\n</div>\r\n"}});
define("epi-cms/version/VersionSelector", [
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/keys",
    "epi-cms/core/ContentReference",
    // Resources
    "dojo/text!./template/VersionSelector.html",
    "epi/i18n!epi/shell/ui/nls/episerver.shared.header",
    // Grid
    "dgrid/OnDemandGrid",
    "dgrid/extensions/DijitRegistry",
    "dgrid/Keyboard",
    "dgrid/Selection",
    "dgrid/extensions/ColumnHider",
    "epi/shell/dgrid/Focusable",
    "epi/shell/dgrid/selection/Exclusive",
    "epi/shell/dgrid/util/misc",
    "epi-cms/dgrid/formatters",
    // Parent class and mixins
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_KeyNavContainer",
    "epi/shell/widget/_FocusableMixin",
    // Widgets in template
    "epi-cms/version/LanguageSelector"
], function (
    declare,
    event,
    lang,
    aspect,
    domClass,
    keys,
    ContentReference,
    // Resources
    template,
    localizations,
    // Grid
    OnDemandGrid,
    DijitRegistry,
    Keyboard,
    Selection,
    ColumnHider,
    Focusable,
    Exclusive,
    misc,
    formatters,
    // Parent class and mixins
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _KeyNavContainer,
    _FocusableMixin
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _KeyNavContainer, _FocusableMixin], {
        // tags:
        //      internal

        // baseClass: [protected] String
        //      Base CSS class of the widget, used to construct CSS classes to indicate widget state.
        baseClass: "epi-version-selector",

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // contentLink: [public] String
        //      The content link of the content for which to display versions.
        contentLink: null,

        // markedContentLink: [public] String
        //      The content link of the version which should be marked as in use.
        markedContentLink: null,

        // languages: [public] Array
        //      The languages to display in the language selector.
        languages: null,

        // store: [public] Store
        //      The store that will be queried for versions.
        store: null,

        // region: [public] String
        //      The region for which this version selector is relevant.
        region: null,

        buildRendering: function () {
            // summary:
            //      Construct the UI for this widget via dijit/_TemplatedMixin with the addition
            //      of a dgrid added via code.
            // tags:
            //      protected
            this.inherited(arguments);

            this.grid = new (declare([OnDemandGrid, DijitRegistry, Keyboard, Selection, Exclusive, Focusable, ColumnHider]))({
                columns: {
                    selector: {
                        label: "",
                        formatter: function () {
                            return misc.icon("epi-iconCheckmark");
                        },
                        sortable: false
                    },
                    icon: {
                        label: "",
                        formatter: function () {
                            return misc.icon("");
                        },
                        sortable: false
                    },
                    language: {
                        label: localizations.language,
                        sortable: false
                    },
                    status: {
                        label: localizations.status,
                        renderCell: formatters.commonDraft
                    },
                    savedDate: {
                        label: localizations.saved,
                        formatter: formatters.localizedDate,
                        className: "epi-grid--30"
                    },
                    savedBy: {
                        label: localizations.by,
                        formatter: formatters.userName,
                        sortable: false
                    }
                },
                cellNavigation: false,
                selectionEvents: "click",
                selectionMode: "exclusive",
                sort: [{ attribute: "savedDate", descending: true }]
            }, this.gridNode);

            // Own the grid and the event handlers.
            this.own(
                this.grid,
                this.grid.on("dgrid-refresh-complete", lang.hitch(this, "_refreshComplete")),
                this.grid.on("dgrid-select", lang.hitch(this, "_versionSelected")),
                aspect.around(this.grid, "renderRow", lang.hitch(this, "_renderRow")),
                this.languageSelector.watch("value", lang.hitch(this, "_updateFilter")),
                this.on("keydown", lang.hitch(this, "_onKeydown"))
            );
        },

        startup: function () {
            // summary:
            //      Processing after the widget and its children have been created and
            //      added to the DOM. Setup the initial query and store for the grid.
            // tags:
            //      protected
            if (this._started) {
                return;
            }
            this.inherited(arguments);

            this.grid.startup();
            this.grid.set("store", this.store, { contentLink: this.contentLink });
        },

        resize: function () {
            // summary:
            //      Resizes the version selector and its children.
            // tags:
            //      public
            this.inherited(arguments);
            this.grid.resize();
        },

        refresh: function () {
            // summary:
            //      Refreshes the version selector to ensure the data displayed is up to date.
            // tags:
            //      public
            if (this._started) {
                this.grid.refresh();
            }
        },

        _setContentLinkAttr: function (contentLink) {
            // summary:
            //      Sets the contentLink and updates the grid.
            // tags:
            //      private
            if (this.contentLink === contentLink) {
                // Early exit if setting the same value since we shouldn't update the query or selection.
                return;
            }

            if (this._started && !ContentReference.compareIgnoreVersion(this.contentLink, contentLink)) {
                // We do not want to cause a query if the new content link is just a different version
                // of the same content.
                this.languageSelector.set("value", this.languageSelector.defaultOption.value);
                this.grid.set("query", { contentLink: contentLink });
            }

            this.contentLink = contentLink;

            this.grid.clearSelection();
            this.grid.select(contentLink);
        },

        _setCurrentLanguageAttr: function (language) {
            // summary:
            //      Sets the current language of the content and updates the language selector.
            // tags:
            //      protected
            this._set("currentLanguage", language);
            this.languageSelector.set("currentLanguage", language);
        },

        _setLanguagesAttr: function (languages) {
            // summary:
            //      Sets the languages the current content is available for and updates the language selector.
            // tags:
            //      protected
            this._set("languages", languages);
            this.languageSelector.set("languages", languages);

            var hasLanguageSupport = languages && languages.length;

            this.languageSelector.set("disabled", !hasLanguageSupport); // Disable the language selector so that it can't get focus.
            domClass.toggle(this.languageSelectorContainer, "dijitHidden", !hasLanguageSupport);
            this.grid.toggleColumnHiddenState("language", !hasLanguageSupport);
        },

        _setMarkedContentLinkAttr: function (contentLink) {
            // summary:
            //      Sets the contentLink and updates the grid.
            // tags:
            //      private
            var row = this._getRowElement(this.markedContentLink);
            if (row) {
                // Remove the CSS class from the current marked row.
                domClass.remove(row, "dgrid-row--marked");
            }

            row = this._getRowElement(contentLink);
            if (row) {
                // Add the CSS class to the new marked row.
                domClass.add(row, "dgrid-row--marked");
            }

            this.markedContentLink = contentLink;
        },

        _setRegionAttr: function (region) {
            // summary:
            //      Sets the contentLink and updates the grid.
            // tags:
            //      private
            var newClass = this.baseClass + "--" + region,
                oldClass = this.baseClass + "--" + this.region;

            this.region = region;

            domClass.replace(this.domNode, newClass, oldClass);
        },

        _refreshComplete: function () {
            // summary:
            //      Selects the current version and marks the marked version when a refresh occurs.
            // tags:
            //      private
            this.grid.select(this.contentLink);

            this.emit("loaded");
        },

        _versionSelected: function (e) {
            // summary:
            //      Extracts the version information and emits a change event.
            // tags:
            //      private
            if (e.parentType) {
                var version = e.rows && e.rows[0].data;
                this.contentLink = version.contentLink;
                this.emit("change", { version: version });
            }
        },

        _renderRow: function (originalMethod) {
            var self = this;

            return function (item) {
                var row = originalMethod.apply(this, arguments);
                if (item.contentLink === self.markedContentLink) {
                    domClass.add(row, "dgrid-row--marked");
                }
                return row;
            };
        },

        _getRowElement: function (contentLink) {
            // summary:
            //      Get the DOM node for the row matching the given content link.
            // tags:
            //      private
            if (contentLink) {
                return this.grid.row(contentLink).element;
            }
        },

        _updateFilter: function (name, oldValue, value) {
            // summary:
            //      update the query filter with the selected language and refresh the grid
            // tags:
            //      private
            if (this._started) {
                if (value !== this.languageSelector.defaultOption.value) {
                    this.grid.set("query", { contentLink: this.contentLink, language: value });
                } else {
                    this.grid.set("query", { contentLink: this.contentLink });
                }
            }
            this.refresh();
        },

        _onKeydown: function (evt) {
            // summary;
            //      Event handler for key presses to take care of tabbing within the version selector.
            // tags:
            //      private
            if (evt.ctrlKey || evt.altKey || evt.keyCode !== keys.TAB) {
                return;
            }

            if (evt.shiftKey) {
                this.focusPrev();
            } else {
                this.focusNext();
            }

            event.stop(evt);
        }
    });
});
