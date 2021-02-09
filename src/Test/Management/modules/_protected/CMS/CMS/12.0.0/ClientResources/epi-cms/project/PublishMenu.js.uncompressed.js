require({cache:{
'url:epi-cms/project/templates/PublishMenu.html':"<div tabIndex=\"${tabIndex}\" role=\"menu\" class=\"epi-invertedTooltip epi-publishActionMenu\" data-dojo-attach-point=\"containerNode\" data-dojo-attach-event=\"onkeypress:_onKeyPress\">\r\n    <div class=\"epi-tooltipDialogTop\">\r\n        <ul>\r\n            <li data-dojo-attach-point=\"primarySection\" class=\"epi-projectStatusMessage\"></li>\r\n            <li data-dojo-attach-point=\"publishMenuNode\"></li>\r\n        </ul>\r\n    </div>\r\n    <div data-dojo-attach-point=\"statusSection\" class=\"epi-tooltipDialogInfo\"></div>\r\n    <table class=\"epi-tooltipDialogMenu epi-menuInverted\" cellspacing=\"0\">\r\n        <tbody data-dojo-attach-point=\"projectActionMenu\"></tbody>\r\n    </table>\r\n</div>\r\n"}});
define("epi-cms/project/PublishMenu", [
    "dojo/_base/declare",
    "dojo/on",

    "dijit/DropDownMenu",
    "dijit/registry",

    "epi/shell/command/builder/MenuAssembler",
    "epi/shell/command/builder/MenuBuilder",
    "epi/shell/widget/_SectionedTemplatedMixin",

    "./command/PublishMenuButtonBuilder",

    "dojo/text!./templates/PublishMenu.html"
], function (
    declare,
    on,

    DropDownMenu,
    registry,

    MenuAssembler,
    MenuBuilder,
    _SectionedTemplatedMixin,
    PublishMenuButtonBuilder,

    template
) {

    return declare([DropDownMenu, _SectionedTemplatedMixin], {
        // summary:
        //      Composite menu for displaying a publish button and general commands for a content item.
        //      It also sports two custom regions for information text, links or widgets.
        //
        // description:
        //      Composite popup menu containing two regions for exposing commands and two custom regions
        //      for showing general markup, text or widgets.
        //
        //      A command can be placed in the top, publish region, by setting the command category to
        //      "publishmenu-primary". The primary commands will be represented by buttons and won't close
        //      the menu when executed.
        //      By setting the command category to "publishmenu", the command will be added to the lower
        //      region as regular menu options.
        //
        //      The two custom regions, "primarySection" and "statusSection", is populated from the named
        //      sections in source content.
        //
        //      Markup example:
        //
        // |    <div id="publishMenu" data-dojo-type="epi-cms/project/PublishMenu">
        // |        <span data-epi-section="primarySection">Hello World!</span>
        // |        <span data-epi-section="statusSection">
        // |            <ul>
        // |                <li>Good evening!</li>
        // |            </ul>
        // |        </span>
        // |    </div>
        //
        // tags:
        //      internal

        sections: ["primarySection", "statusSection"],

        templateString: template,

        buildRendering: function () {
            this.inherited(arguments);

            var configuration = [{
                builder: new PublishMenuButtonBuilder({
                    settings: {
                        "class": "epi-button--bold epi-button--full-width epi-success",
                        isExecutingClass: "epi-loading"
                    },
                    optionClass: "epi-menu--inverted",
                    optionItemClass: "epi-radioMenuItem"
                }),
                category: "publishmenu-primary",
                target: this.publishMenuNode
            }, {
                builder: new MenuBuilder(),
                category: "publishmenu",
                target: this.projectActionMenu
            }];

            this.own(this._menuAssembler = new MenuAssembler({
                configuration: configuration
            }));

            // The PublishMenuButtonBuilder makes sure that any button being "undisplayed" while focused
            // emits an event before focus is lost.
            this.own(on(this.domNode, "beforeFocusedButtonRemoved", this.domNode.focus));
        },

        childSelector: function (/*DOMNode*/ node) {
            // summary:
            //		Selector (passed to on.selector()) used to identify MenuItem child widgets, but exclude inert children
            //		like MenuSeparator.
            // tags:
            //		protected

            // Called by _MenuBase. to determine which items are menu options. Exclude the publish button,
            // since buttons handle their own click execution
            var widget = registry.byNode(node);
            return widget && widget.focus && (node.parentNode === this.projectActionMenu);
        },

        getChildren: function () {
            // summary:
            //      Returns publish button and menu options. Used by _KeyNavContainer to navigate between nodes.

            return [].concat(
                registry.findWidgets(this.publishMenuNode),
                registry.findWidgets(this.projectActionMenu));
        },

        _setCommandSourceAttr: function (commandSource) {
            // summary:
            //      Set the command source which provides commands to the menu

            this._menuAssembler.set("commandSource", commandSource);
        },

        _getCommandSourceAttr: function () {
            // summary:
            //      Gets the command source from the internal menu assembler

            return this._menuAssembler.get("commandSource");
        }
    });
});
