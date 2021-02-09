define("epi-cms/contentediting/OnPageEditing", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/on",
    "dojo/when",
    "dojo/topic",

    "epi/shell/gesture/ScrollPullDown",
    "epi-cms/contentediting/_FormEditingMixin",
    "epi-cms/contentediting/_ValidationMixin",
    "epi-cms/contentediting/EditingBase"
],

function (
    declare,
    lang,
    aspect,
    on,
    when,
    topic,

    ScrollPullDown,
    _FormEditingMixin,
    _ValidationMixin,
    EditingBase
) {

    return declare([EditingBase, _FormEditingMixin, _ValidationMixin], {
        // tags:
        //      internal

        _iframeConnects: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            this.formSettings = {
                doLayout: false,
                baseClass: "epi-cmsEditingForm epi-cmsEditingFormOpe",
                propertyFilter: function (parent, property) {
                    return property.groupName === "EPiServerCMS_SettingsPanel";
                }
            };
        },

        destroy: function () {
            this._removePullDownGesture();
            this.inherited(arguments);
        },

        onEditorWrapperCreated: function (editorWrapper) {
            // summary:
            //      Triggered when the active editor wrapper created.
            //
            // editorWrapper:
            //      The created editor wrapper
            //
            // tags:
            //    public, override, callback

            if (editorWrapper && editorWrapper.editorWidget) {
                var editorWidget = editorWrapper.editorWidget;

                if (editorWidget.onFieldCreated) {
                    var onFieldCreatedHandle = aspect.after(editorWidget, "onFieldCreated", lang.hitch(this, function (fieldName, widget) {
                        //Remove the aspect handle
                        onFieldCreatedHandle.remove();
                        onFieldCreatedHandle = null;

                        this._addStateWatch(widget);
                    }), true);
                } else {
                    editorWidget.set("name", editorWrapper.get("propertyName"));
                    this._addStateWatch(editorWidget);
                }

                // Make sure content is validated when editorWidget is ready
                editorWidget.validate && editorWidget.validate();
            }
        },

        onSetActiveProperty: function (property) {
            // summary:
            //      Triggered when active property is set on the current content view model.
            //  remark:
            //      Check if property mapping doesn't exist, request switch edit mode to end up in Form Editing, where all the properties are available,
            // property: [String]
            //      The property name.
            // tags:
            //      public, override, callback.

            var mapping = this._mappingManager.findOne("propertyName", property);
            if (!mapping) {
                topic.publish("/epi/cms/action/switcheditmode", null, { activePropertyOnStartup: property});
            } else {
                if (mapping.wrapper) {
                    mapping.wrapper.startEdit();
                } else if (mapping.overlayItem) {
                    this._onOverlayItemClick(mapping.overlayItem);
                }
            }
        },

        _onOverlayItemClick: function (overlayItem, e) {

            var editorWrapper = this._activeEditorWrapper;
            var editorWrappers = this._mappingManager.find().filter(function (item) {
                return (item.overlayItem && item.wrapper);
            }).map(function (item) {
                return item.wrapper;
            });

            if (editorWrappers.length > 0) {
                // try to stop editing any active editors.
                editorWrappers.forEach(function (item) {
                    item.tryToStopEditing();
                });

                // If still in an editing state after trying to stop then return since we don't want to open another editor before this is closed.
                // Or if clicking on overlay item while an editor is still setting up.
                var hasAnyWrappersInEditingState = editorWrappers.some(function (item) {
                    return (item.editing);
                });

                if (hasAnyWrappersInEditingState || (editorWrapper && overlayItem.name === editorWrapper.overlayItem.name)) {
                    return;
                }
            }

            this.inherited(arguments);
        },

        onReadySetupEditMode: function () {
            // summary:
            //      Setup edit mode and then bind mouse event listeners to the form and iframe
            //      in order to close the active editor when the user clicks outside.
            // tags:
            //      protected
            this.inherited(arguments);

            var self = this,
                callback = function () {
                    var editorWrapper = self._activeEditorWrapper;
                    if (editorWrapper && editorWrapper.closeOnViewportClick) {
                        editorWrapper.tryToStopEditing(false);
                    }
                };

            // Listen for mousedown events on the form and iframe so that we can close the active editor when they occur.
            this._formConnects.push(on(this._form, "mouseup", callback));
            this.own(on(this.iframeWithOverlay.iframe, "mouseup", callback));
        },

        placeForm: function (form) {
            // summary:
            //		Setup the edit form.
            // tags:
            //		protected

            //Put edit form on the top region of the layout container.
            //It need not to be wrapped in a content pane because of its fixed size and responsiveness.

            form.set("fitContainer", false);
            form.set("transitionMode", "slideIn");

            this.editLayoutContainer.addChild(form, 0);

            this._setupPullDownGesture(form);
        },

        _setupPullDownGesture: function (form) {
            // summary:
            //		Setup pulldown gesture on the form (settings panel).
            // tags:
            //		private

            var opeController = this;

            // Create pull down gesture
            this._pullDownGesture = ScrollPullDown(opeController.iframeWithOverlay.previewContainer, {
                isShown: false,

                show: function () {
                    this.isShown = null; // transiting state
                    when(opeController.editLayoutContainer.selectChild(form), lang.hitch(this, function () {
                        // success
                        this.isShown = true;
                        opeController.iframeWithOverlay.onViewportPullDown();
                    }), lang.hitch(this, function () {
                        // failed
                        this.isShown = false;
                        opeController.iframeWithOverlay.onViewportPullDown();
                    }));
                },

                hide: function () {
                    this.isShown = null; // transiting state
                    when(opeController.editLayoutContainer.selectChild(opeController.iframeWithOverlay), lang.hitch(this, function () {
                        // success
                        this.isShown = false;
                        opeController.iframeWithOverlay.onViewportPullDown();
                    }), lang.hitch(this, function () {
                        // failed
                        this.isShown = true;
                        opeController.iframeWithOverlay.onViewportPullDown();
                    }));
                }
            });

            // Listen to wheel events on the pull-down panel so it's hidden when we scroll down with the pointer over it
            this._pullDownGesture.addMouseWheelListener(form.domNode);

            // Need to listen to mouse wheel events inside the iframed document in IE and Firefox
            if (opeController.iframeWithOverlay.iframe.isInspectable()) {
                this._setupIframeMouseWheelListeners();
            }
        },

        _setupIframeMouseWheelListeners: function () {
            var frameDocumentListener = this._pullDownGesture.addMouseWheelListener(this.iframeWithOverlay.iframe.getDocument());

            this._iframeConnects = [];
            this._iframeConnects.push(this.connect(this.iframeWithOverlay.iframe, "onLoad", function () {
                frameDocumentListener = this._pullDownGesture.addMouseWheelListener(this.iframeWithOverlay.iframe.getDocument());
            }));

            this._iframeConnects.push(this.connect(this.iframeWithOverlay.iframe, "onUnload", function () {
                frameDocumentListener && frameDocumentListener.remove();
            }));
        },

        _teardownIframeMouseWheelListeners: function () {
            if (this._iframeConnects) {
                var c;
                while ((c = this._iframeConnects.pop())) {
                    this.disconnect(c);
                }
                c = null;
                this._iframeConnects = null;
            }
        },

        _removePullDownGesture: function () {
            this._teardownIframeMouseWheelListeners();

            if (this._pullDownGesture) {
                this._pullDownGesture.destroy();
                this._pullDownGesture = null;
            }
        },

        _destroyOverlay: function () {
            // summary:
            //      Destroy the handles owned by the overlay items and view model
            // tags:
            //      protected, internal

            this.inherited(arguments);

            this._removeViewModelWatches();
        },

        removeForm: function (form) {
            // summary:
            //		Remove edit form from container.
            // tags:
            //		protected

            // Destroy pull down gesture.
            this._removePullDownGesture();

            this.editLayoutContainer.leftOver = form;
            return false;
        }
    });
});
