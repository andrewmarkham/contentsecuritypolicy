define("epi/shell/widget/_ActionConsumerWidget", ["dojo/_base/declare", "./_ActionConsumer"], function (declare, _ActionConsumer) {

    return declare(_ActionConsumer, {
        // tags:
        //    internal deprecated

        // definitionConsumer: [protected] Object
        //      The actions consumer that will be the target for action related events.
        definitionConsumer: null,

        startup: function () {
            // summary:
            //      Overridden to populate the connected action consumer
            this.inherited(arguments);
            this._populateActions();
        },

        _setDefinitionConsumerAttr: function (consumer) {
            this._set("definitionConsumer", consumer);

            if (this._started) {
                this._populateActions();
            }
        },

        onActionAdded: function (action) {
            // summary:
            //      Default implementation that checks if a definition consumer exists and registers actions.
            //      Developers should override this if they don't set a definition consumer.
            // tags:
            //      protected
            if (this.definitionConsumer) {
                this.definitionConsumer.add(action);
            }
        },

        onActionRemoved: function (action) {
            // summary:
            //      Default implementation that checks if a definition consumer exists and removes actions.
            //      Developers should override this if they don't set a definition consumer.
            // tags:
            //      protected
            if (this.definitionConsumer) {
                this.definitionConsumer.remove(action.name);
            }
        },

        onActionPropertyChanged: function (action, propertyName, propertyValue) {
            // summary:
            //      Default implementation that checks if a definition consumer exists and updates action state.
            //      Developers should override this if they don't set a definition consumer.
            // tags:
            //      protected
            if (this.definitionConsumer) {
                this.definitionConsumer.setItemProperty(action.name, propertyName, propertyValue);
            }
        },

        _populateActions: function () {
            if (this.definitionConsumer) {
                this.definitionConsumer.add(this.getActions());
            }
        }
    });
});
