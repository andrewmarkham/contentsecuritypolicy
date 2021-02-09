define("epi-cms/widget/overlay/Property", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    // EPi Framework
    "epi/string",
    "epi/shell/widget/overlay/Item"

],

function (
    // Dojo
    declare,
    lang,

    // EPi Framework
    epiString,
    Item
) {
    return declare([Item], {
        // tags:
        //      public

        onValueChange: function (values/* Array || object*/) {
            // summary:
            //      Event to notify that this and possibly other properties
            //      has changed their values
            // values: Object  ||[Object]
            //      The property values that has changed. {propertyName: "propertyName", value: value}
            // tags:
            //      Public callback
        },

        _getRightProperty: function () {
            // summary:
            //      Gets the proper property name.
            // tags:
            //      internal

            var propertyName = this.name;
            if (this.dndTargetPropertyName) {
                propertyName += ("." + epiString.pascalToCamel(this.dndTargetPropertyName));
            }
            return propertyName;
        },

        onDrop: function (target, value) {

            // If we have a mapping dropdata to child property
            // then set drop data to this
            // REMARK: This's just a simple case, handling one specified property, this doesn't support recursive or duplicate child property
            var propertyName = this._getRightProperty();

            // converts the given input to an array value
            function toArray(input) {
                if (!input) {
                    return [];
                }

                if (!(input instanceof Array)) {
                    return [input];
                }
                return input;
            }

            // a property marked with dndTarget could allow multiple values, in that case add the value instead of replacing
            if (this.dndTargetPropertyAllowMultiple === true) {

                var currentValue = toArray(lang.clone(this.contentModel.get(propertyName)));
                toArray(value).forEach(function (item) {
                    currentValue.push(item);
                });

                value = currentValue;
            }

            this.onValueChange({
                propertyName: propertyName,
                value: value
            });
        }
    });
});
