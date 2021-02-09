require({cache:{
'url:epi-cms/contentediting/editors/templates/ContentAreaEditor.html':"﻿<div class=\"dijitInline\" tabindex=\"-1\" role=\"presentation\">\r\n    <div data-dojo-attach-point=\"treeNode\"></div>\r\n    <div data-dojo-attach-point=\"actionsContainer\" class=\"epi-content-area-actionscontainer\"></div>\r\n</div>\r\n"}});
define("epi-cms/contentediting/editors/ContentAreaEditor", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/on",
    "dojo/topic",
    "dojo/when",

    //Dijit
    "dijit/registry",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_CssStateMixin",
    "dijit/_WidgetsInTemplateMixin",

    // EPi Framework
    "epi/shell/dnd/Target",
    "epi/shell/command/_CommandProviderMixin",

    //EPi CMS
    "./_ContentAreaTree",
    "./_ContentAreaTreeModel",
    "./_TextWithActionLinksMixin",
    "epi-cms/_ContentContextMixin",
    "epi-cms/ApplicationSettings",
    "epi-cms/contentediting/viewmodel/ContentAreaViewModel",
    "epi/shell/widget/ContextMenu",
    "epi/shell/widget/_ValueRequiredMixin",
    "epi-cms/widget/overlay/Block",
    "epi-cms/widget/command/CreateContentFromSelector",

    "epi-cms/widget/_HasChildDialogMixin",

    "epi-cms/contentediting/command/BlockRemove",
    "epi-cms/contentediting/command/BlockEdit",
    "epi-cms/contentediting/command/MoveToPrevious",
    "epi-cms/contentediting/command/MoveToNext",
    "epi-cms/contentediting/command/MoveOutsideGroup",
    "epi-cms/contentediting/command/Personalize",
    "epi-cms/contentediting/command/SelectDisplayOption",

    // Resources
    "dojo/text!./templates/ContentAreaEditor.html",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea"
],
function (

// Dojo
    declare,
    lang,
    aspect,
    domClass,
    domStyle,
    on,
    topic,
    when,

    // Dijit
    registry,
    _WidgetBase,
    _TemplatedMixin,
    _CssStateMixin,
    _WidgetsInTemplateMixin,

    // EPi Framework
    Target,
    _CommandProviderMixin,

    // CMS
    _ContentAreaTree,
    _ContentAreaTreeModel,
    _TextWithActionLinksMixin,
    _ContentContextMixin,
    ApplicationSettings,
    ContentAreaViewModel,

    ContextMenu,
    _ValueRequiredMixin,
    BlockOverlay,
    CreateContentFromSelector,

    _HasChildDialogMixin,

    RemoveCommand,
    EditCommand,
    MoveToPrevious,
    MoveToNext,
    MoveOutsideGroup,
    Personalize,
    SelectDisplayOption,

    // Resources
    template,
    resources
) {

    return declare([
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _CssStateMixin,
        _ValueRequiredMixin,
        _ContentContextMixin,
        _CommandProviderMixin,
        _HasChildDialogMixin,
        _TextWithActionLinksMixin
    ], {
        // summary:
        //      Editor for ContentArea to be able to edit my content area property in forms mode
        //      This should be a simple, non WYSIWYG listing of the inner content blocks with possibilities to add, remove and rearrange the content.
        //
        // tags:
        //      internal

        // baseClass: [public] String
        //    The widget's base CSS class.
        baseClass: "epi-content-area-editor",

        // res: Json object
        //      Language resource
        res: resources,

        // templateString: String
        //      UI template for content area editor
        templateString: template,

        // value: String
        //      Value of the content area
        value: null,

        // multiple: Boolean
        //  Value must be true, otherwise dijit/Form will trea the value as an object instead of an array
        multiple: true,

        // parent: Object
        //      Editor wrapper object containe the editor
        parent: null,

        // overlayItem: Object
        //      Source overlay of the content area in on page edit mode
        overlayItem: null,

        // model: Object
        //      Content area editor view model
        model: null,

        // intermediateChanges: Boolean
        //      Inherited from editor interface
        intermediateChanges: true,

        // editMode: String
        //      Flags to detect page edit mode (On page edit or Form edit mode or Create content mode)
        editMode: "onpageedit",

        // _preventOnBlur: [private] Boolean
        //      When set, the onBlur event is prevented.
        _preventOnBlur: false,

        _dndTarget: null,

        // allowedTypes: [public] Array
        //      The types which are allowed. i.e used for filtering based on AllowedTypesAttribute
        allowedTypes: null,

        // restrictedTypes: [public] Array
        //      The types which are restricted.
        restrictedTypes: null,

        constructor: function () {
            this.allowedDndTypes = [];
        },

        onChange: function (value) {
            // summary:
            //    Called when the value in the widget changes.
            // tags:
            //    public callback
        },

        _handleModelChange: function (value) {
            // summary:
            //    Called when the value in the model changes.
            // tags:
            //    public callback

            this.validate();
            this.onChange(value);
        },

        _onBlur: function () {
            // summary:
            //      Override base to prevent the onBlur from being called when the _preventOnBlur flag is set.
            // tags:
            //      protected override

            if (this._preventOnBlur) {
                return;
            }
            this.inherited(arguments);
        },

        focus: function () {
            // summary:
            //    Focus the tree if there is a value, else focus the create block text.
            // tags:
            //    public
            if (this.tree && this.model.get("value").length > 0) {
                this._focusManager.focus(this.tree.domNode);
            } else {
                if (this.textWithLinks) {
                    this.textWithLinks.focus();
                }
            }
        },

        postMixInProperties: function () {

            this.inherited(arguments);

            // NOTE: Check for this._commands to allow for mocking the commands without breaking _CommandProviderMixin.
            this.commands = this._commands || [
                new EditCommand(),
                new SelectDisplayOption(),
                new MoveToPrevious(),
                new MoveToNext(),
                new RemoveCommand()
            ];
            // Only add personalize command if the ui is not limited
            if (!ApplicationSettings.limitUI) {
                this.commands.splice(2, 0,
                    new Personalize({category: null}),
                    new MoveOutsideGroup()
                );
            }
            this.commands.forEach(function (command) {
                this.own(command);
            }, this);

            this.own(
                //Create the view model
                this.model = this.model || new ContentAreaViewModel(),
                this.treeModel = this.treeModel || new _ContentAreaTreeModel({model: this.model}),
                this.model.watch("selectedItem", lang.hitch(this, function (name, oldValue, newValue) {
                    //Update the commands with the selected block
                    this.updateCommandModel(newValue);
                })),
                on(this.model, "changed", lang.hitch(this, function () {
                    if (!this._started || this._supressValueChanged) {
                        return;
                    }

                    this._set("value", this.model.get("value"));

                    //Call to the handle model change with the new value
                    this._handleModelChange(this.value);
                }))
            );
            // personalizationarea isn't an actual type so it needs to be hardcoded like in _ContentAreaTree
            this.allowedDndTypes.push("personalizationarea");
        },

        buildRendering: function () {
            this.inherited(arguments);

            this.contextMenu = new ContextMenu();
            this.contextMenu.addProvider(this);

            this.own(this.contextMenu);

            this.setupActionLinks(this.actionsContainer);

            this.own(this._dndTarget = new Target(this.actionsContainer, {
                accept: this.allowedDndTypes,
                reject: this.restrictedDndTypes,
                isSource: false,
                alwaysCopy: false,
                allowMultipleItems: true,
                insertNodes: function () {}
            }));

            this.own(aspect.after(this._dndTarget, "onDropData", lang.hitch(this, function (dndData, source, nodes, copy) {
                dndData.forEach(function (dndData) {
                    this.model.modify(lang.hitch(this, function () {
                        this.model.addChild(dndData.data);
                    }));
                }, this);

                if (!this.tree) {
                    this._createTree();
                }

            }), true));

            // Handle focus after dropping on the tree or the drop area. We set focus to ourselves so that
            // it is not left where the drag originated.
            this.own(
                aspect.after(this._dndTarget, "onDrop", lang.hitch(this, "focus"))
            );
        },

        postCreate: function () {
            this.inherited(arguments);

            this.set("emptyMessage", resources.emptymessage);

            if (this.parent && this.overlayItem) {
                this.connect(this.parent, "onStartEdit", function () {
                    this._selectFromOverlay(this.overlayItem.model);
                });
            }

            this.own(topic.subscribe("/dnd/start", lang.hitch(this, this._startDrag)));
        },

        startup: function () {

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            this.tree && this.tree.startup();
            this.contextMenu.startup();
        },

        destroy: function () {
            this.tree && this.tree.destroyRecursive();

            this.inherited(arguments);
        },

        isCreateLinkVisible: function () {
            // summary:
            //      Overridden mixin class, depend on currentMode will show/not create link
            // tags:
            //      protected

            return this.model.canCreateBlock(this.allowedTypes, this.restrictedTypes);
        },

        executeAction: function (actionName) {
            // summary:
            //      Overridden mixin class executing click actions from textWithLinks widget
            // actionName: [String]
            //      Action name of link on content area
            // tags:
            //      public

            if (actionName === "createnewblock") {
                // HACK: Preventing the onBlur from being executed so the editor wrapper keeps this editor in editing state
                this._preventOnBlur = true;

                // since we're going to create a block, we need to hide all validation tooltips because onBlur is prevented here
                this.validate(false);
                var command = new CreateContentFromSelector({
                    creatingTypeIdentifier: "episerver.core.blockdata",
                    createAsLocalAsset: true,
                    autoPublish: true,
                    allowedTypes: this.allowedTypes,
                    restrictedTypes: this.restrictedTypes
                });

                command.set("model", {
                    save: lang.hitch(this, function (block) {
                        this._preventOnBlur = false;
                        var value = lang.clone(this.get("value"), true) || [];
                        value.push(block);
                        this.set("value", value);

                        // In order to be able to add a block when creating it from a floating editor
                        // we need to set the editing parameter on the editors parent wrapper to true
                        // since it has been set to false while being suspended when switching to
                        // the secondaryView.
                        this.parent.set("editing", true);
                        this.onChange(value);

                        // Now call onBlur since it's been prevented using the _preventOnBlur flag.
                        this.onBlur();
                    }),
                    cancel: lang.hitch(this, function () {
                        this._preventOnBlur = false;
                        this.onBlur();
                    })
                });
                command.execute();
            }
        },

        isValid: function (isFocused) {
            // summary:
            //    Check if widget's value is valid.
            // isFocused:
            //    Indicate that the widget is being focused.
            // tags:
            //    protected

            // When create block screen is visible, we need to hide all validation messages since onBlur is prevented.
            return (this._preventOnBlur || !this.required || this.model.get("value").length > 0);
        },

        _setReadOnlyAttr: function (readOnly) {
            this._set("readOnly", readOnly);

            // hide actions when readonly
            domStyle.set(this.actionsContainer, "display", readOnly ? "none" : "");

            if (this._source) {
                this._source.isSource = !this.readOnly;
            }

            if (this.model) {
                this.model.set("readOnly", readOnly);
            }

            this.tree && this.tree.set("readOnly", readOnly);
        },

        _checkAcceptance: function (source, nodes) {
            // summary:
            //      Customize checkAcceptance func
            // source: Object
            //      The source which provides items
            // nodes: Array
            //      The list of transferred items

            return this.readOnly ? false : this._source.defaultCheckAcceptance(source, nodes);
        },

        _createTree: function () {
            // summary:
            //    Creates the tree widget
            // tags:
            //    private

            //Create the tree
            this.tree = new _ContentAreaTree({
                accept: this.allowedDndTypes,
                reject: this.restrictedDndTypes,
                contextMenu: this.contextMenu,
                model: this.treeModel,
                readOnly: this.readOnly
            }).placeAt(this.domNode, "first");

            this.tree.own(
                aspect.after(this.tree.dndController, "onDndEnd", lang.hitch(this, "focus"))
            );
        },

        _selectFromOverlay: function (overlayModel) {
            var child = overlayModel && overlayModel.selectedItem && overlayModel.selectedItem.serialize(),
                model = this.model,
                path = ["root"];

            // exit if there is no overlay model to select item
            if (!child) {
                return;
            }

            if (child.contentGroup) {
                model = model.getChild({ name: child.contentGroup });
                path.push(model.id);
            }
            model = model.getChild(child);
            if (!model) {
                return;
            }

            path.push(model.id);

            model.set("selected", true);
            model.set("ensurePersonalization", overlayModel.selectedItem.ensurePersonalization);

            // TODO: move this selection into tree instead
            this.tree && this.tree.set("path", path);

        },

        _startDrag: function (source, nodes, copy) {
            var accepted = this._dndTarget.accept && this._dndTarget.checkAcceptance(source, nodes);
            domClass.toggle(this.domNode, "dojoDndTargetDisabled", !accepted);

            // close the editor when user start draging Block from BlockArea
            //TODO: This widget should not call a method on the parent
            var widget = registry.getEnclosingWidget(nodes[0]);
            if (widget && widget.isInstanceOf(BlockOverlay) && this.parent.cancel) {
                // We set isModified to false (default value) because always synchronize value
                // between OPE and Editor
                this.parent.set("isModified", false);
                this.parent.cancel();
            }
        },

        _setValueAttr: function (value) {

            // Destroy the tree since that is the fastest way to remove all items
            this.tree && this.tree.destroyRecursive();

            this._set("value", value || []);

            this._supressValueChanged = true;
            this.model.set("value", value);
            this._supressValueChanged = false;

            // Create the tree again after the value has been set so
            // all tree nodes are created in one go
            this._createTree();
        }
    });
});
