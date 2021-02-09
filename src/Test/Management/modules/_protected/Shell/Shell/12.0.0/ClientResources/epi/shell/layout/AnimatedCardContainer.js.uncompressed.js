define("epi/shell/layout/AnimatedCardContainer", [
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
    "dojo/query",
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
    query,
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
        //      Override StackContainer.doLayout. Should always be true.
        doLayout: true,

        // templateString: String
        //      Widget's template string.
        templateString: "<div><div class='dijitContainer' style='position: relative; width: 100%; height: 100%' data-dojo-attach-point='containerNode'></div></div>",

        cssClasses: {
            animationNode: "epi-animation-node",
            child: "epi-cardContainer-child",
            primary: "epi-cardContainer-child--primary",
            secondary: "epi-cardContainer-child--secondary",
            secondaryOut: "epi-cardContainer-child--secondary-out",
            visible: "dijitVisible",
            hidden: "dijitHidden"
        },

        addChild: function (child) {
            var r = this.inherited(arguments);

            // add our card class for child widgets
            domClass.add(child.domNode, this.cssClasses.child);

            return r;
        },

        selectSecondaryChild: function (page) {

            // select page with animation or not
            return this.selectChild(page, has("css-transitions"));
        },

        _transition: function (newWidget, oldWidget, animate) {
            // summary:
            //		Hide the old widget and display the new widget.
            //		Subclasses should override this.
            // newWidget: dijit/_WidgetBase
            //		The newly selected widget.
            // oldWidget: dijit/_WidgetBase
            //		The previously selected widget.
            // animate: Boolean
            //		used to select newWidget as the secondary widget.
            // tags:
            //		protected extension

            var d;

            if (animate && oldWidget) {

                // show the new one
                d = this._showChild(newWidget);

                // Transition code from StackContainer
                // Size the new widget, in case this is the first time it's being shown,
                // or I have been resized since the last time it was shown.
                // Note that page must be visible for resizing to work.
                if (newWidget.resize) {
                    if (this.doLayout) {
                        newWidget.resize(this._containerContentBox || this._contentBox);
                    } else {
                        // the child should pick it's own size but we still need to call resize()
                        // (with no arguments) to let the widget lay itself out
                        newWidget.resize();
                    }
                }

                // now set classes to get correct z-index stacking and any animiation
                domClass.add(oldWidget.domNode, this.cssClasses.primary);

                // Call hide function of widget to disabled overlay of iframe
                oldWidget.onHide && oldWidget.onHide();

                //// try to execute the transition
                when(
                    this._executeTransition(newWidget, this.cssClasses.secondary),

                    // transition was done
                    lang.hitch(this, function (widget) {
                        if (this.selectedPreviousChild && this.selectedPreviousChild !== newWidget) {
                            domClass.add(oldWidget.domNode, this.cssClasses.hidden);
                            domClass.remove(oldWidget.domNode, this.cssClasses.visible);
                        }
                    })
                );

                this.selectedPreviousChild = oldWidget;

            } else {

                // remove secondary if already selected
                if (this.selectedPreviousChild === newWidget) {

                    // handle classes
                    domClass.add(this.selectedPreviousChild.domNode, this.cssClasses.visible);
                    domClass.remove(this.selectedPreviousChild.domNode, this.cssClasses.hidden);
                    domClass.remove(this.selectedPreviousChild.domNode, this.cssClasses.primary);
                    domClass.remove(this.selectedChildWidget.domNode, this.cssClasses.secondary);

                    // try to execute the transition
                    when(
                        this._executeTransition(this.selectedChildWidget, this.cssClasses.secondaryOut),

                        // transition was done
                        lang.hitch(this, function (widget) {
                            domClass.remove(widget.domNode, this.cssClasses.visible);
                            domClass.add(widget.domNode, this.cssClasses.hidden);
                            domClass.remove(widget.domNode, this.cssClasses.secondaryOut);
                        }),

                        // transition wasn't done
                        lang.hitch(this, function (widget) {
                            domClass.remove(widget.domNode, this.cssClasses.visible);
                            domClass.add(widget.domNode, this.cssClasses.hidden);
                        })
                    );

                    // hide main widget if it's not the one to be shown now
                    if (newWidget !== this.selectedPreviousChild) {
                        domClass.replace(this.selectedPreviousChild.domNode, this.cssClasses.hidden, this.cssClasses.visible);
                    }

                    this.selectedPreviousChild = null;
                } else {
                    // Default transition
                    if (oldWidget) {
                        this._hideChild(oldWidget);
                        domClass.remove(oldWidget.domNode, this.cssClasses.primary);
                    }
                }

                d = this._showChild(newWidget);
                domClass.add(newWidget.domNode, this.cssClasses.primary);

                // Transition code from StackContainer
                // Size the new widget, in case this is the first time it's being shown,
                // or I have been resized since the last time it was shown.
                // Note that page must be visible for resizing to work.
                if (newWidget.resize) {
                    if (this.doLayout) {
                        newWidget.resize(this._containerContentBox || this._contentBox);
                    } else {
                        // the child should pick it's own size but we still need to call resize()
                        // (with no arguments) to let the widget lay itself out
                        newWidget.resize();
                    }
                }
            }

            return d;	// If child has an href, promise that fires when the child's href finishes loading
        },

        _executeTransition: function (transitionWidget, transitionClass) {

            var d = new Deferred();

            var widgetNode = transitionWidget.domNode;
            var animationNodes = query("." + this.cssClasses.animationNode, widgetNode);

            // NOTE: this only handles first animation node found
            var animationNode = animationNodes.length > 0 ? animationNodes[0] : null;

            // add the animation out class and hide and remove class when we're done animating
            if (animationNode && widgetNode && has("css-transitions")) {

                domClass.add(widgetNode, transitionClass);

                // Observed on IE 10 that we must wait for a little while before touching the node, setting transition related properties or events.
                // Otherwise, we don't get transitionend fired.
                this.own(this.defer(function () {
                    on.once(animationNode, has("transitionend"), function () {
                        d.resolve(transitionWidget);
                    });
                }, 1));
            } else {
                // No transition will be done
                d.reject(transitionWidget);
            }

            return d;
        }

    });
});
