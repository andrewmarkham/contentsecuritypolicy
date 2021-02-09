require({cache:{
'url:epi/shell/layout/templates/PinnablePane.html':"﻿<div class=\"epi-pinnableDock\">\r\n    <div class=\"epi-pinnableFacade\">\r\n        <div class=\"epi-pinnablePane\" data-dojo-attach-point=\"pinnableNode\">\r\n            <div data-dojo-attach-point=\"toolbarNode\"></div>\r\n            <div class=\"epi-pinnableContentWrapper\">\r\n                <div class=\"epi-pinnableContent\" data-dojo-attach-point=\"containerNode\"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi/shell/layout/PinnablePane", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/topic",
    "dojo/when",
    "dojo/text!./templates/PinnablePane.html",
    "dijit/_Contained",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "dijit/layout/ContentPane",
    "epi/dependency",
    "epi/i18n!epi/shell/ui/nls/episerver.shell.ui.resources",
    "epi/shell/layout/PinnablePaneSplitter",
    "epi/shell/widget/_ActionConsumerWidget",
    "epi/shell/widget/_ActionProvider",
    "epi/shell/widget/ToolbarSet"
], function (
    array,
    declare,
    event,
    lang,
    win,
    domClass,
    domGeometry,
    domStyle,
    topic,
    when,
    template,
    _Contained,
    _Container,
    _TemplatedMixin,
    ContentPane,
    dependency,
    resources,
    PinnablePaneSplitter,
    _ActionConsumerWidget,
    _ActionProvider,
    ToolbarSet
) {

    return declare([ContentPane, _TemplatedMixin, _Contained, _Container, _ActionConsumerWidget], {
        // summary:
        //      A content pane that will appear above content by default but also has the
        //      ability to be pinned into the view.
        //
        //      NOTE: Currently only support vertical panes.
        //
        // tags:
        //      public

        // pinned: [public] Boolean
        //		Indicates whether the pane is pinned into view.
        pinned: false,

        // visible: [public] Boolean
        //		Indicates whether the pane is visible.
        visible: false,

        // templateString: [protected] String
        //		A string that represents the widget template.
        templateString: template,

        // baseClass: [protected] String
        //		Root CSS class of the widget, used to construct CSS classes to indicate
        //		widget state.
        baseClass: "epi-pinnable",

        postMixInProperties: function () {
            // summary:
            //		Load pinned and initial size settings from the profile if available.
            // tags:
            //		protected

            var profile = dependency.resolve("epi.shell.Profile");

            this.inherited(arguments);

            when(profile.get(this.id), lang.hitch(this, function (settings) {
                if (settings) {
                    this.pinned = settings.pinned;
                    this.visible = settings.visible;
                    this.size = settings.size;
                }
            }));

            this._profile = profile;
        },

        buildRendering: function () {
            // summary:
            //		Modify the rendering based on the value of pinned.
            // tags:
            //		protected

            this.inherited(arguments);

            var toolbar = new ToolbarSet({ baseClass: "epi-pinnableToolbar" }, this.toolbarNode);
            this.own(toolbar);
            this.set("definitionConsumer", toolbar);

            // Set container size based on profile size if available otherwise minSize.
            domStyle.set(this.containerNode, "width", (this.size || this.minSize) + "px");

            // Call set, if unpinned, to initialize default values since widget base
            // will only call set if the value is true.
            if (!this.pinned) {
                this.set("pinned", this.pinned);
            }

            // Call set, if invisible, to initialize default values since widget base
            // will only call set if the value is true.
            if (!this.visible) {
                this.set("visible", this.visible);
            }
        },

        postCreate: function () {
            // summary:
            //		Setup event handlers and the visual appearance after the DOM fragment
            //		has been created.
            // tags:
            //		protected

            var directionClass = "",
                ltr = this.isLeftToRight(),
                startDrag = function () {
                    if (this.visible) {
                        this._dragging = true;
                    }
                },
                endDrag = function () {
                    this._dragging = false;
                };

            this.inherited(arguments);

            // Setup flow for the pane based on region and text direction.
            if (this.region) {
                switch (this.region) {
                    case "trailing":
                    case "right":
                        directionClass = ltr ? "right" : "left";
                        break;
                    case "leading":
                    case "left":
                        directionClass = ltr ? "left" : "right";
                        break;
                    case "top":
                        directionClass = "top";
                        break;
                    case "bottom":
                        directionClass = "bottom";
                        break;
                }
                domClass.add(this.domNode, this.baseClass + "-" + directionClass);
            }

            // Subscribe to the events required to control the visibility of the pane.
            this.subscribe("/epi/layout/pinnable/" + this.id + "/toggle", function (visible) {
                if (typeof visible !== "boolean") {
                    visible = !this.visible;
                }
                this.set("visible", visible);
            });

            // Subscribe to drag and drop events to update our drag state in order to hide the panels when unpinned.
            this.subscribe("/dnd/start", startDrag);
            this.subscribe("/dnd/drop", endDrag);
            this.subscribe("/dnd/cancel", endDrag);
        },

        startup: function () {
            // summary:
            //		Setup event handlers and the visual appearance after the DOM fragment
            //		has been created.
            // tags:
            //		public

            var splitterWidget = this._splitterWidget;

            if (this._started) {
                return;
            }

            // HACK: Only take the rearrange and add component action from the direct child of pinnable pane.
            //       This should be fixed after RTM as part of the story to layout/rearrange components.
            array.forEach(this.getChildren(), function (child) {
                if (child.isInstanceOf(_ActionProvider)) {
                    this.addProvider(child);
                }
            }, this);

            this.inherited(arguments);

            this._container = this.getParent();

            // If splitters are enabled find the one connected to this pane.
            if (this.splitter && splitterWidget) {
                splitterWidget = PinnablePaneSplitter(splitterWidget);
                if (!this.visible) {
                    splitterWidget.hide();
                }
                this.connect(splitterWidget, "_stopDrag", this.persist);
            }

            this._refreshState();
        },

        resize: function (changeSize) {
            // summary:
            //		Call this to resize a widget, or after its size has changed.
            // changeSize: Object
            //		The margin-box size and position to set for this widget.
            // tags:
            //		public

            var pos = this.region,
                hasWidth = this.visible && this.pinned,
                dockSize = domGeometry.getMarginBox(this.domNode),
                currentSize = domGeometry.getMarginBox(this.containerNode),
                containerBox = {},
                pinnableBox = { t: dockSize.t },
                isLeft = pos === "left" || pos === "leading",
                isRight = pos === "right" || pos === "trailing";

            if (!this._toolbarHeight) {
                this._toolbarHeight = domGeometry.getMarginBox(this.definitionConsumer.domNode).h;
            }

            domGeometry.setMarginBox(this.domNode, { w: hasWidth ? currentSize.w : 0 });

            if (changeSize) {
                if (changeSize.w) {
                    containerBox.w = currentSize.w = changeSize.w;
                    if (!this.pinned) {
                        delete changeSize.w;
                    }
                }
                if (changeSize.h) {
                    dockSize.h = changeSize.h;
                }
            }

            // Max size check incase the base container layout has changed.
            var maxSize = this._computeMaxSize();
            if (this._visibilityChanged && maxSize < currentSize.w) {
                containerBox.w = currentSize.w = maxSize;
            }

            containerBox.h = dockSize.h - this._toolbarHeight;
            domGeometry.setMarginBox(this.containerNode, containerBox);

            if (isLeft) {
                pinnableBox.l = dockSize.l;
            } else if (isRight) {
                pinnableBox.l = hasWidth ? 0 : 0 - currentSize.w;
            }
            domGeometry.setMarginBox(this.pinnableNode, pinnableBox);

            if (this._splitterWidget) {
                var splitterSize = domGeometry.getMarginBox(this._splitterWidget.domNode),
                    splitterBox = { t: dockSize.t };

                if (isLeft) {
                    splitterBox.l = currentSize.w;
                } else if (isRight) {
                    splitterBox.l = hasWidth ? dockSize.l - splitterSize.w : dockSize.l - currentSize.w;
                }

                domGeometry.setMarginBox(this._splitterWidget.domNode, splitterBox);
            }

            this.inherited(arguments);
        },

        persist: function () {
            // summary:
            //		Updates the profile with current size and pinned state.
            // tags:
            //		public

            var settings = {
                pinned: this.pinned,
                visible: this.visible,
                size: domStyle.get(this.containerNode, "width")
            };
            this._profile.set(this.id, settings);
        },

        getActions: function () {
            // summary:
            //		Gets the actions to be added to the header toolbar.
            // tags:
            //		protected

            var actions = this.inherited(arguments),
                isLeft = /left|leading/.test(this.region),
                pin = {
                    name: "pin",
                    widgetType: "dijit/form/ToggleButton",
                    title: this._getPinTitle(),
                    iconClass: "epi-iconPin",
                    settings: { showLabel: false, "class": "epi-chromelessButton", checked: this.pinned, region: isLeft ? "trailing" : "leading" },
                    action: lang.hitch(this, this._togglePinned)
                },
                settings = {
                    name: "settings",
                    title: resources.gadgetchrome.settingsmenutooltip,
                    type: "dropdown",
                    iconClass: "epi-iconSettings",
                    settings: { showLabel: false, "class": "epi-chromelessButton", dropDownPosition: isLeft ? ["below-alt"] : ["below"], region: isLeft ? "trailing" : "leading" }
                };

            actions.splice(0, 0, settings);
            actions.splice(isLeft ? actions.length : 0, 0, pin);

            return actions;
        },


        _setPinnedAttr: function (value) {
            // summary:
            //		Sets the pinned value and updates the layout.
            // tags:
            //		private

            this._set("pinned", value);

            domClass.toggle(this.pinnableNode, this.baseClass + "-pinned", value);
            domClass.toggle(this.pinnableNode, this.baseClass + "-unpinned", !value);
            domStyle.set(this.pinnableNode, "position", value ? "relative" : "absolute");

            this.definitionConsumer.setItemProperty("pin", "title", this._getPinTitle());

            if (this._started) {
                this._refreshState();
            }

            if (!this.pinned) {
                this.set("visible", false);
            }
        },

        _setVisibleAttr: function (value) {
            // summary:
            //		Sets the pinned value and updates the layout.
            // tags:
            //		private

            this._set("visible", value);

            // Set the visiblity of the pinnable pane.
            domStyle.set(this.pinnableNode, "display", value ? "block" : "none");

            // Set the visiblity of the splitter if it exists.
            if (this._splitterWidget) {
                (value) ? this._splitterWidget.show() : this._splitterWidget.hide();
            }

            if (this._started) {
                this._visibilityChanged = true;
                this._refreshState();
                this._visibilityChanged = false;
            }
        },

        _togglePinned: function () {
            // summary:
            //		Toggles the pinned state on button click.
            // tags:
            //		private

            this.set("pinned", !this.pinned);
        },

        _refreshState: function () {
            // summary:
            //		Refreshes the current event bindings and causes a layout.
            // tags:
            //		private

            this._disconnectUnpinnedEvents();

            if (this.visible && !this.pinned) {
                this._connectUnpinnedEvents();
            }

            // Layout the parent container and resize this pane.
            this._container.layout();
            this.resize();

            // Persist the updated pinned state.
            this.persist();

            topic.publish("/epi/layout/pinnable/" + this.id + "/visibilitychanged", this.visible);
        },

        _connectUnpinnedEvents: function () {
            // summary:
            //		Connect the events required when the pane is made visible and
            //		it is in an unpinned state.
            // tags:
            //		private

            this._unpinnedEvents = [
            // Hide when clicking outside the panel.
                this.connect(this.domNode, "onmousedown", function (e) {
                    e.stopPropagation();
                }),
                this.connect(this._container.domNode, "onmousedown", lang.hitch(this, this.set, "visible", false)),
                // Hide when the window is resized.
                this.connect(win.global, "onresize", lang.hitch(this, this.set, "visible", false)),
                // Hide when dragging some content outside the panel.
                this.connect(this.domNode, "onmouseover", event.stop),
                this.connect(this._container.domNode, "onmouseover", function () {
                    if (this._dragging) {
                        this.set("visible", false);
                    }
                }),
                // Hide when the view changes.
                topic.subscribe("/epi/shell/action/changeview", lang.hitch(this, this.set, "visible", false))
            ];
        },

        _disconnectUnpinnedEvents: function () {
            // summary:
            //		Disconnect the events required when the pane is made invisible.
            // tags:
            //		private

            array.forEach(this._unpinnedEvents, this.disconnect);
        },

        _computeMaxSize: function () {
            // summary:
            //		Return the maximum size that my corresponding pane can be set to.
            // tags:
            //		private

            var childSize = domGeometry.getMarginBox(this.domNode).w,
                center = array.filter(this._container.getChildren(), function (child) {
                    return child.region === "center";
                })[0],
                spaceAvailable = domGeometry.getMarginBox(center.domNode).w; // can expand until center is crushed to 0

            return Math.min(this.maxSize, childSize + spaceAvailable);
        },

        _getPinTitle: function () {
            // summary:
            //		Gets the title to use for the pin action.
            // tags:
            //		private

            return this.pinned ? resources.pinnablepane.unpin : resources.pinnablepane.pin;
        }
    });
});
