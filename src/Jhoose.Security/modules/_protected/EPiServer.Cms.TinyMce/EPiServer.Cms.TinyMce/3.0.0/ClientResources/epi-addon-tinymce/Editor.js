define([
// dojo
    "dojo/_base/config",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/dom-style",
    "dojo/dom-class",

    "dojo/topic",

    // dijit
    "dijit/_TemplatedMixin",
    "dgrid/util/misc",

    "require",

    // epi
    "epi/shell/dnd/Target",
    "epi/shell/layout/_LayoutWidget",
    "epi/shell/widget/_ValueRequiredMixin",

    "epi-cms/widget/_HasChildDialogMixin",

    "epi-addon-tinymce/tinymce-loader",
    "./FileBrowser",
    "./displayTransformationErrors",

    // templates
    "dojo/text!./templates/TinyMCEEditor.html",
    // resources
    "epi/i18n!epi/nls/tinymce.editorstyles",

    // plugins
    "epi-addon-tinymce/plugins/epi-link/epi-link",
    "epi-addon-tinymce/plugins/epi-personalized-content/epi-personalized-content",
    "epi-addon-tinymce/plugins/epi-dnd-processor/epi-dnd-processor",
    "epi-addon-tinymce/plugins/epi-image-tools/epi-image-tools",
    "epi-addon-tinymce/plugins/epi-block-tools/epi-block-tools",
    "epi-addon-tinymce/plugins/epi-image-uploader/epi-image-uploader",

    "xstyle/css!./styles/TinyMCEEditor.css"
], function (
// dojo
    config,
    declare,
    lang,

    aspect,
    Deferred,
    domStyle,
    domClass,

    topic,

    // dijit
    _TemplatedMixin,
    misc,

    require,

    // epi
    Target,
    _LayoutWidget,
    _ValueRequiredMixin,

    _HasChildDialogMixin,

    tinymce,
    fileBrowser,
    displayTransformationErrors,

    // templates
    template,
    // resources
    styleResources
) {


    return declare([_LayoutWidget, _TemplatedMixin, _ValueRequiredMixin, _HasChildDialogMixin], {
        // summary:
        //      Editor for TinyMCE in all properties mode.
        // tags:
        //      internal

        // baseClass: [public] String
        //    The widget's base CSS class.
        baseClass: "epiTinyMCEEditor",

        // width: [public] Number
        //    The editor width.
        width: null,

        // height: [public] Number
        //    The editor height.
        height: null,

        // value: [public] String
        //    The editor content.
        value: null,

        // intermediateChanges: Boolean
        //    Fires onChange for each value change or only on demand
        intermediateChanges: true,

        // templateString: [protected] String
        //    Template for the widget.
        templateString: template,

        // settings: [public, readonly] object
        //    The editor settings.
        settings: null,

        // dirtyCheckInterval: [public] Integer
        //    How often should the widget check if it is dirty and raise onChange event, in milliseconds. The value is by default set to 2000 ms
        dirtyCheckInterval: 2000,

        dropTarget: null,

        // readOnly: [public, readonly] Boolean
        //    Denotes that the editor is read only.
        readOnly: false,

        // isFullScreen: [public] Boolean
        //      Indicates if the editor is in fullscreen mode
        isFullScreen: false,

        // _editorValue: [private] String
        //    The value set to the editor
        _editorValue: null,

        // editorAllowedClass: [public] String
        //    The class used to mark the editor as droppable
        editorAllowedClass: "epiTinyMCEEditorAllowed",

        // editorDraggedClass: [public] String
        //    The class used to mark the editor after dropping an item
        editorDraggedClass: "epiTinyMCEEditorDragged",

        postCreate: function () {
            this.inherited(arguments);

            this._throttledPlaceCaretAt = misc.throttle(function (x, y) {
                this.editor.focus();
                this.editor.selection.placeCaretAt(x, y);

                // Determine if selection is inside a content editable false DOM tree.
                var nonEditableRoot = this._getContentEditableFalseRoot(this.editor.selection.getNode(), this.editor.dom.getRoot());
                if (nonEditableRoot) {
                    // More the selection before the content editable false.
                    var range = this.editor.dom.createRng();
                    range.setStartBefore(nonEditableRoot);
                    range.setEndBefore(nonEditableRoot);
                    this.editor.selection.setRng(range);
                }
            }, this);

            this.own(
                this.dropTarget = new Target(this.dndOverlay, {
                    accept: this.allowedDndTypes,
                    reject: this.restrictedDndTypes,
                    createItemOnDrop: false,
                    readOnly: this.readOnly
                }),
                aspect.before(this.dropTarget, "onMouseMove", function (e) {
                    if (!this.dropTarget.isDragging) {
                        return;
                    }
                    this.placeCaretAt(e.offsetX, e.offsetY);
                }.bind(this)),
                topic.subscribe("/dnd/start", this._onDndStart.bind(this)),
                topic.subscribe("/dnd/cancel", this._onDndCancel.bind(this)),
                topic.subscribe("/dnd/drop", this._onDndDrop.bind(this))
            );

            this.connect(this.dropTarget, "onDropData", "onDropData");
        },

        startup: function () {
            // summary:
            //    Loads the TinyMCE dependencies and initialize the editor.
            //
            // tags:
            //    protected

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            return this._updateTinySettings(lang.clone(this.settings))
                .then(function (settings) {
                    return tinymce.init(settings);
                });
        },

        destroy: function () {
            // summary:
            //    Destroy TinyMCE widget.
            //
            // tags:
            //    protected

            if (this._destroyed) {
                return;
            }

            var ed = this.editor;

            if (this.isFullScreen) {
                domClass.remove(document.body, "epi-addon-tinymce--fullscreen");
            }

            ed && ed.remove();

            this.inherited(arguments);
        },

        focus: function () {
            var editor = this.editor;
            if (editor && editor.initialized) {
                editor.focus();
            }
        },

        placeCaretAt: function (clientX, clientY) {
            // summary:
            //    Set caret position
            //
            // tags:
            //    protected

            this._throttledPlaceCaretAt(clientX, clientY);
        },

        canAccept: function () {
            return !domClass.contains(this.dndOverlay, "dojoDndTargetDisabled");
        },

        _getContentEditableFalseRoot: function (node, root) {
            // summary:
            //      Method which traverses up the DOM tree and returns the content editable false root.
            // tags:
            //      private

            var target;

            for (; node && node !== root; node = node.parentNode) {
                if (node.isContentEditable) {
                    return target;
                } else {
                    target = node;
                }
            }

            return target;
        },

        _onDndStart: function () {
            if (!this.editor.inline) {
                this.dndOverlay.style.top = this.editor.contentAreaContainer.offsetTop + "px";
            }
            domStyle.set(this.dndOverlay, "display", "block");
            if (!this.canAccept()) {
                domClass.add(this.stateNode, "epi-dropTargetDisabled");
            }
            this.onBlur();
        },

        _onDndCancel: function () {
            domStyle.set(this.dndOverlay, "display", "none");
            domClass.remove(this.stateNode, "epi-dropTargetDisabled");
        },

        _onDndDrop: function () {
            domStyle.set(this.dndOverlay, "display", "none");
            domClass.remove(this.stateNode, "epi-dropTargetDisabled");
        },

        onDropData: function (dndData) {
            //summary:
            //    Handle drop data event.
            //
            // dndData:
            //    Dnd data extracted from the dragging items which have the same data type to the current target
            //
            // source:
            //    The dnd source.
            //
            // nodes:
            //    The dragging nodes.
            //
            // copy:
            //    Denote that the drag is copy.
            //
            // tags:
            //    private

            var dropItem = dndData ? (dndData.length ? dndData[0] : dndData) : null;

            if (!dropItem) {
                return;
            }

            // invoke the onDropping required by SideBySideWrapper and other widgets listening on onDropping
            if (this.onDropping) {
                this.onDropping();
            }

            this.editor.execCommand("mceEPiProcessDropItem", true, dropItem);
            domStyle.set(this.dndOverlay, { display: "none" });
        },

        _setFocusedAttr: function (focused) {
            // summary:
            //    Sets the focused state and triggers a validation.
            // tags:
            //    protected

            this._set("focused", focused);

            // Trigger validation since the valid state is dependant on the focused state.
            this.validate(true);
        },

        _setValueAttr: function (value) {
            // summary:
            //    Sets the editor value.
            // tags:
            //    protected

            var editor = this.editor;

            this._set("value", value);

            // Set the content if the editor has been initialized.
            if (editor && editor.initialized) {
                editor.setContent(value || "");
            }
        },

        _updateTinySettings: function (settings) {
            var def = new Deferred();

            // If an initialization module module has been defined
            // we run it first
            if (settings.initialization_module) {
                require([settings.initialization_module], function (initModule) {
                    try {
                        def.resolve(initModule(settings));
                    } catch (err) {
                        // Handle errors thrown in the init module
                        console.error(err);
                        def.reject(settings);
                    }
                });
            } else {
                def.resolve(settings);
            }

            // Always apply our settings last, even though the init module does something stupid
            return def.promise
                .always(function (settings) {
                    if (this.readOnly) {
                        settings.toolbar = false;
                        settings.menubar = false;
                    }

                    return lang.mixin(fileBrowser(settings), {
                        branding: false,
                        relative_urls: false,
                        target: this.editorFrame,
                        theme: "modern_episerver",
                        // use `1` instead of `true` as a workaround for https://github.com/tinymce/tinymce/issues/4575
                        // fixed in TinyMCE 5.0.6
                        readonly: this.readOnly ? 1 : false,
                        language: config.locale === "en-us" ? "" : config.locale,
                        setup: function (editor) {
                            this.editor = editor;

                            editor.on("SwitchMode", function () {
                                // use `1` instead of `true` as a workaround for https://github.com/tinymce/tinymce/issues/4575
                                // fixed in TinyMCE 5.0.6
                                if (editor.readonly) {
                                    editor.readonly = 1;
                                }
                            });
                            this._setupEditorEventHandling(editor);
                        }.bind(this)
                    });

                }.bind(this));
        },

        _setupEditorEventHandling: function (editor) {
            // summary:
            //    Hook up to the TinyMCE events.
            // editor:
            //    Instance of the current editor.
            // tags:
            //    protected

            editor.on("init", function () {
                this.own(
                    // notifications should be displayed in custom container
                    aspect.after(editor.notificationManager, "open", function (notification) {
                        if (!notification.$el || !notification.$el.length) {
                            return;
                        }
                        var notificationNode = notification.$el[0];
                        this.notificationsNode.appendChild(notificationNode);
                    }.bind(this))
                );

                // Load our custom tinyMCE content css into the tinyMCE iframe
                editor.dom.loadCSS(this.settings.epi_content_css);

                tinymce.addI18n(config.locale, styleResources);
                editor.setContent(this.value || "");
                this.set("_editorValue", this.editor.getContent());

                // Pass the open function for the notification manager
                displayTransformationErrors(editor.notificationManager.open, this.settings.epi_transformation_errors);

                this.onTinyMCEInitialized();
            }.bind(this));

            editor.on("drop", function () {
                // Focus the editor on drop to handle text being dragged to the editor.
                editor.focus();
            });

            editor.on("undo redo", function () {
                editor.fire("Change");
            });

            editor.on("blur", function (eventArgs) {
                // Do not interfere with focus when the dialog is still being shown.
                if (this.isShowingChildDialog) {
                    return;
                }

                // Ensure the final editor state is set before editing is stopped.
                this._onChange(eventArgs.target.getContent());

                this.set("focused", false);
                this.onBlur();
            }.bind(this));

            editor.on("focus", function () {
                this.set("focused", true);
                this.onFocus();
            }.bind(this));

            editor.on("keyup", misc.debounce(this._dirtyCheck, this, this.dirtyCheckInterval));

            var editorOnChange = function (eventArgs) {
                // Changes from dialogs will be handled after dialog gets executed.
                if (this.isShowingChildDialog) {
                    return;
                }

                this._onChange(eventArgs.target.getContent());
            }.bind(this);

            editor.on("Change", misc.debounce(editorOnChange, this, this.dirtyCheckInterval));

            editor.on("OpenWindow", function () {
                this.isShowingChildDialog = true;
            }.bind(this));

            editor.on("CloseWindow", function (eventArgs) {
                this._onChange(eventArgs.target.getContent());
                this.isShowingChildDialog = false;
                this.focus();
            }.bind(this));

            editor.on("SetContent", this._onSetContent.bind(this));
            editor.on("FileDragging", this.onFileDragging.bind(this));
            editor.on("FileDragged", this.onFileDragged.bind(this));
            editor.on("FileStoppedDragging", this.onFileStoppedDragging.bind(this));

            editor.on("FullscreenStateChanged", function (event) {
                this.isFullScreen = event.state;
                domClass.toggle(this.domNode, this.baseClass + "Fullscreen", event.state);
                domClass.toggle(document.body, "epi-addon-tinymce--fullscreen", event.state);
                this.onFullScreenChanged(this.isFullScreen);
            }.bind(this));
        },

        onFileDragging: function () {
            // summary:
            //    A file is being dragged in edit mode
            // tags:
            //    protected callback

            domClass.replace(this.stateNode, this.editorAllowedClass, this.editorDraggedClass);
        },

        onFileDragged: function () {
            // summary:
            //    A file was dragged onto the editor
            // tags:
            //    protected callback

            domClass.replace(this.stateNode, this.editorDraggedClass, this.editorAllowedClass);
        },

        onFileStoppedDragging: function () {
            // summary:
            //    A file was dragged outside edit mode
            // tags:
            //    protected callback

            domClass.remove(this.stateNode, this.editorAllowedClass, this.editorDraggedClass);
        },

        _onSetContent: function (eventArgs) {
            // summary:
            //    Raised when the content is set to the editor.
            // eventArgs:
            //    The event arguments.
            // tags:
            //    callback

            var newValue = eventArgs.target.getContent();

            if (eventArgs.selection) {
                var isSet = eventArgs.set;
                // If new content is set to current selection, raise event to save it!
                if (isSet) {
                    this._onChange(newValue);
                }
            }

            if (this.get("_editorValue") !== newValue) {
                this.validate();
                this.onLayoutChanged();
            }
        },

        _onChange: function (val) {
            // summary:
            //    Raised when the editor's content is changed.
            //
            // val:
            //    The editor's changed value
            //
            // tags:
            //    callback

            var hasChanged = this.get("_editorValue") !== val;

            if (hasChanged) {
                this._set("value", val);
                this.set("_editorValue", val);

                if (this.validate()) {
                    this.onChange(val);
                }
            }
        },

        onChange: function () {
            // summary:
            //      Called when the value of the editor has changed.
            // tags:
            //      callback
        },

        onFullScreenChanged: function (isFullScreen) {
            // summary:
            //      Called when the fullscreen state is changed
            // tags:
            //      callback
        },

        onTinyMCEInitialized: function () {
            // summary:
            //      Called when the tinymce was initialized.
            // tags:
            //      callback
        },

        _onBlur: function () {
            // TinyMCE should handle its own focus and blur events.
        },

        _onFocus: function () {
            // TinyMCE should handle its own focus and blur events.
        },

        _dirtyCheck: function () {
            // summary:
            //    Check if the editor is dirty and raise onChange event.
            //
            // tags:
            //    private

            // The dirty check might be called after the editor has been destroyed
            // because of the keyup debounce
            if (this._destroyed) {
                return;
            }
            this._onChange(this.editor.getContent());
        }
    });
});
