define("epi-cms/contentediting/editors/_ClipboardPasteMixin", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/_base/window",

    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-construct",

    "dojo/on",
    "dojo/query",
    // dijit
    "dijit/Destroyable",
    // epi
    "epi/string"
],

function (
// dojo
    array,
    declare,
    event,
    lang,
    window,

    domAttr,
    domClass,
    domConstruct,

    on,
    query,
    // dijit
    Destroyable,
    // epi
    epiString
) {

    return declare(Destroyable, {
        // description:
        //      Enable clipboard paste function that can process clipboard data for all browsers.
        // tags:
        //      internal

        // _editingKey: [private] String
        //      The key that used to make editing points are unique for each instance of the content editable.
        _editingKey: "",

        // _editingNode: [private] DOM
        //      The current editing element, that had "contenteditable" attribute is TRUE.
        _editingNode: null,

        // _editingContainer: [private] DOM
        //      The parent element of the given editing element.
        _editingContainer: null,

        // _beginEditingPoint: [private] DOM
        //      The DOM node that will place before the editing element
        _beginEditingPoint: null,

        // _endEditingPoint: [private] DOM
        //      The DOM node that will place after the editing element
        _endEditingPoint: null,

        // _pasteEventActive: [private] Boolean
        //      Flag indicated that paste action (Ctrl+V or paste from context menu) fired or not.
        _pasteEventActive: false,

        // _beginEditingPointCSSClass: [private] String
        //      CSS class used for query purpose. Marked as the start point to find the new pasted nodes.
        _beginEditingPointCSSClass: "epi-content-editable-begin-edit",

        // _endEditingPointCSSClass: [private] String
        //      CSS class used for query purpose. Marked as the end point to find the new pasted nodes.
        _endEditingPointCSSClass: "epi-content-editable-end-edit",

        canAccessClipboard: function (/*Event*/evt) {
            // summary:
            //      Verify that the current browser supports to access clipboard data.
            // evt: [Event]
            //      The source event object
            // tags:
            //      public

            return !!this.getClipboard(evt);
        },

        getClipboard: function (/*Event*/evt) {
            // summary:
            //      Get clipboard object
            // evt: [Event]
            //      The source event object
            // tags:
            //      public

            return (evt && evt.clipboardData) || window.global.clipboardData;
        },

        getClipboardData: function (/*Event*/evt) {
            // summary:
            //      Get clipboard data
            // evt: [Event]
            //      The source event object
            // tags:
            //      public

            var clipboard = this.getClipboard(evt);
            return (clipboard && window.global.clipboardData) ? clipboard.getData("Text") : clipboard.getData("text/plain");
        },

        destroy: function () {
            // summary:
            //      Destroy all redundant nodes after paste and process paste data
            // tags:
            //      public, extension

            this.inherited(arguments);

            this._destroyRedundantNodes([
                this._beginEditingPoint || this._getEditingPoint("before"),
                this._endEditingPoint || this._getEditingPoint("after")
            ]);

            this._editingNode = this._editingContainer = this._beginEditingPoint = this._endEditingPoint = null;
        },

        pasteMixinSetup: function (/*String*/editingKey, /*DOM*/editingElement) {
            // summary:
            //      Setup clipboard paste functions.
            // editingKey: [String]
            //      Key used in manual paste process.
            // editingElement: [DOM]
            //      The given content editing element.
            // tags:
            //      public

            if (!editingElement) {
                return;
            }

            this._editingKey = editingKey;
            this._editingNode = editingElement;
            this._editingContainer = this._editingNode.parentNode;

            this.own(
                on(this._editingNode, "beforepaste", lang.hitch(this, this._onBeforePaste)),
                on(this._editingNode, "paste", lang.hitch(this, this._onPaste)),
                on(this._editingNode, "input", lang.hitch(this, this._onInput))
            );
        },

        _onBeforePaste: function (/*Event*/evt) {
            // summary:
            //      [IE browser only] Process clipboard data before it paste to the target element
            // evt: [Event]
            //      onbeforepaste event
            // tags:
            //      private

            if (this.canAccessClipboard(evt) && window.global.clipboardData) {
                this.getClipboard(evt).setData("Text", epiString.stripHtmlTags(this.getClipboardData(evt)));
            }
        },

        _onPaste: function (/*Event*/evt) {
            // summary:
            //      Process clipboard data before it paste to the target element
            // evt: [Event]
            //      The onpaste event object
            // tags:
            //      private

            if (window.global.clipboardData) {
                return;
            }

            if (this.canAccessClipboard(evt)) {
                this._processNativePaste(evt);

                // Stop onpaste event in order to get clipboard data to process
                event.stop(evt);

                return;
            }

        },

        _onInput: function (/*Event*/evt) {
            // summary:
            //      If the current browser do not support to access clipboard data, process the pasted data on the editing element
            // evt: [Event]
            //      The input event object
            // tags:
            //      private

            if (this.canAccessClipboard(evt) || !this._pasteEventActive) {
                return;
            }

            this._processManualPaste();
        },

        _processNativePaste: function (/*Event*/evt) {
            // summary:
            //      Setup stub for native paste (supported access clipboard data running browser)
            // evt: [Event]
            //      The onpaste event object
            // tags:
            //      private

            var ownerDocument = this._editingNode.ownerDocument,
                textContent = epiString.stripHtmlTags(this.getClipboardData(evt));

            // Call document.execCommand to paste the clean data to the target element
            if (!epiString.isNullOrEmpty(textContent)) {
                ownerDocument.execCommand("insertText", false, textContent);
            }
        },

        _getEditingPoint: function (/*String*/position) {
            // summary:
            //      Get the created editing point by its CSS class from the given position.
            // position: [String]
            //      Accept only 2 values: "before" and "after"
            // tags:
            //      private

            return query("span." + this._getEditingPointClass(position), this._editingContainer)[0];
        },

        _getEditingPointClass: function (/*String*/position) {
            // summary:
            //      Get CSS class for editing point based on the given position (before/after) and the unique id
            // position: [String]
            //      Accept only 2 values: "before" and "after"
            // tags:
            //      private

            var editingCSSClass = (position === "before" ? this._beginEditingPointCSSClass : this._endEditingPointCSSClass);
            if (!epiString.isNullOrEmpty(this._editingKey)) {
                editingCSSClass += "-" + this._editingKey;
            }

            return editingCSSClass;
        },

        _createEditingPoint: function (/*String*/position) {
            // summary:
            //      Create a DOM node that used as an editing point. This DOM node is invisible.
            // position: [String]
            //      Accept only 2 values: "before" and "after"
            // tags:
            //      private

            var editingPoint = domConstruct.create("span",
                {
                    "class": this._getEditingPointClass(position),
                    style: "display:none;position:absolute;left:-99em;"
                },
                this._editingNode,
                position === "before" ? "before" : "after");

            return editingPoint;
        },

        _destroyRedundantNodes: function (/*Array*/redundantNodes) {
            // summary:
            //      Remove all redundant nodes from rendered nodes after paste function.
            // redundantNodes: [Array]
            //      Collection of redundant DOM nodes
            // tags:
            //      private

            // Destroy all redundant nodes
            if (redundantNodes instanceof Array && redundantNodes.length > 0) {
                redundantNodes.forEach(domConstruct.destroy);
            }
        }

    });

});
