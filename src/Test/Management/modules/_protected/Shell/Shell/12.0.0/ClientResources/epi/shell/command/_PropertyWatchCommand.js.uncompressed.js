define("epi/shell/command/_PropertyWatchCommand", [
    "dojo/_base/declare",
    // Parent class and mixins
    "epi/shell/DestroyableByKey",
    "epi/shell/command/_Command"
], function (
    declare,
    // Parent class and mixins
    DestroyableByKey,
    _Command
) {

    return declare([_Command, DestroyableByKey], {
        // summary:
        //      Base command that will watch the specified properties on the model and set
        //      canExecute accordingly.
        // tags:
        //      internal

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: null,

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected

            this._watchModelProperty();
        },

        _watchModelProperty: function () {
            // summary:
            //      Calls _onPropertyChanged with the new models property.
            // tags:
            //      protected

            var model = this.model;

            this.destroyByKey("propertyWatchHandle");

            if (model) {
                this._onPropertyChanged();
                this.propertiesToWatch.forEach(function (property) {
                    this.ownByKey("propertyWatchHandle", model.watch(property, this._onPropertyChanged.bind(this)));
                }, this);
            } else {
                this.set("canExecute", false);
            }
        },

        _onPropertyChanged: function () {
            // summary:
            //      This is called whenever the specified property is changed on
            //      the model and sets canExecute to the value.
            // tags:
            //      protected

            var canExecute = this.propertiesToWatch.every(function (property) {
                return !!this.model[property];
            }, this);

            this.set("canExecute", canExecute);
        }
    });
});
