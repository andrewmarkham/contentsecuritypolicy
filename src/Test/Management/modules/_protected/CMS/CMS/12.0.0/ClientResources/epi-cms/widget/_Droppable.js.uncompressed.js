define("epi-cms/widget/_Droppable", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "epi/shell/dnd/Target"
], function (declare, lang, when, Target) {
    return declare(null, {
        // summary:
        //    Mixin for widgets that are droppable.
        // tags:
        //    public

        // dropAreaNode: [protected] DomNode
        //      The dom node where user can drop
        dropAreaNode: null,

        // allowedDndTypes: [protected] Array
        //      List of data types that this widget can handle
        allowedDndTypes: null,

        postCreate: function () {
            // summary:
            //		Initialize child widgets
            // tags:
            //    protected

            this.inherited(arguments);

            //create drop target
            var dropTarget = this.own(new Target(this.dropAreaNode, {
                accept: this.allowedDndTypes,
                reject: this.restrictedDndTypes,
                createItemOnDrop: false,
                readOnly: this.readOnly,
                skipForm: true
            }))[0];

            this.connect(dropTarget, "onDropData", "_onDropData");
        },

        onDropping: function () {
            // summary:
            //    Triggered when something is dropping onto the widget.
            //
            // tags:
            //    public callback
        },

        onDrop: function () {
            // summary:
            //    Triggered when something has been dropped onto the widget.
            //
            // tags:
            //    public callback
        },

        _onDropData: function (dndData, source, nodes, copy) {
            //summary:
            //    Handle drop data event.
            //
            // dndData:
            //    Dnd data extracted from the dragging items which have the same data type to the current target
            //
            // source:
            //    The dnd source.
            //
            // nodes:
            //    The dragging nodes.
            //
            // copy:
            //    Denote that the drag is copy.
            //
            // tags:
            //    private

            var dropItem = dndData ? (dndData.length ? dndData[0] : dndData) : null;

            if (dropItem) {
                this.onDropping();

                when(dropItem.data, lang.hitch(this, function (resolvedValue) {
                    var value;
                    if (this.dndSourcePropertyName) {
                        value = resolvedValue[this.dndSourcePropertyName];
                    } else {
                        value = resolvedValue;
                    }
                    this.set("value", value);
                    this.onDrop();
                }));
            }
        }
    });
});
