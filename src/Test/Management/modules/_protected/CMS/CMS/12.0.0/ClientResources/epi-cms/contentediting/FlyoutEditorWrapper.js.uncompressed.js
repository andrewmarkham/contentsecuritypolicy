define("epi-cms/contentediting/FlyoutEditorWrapper", [
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/dom-style",

    "dojo/number",

    "epi/shell/widget/IframeWithOverlay",
    "epi/shell/widget/dialog/LightWeight",
    "epi-cms/contentediting/FloatingEditorWrapper"
],

function (
    connect,
    declare,
    lang,

    domClass,
    domGeom,
    domStyle,

    number,

    IframeWithOverlay,
    Dialog,
    FloatingEditorWrapper
) {

    return declare([FloatingEditorWrapper], {
        // tags:
        //      internal

        // summary:
        //    A lightweight right-floating dialog used for displaying property editors.

        _eventHandlers: null,

        constructor: function () {
            this._eventHandlers = [];
        },

        _createDialog: function (/*Object*/editor) {
            // summary:
            //      Overrided to create floating dialog and return it
            // editor:
            //      Editor object
            // tags:
            //      protected

            var dialogResize = function (changeSize) {
                if (!this.open || !changeSize) {
                    return;
                }

                this._containerNodeCS = this._containerNodeCS || domStyle.getComputedStyle(this.containerNode);

                //Calculate the height of the chrome
                if (!this._dialogChromeSize) {
                    this._chromeHeight = domGeom.getMarginBox(this.domNode).h - domGeom.getMarginBox(this.containerNode).h;
                }

                domGeom.setMarginBox(this.containerNode, { h: changeSize.h - this._chromeHeight }, this._containerNodeCS);
                domStyle.set(this.domNode, { top: changeSize.t + "px", left: changeSize.l + "px" });
            };

            var dialog = new Dialog({
                title: this.propertyDisplayName,
                content: editor,
                duration: 350,
                draggable: false,
                closeIconVisible: false,
                region: "trailing",
                resize: dialogResize,
                overlayItem: this.overlayItem,
                _position: function () { },
                _size: function () { }
            });
            domClass.add(dialog.domNode, "epi-floatingEditorWrapperDialog");
            domClass.remove(dialog.domNode, "epi-lfw-dialog--dark");

            // Place dialog inside IframeWithOverlay widget as last child.
            dialog.placeAt(this.get("iframeWithOverlay"));
            domStyle.set(dialog.domNode, { top: "-10000px" });

            return dialog;
        },

        _disconnectLocal: function (targetArray) {
            if (lang.isArray(targetArray)) {
                var listener;
                while ((listener = targetArray.pop())) {
                    connect.disconnect(listener);
                }
            }
        },

        _removeEditingFeatures: function () {
            this.inherited(arguments);

            this._disconnectLocal(this._eventHandlers);
        }

    });

});
