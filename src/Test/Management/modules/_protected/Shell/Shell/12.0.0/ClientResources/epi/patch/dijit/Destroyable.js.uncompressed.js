define("epi/patch/dijit/Destroyable", [
    "dojo/_base/lang",
    "dijit/Destroyable"
], function(lang, Destroyable){
    // Patch to fix memory leaking in dijit/Destroyable. The destroy method in Destroyable class doesn't contain
    // `this.inherited(arguments)`. It is a reason for memory leaking of components which inherit from this class because the
    // destroy method from super class isn't called
    lang.mixin(Destroyable.prototype, {
        destroy: function (/*Boolean*/ preserveDom) {
            this.inherited(arguments);
            this._destroyed = true;
        }
    });
    Destroyable.prototype.destroy.nom = "destroy";
});
