define("epi/shell/layout/CardContainer", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/fx",

    "dojo/aspect",
    "dojo/has",
    "dojo/on",

    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-geometry",

    "dojo/Deferred",
    "dojo/when",

    "dijit/_TemplatedMixin",
    "dijit/layout/StackContainer",

    "dgrid/util/has-css3"
],
function (
    declare,
    lang,
    fx,

    aspect,
    has,
    on,

    domClass,
    domStyle,
    domGeometry,

    Deferred,
    when,

    _TemplatedMixin,
    StackContainer,

    hasCss3) {

    return declare([StackContainer, _TemplatedMixin], {
        // summary:
        //      Layout container that organize pages like set of cards.
        //      Selected page is transitted using animation.
        //
        // tags:
        //      internal xproduct

        // doLayout: Boolean
        //      Override StackContainer.doLayout. Should always be false. In CardContainer, each page decides whether it wants to do layout.
        doLayout: false,

        // transitionClass: String
        //      Css class use to perform page transition.
        transitionClass: "epi-transition",

        // transitionDirection: String
        //      Page transition direction. Available values are "vertical" and "horizontal".
        //      Invalid values are considered to be "vertical".
        transitionDirection: "vertical",

        // baseClass: String
        //      Widget's base css class.
        baseClass: "epi-cardContainer",

        // templateString: String
        //      Widget's template string.
        templateString: "<div><div class='dijitContainer' style='position: relative;' data-dojo-attach-point='containerNode'></div></div>",

        layout: function () {
            // summary:
            //		Layout the contained pages.
            // description:
            //      Stack container set size on all pages depend on the container's doLayout property. Card container let the page design if it want to do layout.
            // tags:
            //		protected extension

            var child = this.selectedChildWidget;

            var children = this.getChildren(), topPage = children[children.length - 1];

            if (child && child.resize) {
                // If the page want to fit in container?
                if (child.fitContainer) {
                    child.resize(this._containerContentBox || this._contentBox);
                } else {
                    child.resize();
                }
            }

            // If current page does not fit the container, set the top page to visible and lay it out.
            if (child !== topPage && !child.fitContainer) {
                domClass.replace(topPage.domNode, "dijitVisible", "dijitHidden");
                if (topPage && topPage !== child && topPage.resize) {
                    if (topPage.fitContainer) {
                        topPage.resize(this._containerContentBox || this._contentBox);
                    } else {
                        topPage.resize();
                    }
                }
            }
        },

        addChild: function (child, insertIndex) {
            // summary:
            //		Makes the given widget a child of this widget.
            // description:
            //		Inserts specified child widget's dom node as a child of this widget's
            //		container node, and possibly does other processing (such as layout).
            //
            //		Functionality is undefined if this widget contains anything besides
            //		a list of child widgets (ie, if it contains arbitrary non-widget HTML).

            if (this._started) {
                var children = this.getChildren(), topPage = children[children.length - 1];
                if (insertIndex >= children.length) {
                    domClass.replace(topPage.domNode, "dijitHidden", "dijitVisible");
                }
            }

            this.inherited(arguments);
        },

        _transition: function (newPage, oldPage /*===== ,  animate =====*/) {
            // summary:
            //		Hide the old widget and display the new widget.
            // newPage: Node|dijit/_WidgetBase
            //		The newly selected widget.
            // oldPage: Node|dijit/_WidgetBase
            //		The previously selected widget.
            // animate: Boolean
            //		Used by AccordionContainer to turn on/off slide effect.
            // tags:
            //		protected extension

            var children = this.getChildren(),
                topPage = children[children.length - 1];

            if (!oldPage || oldPage._destroyed) {
                return;
            }

            // Show the top page if it is invisible, to start transition
            if (oldPage.fitContainer && oldPage !== topPage) {
                domClass.replace(topPage.domNode, "dijitVisible", "dijitHidden");
            }

            return when(newPage === topPage ? this._hideTransition(oldPage, topPage) : null, lang.hitch(this, function (n) {
                var currentOffset = 0;
                if (oldPage && !oldPage._destroyed && oldPage !== topPage) {
                    currentOffset = domGeometry.getMarginBox(oldPage.domNode).h;
                    this._hideChild(oldPage);
                }

                if (!newPage || newPage._destroyed) {
                    return;
                }

                this._showChild(newPage);

                // Size the new widget, in case this is the first time it's being shown,
                // or I have been resized since the last time it was shown.
                // Note that page must be visible for resizing to work.
                if (newPage.resize) {
                    if (newPage.fitContainer) {
                        newPage.resize(this._containerContentBox || this._contentBox);
                    } else {
                        // the child should pick it's own size but we still need to call resize()
                        // (with no arguments) to let the widget lay itself out
                        newPage.resize(null);
                    }

                    // Animate the last page down, making an effect like that we are opening the new page.
                    return when(this._showTransition(newPage, topPage, currentOffset), function () {
                        // Hide the top page if the current page already take all the container's size. This is to prevent tab into the top page and scroll it into view
                        if (newPage.fitContainer && newPage !== topPage) {
                            domClass.replace(topPage.domNode, "dijitHidden", "dijitVisible");
                        }
                    });
                } else {
                    return;
                }
            }));
        },

        _hideTransition: function (oldPage, topPage) {
            // summary:
            //      Override to perform closing transition before hiding a page.
            // oldPage: Node|dijit/_WidgetBase
            //      The old page which is about to hide.
            // topPage: Node|dijit/_WidgetBase
            //      The top page.
            // tags:
            //      protected

            return this._doTransition(oldPage, topPage, false);
        },

        _showTransition: function (newPage, topPage, currentOffset) {
            // summary:
            //      Override to perform opening transition after showing a page.
            // newPage: Node|dijit._WidgetBase
            //      The new page which has just been shown.
            // topPage: Node|dijit._WidgetBase
            //      The top page.
            // currentOffset: Number
            //      Current offset of the topPage, from which animation starts.
            // tags:
            //      protected

            return this._doTransition(newPage, topPage, true, currentOffset);
        },

        _doTransition: function (page, topPage, opening, currentOffset) {
            // summary:
            //      Perform opening or closing transition.
            // page: Node|dijit._WidgetBase
            //      The current page.
            // topPage: Node|dijit._WidgetBase
            //      The top page.
            // opening: Boolean
            //      Indicate that the current page is being opened.
            // currentOffset: Number
            //      Current offset of the topPage, from which animation starts. Use on opening only.
            // tags:
            //      private

            // Animate the last page down/up, making an effect like that we are opening/closing the new page.
            if (page !== topPage) {
                var marginBox = domGeometry.getMarginBox(page.domNode),
                    animationNode = this._getAnimationNode(page, topPage);

                var property = this.transitionDirection === "vertical" ? "top" : "left",
                    size = this.transitionDirection === "vertical" ? marginBox.h : marginBox.w,
                    from = opening ? -(size - currentOffset) + "px" : "0px",
                    to = opening ? "0px" : -size + "px",
                    restore = !opening;

                return this._animate(animationNode, property, from, to, restore);
            }
        },

        _getAnimationNode: function (page, topPage) {
            // summary:
            //      Get the node on which the transition effect is performed.
            // description:
            //      If the page's transitionMode was 'slideIn', the containerNode would be animated. Otherwise would be the last page.
            //      Used for default transition implementation only.
            // page: Node|dijit._WidgetBase
            //      The current page.
            // topPage: Node|dijit._WidgetBase
            //      The top page.
            // tags:
            //      private

            return page.transitionMode === "slideIn" ? this.containerNode : ((page.transitionMode === "reveal") ? topPage.domNode : null);
        },

        _animate: function (node, property, from, to, restore) {
            // summary:
            //      Animate a node using css transition.
            // node: Node
            //      The node to be animated.
            // property: String
            //      Css property used in animation.
            // from: String|Number
            //      Start value.
            // to: String|Number
            //      End value
            // restore: Boolean
            //      Indicate that it should restore the start value after animation.
            // tags:
            //      private

            var dfd = new Deferred();

            if (node && has("css-transitions") && from !== to) {
                domStyle.set(node, property, from);

                // Observed on IE 10 that we must wait for a little while before touching the node, setting transition related properties or events.
                // Otherwise, we don't get transitionend fired.
                setTimeout(lang.hitch(this, function () {
                    domClass.add(node, this.transitionClass);

                    var handle = on(node, has("transitionend"), lang.hitch(this, function () {
                        handle.remove();

                        domClass.remove(node, this.transitionClass);
                        if (restore) {
                            domStyle.set(node, property, from);
                        }

                        dfd.resolve();
                    }));

                    setTimeout(function () {
                        domStyle.set(node, property, to);
                    }, 1);
                }), 1);
            } else {
                dfd.resolve();
            }

            return dfd.promise;
        }
    });
});
