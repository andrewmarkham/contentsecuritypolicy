require({cache:{
'url:epi-cms/component/templates/MainNavigation.html':"<div>\r\n    <div data-dojo-type=\"epi-cms/widget/SearchBox\" data-dojo-attach-point=\"search\" class=\"epi-gadgetInnerToolbar\"></div>\r\n    <div data-dojo-attach-point=\"navigation\" style=\"overflow:auto;\">\r\n    </div>\r\n    <div class=\"epi-gadget-bottom-container dijitHidden\" data-dojo-attach-point=\"bottomLinkContainer\">\r\n        <a class=\"epi-visibleLink epi-main-navigation-language-link\">${res.showalllanguages}</a>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/component/MainNavigationComponent", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/when",
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "epi-cms/component/_ShowAllLanguagesMixin",
    "epi/dependency",
    "epi/i18n!epi/cms/nls/episerver.cms.components.sitetree",
    "dojo/text!./templates/MainNavigation.html",
    "epi-cms/widget/SearchBox"
], function (
    array,
    declare,
    lang,
    domGeometry,
    domClass,
    when,
    _LayoutWidget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _ShowAllLanguagesMixin,

    dependency,
    res,
    template
) {

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ShowAllLanguagesMixin], {
        // summary:
        //      Component for displaying the navigation panel with a search area and a pluggable page selection widget.
        //
        // tags:
        //      internal

        // templateString: [protected] String
        //		A string that represents the widget template.
        templateString: template,

        res: res,

        contentRepositoryDescriptors: null,

        postCreate: function () {
            this.inherited(arguments);

            this.contentRepositoryDescriptors = this.contentRepositoryDescriptors || dependency.resolve("epi.cms.contentRepositoryDescriptors");
            var settings = this.contentRepositoryDescriptors.get(this.repositoryKey);

            var roots = this.roots ? this.roots : settings.roots;

            this.search.set("area", settings.searchArea);
            this.search.set("searchRoots", roots);

            var componentType = settings.customNavigationWidget || "epi-cms/component/ContentNavigationTree";

            require([componentType], lang.hitch(this, function (innerComponentClass) {
                var innerComponent = new innerComponentClass(
                    {
                        typeIdentifiers: settings.mainNavigationTypes ? settings.mainNavigationTypes : settings.containedTypes,
                        containedTypes: settings.containedTypes,
                        settings: settings,
                        roots: roots,
                        repositoryKey: this.repositoryKey
                    }
                );
                innerComponent.placeAt(this.navigation);
                this.tree = innerComponent;

                when(this.tree._isSiteMultilingual()).then(function (isSiteMultilingual) {
                    if (!isSiteMultilingual) {
                        return;
                    }
                    this.loadShowAllLanguages().then(function (showAllLanguages) {
                        innerComponent.set("showAllLanguages", showAllLanguages);
                        this._setShowAllLanguagesLinkVisibility(showAllLanguages);
                    }.bind(this));
                }.bind(this));

                // Resize the tree once it is added to the UI to ensure the indentation
                // is calculated correctly.
                this.tree.resize();

                this.own(this.tree.watch("showAllLanguages", function (value) {
                    var showAllLanguages = this.tree.get("showAllLanguages");
                    this.search.set("filterOnCulture", !showAllLanguages);
                    if (this.showAllLanguages !== showAllLanguages) {
                        this.saveShowAllLanguages(showAllLanguages);
                    }
                    this.set("showAllLanguages", showAllLanguages);

                    this._setShowAllLanguagesLinkVisibility(showAllLanguages);
                }.bind(this)));
            }));

            this.own(this.on(".epi-main-navigation-language-link:click", function () {
                this.tree.set("showAllLanguages", true);
            }.bind(this)));
        },

        layout: function () {
            // summary:
            //		Resize and layout the search box and page selector widget.
            // tags:
            //		protected

            var cb = this._contentBox, ocb = this._oldContentBox;

            if (!cb) {
                return;
            }

            if (!ocb || cb.w !== ocb.w || cb.h !== ocb.h) {
                this._oldContentBox = cb;
                this._relayout();
            }
        },

        _relayout: function () {
            var sb = domGeometry.getMarginBox(this.search.domNode);

            var showAllLanguagesHeight = domClass.contains(this.bottomLinkContainer, "dijitHidden")  ? 0 : domGeometry.getMarginBox(this.bottomLinkContainer).h;

            domGeometry.setMarginBox(this.navigation, {
                w: this._contentBox.w,
                h: this._contentBox.h - sb.h - showAllLanguagesHeight
            });
        },

        _setShowAllLanguagesLinkVisibility: function (showAllLanguages) {
            domClass.toggle(this.bottomLinkContainer, "dijitHidden", showAllLanguages);
            if (!this._contentBox) {
                return;
            }
            this._relayout();
        }
    });
});
