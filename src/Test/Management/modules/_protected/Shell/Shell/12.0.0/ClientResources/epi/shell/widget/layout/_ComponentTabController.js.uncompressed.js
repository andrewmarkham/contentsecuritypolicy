require({cache:{
'url:epi/shell/widget/layout/templates/_ComponentTabController.htm':"﻿<div class=\"dijitTabListContainer-${tabPosition}\" style=\"visibility:hidden\">\r\n    \r\n    <div data-dojo-type=\"dijit.layout._ScrollingTabControllerMenuButton\"\r\n         class=\"tabStripButton-${tabPosition}\"\r\n         id=\"${id}_menuBtn\"\r\n         data-dojo-props=\"containerId: '${containerId}', iconClass: 'dijitTabStripMenuIcon',\r\n\t\t\t\t\tdropDownPosition: ['below-alt', 'above-alt']\"\r\n         data-dojo-attach-point=\"_menuBtn\" showLabel=\"false\" title=\"\">&#9660;</div>\r\n    <div data-dojo-type=\"dijit.layout._ScrollingTabControllerButton\"\r\n         class=\"tabStripButton-${tabPosition}\"\r\n         id=\"${id}_leftBtn\"\r\n         data-dojo-props=\"iconClass:'dijitTabStripSlideLeftIcon', showLabel:false, title:''\"\r\n         data-dojo-attach-point=\"_leftBtn\" data-dojo-attach-event=\"onClick: doSlideLeft\">&#9664;</div>\r\n    <div data-dojo-type=\"dijit.layout._ScrollingTabControllerButton\"\r\n         class=\"tabStripButton-${tabPosition}\"\r\n         id=\"${id}_rightBtn\"\r\n         data-dojo-props=\"iconClass:'dijitTabStripSlideRightIcon', showLabel:false, title:''\"\r\n         data-dojo-attach-point=\"_rightBtn\" data-dojo-attach-event=\"onClick: doSlideRight\">&#9654;</div>\r\n    <div class='dijitTabListWrapper' data-dojo-attach-point='tablistWrapper'>\r\n        <div role='tablist' data-dojo-attach-event='onkeypress:onkeypress' data-dojo-attach-point='containerNode' class=\"nowrapTabStrip\" >\r\n            <div data-dojo-type=\"dijit.form.ToggleButton\" data-dojo-attach-point=\"toggleButton\" data-dojo-attach-event=\"onClick:_toggle\" data-dojo-props=\"showLabel:true, iconClass:'epi-gadget-toggle', 'class':'epi-chromelessButton'\"></div>\r\n        </div>\r\n    </div>\r\n</div>"}});
﻿define("epi/shell/widget/layout/_ComponentTabController", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/Evented",
    "dojo/text!./templates/_ComponentTabController.htm",
    "dijit/layout/ScrollingTabController",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/ToggleButton"
], function (
    array,
    declare,
    lang,
    domStyle,
    domAttr,
    domClass,
    Evented,
    template,
    ScrollingTabController,
    _WidgetsInTemplateMixin,

    //Used in template
    ToggleButton
) {

    return declare([ScrollingTabController, _WidgetsInTemplateMixin, Evented], {
        // summary:
        //      A component container where added children are chromed and placed inside different tabs.
        //
        // tags:
        //      internal

        templateString: template,

        title: "",

        // toggleable: [public] Boolean
        //    Whether pane can be opened or closed by clicking the title bar.
        toggleable: true,

        // open: [public] Boolean
        //    Whether pane is opened or closed.
        open: true,

        addChild: function (child, index) {

            //We need to add the tabs after the toggle button
            if (index && typeof index == "number") {
                index++;
            } else {
                index = this.getChildren().length + 1;
            }

            this.inherited("addChild", [child, index]);

            //If the pane is closed hide the child
            domStyle.set(child.domNode, "display", this.open ? "" : "none");
        },

        _toggle: function (/*Event*/e) {
            //If e is undefined the toggle has been triggered by a navigation using arrow keys and that should not trigger a toggle of the container
            //This is a bit hackish but the StackController triggers an onClick on the element it finds and it is not possible to override that without rewriting the entire keypressfunction
            if (e) {
                this._started && !this._initializing && this.set("open", !this.get("open"));
            }
        },

        _setTitleAttr: function (title) {
            this._set("title", title || "");
            this.toggleButton.set("label", title);
        },

        setOpen: function (open) {
            this._initializing = true;

            this.set("open", open);

            this.toggleButton.set("checked", !this.open);

            this._initializing = false;
        },

        _setOpenAttr: function (open) {
            this._set("open", open);

            //Add dijitClosed class to the tablistWrapper
            if (!this.open) {
                domClass.add(this.tablistWrapper, "closed");
            } else {
                domClass.remove(this.tablistWrapper, "closed");
            }

            //Show the button label
            this.toggleButton.set("showLabel", !this.open);

            array.forEach(this.getChildren(), lang.hitch(this, function (child) {
                if (child !== this.toggleButton) {
                    domStyle.set(child.domNode, "display", this.open ? "" : "none");
                }
            }));

            //Emit toggle event
            !this._initializing && this.emit("toggle", this.open);
        },

        _setToggleableAttr: function (canToggle) {
            this._set("toggleable", canToggle);

            //Show/Hide the toggle button depending on state
            domStyle.set(this.toggleButton.domNode, "display", this.toggleable ? "" : "none");
        }
    });
});
