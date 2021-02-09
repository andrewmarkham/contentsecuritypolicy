require({cache:{
'url:epi-cms/component/templates/GlobalToolbar.html':"﻿<div class=\"dijit epi-globalToolbar\" role=\"toolbar\" tabIndex=\"${tabIndex}\" data-dojo-attach-point=\"containerNode\">\r\n    <div class=\"epi-toolbarGroupContainer\">\r\n        <div class=\"epi-toolbarLeading epi-toolbarGroup\">\r\n            <span data-dojo-attach-point=\"leadingContainerNode\"></span\r\n            ><span data-dojo-attach-point=\"viewNode\"></span\r\n            ><span data-dojo-attach-point=\"compareNode\"></span>\r\n        </div>\r\n        <div data-dojo-attach-point=\"centerContainerNode\" class=\"epi-toolbarCenter epi-toolbarGroup\"></div>\r\n        <div data-dojo-attach-point=\"trailingContainerNode\" class=\"epi-toolbarTrailing epi-toolbarGroup\"></div>\r\n    </div>\r\n</div>"}});
﻿define("epi-cms/component/GlobalToolbar", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/store/Memory",

    // Dijit
    "dijit/registry",
    "dijit/Toolbar",

    // EPi CMS
    "epi/shell/command/_CommandModelBindingMixin",
    "epi/shell/command/_WidgetCommandConsumerMixin",
    "epi/shell/command/builder/_Builder",
    "epi/shell/command/builder/MenuAssembler",
    "epi/shell/command/builder/DropDownButtonBuilder",
    "epi/shell/command/builder/ExpandoMenuBuilder",

    //Template
    "dojo/text!./templates/GlobalToolbar.html",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
],

function (
// Dojo
    declare,
    lang,

    domStyle,

    Memory,

    // Dijit
    registry,
    Toolbar,

    // EPi CMS
    _CommandModelBindingMixin,
    _WidgetCommandConsumerMixin,
    _Builder,
    MenuAssembler,
    DropDownButtonBuilder,
    ExpandoMenuBuilder,

    template,
    resources
) {

    var _MenuBuilder = declare([_Builder], {
        _create: function (command) {
            //Declare a new widget and add the _CommandModelBindingMixin
            var widgetPrototype = declare([command.settings.widget, _CommandModelBindingMixin]);

            //Create the new widget
            return new widgetPrototype(command.settings);
        }
    });

    var _MenuAssembler = declare([MenuAssembler], {
        _getBuildInfo: function (command) {
            // summary:
            //      Return the builder information for a specific command based on its category property
            // tags: private

            //Get the category from the settings object instead of the command
            if (command.settings.category) {

                var i = this.configuration.length - 1;
                for (; i > 0; i--) {
                    if (this.configuration[i].category === command.settings.category) {
                        return this.configuration[i];
                    }
                }
            }

            return this.configuration[0];
        }
    });

    return declare([Toolbar, _WidgetCommandConsumerMixin], {
        // summary:
        //      A component providing the global toolbar.
        //
        // tags:
        //      internal

        templateString: template,

        commandKey: "epi.cms.globalToolbar",

        postCreate: function () {
            // summary: Overridden to add buttons to the tool bar once the toolbar itself has been created.

            this.inherited(arguments);

            //Assemble the menu for the available commands
            var builder = new _MenuBuilder();

            var dropDownBuilder = new DropDownButtonBuilder({
                settings: {
                    title: resources.createcontent.title,
                    "class": "epi-mediumButton epi-disabledDropdownArrow",
                    iconClass: "epi-iconPlus",
                    showLabel: false
                },
                hideEmptyButton: true
            });

            var assemblerConfig = [
                { category: "leading", builder: builder, target: this.leadingContainerNode },
                { category: "view", builder: new ExpandoMenuBuilder({
                    optionClass: "epi-menu--inverted",
                    optionItemClass: "epi-radioMenuItem"
                }), target: this.viewNode },
                { category: "center", builder: builder, target: this.centerContainerNode },
                { category: "trailing", builder: builder, target: this.trailingContainerNode },
                { category: "create", builder: dropDownBuilder, target: this.leadingContainerNode },
                { category: "compare", builder: new ExpandoMenuBuilder({
                    optionClass: "epi-menu--inverted",
                    optionItemClass: "epi-radioMenuItem"
                }), target: this.compareNode }
            ];

            var assembler = new _MenuAssembler({ configuration: assemblerConfig, commandSource: this });
            assembler.build();
        },

        _getNextFocusableChild: function (child, dir) {
            // summary:
            //      Returns the next or previous focusable child, compared
            //      to "child"
            // child: Widget
            //      The current widget
            // dir: Integer
            //      * 1 = after
            //      * -1 = before

            var children = this.getChildren();
            var index = children.indexOf(child);

            index = (dir > 0) ? index + 1 : index - 1;
            if (index < 0) {
                index = children.length - 1;
            } else if (index >= children.length) {
                index = 0;
            }

            return children[index];
        }
    });
});
