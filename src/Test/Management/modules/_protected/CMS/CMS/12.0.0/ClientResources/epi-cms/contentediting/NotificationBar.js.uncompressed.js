require({cache:{
'url:epi-cms/contentediting/templates/NotificationBar.html':"﻿<div class=\"epi-notificationBar\">\r\n    <div data-dojo-attach-point=\"containerNode\"></div>\r\n</div>",
'url:epi-cms/contentediting/templates/NotificationBarItem.html':"﻿<div class=\"epi-notificationBarItem\">\r\n    <div class=\"epi-notificationBarText\" data-dojo-attach-point=\"contentContainer\">\r\n        <p data-dojo-attach-point=\"textContainer\"></p>\r\n    </div>\r\n    <div class=\"epi-notificationBarButtonContainer\" data-dojo-attach-point=\"buttonContainer\">\r\n        <button data-dojo-type=\"dijit/form/Button\" class=\"epi-chromelessButton\" data-dojo-props=\"iconClass:'epi-iconClose', showLabel:false\" data-dojo-attach-event=\"onClick:_onClose\"></button>\r\n    </div>\r\n</div>"}});
﻿define("epi-cms/contentediting/NotificationBar", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/on",

    // Dijit
    "dijit/_TemplatedMixin",
    "dijit/_Widget",
    "dijit/_Container",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/Evented",
    "dijit/form/Button",

    // Dojox
    "dojox/html/ellipsis",

    //Resources
    "dojo/text!./templates/NotificationBar.html",
    "dojo/text!./templates/NotificationBarItem.html"

], function (
    declare,
    lang,
    domClass,
    domStyle,
    domConstruct,
    array,
    on,

    _TemplatedMixin,
    _Widget,
    _Container,
    _WidgetsInTemplateMixin,
    Evented,
    Button,

    ellipsis,

    template,
    notificationBarItemTemplate) {

    var NotificationBarItem = declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
        templateString: notificationBarItemTemplate,
        item: null,
        viewModel: null,

        postCreate: function () {
            this.inherited(arguments);

            if (this.item.content) {
                this._addContent(this.item);
            }

            this._addCommands(this.item);
        },


        _onClose: function (e) {
            e.preventDefault();

            this.emit("close", this);
        },

        _addContent: function (item) {
            //If it's a string, add it to innerHTML
            if (lang.isString(item.content)) {
                this.textContainer.innerHTML = this.item.content;
            } else { //if its not a string, its assumed to be a dom object.
                domConstruct.place(this.item.content, this.textContainer);
            }
        },

        _addCommands: function (item) {
            if (lang.isArray(this.item.commands)) { //check if it has any commands
                array.forEach(this.item.commands, lang.hitch(this, function (command) {
                    this._addButtonForCommand(command);
                }));
            }
        },

        _addButtonForCommand: function (command) {
            var button = new Button({
                label: command.label,
                title: command.tooltip,
                iconClass: command.iconClass
            });

            if (command.cssClass) {
                domClass.add(button.domNode, command.cssClass);
            }

            button.set("disabled", !command.canExecute);

            button.on("click", function () {
                command.execute();
            });

            this.own(command.watch("canExecute", lang.hitch(this, function () {
                button.set("disabled", !command.canExecute);
            })));

            if (command.category === "leftAligned") {
                button.placeAt(this.contentContainer, "first");
            } else {
                button.placeAt(this.buttonContainer, "first");
            }

            this.own(button);
        }
    });

    var NotificationBar = declare([_Widget, _Container, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
        // tags:
        //      internal xproduct

        templateString: template,

        noBorderClass: "epi-notificationBarWithoutBorder",

        buildRendering: function () {
            this.inherited(arguments);
            this._hideIfEmpty();
        },

        clear: function () {
            this._hideIfEmpty();

            array.forEach(this.getChildren(), function (widget) {
                this.removeChild(widget);
                widget.destroy();
                widget = null;
            }, this);

            this.emit("notificationsChanged");
        },

        destroy: function () {
            this.destroyDescendants();

            this.inherited(arguments);
        },

        add: function (notification, /*int?*/ insertIndex) {
            // summary:
            //    Adds a notification to the notification bar.
            //
            // description:
            //    Notification can be either just text or an object containing content and commands. If it contains an array of commands
            //    the commands will be added as buttons.

            var notificationBarItem = new NotificationBarItem({ item: notification });

            this.own(on(notificationBarItem, "close", lang.hitch(this, "_onCloseNotification")));

            this.addChild(notificationBarItem, insertIndex);

            this._hideIfEmpty();

            this.emit("notificationsChanged");
        },

        remove: function (notification) {
            array.forEach(this.getChildren(), lang.hitch(this, function (childWidget) {
                if (childWidget.item && childWidget.item === notification) {
                    this._onCloseNotification(childWidget);
                }
            }));

            this._hideIfEmpty();
        },

        _onCloseNotification: function (item) {
            this.removeChild(item);

            item.destroy();
            item = null;

            this._hideIfEmpty();

            this.emit("notificationsChanged");
        },

        _hideIfEmpty: function () {

            var show = this.getChildren().length > 0;

            domClass.toggle(this.domNode, this.noBorderClass, !show);

            domStyle.set(this.domNode, "display", show ? "" : "none");
        }
    });

    return NotificationBar;
});
