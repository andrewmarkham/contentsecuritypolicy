define("epi/patch/dijit/_KeyNavContainer", [
    "dojo/_base/lang",
    "dijit/_KeyNavContainer"
], function (
    lang,
    _KeyNavContainer
) {

    // Patch to fix leaking connect handles that is added in _startupChild are not removed when child widgets are removed from the container.
    // It looks like the _KeyNavContainer is rewritten in dijit version 1.9 so the leaks don't happen there.

    lang.mixin(_KeyNavContainer.prototype, {

        _childWidgetHandles: null,

        _startupChild: function(/*dijit/_WidgetBase*/ widget){
			// summary:
			//		Setup for each child widget
			// description:
			//		Sets tabIndex=-1 on each child, so that the tab key will
			//		leave the container rather than visiting each child.
			// tags:
			//		private

            widget.set("tabIndex", "-1");

            /* THE FIX GOES HERE */
            /* --------------------------------------------------------------------------------------------- */
            if (!this._childWidgetHandles) {
                this._childWidgetHandles = {};
            }
            var childHandles = [
                this.connect(widget, "_onFocus", function(){
                    // Set valid tabIndex so tabbing away from widget goes to right place, see #10272 <-- comment and issue ID from dijit
                    widget.set("tabIndex", this.tabIndex);
                }),
                this.connect(widget, "_onBlur", function(){
                    widget.set("tabIndex", "-1");
                })
            ];
            this._childWidgetHandles[widget.id] = childHandles;
            /* --------------------------------------------------------------------------------------------- */
            /* END FIX */
        },

        /* THE FIX GOES HERE */
        /* --------------------------------------------------------------------------------------------- */

        removeChild: function(/*Widget|int*/ widget){

			if(typeof widget == "number"){
				widget = this.getChildren()[widget];
            }

            if (widget) {
                this._removeChildHandles(widget.id);
            }

            this.inherited(arguments);
        },

        destroyDescendants: function ()  {

            this.getChildren().forEach(function (widget) {
                this._removeChildHandles(widget.id);
            }, this);

            this.inherited(arguments);
        },

        destroy: function () {
            this.inherited(arguments);

            this._childWidgetHandles = null;
        },

        _removeChildHandles: function (widgetId) {
            // summary:
            //      Finds and removes any handles that has been registered for the
            //      supplied widget id.

            if (!this._childWidgetHandles || !widgetId) {
                return;
            }

            var handles = this._childWidgetHandles[widgetId];
            if (!handles){
                return;
            }

            handles.forEach(function (handle) {
                handle.remove();
            });

            delete this._childWidgetHandles[widgetId];
        },

        /* --------------------------------------------------------------------------------------------- */
        /* END FIX */
    });

    _KeyNavContainer.prototype._startupChild.nom = "_startupChild";
    _KeyNavContainer.prototype.removeChild.nom = "removeChild";
    _KeyNavContainer.prototype.destroyDescendants.nom = "destroyDescendants";
    _KeyNavContainer.prototype.destroy.nom = "destroy";
});
