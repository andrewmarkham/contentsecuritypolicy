require({cache:{
'url:epi/shell/widget/layout/templates/CollapsibleContainer.html':"﻿<div>\r\n    <div class=\"epi-gadgetTitle dojoxDragHandle\" data-dojo-attach-point=\"titleBarNode\">\r\n        <div data-dojo-attach-point=\"focusNode\" class=\"epi-gadgetTitleFocus dijitInline\">\r\n            <button data-dojo-type=\"dijit/form/ToggleButton\" data-dojo-attach-point=\"_toggleButton\"\r\n                data-dojo-attach-event=\"onClick: _toggle\" data-dojo-props=\"title:'${res.togglebuttontooltip}', showLabel:true, iconClass:'epi-gadget-toggle', 'class':'epi-chromelessButton'\">${title}</button>\r\n        </div>\r\n\r\n        <span class=\"epi-extraIconsContainer\" style=\"float:right\">\r\n            <a class=\"dijitInline dijitIcon epi-extraIcon epi-pt-contextMenu\" style=\"min-width:16px\" data-dojo-attach-event=\"onClick: _onContextMenu\">&nbsp;</a>\r\n        </span>\r\n        \r\n    </div>\r\n    <div data-dojo-attach-point=\"containerNode\"></div>\r\n</div>\r\n"}});
﻿define("epi/shell/widget/layout/CollapsibleContainer", [
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/_base/event",
    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_base/wai",
    "dijit/_CssStateMixin",

    "epi/i18n!epi/shell/ui/nls/episerver.shell.ui.resources.gadgetchrome",
    "dojo/text!./templates/CollapsibleContainer.html",

    "dijit/form/ToggleButton"
],
function (declare, domStyle, event, _WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin, Wai, _CssStateMixin, res, template) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, _CssStateMixin], {
        // tags:
        //      internal

        res: res,
        templateString: template,

        postCreate: function () {
            this.inherited(arguments);
        },

        _toggle: function (open) {
            this.set("open", !this._toggleButton.get("checked"));
        },

        _setOpenAttr: function (open) {
            this._set("open", open);

            if (this.containerNode) {
                domStyle.set(this.containerNode, "display", this.open ? "" : "none");
            }
        },

        _setTitleAttr: function (title) {
            this._set("title", title);

            if (this._toggleButton) {
                this._toggleButton.set("label", title);
            }
        },

        _onContextMenu: function (e) {
            if (!this.contextMenu) {
                return;
            }

            event.stop(e);
            this.contextMenu.scheduleOpen(e.target, null, { x: e.pageX, y: e.pageY });
        }
    });
});
