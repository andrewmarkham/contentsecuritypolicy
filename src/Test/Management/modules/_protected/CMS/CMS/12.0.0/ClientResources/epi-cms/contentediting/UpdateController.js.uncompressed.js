define("epi-cms/contentediting/UpdateController", [
    "dojo",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "dojo/dom-attr",
    "dijit"],

function (
    dojo,
    array,
    declare,
    lang,
    domClass,
    domStyle,
    domGeometry,
    domAttr,
    dijit) {

    return declare(null, {
        // tags:
        //      internal

        _showEmptyNode: true,
        _hasEmptyHtml: false,

        // emptyValue: String
        //		Template to display empty value
        emptyValue: "&nbsp;",

        // minWidth: Number
        //      Use this width for the displayNode when then node has a zero width
        minWidth: 18,

        // minHeight: Number
        //      Use this height for the displayNode when then node has a zero height
        minHeight: 14,

        // displayNode: DomNode
        //		The source node
        displayNode: null,

        // model: dojo/Stateful
        //		A model to update
        contentModel: null,

        // contentLink: String
        //      The content link to update
        contentLink: null,

        // modelPropertyName: String
        //		Name of the property in model to observe
        modelPropertyName: null,

        // nodePropertyName: String
        //		Name of the property in the rendered page
        nodePropertyName: null,

        // renderManager: [public] epi.cms.contentediting._Renderer
        //      The render manager
        renderManager: null,

        // displayName: String
        //		A display name for this block
        displayName: null,

        // renderSettings: Object
        //		A display name for this block
        renderSettings: null,

        // rendererClass: String
        //		A display name for this block
        rendererClass: null,

        constructor: function (settings) {
            dojo.mixin(this, settings);
        },

        postscript: function () {
            // watch model
            if (this.contentModel) {
                this._modelWatchHandle = [];
                dojo.forEach(dojo.isArray(this.modelPropertyName) ? this.modelPropertyName : [this.modelPropertyName], dojo.hitch(this, function (propertyName) {
                    this._modelWatchHandle.push(this.contentModel.watch(propertyName, dojo.hitch(this, this._renderNode)));
                }));
            }

            this.checkEmptyHtml();
        },

        destroy: function () {
            // detach watch handle
            array.forEach(this._modelWatchHandle, function (handle) {
                handle.remove();
            });

            dojo.disconnect(this._renderDisplayNodeConnect);

            // Clear node in other frame to prevent nasty issues with dojo caching unloaded documents
            delete this.srcNodeRef;
            delete this.displayNode;

            this.inherited(arguments);
        },

        onReloadRequired: function (sender) {
            // summary:
            //		Set this handler to be notified when the block requires a full reload of the web page to be rerenderd.
            // tags:
            //		callback

        },

        onRender: function (block) {
            // summary:
            //		Set this handler to be notified when the block renders
            // tags:
            //		callback

        },

        _renderNode: function (propertyName, oldValue, value) {

            var contentLink = this.contentLink;
            var renderSettings = this.renderSettings;
            var rendererClass = this.rendererClass;
            var renderPropertyName = this.nodePropertyName || this.modelPropertyName;

            var def = this.renderManager.renderValue(contentLink, renderPropertyName, value, renderSettings, rendererClass);

            // Did we get a new deferred?
            if (def !== this._lastRenderDeferred) {

                // Store value
                this._lastRenderDeferred = def;

                dojo.when(def, dojo.hitch(this, function (result) {

                    // update node if we have a last deferred, this because cached rendering can
                    // be resolved faster than server rendered values. The last rendered deferred
                    // will be the one to update the node the last time.
                    if (this._lastRenderDeferred) {

                        if (result.doReload !== undefined && result.doReload) {
                            this.onReloadRequired(this);
                        } else if (dojo.isString(result)) {
                            this._updateRendering(result);
                        } else if (result.innerHtml !== undefined) {
                            this._updateRendering(result.innerHtml, result.attributes);
                        } else if (result.error !== undefined) {
                            this._handleValidationError(result.error);
                        }

                        if (def === this._lastRenderDeferred) {
                            this._lastRenderDeferred = null;
                        }
                    }
                }));
            }
        },

        _isEmptyHtml: function (displayNode) {

            // TODO: check for other types of nodes
            // TODO: use property descriptor to know which properties can have content (or not have inner content)
            var html = "";

            if (!displayNode) {
                return false;
            }

            if (displayNode.tagName === "IMG") {
                html = dojo.attr(displayNode, "src") || "";
            } else {
                html = displayNode.innerHTML;
            }

            // strip scripts tag from html. The regex pattern is borrowed from jquery.
            html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

            // This won't handle empty <br> in html
            return (typeof html == "string") && (html.replace(/\s*/g, "").length === 0);
        },

        checkEmptyHtml: function () {
            // summary:
            //		Overrides empty DomNode html with this.emptyValue
            // tags:
            //		public

            var isEmpty;

            if (!this._showEmptyNode) {
                return;
            }

            isEmpty = this._isEmptyHtml(this.displayNode);

            if (isEmpty && this._canModifyDisplayNode()) {
                this.displayNode.innerHTML = dojo.string.substitute(this.emptyValue, this);
            }

            this._ensureSize();
        },

        _canModifyDisplayNode: function () {
            // summary:
            //		For 'none' renderer, DomNode html and attributes should not be overwritten.
            //      It should be handled by page rendering framework
            // tags:
            //		private

            return this.rendererClass !== "epi-cms/contentediting/NullRenderer";
        },

        _ensureSize: function () {
            if (!this._canModifyDisplayNode()) {
                return;
            }

            try {
                this._clearComputedStyle();
                this._computeStyle();
            } catch (e) {
                // Probably failed because displayNode is not set yet
                console.warn("Could not get or set domStyle for displayNode", e);
            }
        },

        _clearComputedStyle: function () {

            var originalStyle = this._originalStyle;

            if (originalStyle) {

                // Reset any previous width and height styling, ie get the height for the content of the displaynode
                for (var prop in originalStyle) {

                    if (originalStyle.hasOwnProperty(prop)) {
                        domStyle.set(this.displayNode, prop, this._originalStyle[prop]);
                    }
                }

                this._originalStyle = null;
            }
        },

        _computeStyle: function () {
            var node = this.displayNode,
                computedStyle = node && domStyle.get(node);

            if (!computedStyle) {
                return;
            }

            var originalStyle = {
                    minWidth: domStyle.toPixelValue(node, computedStyle.minWidth),
                    minHeight: domStyle.toPixelValue(node, computedStyle.minHeight),
                    display: computedStyle.display
                },
                styleToApply = { },
                setMinHeight = originalStyle.minHeight === 0,
                setMinWidth = originalStyle.minWidth === 0,
                setDisplay = originalStyle.display === "inline",
                marginBox = domGeometry.getMarginBox(node, computedStyle);

            // Check if the node is smaller than desired, either from page cssClass/style or our min settings
            if (marginBox.h < (setMinHeight ? this.minHeight : originalStyle.minHeight) ||
                marginBox.w < (setMinWidth ? this.minWidth : originalStyle.minWidth)) {

                if (setMinHeight) {
                    styleToApply.minHeight = this.minHeight + "px";
                }
                if (setMinWidth) {
                    styleToApply.minWidth = this.minWidth + "px";
                }
                if (setDisplay) {
                    styleToApply.display = "inline-block";
                }

                if (setDisplay || setMinHeight || setMinWidth) {

                    this._originalStyle = originalStyle;
                    domStyle.set(node, styleToApply);
                }
            }
        },

        _updateRendering: function (innerHtml, attributes) {
            // summary:
            //		Callback when rendering has new html.
            // innerHtml: String
            //		The inner html for the node.
            // attributes: Dictionary
            //      The attributes for the outer node that should be set.
            // tags:
            //		private

            this.displayNode.innerHTML = innerHtml;

            if (attributes) {
                array.forEach(attributes, lang.hitch(this, function (attribute) {
                    this._updateAttribute(attribute);
                }));
            }

            this._hasEmptyHtml = this._isEmptyHtml(this.displayNode);
            if (this._hasEmptyHtml) {
                this.checkEmptyHtml();
                if (!this._showEmptyNode) {
                    domStyle.set(this.displayNode, "display", "none");
                }
            } else {
                // node has value, make sure it's not displayed too small
                // it probably has some html, but it could be with empty
                // innerHTML and then there width or height will be zero

                if (this._showEmptyNode) {
                    this._ensureSize();
                }
            }
            this.onRender(this);
        },

        _updateAttribute: function (attribute) {
            // summary:
            //		Update attribute for the display node.
            // attribute: Object
            //      The attribute for the outer node that should be set.
            // tags:
            //		private

            if (attribute.name.toLowerCase() === "class") {
                // Need to keep existing css style
                domClass.add(this.displayNode, attribute.value);
            } else {
                domAttr.set(this.displayNode, attribute.name, attribute.value);
            }
        },

        _handleValidationError: function (message) {
            // summary:
            //		Callback when rendering has new html.
            // html: String
            //		Focus on the display mode text
            // tags:
            //		private

            console.log(message + ": \"" + this.contentModel.get(this.modelPropertyName) + "\"");
        },

        render: function () {
            var val = this.contentModel.get(this.modelPropertyName);
            this._renderNode(this.modelPropertyName, val, val);
        },

        focus: function () {
            // TODO: focus overlay?
            dijit.focus(this.displayNode);
        },

        setShowEmptyNode: function (val) {
            this._showEmptyNode = val;

            if (this._hasEmptyHtml) {
                this._updateRendering("");
            }
        }
    });

});
