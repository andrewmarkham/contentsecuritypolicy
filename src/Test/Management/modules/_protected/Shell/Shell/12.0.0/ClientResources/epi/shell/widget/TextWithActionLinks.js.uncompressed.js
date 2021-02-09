define("epi/shell/widget/TextWithActionLinks", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/Evented",
    "dojo/on",
    "dojo/query",

    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/focus",

    "dojox/html/entities"
], function (array,
    declare,
    event,
    lang,
    Evented,
    on,
    query,
    _WidgetBase,
    _TemplatedMixin,
    focusUtil,
    entities) {
    return declare([_WidgetBase, _TemplatedMixin, Evented], {
        // tags:
        //      public

        tagName: "span",

        templateString: "<{0}>{1}</{0}>",

        contentString: "",

        namedActions: null, // { actionName1: "<actionDisplayName1>", actionName2: "<actionDisplayName2>" }
        _actionMap: null,

        _eventHandlers: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            this._actionMap = [];
            this._eventHandlers = [];
            var fragments = {};
            var contentString = this.contentString;
            var namedAction;
            var id = 0;

            // replace template string with action names to create links
            if (this.namedActions) {

                for (var actionName in this.namedActions) {
                    namedAction = entities.encode(this.namedActions[actionName]);
                    fragments[actionName] = "<a class=\"epi-visibleLink\" href=\"#\" data-dojo-attach-point=\"action" + (id++) + "\">" + namedAction + "</a>";
                    this._actionMap.push(actionName);
                }

                contentString = lang.replace(contentString, fragments);
            }

            this.templateString = lang.replace(this.templateString, [this.tagName, contentString]);
        },

        postCreate: function () {
            this.inherited(arguments);

            // bind events
            array.forEach(this._actionMap, function (actionName, id) {

                var link = this["action" + id];

                if (link) {

                    var handler = on(link, "click", (function (context, actionName) {
                        return function (evt) {
                            event.stop(evt);
                            context.emit("onActionClick", actionName);
                        };
                    })(this, actionName));

                    this._eventHandlers.push(handler);
                }
            }, this);
        },

        destroy: function () {

            array.forEach(this._eventHandlers, function (handler) {
                handler.remove();
            }, this);
            this._eventHandlers = null;

            this.inherited(arguments);

        },

        focus: function () {
            var links = query("a", this.domNode);

            if (links.length > 0) {
                focusUtil.focus(links[0]);
            }
        }
    });
});
