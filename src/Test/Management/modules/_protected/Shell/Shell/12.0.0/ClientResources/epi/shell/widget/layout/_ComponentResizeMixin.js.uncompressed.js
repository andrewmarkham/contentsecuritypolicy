define("epi/shell/widget/layout/_ComponentResizeMixin", [
    "dojo/_base/declare",
    "dojo/dom-style",
    "epi/shell/widget/layout/_ComponentSplitter"
], function (declare, domStyle, _ComponentSplitter) {

    return declare(null, {
        // tags:
        //      internal

        showSplitter: true,

        // open: [public] Boolean
        //      Flag indicating whether the component is open.
        open: true,

        // resizable: [public] Boolean
        //      Flag indicating whether the component is able to be resized.
        resizable: true,

        startup: function () {
            // summary:
            //    Start the widget. Setup widget styles and initialize its children.
            //
            // tags:
            //    public

            this.inherited(arguments);

            if (!this._splitter) {
                var params = {
                    child: this,
                    container: this.getParent(),
                    id: this.id + "_splitter",
                    region: "bottom"
                };

                if (this._splitterNode) {
                    this._splitter = new _ComponentSplitter(params, this._splitterNode);
                } else {
                    this._splitter = new _ComponentSplitter(params);
                    this.addChild(this._splitter);
                }
            }

            //We need to run this in startup, otherwise we do not have any parent
            this._toggleSplitter(this.showSplitter);
            this._splitter.startup();

            this._splitter.set("disabled", !this.resizable);
        },

        destroy: function () {
            if (this._splitter) {
                this._splitter.destroyRecursive();
            }

            this.inherited(arguments);
        },

        _setOpenAttr: function (value) {
            this._set("open", value);

            domStyle.set(this.domNode, "minHeight", this.get("minHeight") + "px");
            this.set("resizable", value);
        },

        _setResizableAttr: function (value) {
            this._set("resizable", value);

            if (this._splitter) {
                this._splitter.set("disabled", !value);
            }
        },

        _getMinHeightAttr: function () {
            if (this.open) {
                return this.minHeight;
            }
            return this.getSize().h;
        },

        _setShowSplitterAttr: function (showSplitter) {
            this._set("showSplitter", showSplitter);

            this._toggleSplitter(showSplitter);
        },

        _toggleSplitter: function (show) {
            if (this._splitter) {
                domStyle.set(this._splitter.domNode, "display", show ? "" : "none");
            }
        },

        getSize: function () {
            // summary:
            //    Get the current size of the component. Sub-classes should override this.
            // tags:
            //    abstract
        },

        _setLastOpenHeightAttr: function (value) {
            this._set("lastOpenHeight", value);

            // if component is close then there is no point to reset the dom height
            if (value && this.open) {
                domStyle.set(this.domNode, "height", value + "px");
            }
        },

        _getSettingsAttr: function () {
            //Get the current state of the component
            return {
                open: this.open,
                lastOpenHeight: this.open ? this.getSize().h : this.lastOpenHeight
            };
        }
    });
});
