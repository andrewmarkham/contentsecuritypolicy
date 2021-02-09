define("epi/shell/_ContextMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/topic",
    "dijit/Destroyable"
], function (
    declare,
    lang,
    Deferred,
    topic,
    Destroyable
) {

    return declare([Destroyable], {
        // summary:
        //    Helps keeping up to date with the current context. Mixing this into a class gives access to current context and other useful features.
        // tags:
        //    public abstract

        // _currentContext: [protected] Object
        //      The currently loaded context
        _currentContext: null,

        // _waitingForContext: [private] Promise
        //      Set to a promise when waiting for initial context
        _waitingForContext: null,

        constructor: function (options) {
            var initHandle;

            function setupCurrentContext(ctx, callerData) {
                if (this._currentContext || !callerData || callerData.sender !== this) {
                    return;
                }

                initHandle.remove();
                initHandle = null;

                // we have context, make sure everyone interested knows
                this._initialContextChanged(ctx);
            }

            this.own(
                topic.subscribe("/epi/shell/context/request", lang.hitch(this, this._contextRequest)),
                topic.subscribe("/epi/shell/context/changed", lang.hitch(this, this._contextChanged)),
                topic.subscribe("/epi/shell/context/updated", lang.hitch(this, this._contextUpdated)),
                topic.subscribe("/epi/shell/context/requestfailed", lang.hitch(this, this._contextFailed)),
                initHandle = topic.subscribe("/epi/shell/context/current", lang.hitch(this, setupCurrentContext))
            );

            topic.publish("/epi/shell/context/requestcurrent", { sender: this });
        },

        getCurrentContext: function () {
            // summary:
            //      Returns either the current context or a deferred which will resolve context as soon as it becomes available.
            //
            // example:
            //      when(this.getCurrentContext(), function(ctx) {
            //          console.log("now we know we've got ", ctx);
            //      });
            //
            // tags:
            //      protected

            if (this._currentContext !== null) {
                // we have context, resolve it immediately
                return this._currentContext;
            }

            if (!this._waitingForContext) {
                // we've never requested context before, store deferred
                this._waitingForContext = new Deferred();
            }

            return this._waitingForContext.promise;
        },

        contextChanged: function (ctx, callerData) {
            // summary:
            //    Called when the currently loaded page changes. I.e. a new page is loaded into the preview area.
            // tags:
            //    protected
        },

        contextUpdated: function (ctx, callerData) {
            // summary:
            //    Called when the currently loaded page is updated. For instance when the language settings are changed.
            // tags:
            //    protected
        },

        contextChangeFailed: function (ctx, callerData) {
            // summary:
            //    Called when loading the context fails
            // tags:
            //    protected
        },

        _contextChanged: function (ctx, callerData) {
            // tags:
            //    private

            if (!this._currentContext) {
                this._initialContextChanged(ctx);
            }

            this._currentContext = ctx;
            this.contextChanged(ctx, callerData);
        },

        _initialContextChanged: function (context, callerData) {
            // tags:
            //    private

            this._currentContext = context;

            if (this._waitingForContext) {
                this._waitingForContext.resolve(context);
                this._waitingForContext = null;
            }
        },

        _contextRequest: function () {
            // tags:
            //    private

            // Invalidate the current context when someone requests a new context
            this._currentContext = null;
        },

        _contextUpdated: function (ctx, callerData) {
            // tags:
            //    private

            this._currentContext = ctx;
            this.contextUpdated(ctx, callerData);
        },

        _contextFailed: function (ctx, callerData) {
            // tags:
            //    private

            if (!this._currentContext) {
                this._initialContextChanged(ctx);
            }

            this._currentContext = ctx;
            this.contextChangeFailed(ctx, callerData);
        }
    });
});
