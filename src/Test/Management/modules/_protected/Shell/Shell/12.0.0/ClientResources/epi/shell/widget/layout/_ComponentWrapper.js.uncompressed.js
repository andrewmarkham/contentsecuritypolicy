require({cache:{
'url:epi/shell/widget/layout/templates/_ComponentWrapperHeader.htm':"﻿<div>\r\n    <div class=\"epi-gadgetTitle dojoxDragHandle\" data-dojo-attach-point=\"titleBarNode\">\r\n        <div data-dojo-attach-point=\"focusNode\" class=\"epi-gadgetTitleFocus\">\r\n            <button data-dojo-type=\"dijit/form/ToggleButton\" data-dojo-attach-point=\"toggleButton\"\r\n                data-dojo-attach-event=\"onClick:toggle\" data-dojo-props=\"title:'${res.togglebuttontooltip}', showLabel:true, iconClass:'epi-gadget-toggle', 'class':'epi-chromelessButton'\">\r\n                ${title}</button>\r\n        </div>\r\n        <div class=\"epi-gadgetButtonBar\">\r\n            <button data-dojo-type=\"dijit/form/Button\" data-dojo-attach-point=\"closeButton\" data-dojo-attach-event=\"onClick:onClose\"\r\n                data-dojo-props=\"showLabel:false, title:'${res.closebuttontooltip}', iconClass:'epi-gadget-delete', 'class':'epi-chromelessButton'\">\r\n                ${res.closebuttontooltip}</button>\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi/shell/widget/layout/_ComponentWrapper", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/string",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/Evented",
    // dijit
    "dijit/_base/wai",
    "dijit/_CssStateMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_Widget",
    "dijit/layout/BorderContainer",
    // epi
    "epi",
    "epi/shell/command/_CommandProviderMixin",
    "epi/shell/widget/command/GadgetAction",
    "epi/shell/widget/command/RemoveGadget",
    "epi/shell/widget/ComponentChrome",
    "epi/shell/widget/layout/_ComponentResizeMixin",
    "epi/shell/widget/layout/_ComponentSplitter",
    "epi/shell/DialogService",

    "dojo/text!./templates/_ComponentWrapperHeader.htm",
    // resources
    "epi/i18n!epi/shell/ui/nls/episerver.shell.ui.resources.gadgetchrome",

    // Widgets used in template
    "dijit/form/Button",
    "dijit/form/ToggleButton"
],

function (
// dojo
    declare,
    array,
    string,
    lang,
    domStyle,
    domAttr,
    domClass,
    domGeometry,
    evented,
    // dijit
    wai,
    _CssStateMixin,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _Widget,
    BorderContainer,
    // epi
    epi,
    _CommandProviderMixin,
    GadgetAction,
    RemoveCommand,
    ComponentChrome,
    _ComponentResizeMixin,
    _ComponentSplitter,
    dialogService,

    template,
    // resources
    res) {

    var _Header = declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, evented], {
        templateString: template,
        title: "",
        res: res,
        open: true,
        toggleable: true,
        closable: false,

        // Css class to wrap the entire Widget
        "class": "epi-gadgetHeader",

        toggle: function () { },

        onClose: function () { },

        postCreate: function () {
            this.inherited(arguments);

            if (this.toggleable) {
                this._trackMouseState(this.titleBarNode, "epi-gadgetTitle");
            }
        },

        startup: function () {
            this.inherited(arguments);

            this.toggleButton.set("checked", !this.open);
        },

        _setClosableAttr: function (/*Boolean*/closable) {
            domStyle.set(this.closeButton.domNode, "display", closable ? "" : "none");
            domClass.toggle(this.titleBarNode, "epi-gadget-unlocked", closable);
        },

        _setTitleAttr: function (title) {
            this._set("title", title || "");
            this.toggleButton.set("label", this.title);
        },

        _setToggleableAttr: function (canToggle) {
            this.toggleable = canToggle;
            wai.setWaiRole(this.focusNode, canToggle ? "button" : "heading");
            if (canToggle) {
                wai.setWaiState(this.focusNode, "controls", this.id + "_pane");
                domAttr.set(this.focusNode, "tabIndex", this.tabIndex);
            } else {
                domAttr.remove(this.focusNode, "tabIndex");
            }

            this.toggleButton.set("disabled", !this.toggleable);
            this.toggleButton.set("iconClass", this.toggleable ? "epi-gadget-toggle" : "");
        }
    });

    return declare([BorderContainer, _ComponentResizeMixin, _CssStateMixin, _CommandProviderMixin, evented], {
        // tags:
        //      internal

        // dndType: [const] String
        //    Drag'n'drop type. Set this in acceptTypes in ComponentContainer
        dndType: "epi.shell.layout._ComponentWrapper",

        // heading: [public] String
        //    Heading for the pane
        heading: "",

        // toggleable: [public] Boolean
        //		Whether pane can be opened or closed by clicking the title bar.
        toggleable: true,

        // tabIndex: [public] String
        //    Tabindex setting for the title (so users can tab to the title then
        //    use space/enter to open/close the title pane)
        tabIndex: "0",

        // baseClass: [protected] String
        //    The root className to be placed on this widget's domNode.
        baseClass: "epi-gadget",

        // Css class to wrap the entire Widget
        "class": "epi-gadgetContainer",

        // closable: [public] Boolean
        //    If true, a close button is placed in the title bar,
        //    and the Gadget can be hidden. If false, the Gadget
        //    cannot be closed.
        closable: false,

        // dragRestriction: [public] Boolean
        //    To remove the drag capability.
        dragRestriction: false,

        // confirmationBeforeRemoval: [public] Boolean
        //    Sets whether the gadget needs an confirmation before removing it or not.
        confirmationBeforeRemoval: true,

        // res: [private] Object
        //    Localization resources for the gadget.
        res: res,

        gutters: false,

        postCreate: function () {
            // summary:
            //    Executed after the widget has been created. Setup widget's properties and animations.
            //
            // tags:
            //    protected

            this.inherited(arguments);

            //Create the header widget and hook up events
            this._header = new _Header({
                region: "top",
                splitter: false,
                title: this.heading || "",
                closable: this.closable,
                toggle: lang.hitch(this, this.toggle),
                onClose: lang.hitch(this, this.onClose)
            });
            this.addChild(this._header);
        },

        _setIsRemovableAttr: function (/*Boolen*/isRemovable) {
            //If isRemovable is undefined treat it as removable
            isRemovable = isRemovable !== false;

            this._set("isRemovable", isRemovable);

            this.set("closable", !!(isRemovable && this.closable));
        },

        _setClosableAttr: function (/*Boolean*/closable) {
            // summary:
            //    Show or hide the gadget's close button.
            //
            // closable:
            //    Flag determining whether the gadget can be closed or not.
            //
            // tags:
            //    public

            this._set("closable", closable);
            this._header && this._header.set("closable", closable);
        },

        _showRemovalConfirmationDialog: function () {
            // summary:
            //    Configure and open the removal confirmation dialog.
            //
            // tags:
            //    private
            var description = this.heading ?
                string.substitute(this.res.removecomponentquestion, { name: this.heading }) :
                this.res.removecomponentquestionwithoutname;

            return dialogService.confirmation({
                description: description,
                title: this.res.deletemenuitemlabel
            });
        },

        onClose: function (/*Event*/evt) {
            // summary:
            //    Raised when closing the gadget.
            //
            // evt:
            //    Event fired when clicking on the gadget's close button.
            //
            // description:
            //    Hides the gadget. Note that it does not persist this, so it is up to the client to
            //    listen to this method and persist the closed state in their own way.
            //
            // tags:
            //    public callback
            if (!this.confirmationBeforeRemoval) {
                domStyle.set(this.domNode, "display", "none");
                this.onClosed();
            } else {
                this._showRemovalConfirmationDialog().then(function () {
                    domStyle.set(this.domNode, "display", "none");
                    this.onClosed();
                }.bind(this));
                return true;
            }
        },

        startup: function () {
            //We need to set the open state before we start the children
            this._header.set("open", this.open);
            this.set("open", this.open);

            this.inherited(arguments);
        },

        resize: function (changeSize) {
            changeSize = lang.mixin({}, changeSize);
            if (!changeSize.h) {
                if (!this.open) {
                    var marginExtents = domGeometry.getMarginExtents(this.domNode).h;
                    changeSize.h = marginExtents + this._getClosedHeight();
                } else if (this.lastOpenHeight) {
                    changeSize.h = this.lastOpenHeight;
                }
            }

            this.inherited(arguments, [changeSize]);
        },

        getSize: function () {
            var size = domGeometry.getMarginBox(this.domNode);
            if (!this.open) {
                size.h = this._getClosedHeight();
            }
            return size;
        },

        _getClosedHeight: function () {
            var headerHeight = this._header ? domGeometry.getMarginBox(this._header.domNode).h : 0,
                splitterHeight = this._splitter ? domGeometry.getMarginBox(this._splitter.domNode).h : 0;

            return headerHeight + splitterHeight;
        },

        onClosed: function () {
            // summary:
            //    Raised after the gadget get closed.
            //
            // tags:
            //    public callback
        },

        _setHeadingAttr: function (text) {
            this._set("heading", text);
            this._header && this._header.set("title", text);
        },

        _setToggleableAttr: function (/*Boolean*/canToggle) {
            this._header && this._header.set("toggleable", canToggle);
        },

        toggle: function () {
            // summary:
            //    Switches between opened and closed state
            //
            // tags:
            //    private

            // Save last open height of the current gadget before it collapsed
            if (this._started) {
                if (!open) {
                    this.lastOpenHeight = domGeometry.getMarginBox(this.domNode).h;
                }
            }

            this._started && this.set("open", !this.get("open"));
        },

        _setOpenAttr: function (open) {
            this.inherited(arguments);

            if (this._started) {
                //Emit the toggle event
                this.emit("toggle", this.open);
            }
        },

        addChild: function (child) {

            //If it is a _ComponentSplitter or _Header use the regular addChild
            if (child.isInstanceOf(_ComponentSplitter) || child.isInstanceOf(_Header)) {
                return this.inherited(arguments);
            }

            this._addGadgetCommands(child);

            // Add remove command for new child.
            this.add("commands", new RemoveCommand({ model: this }));

            //Wrap the child in a Component Chrome
            var componentChrome = new ComponentChrome({
                region: "center",
                splitter: false
            });
            componentChrome.addProvider(this);
            componentChrome.addChild(child);

            this._child = componentChrome;

            this.inherited("addChild", [componentChrome]);

            if (this._started && !child.started && !child._started) {
                child.startup();
            }
        },

        _addGadgetCommands: function (gadget) {
            // summary:
            //      Adds the commands from the gadget actions definition.

            if (gadget && lang.isArray(gadget.gadgetActions)) {
                array.forEach(gadget.gadgetActions, function (action) {
                    this.add("commands", new GadgetAction({
                        actionName: action.actionName,
                        label: action.text,
                        model: gadget
                    }));
                }, this);
            }
        }
    });
});
