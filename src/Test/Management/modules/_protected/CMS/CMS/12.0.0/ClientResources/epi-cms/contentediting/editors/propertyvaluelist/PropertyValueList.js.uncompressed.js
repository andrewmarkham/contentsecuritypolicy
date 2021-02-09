require({cache:{
'url:epi-cms/contentediting/editors/propertyvaluelist/templates/PropertyValueList.html':"<div class=\"epi-property-value-list dijitInline\"  tabindex=\"-1\" role=\"presentation\">\r\n    <div data-dojo-attach-point=\"listNode\"></div>\r\n    <div data-dojo-attach-point=\"addNode\" class=\"add\"></div>\r\n</div>\r\n"}});
define("epi-cms/contentediting/editors/propertyvaluelist/PropertyValueList", [
    // dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/when",
    "dojo/dom-construct",
    "dojo/keys",

    // dijit
    "dijit/registry",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",

    // List modules
    "dgrid/List",
    "dgrid/Keyboard",
    "dgrid/extensions/DnD",
    "epi/shell/dgrid/SingleQuery",
    "epi/shell/dgrid/WidgetRow",
    "epi-cms/dgrid/WithContextMenu",

    // epi
    "epi/shell/MetadataTransformer",
    "epi/shell/widget/_ValueRequiredMixin",
    "epi/shell/widget/WidgetFactory",
    "epi/shell/widget/_FocusableMixin",
    "epi/shell/command/builder/ButtonBuilder",

    "./viewmodels/PropertyValueListViewModel",
    "./PropertyValueListItem",
    "./command/AddPropertyValue",

    // resources
    "dojo/text!./templates/PropertyValueList.html"
], function (
    // dojo
    declare,
    lang,
    aspect,
    domClass,
    when,
    domConstruct,
    keys,

    // dijit
    registry,
    _WidgetBase,
    _TemplatedMixin,

    // List modules
    List,
    Keyboard,
    DnD,
    SingleQuery,
    WidgetRow,
    WithContextMenu,

    // epi
    MetadataTransformer,
    _ValueRequiredMixin,
    WidgetFactory,
    _FocusableMixin,
    ButtonBuilder,

    PropertyValueListViewModel,
    PropertyValueListItem,
    AddPropertyValueCommand,

    // resources
    template
) {

    var PropertyList = declare([List, SingleQuery, DnD, Keyboard, WithContextMenu, WidgetRow]);

    return declare([_WidgetBase, _TemplatedMixin, _ValueRequiredMixin, _FocusableMixin], {
        // summary:
        //      The view for the PropertyValueList. Responsible for creating the PropertyValueList
        //      view model and creating PropertyValueListItems
        // tags:
        //      internal

        templateString: template,

        // baseClass: [public] String
        //    The widget's base CSS class.
        baseClass: "epi-content-area-editor",

        // multiple: [proteced] Boolean
        //      Used by formmixin to determine whether to inject value as an array or single item
        //      return true
        multiple: true,

        // value: [public] Array
        //      The widget's value.
        value: null,

        // model: [public] epi-cms/contentediting/editors/propertyvaluelist/viewmodels/PropertyValueListViewModel
        //      Model of the PropertyValueList
        model: null,

        // _listSelectionMode: [readonly] String
        //    List selection mode.
        _listSelectionMode: "single",

        postMixInProperties: function () {
            this.inherited(arguments);

            this.metadataTransformer = this.metadataTransformer || new MetadataTransformer();
            this._widgetFactory = new WidgetFactory();

            this.own(
                this.model = this.model || new PropertyValueListViewModel({maxLength: this.metadata.customEditorSettings.maxLength})
            );
        },

        buildRendering: function () {
            this.inherited(arguments);

            this._setupModelWatchers();
            this._setupList();
            this._setupAddCommand();
        },

        startup: function () {
            if (this._started) {
                return;
            }

            this.inherited(arguments);

            if (this.list) {
                this.list.startup();
            }
        },

        onChange: function (value) {
            // summary:
            //      An extension point invoked when the value has changed.
            // tags:
            //      public
        },

        isValid: function () {
            // summary:
            //      Returns true if the editor is not required or if it contains one or more items.
            // tags:
            //      protected

            return !this.required || this.model.get("hasValue");
        },

        _getValueAttr: function () {
            // summary:
            //      Gets the values from the model.
            // tags:
            //      private

            return this.model.getFilteredValue();
        },

        _setupModelWatchers: function () {
            // summary:
            //      Sets up all watchers for changes to the model.
            // tags:
            //      private

            var callback = function () {
                this.onChange(this.get("value"));
            }.bind(this);

            this.own(
                aspect.after(this.model, "moveUp", callback),
                aspect.after(this.model, "moveDown", callback),
                aspect.after(this.model, "remove", callback),
                this.model.on("itemAdded", this._onItemAdded.bind(this))
            );
        },

        _setupList: function () {
            // summary:
            //      Creates the list and setup all events.
            // tags:
            //      private

            this.own(
                this.list = new PropertyList({
                    "class": "epi-grid-height--auto epi-card-list epi-card-list--numbered",
                    store: this.model.get("store"),
                    commandCategory: "itemContext",
                    dndSourceType: [this.name],
                    deselectOnRefresh: false,
                    tabIndex: -1, // the list itself does not need to have a tabstop
                    dndParams: {
                        withHandles: true,
                        creator: this._createAvatar.bind(this),
                        skipForm: true
                    },
                    maintainOddEven: false,
                    selectionMode: this._listSelectionMode,
                    renderRow: this._renderPropertyValue.bind(this)
                }, this.listNode),

                this.list.addKeyHandler(keys.DELETE, this._removeItem.bind(this)),
                this.list.addKeyHandler(keys.UP_ARROW, this._moveItem.bind(this, true)),
                this.list.addKeyHandler(keys.DOWN_ARROW, this._moveItem.bind(this, false)),
                this.on("keypress", this._createItem.bind(this)),

                this.list.on("dgrid-select, dgrid-deselect, dgrid-contextmenu", function (event) {
                    this._updateSelectedValue();
                }.bind(this)),

                this.list.on("dgrid-contextmenu", function () {
                    // hide any tooltip when showing the context menu
                    this.displayMessage(false);
                }.bind(this))
            );

            var dndSource = this.list.get("dndSource");
            this.own(
                aspect.after(dndSource, "onDndStart", function (source, nodes, copy) {
                    var accepted = source === dndSource;
                    domClass.toggle(this.domNode, "dojoDndTargetDisabled", !accepted);
                }.bind(this), true),
                aspect.after(dndSource, "onDndDrop", function () {
                    this.onChange(this.get("value"));
                }.bind(this), true)
            );

            this.list.contextMenu.addProvider(this.model);
        },

        _createAvatar: function (listItem) {
            var widget = registry.byNode(this.list.row(listItem).element);
            var node = domConstruct.create("div").appendChild(document.createTextNode(widget.getDisplayedValue()));

            return {
                node: node,
                type: this.name,
                data: listItem
            };
        },

        _updateSelectedValue: function () {
            // summary:
            //      Updates the selected value
            // tags:
            //      private

            var id = Object.keys(this.list.selection)[0],
                selectedValue = null;

            if (id !== undefined) {
                selectedValue = {
                    id: id,
                    data: this.list.row(id).data
                };
            }

            this.model.set("selectedValue", selectedValue);
        },

        _setupAddCommand: function () {
            // summary:
            //      Sets up the command and assemble it
            // tags:
            //      private

            this.own(this._addPropertyValueCommand = new AddPropertyValueCommand({ model: this.model }));

            var builder = new ButtonBuilder({
                settings: {
                    "class": "epi-chromeless",
                    showLabel: false
                }
            });
            builder.create(this._addPropertyValueCommand, this.addNode);
        },

        _renderPropertyValue: function (value) {
            // summary:
            //      Renders an propertyvalue widget for the row and returns its DOM node.
            // tags:
            //      private


            var editorDefinition = lang.clone(this.metadata.customEditorSettings.innerPropertySettings);
            editorDefinition.settings.value = value.item;
            if (typeof this.get("readOnly") !== "undefined") {
                editorDefinition.settings.readOnly = this.get("readOnly");
            }

            var listItemWidget = new PropertyValueListItem({
                widgetFactory: this._widgetFactory,
                editorDefinition: this.metadataTransformer.transformPropertySettings(editorDefinition)
            });

            this.list.own(
                listItemWidget.on("change", function (editorValue) {
                    this.model.put(value.id, editorValue);
                    this._set("value", this.get("value"));
                    this.onChange(this.get("value"));
                    this.validate();
                }.bind(this)),

                listItemWidget.on("focus", function (sender) {
                    if (this.readOnly || sender) {
                        return;
                    }

                    // Try to get the dgrid row for the current widget
                    var row = this.list.row(value.id);
                    if (!row || !row.element) {
                        return;
                    }
                    // Set focus to the widgets dgrid row, we need that for the context menu to
                    // be visible on the correct row
                    // NOTE: Focus needs to be called before we clear and re-select
                    //
                    this.list.focus(row.element);

                    // Clear the selection and the select the row
                    this.list.clearSelection();
                    this.list.select(row);

                }.bind(this)),

                listItemWidget);

            return listItemWidget.domNode;
        },

        _removeItem: function () {
            this.model.remove();
        },

        _moveItem: function (moveUp, event) {
            // summary:
            //      Move the item up or down by pressing CTRL+UP/DOWN.
            // tags:
            //      private

            if (event.ctrlKey) {
                var row = this.list.row(event);
                this.list.focus(row);
                moveUp ? this.model.moveUp() : this.model.moveDown();
            }
        },

        _createItem: function (event) {

            // Exit if focus on text
            if (event.target.type === "text") {
                return;
            }

            if (event.key === "+") {
                this.model.addItem();
                event.preventDefault();
            }
        },

        _onItemAdded: function (e) {
            // summary:
            //      When adding an item, select the new row and focus the editor.
            // tags:
            //      private

            var row = this.list.row(e.itemId);
            if (!row || !row.element) {
                return;
            }

            // setting focus on specific list row will set "dgrid-focus" class on row
            // which keeps menu alvays visible
            this.list.focus(row.element);

            var widget = registry.byNode(row.element);
            if (widget && widget.focus) {
                widget.focus();
            }
        },

        _setValueAttr: function (value) {
            // summary:
            //      Sets the values to the model and refreshes the list.
            // tags:
            //      private

            this._set("value", value);
            this.model.set("value", value);
        },

        _setReadOnlyAttr: function (readOnly) {
            // summary:
            //      Sets the readonly setting.
            // tags:
            //      private

            this._set("readOnly", readOnly);
            this.model.set("readOnly", readOnly);

            this.list.set("selectionMode", this.readOnly ? "none" : this._listSelectionMode);
            this.list.set("dndDisabled", this.readOnly);
        }
    });
});
