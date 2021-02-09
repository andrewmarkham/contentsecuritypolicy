define("epi-cms/component/SiteTree", [
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/when",
    "dojo/dom-style",
    "dijit/layout/_LayoutWidget",
    "dijit/Tooltip",
    "epi/Url",
    "epi-cms/component/SiteTreeModel",
    "epi-cms/component/SiteTreeNode",
    "epi/dependency",
    "epi/shell/command/_WidgetCommandProviderMixin",
    "epi/shell/command/ToggleCommand",
    "epi/shell/widget/Tree",
    "epi/i18n!epi/cms/nls/episerver.cms.components.sitetree"
], function (
    declare,
    Deferred,
    lang,
    array,
    when,
    domStyle,
    _LayoutWidget,
    Tooltip,
    Url,
    SiteTreeModel,
    SiteTreeNode,
    dependency,
    _WidgetCommandProviderMixin,
    ToggleCommand,
    Tree,
    resources
) {

    return declare([_LayoutWidget, _WidgetCommandProviderMixin], {
        // tags:
        //      internal

        profile: null,

        buildRendering: function () {
            this.inherited(arguments);

            // Set overflow to auto in order for the tree to be scrollable if this container is to small.
            domStyle.set(this.domNode, "overflow", "auto");
        },

        postCreate: function () {
            this.inherited(arguments);

            //Get the store and attach it to the model
            var registry = dependency.resolve("epi.storeregistry");
            var store = registry.get("epi.cms.sitestructure");

            this.profile = this.profile || dependency.resolve("epi.shell.Profile");

            var model = this._treeModel = new SiteTreeModel({store: store});

            //Create show all languages command
            var command = new ToggleCommand({
                category: "setting",
                label: resources.showalllanguages,
                model: model,
                property: "showAllLanguages"
            });

            this.commands.push(command);

            //Create the site and language tree
            this._tree = new Tree({
                model: model,
                showRoot: false,
                "class": "epi-simpleTree",
                persist: false,
                onClick: lang.hitch(this, function (item) {
                    if (!item.host || !item.languageId) {
                        // In case root node (another site in the sites tree) selected (mean that we do not have any information about host and language)
                        window.location.replace(item.editUrl);
                    } else {

                        var self = this;

                        // click on the language branch under a site (root node)
                        when(self.profile.setContentLanguage(item.languageId, item.host), function () {
                            // TECHNOTE: we try to keep the current viewing hostname if the editUrl and current url are sibling in the same (load balancing) site
                            // Example: {
                            //      siteUrl : http://site1,
                            //      hosts: ['site1', 'site1b']
                            //}
                            // if we are viewing site1b, and click on a languageBranch under siteUrl:http://site1, we still navigate to site1b (instead of go to http://site1)

                            var urlToNavigate = item.editUrl;
                            if (array.some(item.hosts, function (host) {
                                return host === window.location.host;
                            })) {
                                var editUrl = new Url(urlToNavigate);
                                editUrl.scheme = window.location.protocol.replace(":", "");
                                editUrl.authority = window.location.host;

                                urlToNavigate = editUrl.toString();
                            }

                            window.location.replace(urlToNavigate);
                        });
                    }
                }),
                _createTreeNode: function (args) {
                    return new SiteTreeNode(args);
                },
                _onNodeMouseEnter: function (node) {
                    if (node.item.isLanguageNode && !node.item.isAvailable) {
                        Tooltip.show(resources.notavailabletooltip, node.labelNode, ["after-centered", "below"]);
                    }
                },
                _onNodeMouseLeave: function (node) {
                    Tooltip.hide(node.labelNode);
                }
            });

            //Add the tree to the container
            this.addChild(this._tree);
        },

        layout: function () {
            this._tree.resize();
        },

        startup: function () {
            this.inherited(arguments);

            this._setTreePath();
        },

        _setTreePath: function () {
            Deferred.when(this._treeModel.getCurrentSite(), lang.hitch(this, function (config) {
                this._tree.set("path", ["root", config.currentSite, config.currentEditLanguageId]);
            }));
        }

    });
});
