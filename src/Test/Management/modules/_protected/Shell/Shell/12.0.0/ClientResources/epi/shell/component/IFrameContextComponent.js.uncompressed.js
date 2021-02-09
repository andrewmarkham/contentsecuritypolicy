define("epi/shell/component/IFrameContextComponent", [
    "dojo",
    "dijit",
    "epi/shell/widget/Iframe",
    "epi/shell/_ContextMixin"],
function (dojo, dijit, Iframe, _ContextMixin) {

    return dojo.declare([Iframe, _ContextMixin], {
        // summary:
        //    A context-aware iFrame widget that loads a specified URL.
        //
        // description:
        //    Extends epi/shell/widget/Iframe and adds context-awareness with the help of epi/shell/_ContextMixin.
        //    When there's a context change the iFrame is reloaded with the context uri attached to the url.
        //
        // tags:
        //    public

        // reloadOnContextChange: [public] Bool
        //      A flag that says if the iframe should be reloaded when the context is changed.
        //      The default value is true.
        reloadOnContextChange: true,

        // keepUrlOnContextChange: [public] Bool
        //      A flag that says if the iframe should keep the url when the context is changed.
        //      The default value is false.
        keepUrlOnContextChange: false,

        postCreate: function () {
            dojo.when(this.getCurrentContext(), dojo.hitch(this, function (context) {
                this.contextChanged(context);
            }));
            if (!this.reloadOnContextChange) {
                this.load(this.get("urlTemplate"));
            }
        },

        _constructQuery: function (context) {
            return {
                uri: context.uri,
                id: context.id || ""
            };
        },

        contextChanged: function (context, callerData) {
            this.inherited(arguments);

            if (this.reloadOnContextChange) {
                if (this.keepUrlOnContextChange) {
                    var url = this.get("url");
                    if (url === "about:blank") {
                        url = this.get("urlTemplate");
                    }
                    this.load(url, { query: this._constructQuery(context) }, true);
                } else {
                    this.load(this.get("urlTemplate"), { query: this._constructQuery(context) }, true);
                }
            }
        }
    });
});
