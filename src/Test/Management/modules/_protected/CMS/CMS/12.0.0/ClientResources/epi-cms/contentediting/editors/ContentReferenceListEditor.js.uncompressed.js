require({cache:{
'url:epi-cms/contentediting/editors/templates/ContentReferenceListEditor.html':"﻿<div class=\"dijitInline\" tabindex=\"-1\" role=\"presentation\">\r\n    <div class=\"epi-content-area-header-block\">\r\n        <div data-dojo-type=\"epi-cms/contentediting/AllowedTypesList\"\r\n             data-dojo-props=\"allowedTypes: this.allowedTypes, restrictedTypes: this.restrictedTypes\"\r\n             data-dojo-attach-point=\"allowedTypesHeader\"></div>\r\n    </div>\r\n    <div class=\"epi-content-area-editor--wide epi-content-area-editor\"\r\n         data-dojo-attach-point=\"dndAreaWrapper\">\r\n        <div data-dojo-type=\"epi-cms/contentediting/ContentReferenceList\"\r\n             data-dojo-props=\"allowedTypes: this.allowedTypes,\r\n                          restrictedTypes: this.restrictedTypes,\r\n                          commandSource: this.model,\r\n                          store: this.model.valueStore,\r\n                          readOnly: this.readOnly,\r\n                          query: this.model.query\"\r\n             data-dojo-attach-point=\"list\"></div>\r\n        <div data-dojo-attach-point=\"dropContainer\" class=\"epi-content-area-actionscontainer\"></div>\r\n    </div>\r\n</div>"}});
﻿define("epi-cms/contentediting/editors/ContentReferenceListEditor", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/on",
    "dojo/when",
    // dijit
    "dijit/_TemplatedMixin",
    "dijit/_WidgetBase",
    "dijit/_WidgetsInTemplateMixin",
    // epi
    "epi/shell/dnd/Target",
    "epi/shell/widget/_ValueRequiredMixin",
    "epi/shell/widget/_FocusableMixin",
    // epi-cms
    "./_AddItemDialogMixin",
    "./_TextWithActionLinksMixin",
    "./model/ContentReferenceListEditorModel",
    "../AllowedTypesList",
    "../ContentReferenceList",
    "epi-cms/widget/ContentSelectorDialog",
    // resources
    "dojo/text!./templates/ContentReferenceListEditor.html",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentreferencelisteditor"
], function (
// dojo
    declare,
    lang,
    aspect,
    domStyle,
    domClass,
    on,
    when,
    // dijit
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,
    // epi
    Target,
    _ValueRequiredMixin,
    _FocusableMixin,
    // epi-cms
    _AddItemDialogMixin,
    _TextWithActionLinksMixin,
    ContentReferenceListEditorModel,
    AllowedTypesList,
    ContentReferenceList,
    ContentSelectorDialog,
    // resources
    templateString,
    resources
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ValueRequiredMixin, _FocusableMixin, _TextWithActionLinksMixin, _AddItemDialogMixin], {
        // summary:
        //      A widget used to edit a list of content references.
        // tags:
        //      internal

        // baseClass: [public] String
        //    The widget's base CSS class.
        baseClass: "epi-content-area-wrapper",

        // value: [public] Array
        //      An array of content references.
        value: null,

        // model: [protected] Object
        //      The model for this editor.
        model: null,

        // templateString: [public] String
        //      A html string defining the template for this editor.
        templateString: templateString,

        // itemEditorType: Function
        //      The item editor class.
        itemEditorType: ContentSelectorDialog,

        // multiple: [internal] Boolean
        //    Represents that widget accepts an array as a value
        //    and is used by _FormMixin
        multiple: true,

        postMixInProperties: function () {
            // summary:
            //      Called after the parameters to the widget have been read-in,
            //      but before the widget template is instantiated.
            // tags:
            //      protected

            this.inherited(arguments);
            this.dialogParams = lang.mixin({
                dialogClass: "epi-dialog-portrait"
            }, this.dialogParams);
            this.allowedTypes = this.allowedTypes || ["episerver.core.icontentdata"];
            this.model = this.model || new ContentReferenceListEditorModel();
            this.own(this.model);
        },

        buildRendering: function () {
            // summary:
            //      Construct the UI for this widget, setting this.domNode, this.dndTarget and this.model.
            // tags:
            //      protected

            this.inherited(arguments);

            this._setupModelWatchers();

            if (this.readOnly) {
                return;
            }

            this.dndTarget = new Target(this.dropContainer, {
                accept: this.allowedTypes,
                reject: this.restrictedTypes,
                alwaysCopy: false,
                allowMultipleItems: true,
                creator: function () { },
                insertNodes: function () { }
            });
            this.setupActionLinks(this.dropContainer);
            this._setupEvents();
        },

        _setupModelWatchers: function () {
            // summary:
            //      Sets up all watchers for changes to the model.
            // tags:
            //      private
            var afterValueUpdate = lang.hitch(this, function (newItems) {
                this.list.refresh();
                if (newItems) {
                    this.list.setSelection(newItems);
                }
                this.onChange(this.get("value"));
            });
            this.own(
                aspect.before(this.model, "addItems", this.focus.bind(this)),
                aspect.after(this.model, "addItems", afterValueUpdate),
                aspect.after(this.model, "moveItems", afterValueUpdate),
                aspect.after(this.model, "removeItems", afterValueUpdate)
            );
        },

        _setupEvents: function () {
            // summary:
            //      Sets up all events for this widget.
            // tags:
            //      private

            var dndSource = this.list.getDndSource();
            this.own(
                this.dndTarget,
                on(this.list, "itemaction", lang.hitch(this, function (e) {
                    this.model.navigateToItem(e.item);
                })),
                on(this.list, "itemsdropped", lang.hitch(this, function (e) {
                    this.model.addItems(
                        e.items,
                        dndSource.current != null ?
                            dndSource.getItem(dndSource.current.id).data.index :
                            null,
                        dndSource.before
                    );
                })),
                on(this.list, "itemsmoved", lang.hitch(this, function (e) {
                    this.model.moveItems(
                        e.ids,
                        dndSource.current != null ?
                            dndSource.getItem(dndSource.current.id).data.index :
                            null,
                        dndSource.before
                    );
                })),
                on(this.list, "itemsremove", lang.hitch(this, function (e) {
                    this.model.removeItems(e.ids);
                })),
                aspect.after(this.dndTarget, "onDropData", lang.hitch(this, function (dndData, source) {
                    var items = dndData.map(function (item) {
                        return item.data;
                    });
                    this.model.addItems(items);
                }), true),
                aspect.after(dndSource, "onDndStart", lang.hitch(this, function (source, nodes, copy) {
                    var accepted = dndSource.accept && dndSource.checkAcceptance(source, nodes);
                    domClass[accepted ? "remove" : "add"](this.dndAreaWrapper, "dojoDndTargetDisabled");
                }), true)
            );
        },

        _setValueAttr: function (value) {
            // summary:
            //      Sets the contentLinks to the model and refreshes the list.
            // tags:
            //      protected

            this.model.setContentLinks(value).then(lang.hitch(this, function () {
                if (this.list) {
                    //since this resets the list we need to clear the selection
                    this.list.setSelection([]);
                    this.list.refresh();
                }
            }));
        },

        _getValueAttr: function () {
            // summary:
            //      Gets the contentLinks from the model.
            // tags:
            //      protected

            return this.model.get("contentLinks");
        },

        _setReadOnlyAttr: function (readOnly) {
            this._set("readOnly", readOnly);

            this.model.set("readOnly", readOnly);

            // hide actions when readonly
            domStyle.set(this.dropContainer, "display", readOnly ? "none" : "");
        },

        focus: function () {
            // summary:
            //    Sets focus on the list if there is a value, otherwise sets focus on the create text.
            // tags:
            //    public

            if (this._hasValue()) {
                this.list.focus();
            } else {
                this.textWithLinks.focus();
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
            //      Returns true if the editor is not required or if it contains one or more content links.
            // tags:
            //      protected

            return !this.required || this._hasValue();
        },

        _hasValue: function () {
            // summary:
            //      return true if the model contains any links; otherwise false.
            // tags:
            //      private

            return (!!this.model && !!this.get("value") && this.get("value").length > 0);
        },

        getTemplateString: function () {
            // summary:
            //      The template string for drop area.
            // tags:
            //      protected

            return {
                templateString: resources.template,
                actions: resources.actions
            };
        },

        executeAction: function (actionName) {
            // summary:
            //      Opens the content selector dialog.
            // tags:
            //      private

            this._onToggleItemEditor();
        },

        _createItemEditor: function () {
            // summary:
            //      Creates the content selector dialog.
            // tags:
            //      private

            return new this.itemEditorType({
                canSelectOwnerContent: false,
                showButtons: false,
                roots: this.roots,
                allowedTypes: this.allowedTypes,
                restrictedTypes: this.restrictedTypes,
                showAllLanguages: true,
                disableRestrictedTypes: false
            });
        },

        _getDialogTitleText: function (existingItem) {
            // summary:
            //      Gets the title for the content selector dialog.
            // tags:
            //      protected

            return resources.dialogtitle;
        },

        _onDialogExecute: function () {
            // summary:
            //      Makes sure that no validation is made before calling the public callback onExecuteDialog.
            // tags:
            //      protected

            this.onExecuteDialog();
        },

        onExecuteDialog: function () {
            // summary:
            //      Adds the value of the dialog as a contentLink to the model.
            // tags:
            //      protected

            var contentLink = this._itemEditor.get("value");
            this.model.addContentLink(contentLink);
        }
    });
});
