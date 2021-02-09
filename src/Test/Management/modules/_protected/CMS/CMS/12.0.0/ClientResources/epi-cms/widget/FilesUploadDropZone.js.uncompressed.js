require({cache:{
'url:epi-cms/widget/templates/FilesUploadDropZone.html':"<div class=\"epi-assetsDropZone\">\r\n    <div class=\"dijitReset dijitInline epi-dropZone\">\r\n        <div data-dojo-attach-point=\"iconNode\" class=\"epi-dropZone-icon\"></div>\r\n        <span data-dojo-attach-point=\"descriptionNode\" class=\"epi-dropZone-text\"></span>\r\n    </div>\r\n    <div data-dojo-attach-point=\"dropArea\" class=\"epi-dropZone-overlay\"></div>\r\n</div>\r\n"}});
define("epi-cms/widget/FilesUploadDropZone", [
// dojo
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/on",
    // dijit
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    // epi
    "epi/shell/widget/_ModelBindingMixin",
    "./viewmodel/FilesUploadDropZoneViewModel",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.uploadmultiplefiles.dropzone",
    // template
    "dojo/text!./templates/FilesUploadDropZone.html"
],
function (
// dojo
    declare,
    domClass,
    domGeometry,
    on,
    // dijit
    _Widget,
    _TemplatedMixin,
    // epi
    _ModelBindingMixin,
    FilesUploadDropZoneViewModel,
    // resources
    resources,
    // template
    template
) {
    return declare([_Widget, _TemplatedMixin, _ModelBindingMixin], {
        // summary:
        // tags:
        //      internal

        res: resources, // Language resource for drop zone

        // Template for drop zone
        templateString: template,

        dragStartCssClass: "epi-dragStart", // Default drag start css class for drop zone when dragging over outside dom node
        dragOverCssClass: "epi-dragOver", // Default drag over css class for drop zone

        outsideDomNode: null, // Drop zone's outside dom node

        // enabled: [readonly] Boolean
        //      Flag to indicate whether this drop zone should be enabled for dropping or not.
        enabled: true,

        // validSelection: [public] Boolean
        //      Flag to indicate if the current selection is valid.
        validSelection: true,

        // descriptionText: [public] String
        //      The text to display in the drop zone.
        descriptionText: null,

        // settings: [public] Object
        //      The settings object for this drop zone. It should define enabled, validSelection and dropFolderName.
        settings: null,

        // model: [public] FilesUploadDropZoneViewModel
        //      The view model for this drop zone.
        model: null,

        modelBindingMap: {
            descriptionText: ["descriptionText"],
            enabled: ["enabled"],
            validSelection: ["validSelection"]
        },

        postMixInProperties: function () {
            this.inherited(arguments);
            this.model = this.model || new FilesUploadDropZoneViewModel();
        },

        postCreate: function () {
            // summary:
            //      Set initial values.
            // tags:
            //      protected

            this.inherited(arguments);

            if (this.outsideDomNode) {
                this.own(
                    on(this.outsideDomNode, "dragenter", this._onDragEnter.bind(this)),
                    on(this.outsideDomNode, "dragend", this._onDragLeave.bind(this)),
                    on(this.outsideDomNode, "drop", this._onDragLeave.bind(this))
                );
            }

            this.own(
                on(this.dropArea, "dragover", this._onDragOver.bind(this)),
                on(this.dropArea, "dragleave", this._onDragLeave.bind(this)),
                on(this.dropArea, "dragend", this._onDragLeave.bind(this)),
                on(this.dropArea, "drop", this._onDrop.bind(this))
            );
        },

        _onDragEnter: function (evt) {
            // summary:
            //      Handle when dragging file(s) over outside drop zone
            //
            // tags:
            //      private

            if (!this.enabled) {
                return;
            }

            evt.preventDefault();
            domClass.add(this.domNode, this.dragStartCssClass);
        },

        _onDragOver: function (evt) {
            // summary:
            //      Handle when dragging file(s) over drop zone
            //
            // tags:
            //      private

            if (!this.enabled) {
                return;
            }

            evt.preventDefault();
            domClass.remove(this.domNode, this.dragStartCssClass);
            domClass.add(this.domNode, this.dragOverCssClass);
        },

        _onDragLeave: function (evt) {
            // summary:
            //      Handle when drag leaves file management
            //
            // tags:
            //      private

            if (!this.enabled) {
                return;
            }

            evt.preventDefault();
            this._removeAllCssClasses();
        },

        onDrop: function (evt, files) {
            // summary:
            //      Trigger when some files dropped on the target
            // e: Event
            //      event object.
            // files: Array
            //      file list.
            // tags: callback
        },

        _onDrop: function (evt) {
            // summary:
            //      Handle when drop file(s) in drop zone
            //
            // tags:
            //      private

            if (!this.enabled) {
                return;
            }

            evt.preventDefault();
            this._removeAllCssClasses();
            this.onDrop(evt, evt.dataTransfer.files);
        },

        _removeAllCssClasses: function () {
            // summary:
            //      remove all added css classes
            //
            // tags:
            //      private

            domClass.remove(this.domNode, this.dragStartCssClass);
            domClass.remove(this.domNode, this.dragOverCssClass);
        },

        _setSettingsAttr: function (value) {
            // summary:
            //      Sets the settings on the model.
            //
            // tags:
            //      protected

            this._set("settings", value);

            this.model.set("settings", value);
        },

        _setValidSelectionAttr: function (value) {
            // summary:
            //      Toggles the icon node.
            //
            // tags:
            //      protected

            this._set("validSelection", value);

            domClass.toggle(this.iconNode, "epi-no-drop", !value);
        },

        _setDescriptionTextAttr: { node: "descriptionNode", type: "innerText" }
    });
});
