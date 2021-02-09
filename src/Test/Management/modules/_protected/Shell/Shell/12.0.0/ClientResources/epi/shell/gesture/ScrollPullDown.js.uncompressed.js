define("epi/shell/gesture/ScrollPullDown", [
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/mouse",
    "dojo/on",
    "dijit/Destroyable"],
function (
    declare,
    event,
    lang,
    mouse,
    on,
    Destroyable) {

    return declare([Destroyable], {
        // summary:
        //      Class for listening to mouse wheel movements and call show and hide delegate based on
        //      the current scroll position of a monitored target. The class is used for to identify
        //      when to show or hide a pull-down menu based on scroll wheel movement.
        //      If the scrolling is at the top of the scrollTarget (see contructor arguments) when
        //      indicates a positive wheelDelta, the the show delegate is omitted. If the show delegate has been
        //      called when a mouse wheel event indicates a negative wheelDelta then the hide delegate is called.
        //
        // tags:
        //      internal

        _delegate: null,

        _scrollTarget: null,
        _isScrolling: false,
        _pullDownInertia: 100,

        // Timeout references
        _ts: null,
        _tb: null,

        destroy: function () {
            this._delegate = null;
        },

        constructor: function (/*DOMNode*/scrollTarget, /*Object*/delegate) {
            // summary:
            //  Set up a new instance monitoring a specific dom node
            //
            // scrollTarget:
            //  A node with scrolling enabled and whose scrollTop value must be 0 for the show event to be emitted
            // delegate:
            //  An object that contains show, hide methods and isShown property.

            this._delegate = delegate;

            this._scrollTarget = scrollTarget;
            this.addMouseWheelListener(scrollTarget);
        },

        addMouseWheelListener: function (/*DOMNode*/target) {
            // summary:
            //  Add a mouse wheel delegate to the supplied target.
            //
            // returns:
            //  An delegate handle on which you can call remove to detach the delegate.

            if (target) {
                return this.own(on(target, mouse.wheel, lang.hitch(this, this._onMouseWheel)))[0];
            }

        },

        _blockShowEvent: function () {
            // summary:
            //  Used for blocking the show event while scrolling continously. We don't want the event
            //  emitted as a part of scrolling to the top of the page.
            //  Requires _pullDownInertia ms of grace time between wheel events once the top is reached.
            //
            // tags: private

            if (this._scrollTarget.scrollTop > 0) {
                this._isScrolling = true;
            }

            this._ts && clearTimeout(this._ts);
            this._ts = setTimeout(lang.hitch(this, function () {
                this._isScrolling = false;
            }), this._pullDownInertia);

            return this._isScrolling;
        },

        _initiateScrollBlock: function () {
            // summary:
            //  Sets a flag indicating that the mouse whhel event should be blocked while continously emitted

            this._scrollBlock = true;
        },

        _blockScrollEvent: function () {
            // summary:
            //  Returns true if the scroll event should be blocked, and resets the timeout used for
            //  adding resistance between scrolling of the _scrollTarget and showing/hiding the pull-down menu.

            this._tb && clearTimeout(this._tb);
            this._tb = setTimeout(lang.hitch(this, function () {
                this._scrollBlock = false;
            }), this._pullDownInertia);

            // Block scrolling if the pull-down menu is opening or hiding; or the blocking timeout hasn't expired
            return (this._delegate.isShown == null) || this._scrollBlock;
        },



        _raiseShow: function (evt) {
            // summary:
            //  Calls the show delegate. The delegate is only called once for each show/transiting/hide cycle

            // The hide delegate should be called when _isShown === false (obviously not shown)
            if (this._delegate.isShown === false) {
                event.stop(evt);
                this._delegate.show();
                this._initiateScrollBlock();
            }
        },

        _raiseHide: function (evt) {
            // summary:
            //  Calls the hide delegate. The delegate is only called once for each show/transiting/hide cycle

            // The hide delegate should be called when _isShown === true (obviously shown)
            if (this._delegate.isShown === true) {
                event.stop(evt);
                this._delegate.hide();
                this._initiateScrollBlock();
            }
        },

        _onMouseWheel: function (evt) {

            if (!evt.wheelDelta) {
                // Even if the event has no wheel direction we update the scroll block timeout
                this._blockScrollEvent();
                return;
            }

            if (this._blockScrollEvent()) {
                // When hiding (scrolling down while shown) we don't wan't the connected scroll target to scroll.
                event.stop(evt);
                return;
            }

            if (evt.wheelDelta < 0 || (this._delegate.isShown && this._scrollTarget.scrollTop > 0)) {
                // Scrolling down or scrolling when we're in shown state
                this._raiseHide(evt);
            } else if (!this._blockShowEvent()) {
                this._raiseShow(evt);
            }
        }

    });

});
