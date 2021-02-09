define("epi/shell/widget/_ActionProviderBase", [
    "epi",
    "dojo"],

function (epi, dojo) {

    return dojo.declare(null, {
        // summary:
        //    Base class for components that can provide actions and handlers to execute
        //
        // tags:
        //    public deprecated

        getActions: function () {
            // summary:
            //      Provides a list of registered actions.
            //
            // tags:
            //      public abstract

            return [];
        },

        onActionAdded: function (action) {
            // summary:
            //      Event raised when a new action has been added to the provider
            //
            // action: Object
            //      The added action
            //
            // tags:
            //      public event
        },

        onActionRemoved: function (action) {
            // summary:
            //      Event raised when an action has been removed from the provider
            //
            // action: Object
            //      The removed action
            //
            // tags:
            //      public event
        },

        onActionPropertyChanged: function (action, propertyName, propertyValue) {
            // summary:
            //      Event raised when a property of an action has changed
            //
            // action: Object
            //      The action for which the property changed
            //
            // propertyName: String
            //      Name of the changed property
            //
            // propertyValue: Object
            //      The new value of the updated property
            //
            // tags:
            //      public event
        }
    });
});
