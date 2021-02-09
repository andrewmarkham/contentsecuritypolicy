define("epi/shell/widget/DelayableStandby", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojox/widget/Standby"
],

function (
// Dojo
    declare,
    lang,
    Standby
) {

    return declare([Standby], {
        // summary:
        //    Represent a Standby widget, which would be display in a delay time.
        //
        // tags:
        //    internal xproduct

        // delayTime: [public] Integer
        //    Delay time before displaying standby, in millisecond.
        delayTime: 300,


        // showTimeOut: Integer
        //      Timeout in milliseconds when to hide standby if it's shown. Set to zero or negative
        //      to show standby until closed
        showTimeOut: 30e3,

        // color:	String
        //		The color to set the overlay.  Should be in #XXXXXX form.
        //		Default color is set to white.
        color: "#FFFFFF",

        // Id of settimeout when show loading indicator
        _timeoutId: -1,

        // _isShowing: Boolean
        //      Indicates if the standby is showing or is about to show
        _isShowing: false,

        destroy: function () {
            this._clearTimeout();

            this.inherited(arguments);
        },

        show: function (delayTime, showTimeOut) {
            // summary:
            //		Show the standby, after a delayTime
            // tags:
            //		public

            var params = arguments;
            this._clearTimeout();

            this._isShowing = true;

            if (typeof delayTime !== undefined && delayTime === 0) {
                this.inherited(params);
            } else {
                this._timeoutId = setTimeout(lang.hitch(this, function () {

                    var alsoHideAfter = showTimeOut || this.showTimeOut;

                    // create another timeout to hide the standby, so we don't get stuck with it forever
                    if (alsoHideAfter >= 0) {
                        this._timeoutId = setTimeout(lang.hitch(this, function () {
                            this.hide();
                        }), alsoHideAfter);
                    }

                    // call inherited show method, this has to be the original arguments, otherwise we loose context
                    this.inherited(params);

                }), delayTime || this.delayTime);
            }
        },

        hide: function () {
            // summary:
            //		Hide the standby
            // tags:
            //		public

            this._isShowing = false;
            this._clearTimeout();
            this.inherited(arguments);
        },

        _clearTimeout: function () {
            // summary:
            //		Clears any existing timeout process.
            // tags:
            //		private

            if (this._timeoutId >= 0) {
                clearTimeout(this._timeoutId);
            }
        },

        _getIsShowingAttr: function () {
            // summary:
            //      Indicated if the standby is showing or is about to show
            return this._isShowing;
        }
    });
});
