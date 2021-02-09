define("epi/shell/widget/FormContainer", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom-geometry",
    "dojo/aspect",
    "dojo/has",
    "dojo/when",
    // dijit
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Form",
    // epi
    "epi/epi",
    "require",
    "epi/shell/widget/WidgetFactory",
    "epi/shell/MetadataTransformer"
],

function (
// dojo
    declare,
    array,
    lang,
    domGeom,
    aspect,
    has,
    when,
    // dijit
    _LayoutWidget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    Form,
    // epi
    epi,
    logger,
    WidgetFactory,
    MetadataTransformer
) {

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //     Create a form widget for the specified model, according to the metadata information
        //
        // tags:
        //    public

        templateString: "<div class=\"epi-form-container\">\
                            <div data-dojo-type=\"dijit/form/Form\" data-dojo-attach-point=\"form\">\
                            </div>\
                         </div>",

        // value: Object
        //     Value object to fill in. Used for initial value and to compare
        value: null,

        // metadata: Object | dojo/Deferred
        //     Metadata object or metadata load deferred.
        metadata: null,

        // propertyFilter: Function
        //     Metadata property filter function.
        propertyFilter: null,

        // defaultContainerWidget
        //     Container widget class name which is used to put property widgets in.
        defaultContainerWidget: "epi/shell/layout/SimpleContainer",

        // useDefaultValue: bool
        //     If true use the default value specified in metadata if no value has been set.
        useDefaultValue: null,

        readOnly: false,

        doLayout: true,

        _widgetMap: null,
        _uiSetUp: false,
        _aspectHandles: null,

        postMixInProperties: function () {
            this.inherited(arguments);
            this._widgetMap = {};
            this._aspectHandles = [];
        },

        startup: function () {

            if (this._started) {
                return;
            }

            this.inherited(arguments);
            this._setupUI();
        },

        destroy: function (preserveDom) {
            array.forEach(this._aspectHandles, function (item) {
                item.remove();
            });
            this._aspectHandles = null;

            if (this.containerLayout) {
                this.containerLayout.destroyRecursive(preserveDom);
                this.containerLayout = null;
            }

            this.inherited(arguments);
        },

        _getValueAttr: function () {
            return this._formCreated ? this.form.get("value") : this.value;
        },

        _setValueAttr: function (value) {
            if (this._formCreated) {
                if (value) {
                    this.form.set("value", value);
                } else {
                    this.form.reset();
                }
            }
            this._set("value", value);
        },

        _setMetadataAttr: function (metadata) {
            // summary:
            //      Set the metadata.
            // metadata: Object
            //      The metadata object.

            this._set("metadata", metadata);
        },

        _getUseDefaultValueAttr: function () {

            if (this.useDefaultValue === null) {
                return !this.value;
            }

            return this.useDefaultValue;
        },

        onGroupCreated: function (groupName, groupContainer) {
            // summary:
            //     Raised when a group container is created.
            // groupName: String
            //     The field name
            // groupContainer: dijit/layout/_LayoutWidget
            //     The group container
            // tags:
            //     callback
        },

        onChange: function (value) {
            // summary:
            //    Raised when the form's value is changed.
            //
            // value:
            //    The new value
            //
            // tags:
            //    callback public
        },

        onFieldCreated: function (fieldName, widget) {
            // summary:
            //     Raised when a field editor widget is created.
            // fieldName: String
            //     The field name
            // widget: dijit/_Widget
            //     The widget
            // tags:
            //     callback
        },

        _onFormCreated: function (widget) {
            // summary:
            //     Raised when the form is completely created.
            // widget: epi/shell/widget/FormContainer
            //     The form container widget
            // tags:
            //     private

            if (epi.isEmpty(this.get("value"))) {
                this._onChange();
            }

            this.onFormCreated(widget);
        },

        onFormCreated: function (widget) {
            // summary:
            //     Raised when the form is completely created.
            // widget: epi/shell/widget/FormContainer
            //     The form container widget
            // tags:
            //     callback
        },

        _setupUI: function () {
            // summary:
            //     create the form and the widgets that it contains, formatted accordingly to the metadata
            //     after the form is completed, it calls startup and connects the form widgets to the model.

            var widgetFactory = new WidgetFactory();
            var metadataTransformer = this.metadataTransformer || new MetadataTransformer({ propertyFilter: this.propertyFilter });

            when(this.metadata,
                lang.hitch(this, function (item) {

                    if ( false ) {
                        var timeLog = logger.timedGroup("FormContainer::_setupUI " + arguments.callee.caller.nom);
                    }

                    var useDefaultValue = this.get("useDefaultValue");

                    //transform the metadata in a format that widgetFactory will interpret
                    var componentDefinitions = metadataTransformer.toComponentDefinitions(item, "", useDefaultValue, this.readOnly);

                    //we check that the item has a widget, otherwise we take the default one, and place this widget as the main container (in the form node)
                    var layoutClass = item.layoutType || this.defaultContainerWidget;

                    //Require the layout container
                    require([layoutClass], lang.hitch(this, function (layoutCtor) {

                        var parentWidgets = [],
                            groupWidgets = [];

                        this.containerLayout = new layoutCtor();
                        parentWidgets.push(this.containerLayout);

                        this.connect(widgetFactory, "onWidgetCreated", function (widget, componentDefinition) {

                            //set parent and group
                            var parentWidget = parentWidgets[parentWidgets.length - 1];
                            var groupWidget = groupWidgets.length ? groupWidgets[groupWidgets.length - 1] : null;
                            this._widgetMap[widget.id] = {
                                parent: parentWidget,
                                group: groupWidget
                            };

                            // TODO: use one watch to update all widgets when our readonly change
                            this.own(this.watch("readOnly", lang.hitch(this, function (name, oldValue, value) {
                                widget.set("readOnly", value);
                            })));

                            if (componentDefinition.settings._type === "field") {
                                widget.set("editMode", "createcontent");

                                this.connect(widget, "onChange", "_onChange");

                                // Do some layout preparation before setting focus on a widget
                                this._aspectHandles.push(aspect.before(widget, "focus", lang.hitch(this, function () {
                                    this._beforeSetFocus(widget);
                                })));

                                this.onFieldCreated(componentDefinition.settings.name, widget);
                            } else if (componentDefinition.settings._type === "group") {
                                groupWidgets.push(widget);
                                this.onGroupCreated(componentDefinition.settings.name, widget, groupWidget);
                            } else if (componentDefinition.settings._type === "parent") {
                                parentWidgets.push(widget);
                            }
                        });

                        this.connect(widgetFactory, "onWidgetHierarchyCreated", function (widget, componentDefinition) {
                            if (componentDefinition.settings._type === "group") {
                                groupWidgets.pop();
                            } else if (componentDefinition.settings._type === "parent") {
                                parentWidgets.pop();
                            }
                        });

                        //create the form and start the children
                        when(widgetFactory.createWidgets(this.containerLayout, componentDefinitions, false), lang.hitch(this, function (widgets) {
                            if (this._destroyed) {
                                if ( false ) {
                                    timeLog.end();
                                }
                                return;
                            }

                            this.containerLayout.placeAt(this.form.domNode);
                            this._formCreated = true;
                            this.form.connectChildren();

                            if (this.value !== null) {
                                this.set("value", this.value);
                            }

                            this.layout();

                            this._uiSetUp = true;

                            this._onFormCreated(this);

                            widgetFactory = null;
                            parentWidgets = null;
                            groupWidgets = null;

                            if ( false ) {
                                timeLog.end();
                            }
                        }));

                        this.own(this.form.watch("state", lang.hitch(this, function (name, oldValue, value) {
                            this.set("state", value);
                        })));
                    }));
                })
            );
        },

        _onChange: function () {
            if (!this._uiSetUp) {
                return;
            }
            var newValue = this.form.get("value");
            if (!epi.areEqual(this.value, newValue)) {
                this.value = newValue;
                this.onChange(newValue);
            }
        },

        focus: function () {
            // Ignore any calls to focus on this widget since we don't know where focus
            // should go (since we don't have references to our children). In most cases the
            // focus call is probably coming as a result of an outside validation call, in
            // which case we have already handled focus in our own validation method.
        },

        layout: function () {
            if (!this._started) {
                return;
            }
            var child = this.containerLayout;
            if (child && child.resize) {
                var size = this._containerContentBox || this._contentBox;
                child.resize(this.doLayout && size && size.w && size.h ? size : null);
            }
        },

        validate: function () {
            return this._uiSetUp && this.form.validate();
        },

        isValid: function () {
            return this.validate();
        },

        _beforeSetFocus: function (widget) {
            if (this._widgetMap[widget.id]) {
                var parent = this._widgetMap[widget.id].parent;
                var group = this._widgetMap[widget.id].group;

                this._beforeSetFocus(parent);

                //parent must be a Container
                if (parent.selectChild) {
                    parent.selectChild(group);
                }
            }
        }
    });
});
