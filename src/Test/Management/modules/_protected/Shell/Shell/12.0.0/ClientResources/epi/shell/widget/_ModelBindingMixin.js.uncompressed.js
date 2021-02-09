define("epi/shell/widget/_ModelBindingMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/shell/DestroyableByKey"],

function (array, declare, lang, DestroyableByKey) {

    return declare([DestroyableByKey], {
        // summary:
        //      Add the capability to bind a widget to a view model object.
        //      By providing a binding map, the widget can observe the view model and update its properties accordingly.
        //      The purpose is to separate presentation logic from the widgets and make them testable. The widget properties
        //      can then be reflected in the dom by using dijit attribute mapping.
        //      The mixin will take care of
        //
        // description:
        //      Declare the binding map in widget declaration to enable property propagtation from model to widget. One property
        //      in the model can be propagated to many widget properties.
        //
        //      |   define([
        //      |       "dojo/dom-style",
        //      |       "dijit/_Widget",
        //      |       "dijit/_TemplatedMixin",
        //      |       "epi/shell/widget/_ModelBindingMixin"
        //      |   ],
        //      |
        //      |   function (domStyle, _Widget, _TemplatedMixin, _ModelBindingMixin) {
        //      |       return dojo.declare([_Widget, _TemplatedMixin, _ModelBindingMixin], {
        //      |
        //      |           templateString: '<div><div data-dojo-attach-point="statusTextNode"></div><div data-dojo-attach-point="statusTextNode2"></div></div>',
        //      |
        //      |           // Declare view model binding
        //      |           modelBindingMap: {
        //      |               "statusText": ["statusText", "statusText2"],
        //      |               "visible": ["visible"],
        //      |           },
        //      |
        //      |
        //      |           // other formats supported by modelBindingMap:
        //      |           // * array of properties mapped 1-1
        //      |           //      this.modelBindingMap = ["prop1", "prop2", "prop3"]
        //      |           //      is equivalent to:
        //      |           //      this.modelBindingMap = {
        //      |           //         "prop1": ["prop1"],
        //      |           //         "prop2": ["prop2"],
        //      |           //         "prop3": ["prop3"]
        //      |           //      }
        //      |
        //      |           // * values of modelBindingMap are strings instead of array of strings
        //      |           //      this.modelBindingMap = {
        //      |           //         "prop1": "widgetProperty1",
        //      |           //         "prop2": "widgetProperty2",
        //      |           //         "prop3": "widgetProperty3"
        //      |           //      }
        //      |           //     equivalent is same object with values surrounded as array
        //      |
        //      |           _setModelAttr: function(newModel) {
        //      |               this.inherited(arguments);
        //      |
        //      |               // Own any additional model bindinds (i.e. on or connects) here if needed,
        //      |               // inherited call will release model handles, so we don't need to do at destroyByKey
        //      |               // this.ownByKey(this.model, handle1, handle2)
        //      |           },
        //      |
        //      |           _setStatusTextAttr: { node: "statusTextNode", type: "innerHTML" },
        //      |
        //      |           _setStatusText2Attr: { node: "statusTextNode2", type: "innerHTML" },
        //      |
        //      |           _setVisibleAttr: function (val) {
        //      |               domStyle.set(this.domNode, "visibility", val ? "visible" : "hidden");
        //      |           },
        //      |
        //      |           // The other stuffs come here
        //      |       });
        //      |   });
        //
        // tags:
        //      public

        // model: [protected] dojo/Stateful
        //      The view model which is a stateful object.
        model: null,

        // modelBindingMap: [protected] Object
        //      The binding map. Each key in the map must be an observable property in the model and each item in the map
        //      is a list of widget properties.
        modelBindingMap: null,

        constructor: function (options) {
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.modelBindingMap) {
                this.modelBindingMap = {};
            }
        },

        _setModelAttr: function (value) {
            // remove existing handles
            this.destroyByKey(this.model);

            this._set("model", value);

            this._setupModelBindings();
        },

        _setupModelBindings: function () {

            if (!this.model) {
                return;
            }

            var callback = lang.hitch(this, "_modelWatch");

            var mappings = this._getNormalizedBindingMap();

            for (var modelProperty in mappings) {
                var widgetProperties = mappings[modelProperty];

                this.ownByKey(this.model, this.model.watch(modelProperty, callback));

                // copy intial values to widget
                array.forEach(widgetProperties, function (widgetProperty) {
                    this.set(widgetProperty, this.model.get(modelProperty));
                }, this);

            }
        },

        _modelWatch: function (modelProperty, oldValue, value) {
            var mappings = this._getNormalizedBindingMap();

            var widgetProperties = mappings[modelProperty];

            array.forEach(widgetProperties, function (widgetProperty) {
                this.set(widgetProperty, value);
            }, this);
        },

        _getNormalizedBindingMap: function () {
            // convert modelBindingMap to format:
            /*
             this.modelBindingMap = {
                 "prop1" = ["prop1"],
                 "prop2"= ["prop2"],
                 "prop3"= ["prop3"],
             }
             */

            var mappings = {};

            // modelBindingMap is an array and model properties match 1-1
            /*
                this.modelBindingMap = ["prop1", "prop2", "prop3"];
             */
            if (this.modelBindingMap instanceof Array) {
                this.modelBindingMap.forEach(function (property) {
                    mappings[property] = [property];
                });

                return mappings;
            }

            // modelBindingMap is an object
            /*
                this.modelBindingMap = { "prop1": ["widgetProp1"], "prop2": ["widgetProp2"] };
             */
            for (var modelProperty in this.modelBindingMap) {
                if (!this.modelBindingMap.hasOwnProperty(modelProperty)) {
                    continue;
                }
                var widgetProperties = this.modelBindingMap[modelProperty];

                // check if value of bindingMap is an array and convert if necessary
                /*
                    prop1: "widgetProp1"  =>  prop1: ["widgetProp1"]
                 */
                if (!(widgetProperties instanceof Array)) {
                    widgetProperties = [widgetProperties];
                }

                mappings[modelProperty] = widgetProperties;
            }

            return mappings;
        }
    });
});
