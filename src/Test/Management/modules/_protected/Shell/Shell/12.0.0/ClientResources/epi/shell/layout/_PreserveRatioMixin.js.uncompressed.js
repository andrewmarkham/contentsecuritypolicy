define("epi/shell/layout/_PreserveRatioMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",

    "dijit/Destroyable"
],
function (
    declare,
    lang,
    aspect,

    Destroyable
) {

    return declare([Destroyable], {
        // summary:
        //      Mixin that preserves the size ratio of the splitter panels in a BorderContainer when resizing the window
        // tags:
        //      public

        postCreate: function () {
            // summary:
            //      we adjust the splitter ratio before the resize is executed
            // tags:
            //      protected

            this.inherited(arguments);
            this.own(
                aspect.before(this, "resize", lang.hitch(this, this._adjustSplitter))
            );

        },

        _adjustSplitter: function () {
            // summary:
            //      gets the calculated new style for the frames and applies it
            // tags:
            //      private
            if (typeof this.getChildren === "function") {
                var allFrames = this.getChildren();
                if (allFrames.length === 0) {
                    return;
                }

                var splitFrames = allFrames.filter(function (obj) {
                    return (obj.splitter === true);
                });
                var oddFrames = allFrames.filter(function (obj) {
                    return (obj.splitter !== true);
                });

                var splitterCount = splitFrames.length;
                var max = 0;
                for (var frame in splitFrames) {
                    max = this._calcTrueMax(oddFrames, splitFrames, splitFrames[frame], splitterCount);
                    splitFrames[frame].set("style", this._getStyle(splitFrames[frame], max));
                }
            }

        },

        _getStyle: function (frame, max) {
            // summary:
            //      gets the max allowed size and calculates the new ratio, the returns the styling rule
            // tags:
            //      private

            var style = null;

            switch (frame.region) {
                case "top":
                case "bottom":
                    style = "height: " + this._calcRatio(frame.get("h"), max) + "%;";
                    break;
                case "left":
                case "right":
                    style = "width: " + this._calcRatio(frame.get("w"), max) + "%;";
                    break;
            }

            return style;
        },

        _calcRatio: function (partial, max) {
            // summary:
            //      calculates percentage ratio
            // tags:
            //      private

            return (partial / max) * 100;
        },

        _calcTrueMax: function (oddFrames, splitFrames, currentFrame, splitterCount) {
            // summary:
            //      Summarize max size adjusted with region frames, splitters and center panel
            // tags:
            //      private

            var orientation = "w";

            if (currentFrame.region === "bottom" || currentFrame.region === "top") {
                orientation = "h";
            }

            var max = currentFrame.get(orientation);
            var centerSize = oddFrames.filter(function (child) {
                return child.region === "center";
            })[0].get(orientation);
            var splitterSize = currentFrame._splitterWidget.get(orientation);

            var processFrame = function (frame) {
                if (orientation === "w" && (frame.region === "right" || frame.region === "left")) {
                    max += frame.get("w");
                } else if (orientation === "h" && (frame.region === "bottom" || frame.region === "top")) {
                    max += frame.get("h");
                }
            };

            oddFrames.forEach(processFrame);

            splitFrames.forEach(function (frame) {
                if (frame === currentFrame) {
                    return;
                }

                processFrame(frame);
            });

            return max + centerSize + (splitterSize * splitterCount);
        }

    });
});
