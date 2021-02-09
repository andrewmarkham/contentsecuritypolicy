require({cache:{
'url:epi-cms/component/templates/Versions.html':"<div>\r\n    <div class=\"epi-versions\" data-dojo-type=\"epi-cms/component/Versions\" data-dojo-attach-point=\"versions\"></div>\r\n    <div class=\"epi-gadget-bottom-container dijitHidden\" data-dojo-attach-point=\"bottomLinkContainer\">\r\n        <a class=\"epi-visibleLink epi-versions-language-link\">${res.showalllanguages}</a>\r\n    </div>\r\n</div>\r\n"}});
define("epi-cms/component/VersionsComponent", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/when",

    // Dijit
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",

    // EPi Framework
    "epi/dependency",

    // EPi CMS
    "epi-cms/component/_ShowAllLanguagesMixin",
    "epi-cms/component/Versions",

    // Resources
    "dojo/text!./templates/Versions.html",
    "epi/i18n!epi/cms/nls/episerver.cms.components.sitetree"
], function (
// Dojo
    array,
    declare,
    lang,
    domGeometry,
    domClass,
    when,

    // Dijit
    _LayoutWidget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    // EPi Framework
    dependency,

    // EPi CMS
    _ShowAllLanguagesMixin,
    Versions,

    // Resources
    template,
    res
) {

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ShowAllLanguagesMixin], {
        // summary:
        //      Component for displaying the versions list.
        //
        // tags:
        //      internal

        // templateString: [protected] String
        //		A string that represents the widget template.
        templateString: template,

        res: res,

        postCreate: function () {
            this.inherited(arguments);

            when(this.versions._isSiteMultilingual()).then(function (isSiteMultilingual) {
                if (!isSiteMultilingual) {
                    return;
                }
                this.loadShowAllLanguages().then(function (showAllLanguages) {
                    this.versions.set("showAllLanguages", showAllLanguages);
                    this._setShowAllLanguagesLinkVisibility(showAllLanguages);
                }.bind(this));
            }.bind(this));

            this.own(this.versions.watch("showAllLanguages", function () {
                var showAllLanguages = this.versions.get("showAllLanguages");
                if (this.showAllLanguages !== showAllLanguages) {
                    this.saveShowAllLanguages(showAllLanguages);
                }
                this.set("showAllLanguages", showAllLanguages);

                this._setShowAllLanguagesLinkVisibility(showAllLanguages);
            }.bind(this)));

            this.own(this.on(".epi-versions-language-link:click", function () {
                this.versions.set("showAllLanguages", true);
            }.bind(this)));
        },

        layout: function () {
            // summary:
            //		Resize and layout.
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
            var showAllLanguagesHeight = domClass.contains(this.bottomLinkContainer, "dijitHidden") ? 0 : domGeometry.getMarginBox(this.bottomLinkContainer).h;

            domGeometry.setMarginBox(this.versions.domNode, {
                w: this._contentBox.w,
                h: this._contentBox.h - showAllLanguagesHeight
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
