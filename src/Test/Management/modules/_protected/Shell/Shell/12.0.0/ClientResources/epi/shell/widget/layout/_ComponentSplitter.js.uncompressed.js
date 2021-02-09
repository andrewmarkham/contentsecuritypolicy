define("epi/shell/widget/layout/_ComponentSplitter", [
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/keys",
    "dojo/on",
    "dojo/touch",

    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_CssStateMixin"
], function (
    declare,
    event,
    lang,
    win,
    domGeometry,
    domStyle,
    keys,
    on,
    touch,

    _WidgetBase,
    _TemplatedMixin,
    _CssStateMixin
) {

    return declare([_WidgetBase, _TemplatedMixin, _CssStateMixin], {
        // tags:
        //      internal

        // baseClass: [protected] String
        //      Root CSS class, used to construct CSS classes to indicate widget state.
        baseClass: "epi-gadgetGutter",

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: "<div data-dojo-attach-event=\"onkeypress:_onKeyPress,press:_startDrag\" role=\"separator\" tabindex=\"0\"></div>",

        // disabled: [public] Boolean
        //      Flag indicating if the splitter should respond to user interaction.
        disabled: false,

        constructor: function () {
            this._handlers = [];
        },

        _startDrag: function (e) {
            if (this.disabled) {
                return;
            }

            // Performance: load data into local variables for mouse event function closure.
            var splitterStyle = this.domNode.style,
                pageStart = e.pageY,
                node = this.child.domNode,
                computedStyle = domStyle.getComputedStyle(node),
                marginExtents = domGeometry.getMarginExtents(node, computedStyle).h,
                childStart = domGeometry.getMarginBox(node, computedStyle).h,
                maxFunc = this.container._getMaxSizeChild
                    ? lang.hitch(this.container, "_getMaxSizeChild")
                    : lang.hitch(this, function () {
                        return this.child.maxHeight || Infinity;
                    }),
                min = this.child.minHeight || 0,
                splitterStart = parseInt(splitterStyle.top, 10),
                layoutFunc = lang.hitch(this.container, "_layoutChildren", this.child),
                doc = win.doc;

            this._handlers = this._handlers.concat([
                on(doc, touch.move, this._drag = function (e, complete) {
                    var delta = e.pageY - pageStart,
                        childSize = delta + childStart,
                        boundChildSize = Math.max(Math.min(childSize, maxFunc()), min + marginExtents);

                    layoutFunc(boundChildSize, complete);

                    splitterStyle.top = delta + splitterStart + boundChildSize - childSize + "px";
                }),
                on(doc, "dragstart", event.stop),
                on(win.body(), "selectstart", event.stop),
                on(doc, touch.release, lang.hitch(this, "_stopDrag"))
            ]);

            event.stop(e);
        },

        _stopDrag: function (e) {
            try {
                this._drag(e);
                this._drag(e, true);
            } finally {
                this._cleanupHandlers();
                delete this._drag;
            }
        },

        _onKeyPress: function (e) {
            var tick = 1;
            switch (e.keyCode) {
                case keys.UP_ARROW:
                    tick = -1;
                    break;
                case keys.DOWN_ARROW:
                    break;
                default:
                    return;
            }
            var childSize = domGeometry.getMarginSize(this.child.domNode).h + tick;
            this.container._layoutChildren(this.child, Math.max(Math.min(childSize, this.child.maxSize), this.child.minSize));
            event.stop(e);
        },

        _cleanupHandlers: function () {
            var h;
            while (h = this._handlers.pop()) { //eslint-disable-line no-cond-assign
                h.remove();
            }
        },

        destroy: function () {
            this._cleanupHandlers();
            delete this.child;
            delete this.container;
            this.inherited(arguments);
        }
    });
});
