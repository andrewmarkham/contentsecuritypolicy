define("epi-cms/component/SharedBlocks", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-class",

    "dojo/on",
    // epi
    "epi-cms/asset/HierarchicalList",
    "epi-cms/component/SharedBlocksViewModel",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.createblock",
    "epi/i18n!epi/cms/nls/contenttypes.blockdata",
    "epi/i18n!epi/cms/nls/episerver.cms.components.sitetree"
],

function (
// dojo
    array,
    declare,
    lang,
    aspect,
    domConstruct,
    domGeometry,
    domClass,
    on,
    // epi
    HierarchicalList,
    SharedBlocksViewModel,
    // resources
    componentResources,
    res,
    sitetreeRes) {

    return declare([HierarchicalList], {
        // summary:
        //      Shared blocks component
        // tags:
        //      internal

        // showCreateContentArea: [public] Boolean
        //      Flag which indicates whether the create content area should be displayed on startup.
        showCreateContentArea: false,

        modelClassName: SharedBlocksViewModel,

        noDataMessages: componentResources.nodatamessages,

        // hierarchicalListClass: [readonly] String
        //      The CSS class to be used on the content list.
        hierarchicalListClass: "epi-blockList",

        // createContentIcon: [public] String
        //      The icon class to be used in the create content area of the list.
        createContentIcon: "epi-iconPlus",

        // createContentText: [public] String
        createContentText: res.create,

        postMixInProperties: function () {
            this.inherited(arguments);

            this.modelBindingMap.showAllLanguages = ["showAllLanguages"];
        },

        buildRendering: function () {
            this.inherited(arguments);

            // Aspect the renderQuery method on the grid to get the number of items rendered after a query has executed
            // We can't depend on the "dgrid-refresh-complete" event from the grid because it might not always return the correct result
            // e.g if two refresh were initiated at almost the same time we will only get the event for the first refresh call
            var self = this;
            this.own(aspect.after(this.list.grid, "renderQuery", function (results) {
                return results.then(function (results) {
                    var showCreateContentArea = results.length > 0 ? false : self.model.getCommand("newBlockDefault").get("canExecute");
                    self._toggleCreateContentArea(showCreateContentArea);
                });
            }));

            var link = domConstruct.create("a", {
                "class": "epi-visibleLink",
                innerHTML: sitetreeRes.showalllanguages
            });
            this.own(on(link, "click", function () {
                this.model.set("showAllLanguages", true);
            }.bind(this)));

            this.bottomLinkContainer = domConstruct.toDom("<div class=\"epi-gadget-bottom-container dijitHidden\"></div>");
            domConstruct.place(link, this.bottomLinkContainer);

            domConstruct.place(this.bottomLinkContainer, this.domNode);
        },

        layout: function () {
            var showAllLanguagesHeight = domClass.contains(this.bottomLinkContainer, "dijitHidden") ? 0 : domGeometry.getMarginBox(this.bottomLinkContainer).h;

            var searchBoxSize = domGeometry.getMarginBox(this.searchBoxNode),
                containerSize = {
                    h: this._contentBox.h - searchBoxSize.h - showAllLanguagesHeight,
                    w: this._contentBox.w,
                    l: this._contentBox.l,
                    t: this._contentBox.t
                };

            this.container.resize(containerSize);
        },

        _onCreateAreaClick: function () {
            // summary:
            //      A callback function which is executed when the create area is clicked.
            // tags:
            //      protected
            this.inherited(arguments);
            this.model._commandRegistry.newBlockDefault.command.execute();
        },

        _setShowAllLanguagesAttr: function (showAllLanguages) {
            this._set("showAllLanguages", showAllLanguages);
            domClass.toggle(this.bottomLinkContainer, "dijitHidden", showAllLanguages);
            if (this._contentBox) {
                this.layout();
            }
        }
    });

});
