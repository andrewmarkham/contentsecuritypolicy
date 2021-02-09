require({cache:{
'url:epi-cms/widget/templates/PersonalizationSelector.html':"﻿<div class=\"epi-menu--inverted\">\r\n    <div class=\"epi-dijitTooltipContainer\">\r\n        <div class=\"epi-invertedTooltip\">\r\n            <div class=\"epi-tooltipDialogTop\">\r\n                <span data-dojo-attach-point=\"header\">${resources.whocansee}</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"epi-tooltipDialogContent--max-height\">\r\n            <div data-dojo-type=\"dijit/Menu\" data-dojo-attach-point=\"visitorGroupsMenu\" style=\"width:100%\"></div>\r\n            <div class=\"epi-menuSeparator\" tabindex=\"-1\"></div>\r\n            <div data-dojo-type=\"dijit/Menu\" data-dojo-attach-point=\"filterOptionsMenu\" style=\"width:100%\">\r\n                <div data-dojo-attach-point=\"rdEveryone\" data-dojo-type=\"epi/shell/widget/RadioMenuItem\" data-dojo-props=\"label:'${resources.everyone}', value: ''\"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/widget/PersonalizationSelector", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    "dojo/when",
    "dojox/html/entities",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/CheckedMenuItem",
    "epi/dependency",
    // Resouces
    "dojo/text!./templates/PersonalizationSelector.html",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea.personalize",
    // Widgets used in template
    "dijit/Menu",
    "epi/shell/widget/RadioMenuItem"
], function (
    array,
    declare,
    lang,
    Stateful,
    when,
    entities,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    CheckedMenuItem,
    dependency,
    // Resouces
    template,
    resources
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // tags:
        //      internal

        templateString: template,

        model: null,

        resources: resources,

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.store) {
                var registry = dependency.resolve("epi.storeregistry");
                this.store = registry.get("epi.cms.visitorgroup");
            }
        },

        postCreate: function () {
            this.inherited(arguments);

            this.own(
                this.rdEveryone.on("change", lang.hitch(this, "restoreDefault")),
                this.model.watch("roleIdentities", lang.hitch(this, function () {
                    if (!this.rdEveryone.checked && this.model.roleIdentities && this.model.roleIdentities.length === 0) {
                        this.restoreDefault();
                    }
                }))
            );

            //Query the store for all groups
            when(this.store.query(), lang.hitch(this, function (groups) {
                if (!this._destroyed) {
                    this.set("visitorGroups", groups);
                }
            }));
        },

        restoreDefault: function () {
            array.forEach(this.visitorGroupsMenu.getChildren(), function (item) {
                item.set("checked", false);
            });

            this.rdEveryone.set("checked", true);
            this.model.modify(function () {
                this.model.resetRoleIdentities();
            }, this);
        },

        _setVisitorGroupsAttr: function (groups) {
            this._set("visitorGroups", groups);

            if (!this.model.hasAnyRoles()) {
                this.rdEveryone.set("checked", true);
            }

            array.forEach(groups, function (group) {

                var item = new CheckedMenuItem({
                    label: entities.encode(group.name),
                    visitorgroupId: group.id,
                    checked: this.model.isRoleSelected(group.id)
                });

                this.own(item.watch("checked", lang.hitch(this, function (property, oldValue, newValue) {
                    this.model.modify(function () {
                        this.model.selectRole(group.id, newValue);
                    }, this);

                    this.rdEveryone.set("checked", !this.model.hasAnyRoles());
                })));

                this.visitorGroupsMenu.addChild(item);
            }, this);
        }
    });
});
