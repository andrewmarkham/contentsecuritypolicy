require({cache:{
'url:epi-cms/widget/templates/NotificationStatusBar.html':"﻿<div>\r\n    <div class=\"epi-dijitTooltipTitleBar\">\r\n        <span class=\"epi-dijitTooltipTitle\">${res.title}</span>\r\n        <span class=\"epi-closeButton dijitDialogCloseIcon\" data-dojo-attach-point=\"closeIcon\" title=\"${res.title}\" role=\"button\"></span>\r\n    </div>\r\n    <div class=\"epi-dijitTooltipContent\" data-dojo-attach-point=\"zoneLayoutNode\">\r\n        <div data-dojo-attach-point=\"zoneContainer\">\r\n            <div data-dojo-type=\"epi-cms/widget/NotificationStatusZone\" data-dojo-attach-point=\"errorZone\" data-dojo-props=\"title: '${res.errortitle}', type: 'error'\"></div>\r\n            <div data-dojo-type=\"epi-cms/widget/NotificationStatusZone\" data-dojo-attach-point=\"warningZone\" data-dojo-props=\"title: '${res.warningtitle}', type: 'warning'\"></div>\r\n            <div data-dojo-type=\"epi-cms/widget/NotificationStatusZone\" data-dojo-attach-point=\"infoZone\"  data-dojo-props=\"title: '${res.notetitle}', type: 'note'\"></div>\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/widget/NotificationStatusBar", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/keys",

    // dijit
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/BorderContainer",

    // dojox
    "dojox/html/entities",

    // epi
    "epi/dependency",
    "epi-cms/widget/NotificationStatusZone",
    "epi-cms/widget/TooltipDialog",

    // resources
    "dojo/text!./templates/NotificationStatusBar.html",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.statusbar.notificationstatus"
],

function (
// dojo
    array,
    declare,
    event,
    lang,
    domClass,
    keys,

    // dijit
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    BorderContainer,

    // dojox
    entities,

    // epi
    dependency,
    NotificationStatusZone,
    TooltipDialog,

    // resources
    template,
    nlsNotificationstatus
) {
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      Shows notifications from MessageService for typeName's "error", "warn", and "info"
        // tags:
        //      internal

        res: nlsNotificationstatus,

        templateString: template,

        _itemTemplate: "<li>{message}</li>",

        _notificationTooltipDialogCssClass: "epi-notificationToolipDialog epi-notificationToolipDialogCompact",

        _dimmedOutCssClass: "epi-notificationIcon-DimmedOut",

        _notificationErrorClass: "epi-notificationIcon-Error",

        _notificationWarningClass: "epi-notificationIcon-Warning",

        _notificationNoteClass: "epi-notificationIcon-Note",

        _totalNotifications: 0,

        messageContext: null,

        _tooltipDialog: null,

        messageService: null,

        _observeHandle: null,

        zoneContainer: null,

        // notificationContext: [public] Object
        //		The notificationContext for which information will be displayed.
        notificationContext: null,

        baseClass: "epi-notificationIcon",

        postMixInProperties: function () {

            this.inherited(arguments);

            this.messageService = this.messageService || dependency.resolve("epi.shell.MessageService");
        },

        postCreate: function () {
            // summary:
            //    Initializes notification status bar.
            // tags:
            //    public

            this.inherited(arguments);

            this._tooltipDialog = new TooltipDialog({
                connectorMargin: 47,
                hideOnBlur: true,
                content: this.zoneLayoutNode
            });
            this.own(this._tooltipDialog);

            this._buildIconBlock();

            // Css class for notification status bar, overrides connector top styles
            domClass.add(this._tooltipDialog.domNode, this._notificationTooltipDialogCssClass);

            this.connect(this.domNode, "onclick", lang.hitch(this, this._show));
            this.connect(this.domNode, "onkeypress", lang.hitch(this, this._onKeyPress));
            this.connect(this.closeIcon, "onclick", lang.hitch(this, this._hideTooltip));
        },

        update: function (/*Object*/newMessageContext) {
            // summary:
            //    Updates notification context with the new context
            // newMessageContext:
            //    Query to find message belong to.
            // tags:
            //    public

            this._hideTooltip();
            this.messageContext = newMessageContext;
            this._listenMessagePool();
            this._updateUI();
        },

        destroy: function () {
            // summary:
            //    Destroy this widget, removes handler event used, ready for GC
            //
            // tags:
            //    public

            this._unListenMessagePool();
            this.inherited(arguments);
        },

        focus: function () {
            // summary:
            //      Set focus on the widget.
            // tags:
            //      public

            this.domNode.focus(); // No focusNode
        },

        show: function () {
            // summary:
            //    Show tooltip for the widget, force show from other widget (i.e: StatusBar)
            // tags:
            //    public
            this._keepShowing = true;
            this._showTooltip();
        },

        getMessages: function (messageType) {
            // summary:
            //    Gets messages from message service pool
            // tags:
            //    private

            var query = (messageType) ? lang.mixin({ typeName: messageType }, this.messageContext) : this.messageContext;
            return this.messageService.query(query);
        },

        _onKeyPress: function (evt) {
            if (evt.keyCode === keys.ENTER) {
                this._show();
            }
        },

        _listenMessagePool: function () {
            // summary:
            //    Listens change on current page in Message Services
            //    Server in case validate on Edit
            // tags:
            //    private
            this._unListenMessagePool();
            this._observeHandle = this.messageService.observe(this.messageContext, lang.hitch(this, function () {
                this._updateUI();
            }));
        },

        _unListenMessagePool: function () {
            // summary:
            //    Cancels listen change on current page in Message Services
            // tags:
            //    private

            if (this._observeHandle) {
                this._observeHandle.cancel();
                delete this._observeHandle;
            }
        },

        _updateNotificationZone: function (zone, itemTemplate, items) {
            if (items && items.length > 0) {
                array.forEach(items, function (item) {
                    zone.addRow(lang.replace(itemTemplate, { message: entities.encode(item.message) }), "last");
                });
                zone.show();
            } else {
                zone.hide();
            }
        },

        _updateUI: function () {
            // summary:
            //    Re-renders the UI of widget.
            // tags:
            //    private

            // empty zone content
            this.errorZone.empty();
            this.warningZone.empty();
            this.infoZone.empty();

            // Get notification types to be updated
            var errors = this.getMessages("error");
            var warnings = this.getMessages("warn");
            var information = this.getMessages("info");

            this._totalNotifications = errors.length + warnings.length + information.length;

            this._buildIconBlock();

            // update "error" zone
            this._updateNotificationZone(this.errorZone, this._itemTemplate, errors);
            // update "warning" zone
            this._updateNotificationZone(this.warningZone, this._itemTemplate, warnings);
            // update "note" zone
            this._updateNotificationZone(this.infoZone, this._itemTemplate, information);

            this._updateIconStatus(errors.length, warnings.length, information.length);
        },

        _buildIconBlock: function () {
            // summary:
            //    Setup status bar notification icon
            // tags:
            //    private

            this.domNode.innerHTML = this._totalNotifications;

            if (this._totalNotifications === 0) {
                domClass.add(this.domNode, this._dimmedOutCssClass);
                domClass.remove(this.domNode, this._notificationNoteClass);
                domClass.remove(this.domNode, this._notificationWarningClass);
                domClass.remove(this.domNode, this._notificationErrorClass);
                this._hideTooltip();
            } else {
                domClass.remove(this.domNode, this._dimmedOutCssClass);
            }
        },

        _updateIconStatus: function (errors, warnings, information) {
            // Set class on notification badge
            if (errors) {
                domClass.add(this.domNode, this._notificationErrorClass);
                domClass.remove(this.domNode, this._notificationNoteClass);
                domClass.remove(this.domNode, this._notificationWarningClass);
            } else if (warnings) {
                domClass.add(this.domNode, this._notificationWarningClass);
                domClass.remove(this.domNode, this._notificationNoteClass);
            } else if (information) {
                domClass.add(this.domNode, this._notificationNoteClass);
            }
        },

        _setNotificationContextAttr: function (value) {
            this._set("notificationContext", value);
            this.update(value);
        },

        _show: function (e) {
            // summary:
            //    Show tooltip for the widget
            // tags:
            //    private

            if (e) {
                event.stop(e);
            }

            this._showTooltip();
        },

        _showTooltip: function () {
            // summary:
            //    Show tooltip for the widget
            // tags:
            //    private

            if (this._totalNotifications === 0) {
                return;
            }

            this._tooltipDialog.showTooltipDialog(this.domNode, ["below-alt"]);
        },

        _hideTooltip: function () {
            // summary:
            //    Hide tooltip for widget
            // tags:
            //    private

            this._tooltipDialog.hideTooltipDialog();
        }
    });
});
