define("epi/shell/widget/Application", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/on",
    "dojo/when",

    "dijit/layout/_LayoutWidget",

    "epi/dependency"
],

function (
    array,
    declare,
    domStyle,
    on,
    when,

    _LayoutWidget,

    dependency
) {

    return declare([_LayoutWidget], {
        // summary:
        //      Application widget. Responsible for loading and creating the view components.
        //
        // tags:
        //    internal

        _componentController: null,

        postMixInProperties: function () {
            // tags:
            //      protected

            this.inherited(arguments);

            this._componentController = this._componentController || dependency.resolve("epi.shell.controller.Components");
        },

        startup: function () {

            var self = this,
                viewNodes;

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            viewNodes = [this.containerNode];

            domStyle.set(this.domNode, "visibility", "hidden");

            when(this._componentController.loadComponents(viewNodes), function (widgets) {

                array.forEach(widgets, function (widget) {
                    self._setupChild(widget);
                });

                self.resize();

                domStyle.set(self.domNode, "visibility", "visible");

            }, function (e) {
                console.error(e.stack || e);
            });
        },

        layout: function () {

            var size = this._contentBox;

            array.forEach(this.getChildren(), function (widget) {
                widget.resize && widget.resize(size);
            });
        }
    });
});

