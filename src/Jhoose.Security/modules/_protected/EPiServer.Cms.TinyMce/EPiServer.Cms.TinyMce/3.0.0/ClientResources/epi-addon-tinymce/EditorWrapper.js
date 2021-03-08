define([
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/on",
    "dojo/when",
    "dojo/Deferred",
    "dojo/aspect",
    // epi
    "epi/debounce",
    "epi-cms/contentediting/InlineEditorWrapper",
    "epi/shell/DestroyableByKey",
    "./tinymce-loader"
],

function (
// dojo
    declare,
    lang,
    domStyle,
    domConstruct,
    domClass,
    on,
    when,
    Deferred,
    aspect,
    // epi
    debounce,
    InlineEditorWrapper,
    DestroyableByKey,
    tinymce
) {

    return declare([InlineEditorWrapper, DestroyableByKey], {
        // summary:
        //      Overlay based inline editor wrapper for rich text editor.
        // tags:
        //      internal

        _toolbarPositionHandleKey: "toolbarPositionHandle",

        // isUndoDisabled: [readonly] boolean
        //      Flag used to disable undo when the editor is running.
        isUndoDisabled: true,

        postCreate: function () {
            this.inherited(arguments);

            this.own(
                on(this.get("iframeWithOverlay").iframe, "unload", function () {
                    this.tryToStopEditing();
                }.bind(this))
            );
        },

        buildRendering: function () {
            this.inherited(arguments);

            // Create the container to place the TinyMCE toolbar inside.
            var toolbarParams = {
                className: "epi-tinymce-inline-toolbar",
                id: this.id + "_toolbar"
            };

            this.toolbarContainer = domConstruct.create("div", toolbarParams, this.overlayItem.domNode, "before");
            this.editorParams.settings.fixed_toolbar_container = "#" + this.toolbarContainer.id;
        },

        destroy: function () {
            this.inherited(arguments);

            this._removeHandles();
            domConstruct.destroy(this.toolbarContainer);
            this.toolbarContainer = null;
        },

        focus: function () {
            // summary:
            //      Setup pre-settings when focus
            // tags:
            //      public, extension

            this.inherited(arguments);

            this.blockDisplayNode && domStyle.set(this.blockDisplayNode, { visibility: "hidden" });

            this._toggleOverlayItemZIndex(true);
            this._toggleSupportCustomDnd(true);
        },

        startEdit: function () {
            // summary:
            //      Updates editor widget parameters when start edit
            // tags:
            //      public, extension

            this.inherited(arguments);

            var overlayContainer = this.overlayItem.parent.domNode.parentElement;

            when(this._getOrCreateEditor()).then(function () {
                this.toolbarContainer.style.display = "";
                this.editorWidget.focus();

                var updateToolbarPosition = function () {
                    // exit if in fullScreen mode
                    if (this.editorWidget.isFullScreen) {
                        return;
                    }

                    var overlayPosition = {
                        x: this.overlayItem.domNode.offsetLeft,
                        y: this.overlayItem.domNode.offsetTop
                    };

                    this.toolbarContainer.style.width = this.overlayItem.domNode.clientWidth + "px";
                    this.toolbarContainer.style.left = overlayPosition.x + "px";

                    var top = Math.max(overlayPosition.y - this.toolbarContainer.clientHeight, overlayContainer.scrollTop);
                    var overlayBottom = this.overlayItem.domNode.clientHeight + overlayPosition.y;
                    top = Math.min(overlayBottom + this.toolbarContainer.clientHeight, top);
                    this.toolbarContainer.style.top =  top + "px";
                }.bind(this);

                // Set the initial toolbar position once the editor is initialized.
                this.ownByKey(this._toolbarPositionHandleKey,
                    on(this.editorWidget, "tinyMCEInitialized", updateToolbarPosition),
                    on(overlayContainer, "scroll", debounce(updateToolbarPosition)),
                    on(this.editorWidget, "fileDragged", function () {
                        domClass.replace(this.overlayItem.containerNode, this.editorWidget.editorDraggedClass, this.editorWidget.editorAllowedClass);
                    }.bind(this)),
                    on(this.editorWidget, "fileDragging", function () {
                        domClass.replace(this.overlayItem.containerNode, this.editorWidget.editorAllowedClass, this.editorWidget.editorDraggedClass);
                    }.bind(this)),
                    on(this.editorWidget, "fileStoppedDragging", function () {
                        domClass.remove(this.overlayItem.containerNode, this.editorWidget.editorAllowedClass, this.editorWidget.editorDraggedClass);
                    }.bind(this)),
                    on(this.editorWidget, "fullScreenChanged", function (fullScreen) {
                        fullScreen ? this._addFullScreenToolbar() : this._removeFullScreenToolbar();
                    }.bind(this)),
                    aspect.after(this.overlayItem, "updatePosition", debounce(updateToolbarPosition))
                );

                updateToolbarPosition();
            }.bind(this));
        },

        tryToStopEditing: function () {
            // summary:
            //      Try to stop editing, if the value has changed, editing is stopped
            //      otherwise editing is cancelled
            // tags:
            //      public overridden

            this.inherited(arguments);
            // Hide TinyMCE toolbar and dropdown menus
            this.toolbarContainer.style.display = "none";
            if (tinymce.ui.FloatPanel) {
                tinymce.ui.FloatPanel.hideAll();
            }
        },

        _onEditorResizing: function (/*Object*/resizeInfo) {
            // summary:
            //      Stub to do something when the current editor on resizing progress
            // resizeInfo: [Object]
            //      Object that provides resize information to editor wrapper
            // tags:
            //      protected, extension

            this.blockDisplayNode && domStyle.set(this.blockDisplayNode, resizeInfo.style);
        },

        _onEditorResized: function (/*Function*/callbackFunction) {
            // summary:
            //      Stub to do something when the current editor finished its resizing process
            // tags:
            //      protected, extension

            var overlayItem = this.get("overlayItem");
            overlayItem && overlayItem.onResize();

            callbackFunction && this.defer(callbackFunction, 100);
        },

        _removeHandles: function () {
            // summary:
            //      Removes registered handles
            // tags:
            //      private

            this.destroyByKey(this._toolbarPositionHandleKey);
        },

        _addFullScreenToolbar: function () {
            // summary:
            //      Saves the old toolbar settings. Styles the fullscreen toolbar and
            //      resizes the editor container to fit the fullscreen toolbar
            // tags:
            //      private

            var styles = domStyle.get(this.toolbarContainer);
            this._toolbarStyles = {
                top: styles.top,
                left: styles.left,
                width: styles.width
            };

            this._toolbarParent = this.toolbarContainer.parentElement;
            document.body.appendChild(this.toolbarContainer);

            //Set the styles after the append because the offsetHeight is changing when in fullscreen
            domStyle.set(this.toolbarContainer, { left: "0px", top: "0px", width: "100%" });
            domStyle.set(this.editorWidget.editor.editorContainer, { top: this.toolbarContainer.offsetHeight + "px" });
        },

        _removeFullScreenToolbar: function () {
            // summary:
            //      Removes the fullscreen toolbar, styles and re-adds the none fullscreen toolbar
            // tags:
            //      private

            domStyle.set(this.toolbarContainer, this._toolbarStyles);
            domStyle.set(this.editorWidget.editor.editorContainer, { top: "0px" });
            this._toolbarParent.appendChild(this.toolbarContainer);
        },

        _removeEditingFeatures: function () {
            // summary:
            //      Its purpose is to restore state as it was before editing was started.
            // tags:
            //      protected, extension

            this.inherited(arguments);

            // Restore the block display node's styles
            this.blockDisplayNode && domStyle.set(this.blockDisplayNode, {
                height: "auto",
                visibility: "visible"
            });

            // Restore z-index of the overlay item
            this._toggleOverlayItemZIndex();
            // Remove custom Dnd
            this._toggleSupportCustomDnd();
            this._removeHandles();
        }
    });
});
