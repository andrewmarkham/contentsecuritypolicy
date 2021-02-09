require({cache:{
'url:epi-cms/contentediting/editors/templates/DialogWithCheckBoxListEditor.html':"﻿<div class=\"dijitReset dijitInline epi-previewableTextBox-wrapper\">\r\n    <span data-dojo-attach-point=\"labelNode\" class=\"epi-previewableTextBox-text dojoxEllipsis dijitInline\"></span>\r\n    <a href=\"#\" data-dojo-attach-point=\"changeNode\" class=\"epi-functionLink\">${changeLabel}</a>\r\n</div>"}});
﻿define("epi-cms/contentediting/editors/DialogWithCheckBoxListEditor", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",

    // Dijit
    "dijit/_TemplatedMixin",
    "dijit/_Widget",

    // EPi
    "epi",
    "epi/shell/DialogService",
    "epi-cms/contentediting/editors/CheckBoxListEditor",
    "epi-cms/contentediting/editors/DialogWithCheckBoxListEditorViewModel",
    "epi-cms/widget/_HasChildDialogMixin",

    // Resources
    "dojo/text!./templates/DialogWithCheckBoxListEditor.html"
],

function (
// dojo
    declare,
    event,
    lang,

    // Dijit
    _TemplatedMixin,
    _Widget,

    // epi
    epi,
    dialogService,
    CheckBoxListEditor,
    DialogWithCheckBoxListEditorViewModel,
    _HasChildDialogMixin,

    // Resources
    template
) {
    return declare([_Widget, _TemplatedMixin, _HasChildDialogMixin], {
        // summary:
        //      Widget that wraps a CheckBoxListEditor in a dialog.
        // tags:
        //      internal

        templateString: template,

        changeLabel: epi.resources.action.change,

        valueIsCsv: true,

        valueIsInclusive: true,

        _checkBoxWidget: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            this._dialogService = this._dialogService || dialogService;

            this.model = new DialogWithCheckBoxListEditorViewModel({
                valueIsCsv: this.valueIsCsv,
                valueIsInclusive: this.valueIsInclusive
            });

            this.own(this.model.watch("label", lang.hitch(this, function (name, oldValue, newValue) {
                this.labelNode.innerHTML = newValue;
            })));
        },

        postCreate: function () {
            this.inherited(arguments);
            this.connect(this.changeNode, "onclick", this._onChangeNodeClick);
        },

        onChange: function (value) {
            // summary:
            //		Callback method for updating the editor wrapper.
            // tags:
            //		callback
        },

        _setValueAttr: function (value) {
            this._set("value", value);
            this.model.set("value", value);
        },

        _setSelectionsAttr: function (value) {
            this._set("selections", value);
            this.model.set("selections", value);
        },

        _onChangeNodeClick: function (e) {
            event.stop(e);

            this._checkBoxWidget = new CheckBoxListEditor({
                selections: this.selections,
                valueIsCsv: this.valueIsCsv,
                valueIsInclusive: this.valueIsInclusive,
                readOnly: this.readOnly
            });

            this._checkBoxWidget.set("value", this.value);

            this.isShowingChildDialog = true;
            this._dialogService.dialog({
                content: this._checkBoxWidget,
                title: this.label
            }).then(function () {
                this._onSave();
            }.bind(this)).always(function () {
                this.isShowingChildDialog = false;
            }.bind(this));
        },

        _onSave: function () {
            this.set("value", this._checkBoxWidget.value);
            this.onChange(this._checkBoxWidget.value);
            this.onBlur(); // make sure the auto save worker will be executed
        }
    });
});
