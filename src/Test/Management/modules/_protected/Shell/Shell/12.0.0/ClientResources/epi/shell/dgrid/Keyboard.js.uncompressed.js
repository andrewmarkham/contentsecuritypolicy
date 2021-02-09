define("epi/shell/dgrid/Keyboard", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dgrid/Keyboard"
],
function (
    declare,
    lang,
    on,
    dgridKeyboard
) {
    return declare([dgridKeyboard], {
        // summary:
        //      Expands keyboard handling to include copy, cut and paste keyboard action for the grid.
        // tags:
        //      internal

        postMixInProperties: function () {
            // summary:
            //      Adds custom key map, in order to handle copy, cut and paste keyboard action for grid.
            // tags:
            //      Protected

            this.inherited(arguments);

            this.keyMap = lang.mixin(this.keyMap, this._createCustomKeyMap());
        },

        _createCustomKeyMap: function () {
            // summary:
            //      Returns custom key map, in order to handler copy, cut and paste keyboard action for grid.
            // tags:
            //      private

            return {
                67: function (event) { // C
                    if (this._isCtrlOrMetaKeyPressed(event)) {
                        this._doCopy(event);
                    }
                },
                99: function (event) { // c
                    if (this._isCtrlOrMetaKeyPressed(event)) {
                        this._doCopy(event);
                    }
                },
                88: function (event) { // X
                    if (this._isCtrlOrMetaKeyPressed(event)) {
                        this._doCut(event);
                    }
                },
                120: function (event) { // x
                    if (this._isCtrlOrMetaKeyPressed(event)) {
                        this._doCut(event);
                    }
                },
                86: function (event) { // V
                    if (this._isCtrlOrMetaKeyPressed(event)) {
                        this._doPaste(event);
                    }
                },
                118: function (event) { // v
                    if (this._isCtrlOrMetaKeyPressed(event)) {
                        this._doPaste(event);
                    }
                }
            };
        },

        _isCtrlOrMetaKeyPressed: function (event) {
            // summary:
            //      Checks if the Ctrl or Meta key is pressed
            // tags:
            //      private

            return event.ctrlKey || event.metaKey;
        },

        _doCopy: function (event) {
            on.emit(this.domNode, "dgrid-rowcopy", event);
        },

        _doCut: function (event) {
            on.emit(this.domNode, "dgrid-rowcut", event);
        },

        _doPaste: function (event) {
            on.emit(this.domNode, "dgrid-rowpaste", event);
        }
    });
});
