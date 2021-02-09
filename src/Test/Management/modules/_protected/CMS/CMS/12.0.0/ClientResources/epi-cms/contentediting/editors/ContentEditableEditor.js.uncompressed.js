define("epi-cms/contentediting/editors/ContentEditableEditor", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",

    "dojo/on",
    "dojo/query",
    // dijit
    "dijit/_FocusMixin",
    "dijit/_WidgetBase",
    "dijit/focus",
    "dijit/Tooltip",
    // epi
    "epi/string",
    "epi/shell/widget/_ValueRequiredMixin",
    "epi-cms/contentediting/editors/_ClipboardPasteMixin"
],

function (
// dojo
    declare,
    lang,

    domAttr,
    domClass,
    domStyle,

    on,
    query,
    // dijit
    _FocusMixin,
    _WidgetBase,
    focusUtil,
    Tooltip,
    // epi
    epiString,
    _ValueRequiredMixin,
    _ClipboardPasteMixin
) {

    return declare([_WidgetBase, _FocusMixin, _ValueRequiredMixin, _ClipboardPasteMixin], {
        // summary:
        //      Adds content editable editing functionality for properties marked up with the "contenteditable" wrapper type.
        // tags:
        //      internal

        // baseClass: [public] String
        //      The widget's base CSS class.
        baseClass: "epi-content-editable-editor",

        // uiSafeHtmlTags: [public] Array
        //      Array of allowed html tags that can be rendered
        uiSafeHtmlTags: [],

        // blockDisplayNode: [public] DOM
        //      The dom node that should be edited.
        blockDisplayNode: null,

        postCreate: function () {
            // summary:
            //      Enable "contenteditable" for the DOM node, connect event listens, and give the editable node focus.
            // tags:
            //      public override

            this.inherited(arguments);

            var node = this.blockDisplayNode;

            // Setup clipboard paste functions
            this.pasteMixinSetup(this.id, node);

            this.own(
                on(this.domNode, "click", lang.hitch(this, function (e) {
                    // Only _makeContentEditable() in case we having invalid content, otherwise it will run twice
                    this.get("state") === "Error" && this._makeContentEditable();
                })),
                on(node, "blur", lang.hitch(this, this.validate)),
                on(node, "keydown", lang.hitch(this, this.validate))
            );
        },

        destroy: function () {
            //make sure we release the reference to the dom node
            this.blockDisplayNode = null;

            this.inherited(arguments);
        },

        focus: function () {
            // summary:
            //      Focus to content editable
            // tags:
            //      public

            this._makeContentEditable();
            this.inherited(arguments);
        },

        isValid: function (/*Boolean*/ isFocused) {
            // summary:
            //      Tests if the value is valid.
            // tags:
            //      public

            var value = this.get("value");

            if (this.required && epiString.isNullOrEmpty(value)) {
                return false;
            }

            if (this.pattern && !(new RegExp(this.pattern).test(value))) {
                return false;
            }

            return true;
        },

        getErrorMessage: function (/*Boolean*/ isFocused) {
            // summary:
            //      Return an error message to show if appropriate
            // tags:
            //      public

            return (this.required && epiString.isNullOrEmpty(this.get("value"))) ? this.missingMessage : this.invalidMessage;
        },

        validate: function (/*Boolean*/isFocused) {
            // summary:
            //      Override base method to customize behaviour on blockDisplayNode instead of on this.domNode
            // tags:
            //      protected

            //TODO:CMS-8150 "isFocused" is not always a boolean. Figure out why we modify this.focused here.
            this.focused = isFocused;

            var isValid = this.inherited(arguments);

            this.set("message", this.getErrorMessage());

            return isValid;
        },

        _makeContentEditable: function () {
            // summary:
            //      Make the blockDisplayNode become a content editable.
            //      After that focus it and show validation if need.
            // tags:
            //      private

            var node = this.blockDisplayNode;

            // Make content editable
            domAttr.set(node, "contenteditable", "true");

            // Override the width style set by the editor descriptor if there is
            domStyle.set(this.domNode, "width", "auto");

            focusUtil.focus(node);

            // Set caret position to the end of text
            this.get("state") !== "Error" && this._setCaretPosition(node, node.textContent.length);
        },

        _setCaretPosition: function (/*DOM*/activeElement, /*Integer*/endAt) {
            // summary:
            //      Set caret at the given position
            // activeElement: [DOM]
            //      The current editing DOM node
            // endAt: [Integer]
            //      The latest position of the pointer after pasted
            // tags:
            //      private

            var ownerDocument = activeElement.ownerDocument,
                range = ownerDocument.createRange(),
                selection = ownerDocument.getSelection();

            // A content node is required to set the caret position
            if (!activeElement.lastChild) {
                activeElement.appendChild(ownerDocument.createTextNode(""));
            }

            endAt = Math.min(activeElement.lastChild.textContent.length, endAt);
            range.setStart(activeElement.lastChild, endAt);

            range.collapse(true);

            selection.removeAllRanges();
            selection.addRange(range);
        },

        _getValueAttr: function () {
            // summary:
            //      Gets the text content of the blockDisplayNode.
            // tags:
            //      public

            return lang.trim(query(this.blockDisplayNode).text());
        },

        _setValueAttr: function (val) {
            // Change to text format
            query(this.blockDisplayNode).text(val || "");
        },

        _removeEditingFeatures: function () {
            // summary:
            //      Change back to a non-editing state.
            // tags:
            //      protected

            domAttr.remove(this.blockDisplayNode, "contenteditable");
        }

    });

});
