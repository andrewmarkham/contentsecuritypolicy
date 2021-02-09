define("epi-cms/widget/_DndStateMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "epi/obsolete"
], function (
    declare,
    lang,
    aspect,
    domClass,
    obsolete
) {
    return declare([], {
        // tags:
        //      internal xproduct deprecated

        // baseDndStateClass: String
        //      CSS base class for dnd state.
        baseDndStateClass: "epi-dropTarget",

        // dndStateClass: String
        //      CSS class for current state
        dndStateClass: null,

        // dropTarget: Target
        //      An instance of Target class
        dropTarget: null,

        // _aspectAfterHandler: Object
        //      Return object from aspect after method.
        _aspectAfterHandler: null,

        constructor: function () {
            obsolete("epi-cms/widget/_DndStateMixin", "DnD state should be managed manually.");
        },

        postCreate: function () {
            this.inherited(arguments);

            this.subscribe("/dnd/start", "_onDndStart");
            this.subscribe("/dnd/cancel", "_onDndCancel");
            this.subscribe("/dnd/drop", "_onDndDrop");

            if (this.dropTarget) {
                this._aspectAfterHandler = aspect.after(this.dropTarget, "onDndStart", lang.hitch(this, "_onAfterDndStart"));
            }
        },

        _getDndStateClassAttr: function () {
            var suffix = this.canAccept() ? "Enabled" : "Disabled";
            this.dndStateClass = this.baseDndStateClass + suffix;
            return this.dndStateClass;
        },

        canAccept: function () {
            return false;
        },

        _onDndStart: function () {
            // Only excecute when mixin widget has not any target
            if (!this.dropTarget) {
                domClass.add(this.domNode, this.get("DndStateClass"));
            }
        },

        _onAfterDndStart: function () {
            domClass.add(this.domNode, this.get("DndStateClass"));
        },

        _onDndCancel: function () {
            domClass.remove(this.domNode, this.dndStateClass);
        },

        _onDndDrop: function () {
            domClass.remove(this.domNode, this.dndStateClass);
        },

        destroy: function () {
            this.inherited(arguments);
            if (this._aspectAfterHandler) {
                this._aspectAfterHandler.remove();
                this._aspectAfterHandler = null;
            }
        }
    });
});
