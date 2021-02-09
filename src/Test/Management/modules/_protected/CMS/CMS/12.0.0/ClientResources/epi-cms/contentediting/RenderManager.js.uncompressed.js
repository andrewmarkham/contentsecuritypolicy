define("epi-cms/contentediting/RenderManager", [
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/Deferred",
    "dojo/_base/json",
    "dojo/_base/array",
    "epi",
    "epi/dependency",
    "epi/datetime",
    "dojox/encoding/digests/SHA1",
    "dojo/Stateful",

    "epi-cms/contentediting/PropertyRenderer"
],

function (dojo, declare, lang, Deferred, json, array, epi, dependency, epiDateTime, SHA1, Stateful, PropertyRenderer) {

    return declare([Stateful], {
        // summary:
        //    This class manages content blocks server rendering. It provides a cache to avoid redundant server calls.
        // tags:
        //    internal

        // _cache: [private] Object
        //    The internal render cache
        _cache: null,
        _queue: null,

        // defaultRenderer: Object
        //      Instance of the default renderer class
        defaultRenderer: null,

        // _rendererPool: Hashtable
        //      Cache of renderer objects
        _rendererPool: {},

        // rendering: Boolean
        //      Set to true while we're rendering items
        rendering: false,

        // processQueueOnRenderValue: Boolean
        //      Set this to true to start rendering automatically after calling renderValue
        processQueueOnRenderValue: true,

        // numberOfItemsInQueue: Number
        //      Number of items queued to be rendered
        numberOfItemsInQueue: 0,

        // numberOfItemsRendering: Number
        //      Number of items being rendered
        numberOfItemsRendering: 0,

        // concurrentProcessedItems: Number
        //      Maximum number of items that can be rendered at the same time
        concurrentProcessedItems: 2,

        // processInterval: Number
        //      How often (in milliseconds) should we check the queue to see if there's any items to be rendered
        processInterval: 200,

        // _processIntervalId: [private] Number
        //      Id of the interval to check queue, will only be set if any rendering has occurred
        _processIntervalId: 0,

        // _itemsBeingRendered: [private] Hashmap
        //      Hashmap with items being rendered
        _itemsBeingRendered: null,

        // viewSettingsManager: [private] epi.cms.contentediting.ViewSettingsManager
        //      The ViewSettingsManager is used to get a currently selected visitor group.
        viewSettingsManager: null,

        _viewSettingsToCopy: ["visitorgroup"],

        constructor: function (params) {
            this._cache = {};
            this._queue = [];
            this._itemsBeingRendered = {};
            lang.mixin(this, params);

            this.defaultRenderer = this.defaultRenderer || new PropertyRenderer();
        },

        postscript: function () {
            // Listen changed visitor group, to apply visitor group.
            this.viewSettingsManager = this.viewSettingsManager || dependency.resolve("epi.viewsettingsmanager");
        },

        destroy: function () {
            // stop queue
            this._stopRenderingInterval();

            // set flag
            this._isDestroyed = true;

            // clear cache
            for (var i in this._cache) {
                delete this._cache[i];
            }
            // clear itemsbeing rendered
            for (var j in this._itemsBeingRendered) {
                delete this._itemsBeingRendered[j];
            }

            this._cache = null;
            this._itemsBeingRendered = null;
            this._queue = null;

            this.inherited(arguments);
        },

        _getRenderer: function (rendererClassName) {
            var def = new Deferred();
            if (rendererClassName) {
                if (this._rendererPool[rendererClassName]) {
                    return this._rendererPool[rendererClassName];
                } else {
                    require([rendererClassName], function (renderer) {
                        def.resolve(new renderer());
                    });
                }
            } else {
                return this.defaultRenderer;
            }
            return def;
        },

        renderValue: function (contentLink, propertyName, value, renderSettings, rendererClassName) {
            // summary:
            //    Get block render for a content model's node, supplying its value.
            //
            // contentLink: Object|String
            //    The id of the content on which the property is rendered.
            //
            // propertyName: String
            //    Name of the property to render
            //
            // value: String
            //    The node value.
            //
            // rendererClassName: String
            //    Name of renderer class which takes care of render the given value to html.
            //
            // renderSettings: Object
            //    Render setting
            //
            // returns:
            //	  A dojo/Deferred object which results the render
            //
            // tags:
            //    public

            var def;

            if (this._isSuspending) {
                def = new Deferred();
                def.cancel();
                return def;
            }

            value = epiDateTime.transformDate(value);

            renderSettings = this.cloneAndCompleteRenderSettings(renderSettings || {});

            // Firstly, try getting from cache
            var renderedContent = this._get(propertyName, renderSettings, value);

            if (renderedContent) {
                def = new Deferred();
                def.resolve(renderedContent);
            } else {
                if (renderSettings && renderSettings.isFullReload) {
                    def = new Deferred();
                    def.resolve({ doReload: true });
                } else {
                    def = new Deferred();
                    Deferred.when(this._getRenderer(rendererClassName), lang.hitch(this, function (renderer) {
                        if (!renderer) {
                            renderer = this.defaultRenderer;
                        }

                        Deferred.when(this._queueItem(renderer, contentLink, propertyName, renderSettings, value), function (result) {
                            def.resolve(result);
                        });

                        if (this.processQueueOnRenderValue && !this._isSuspending) {
                            this._startRenderingInterval();
                        }

                    }));
                }
            }

            return def;
        },

        cloneAndCompleteRenderSettings: function (renderSettings) {
            // summary:
            //    Clones the supplied renderSettings and adds settings from the ViewSettingsManager.
            //
            // returns:
            //    The cloned and updated renderSettings.
            //
            // tags:
            //    public

            renderSettings.propertyRenderSettings = renderSettings.propertyRenderSettings || "";

            var renderSettingsClone = lang.clone(renderSettings);

            if (this.viewSettingsManager.get("enabled")) {
                array.forEach(this.viewSettingsManager.getRenderingViewSettings(), lang.hitch(this, function (viewSetting) {
                    if (viewSetting.get("enabled")) {
                        var settingValue = this.viewSettingsManager.getSettingProperty(viewSetting.key);
                        if (settingValue) {
                            this.updateRenderSettings(renderSettingsClone, settingValue, viewSetting.key, viewSetting.isTagItem);
                        }
                    }
                }));
            }

            return renderSettingsClone;
        },

        updateRenderSettings: function (/*String*/renderSettings, /*String*/newItem, /*String*/key, /*Boolean*/isTagItem) {
            // summary:
            //    Add new items to the renderSettings.
            //
            // renderSettings:
            //    The property render settings.
            //
            // newItem:
            //    The item that will be added to the property.
            //
            // key:
            //    The name of the property that will be updated.
            //
            // isTagItem:
            //    Flag indicating where the new item will be added if it's true
            //    the item will be added to the renderSettings.propertyRenderSettings.tag,
            //    otherwise it will be added directly as a property on the renderSettings object.
            //
            // returns:
            //    The updated setting as a string.
            //
            // tags:
            //    public
            var itemlist = [],
                newitemlist = [],
                itemsString = "",
                propertyName = (isTagItem ? "tag" : key),
                replaceItem = !isTagItem,
                data = null;

            if (isTagItem) {
                renderSettings.propertyRenderSettings = renderSettings.propertyRenderSettings || "";
                data = (renderSettings.propertyRenderSettings ? dojo.fromJson(renderSettings.propertyRenderSettings) : {});
            } else {
                data = (renderSettings ? renderSettings : {});
            }

            if (!data[propertyName] || replaceItem) {
                // in case there isn't any tag defined.
                itemsString = newItem;
            } else {
                // there're tags already configured.
                itemlist = data[propertyName].split(",");

                array.forEach(itemlist, function (item, idx) {
                    item = lang.trim(item);
                    if (item.toLowerCase() !== newItem.toLowerCase()) {
                        newitemlist.push(item);
                    }
                });
                // add the new tag to the array.
                newitemlist.push(newItem);
                itemsString = newitemlist.join(", ");
            }

            // update the settings object.
            data[propertyName] = itemsString;

            if (isTagItem) {
                renderSettings.propertyRenderSettings = dojo.toJson(data);
            }
        },

        processQueue: function () {
            // summary:
            //    Process the queue.
            //

            if (this._isSuspending) {
                return;
            }
            if (this._queue.length === 0) {
                // queue is empty, stop processing queue
                this._stopRenderingInterval();
                return;
            }

            if (this.numberOfItemsRendering >= this.concurrentProcessedItems) {
                // we're already rendering max number of items
                return;
            }

            // add as many items as needed to rendering pool
            var nextItemToProcessIndex = this._nextItemToProcessIndex();

            while (nextItemToProcessIndex >= 0 && this.numberOfItemsRendering < this.concurrentProcessedItems) {

                this._processItemInQueue(nextItemToProcessIndex);

                // Find next item to process
                nextItemToProcessIndex = this._nextItemToProcessIndex();
            }
        },

        suspend: function () {
            // summary:
            //    Suspend the render manager.
            //
            // remarks:
            //    Ongoing rendering items will be canceled. Queueing items will be deleted and adding items will be temporary rejected.
            //    Used when the preview need to be reloaded.

            if (this._isSuspending) {
                return;
            }

            // set flag
            this._isSuspending = true;
            this._stopRenderingInterval();
        },

        clear: function () {
            //cancel ongoing
            this.set("numberOfItemsRendering", 0);
            for (var key in this._itemsBeingRendered) {
                this._itemsBeingRendered[key].deferred.cancel();
                delete this._itemsBeingRendered[key];
            }
            this._itemsBeingRendered = {};

            //empty queue
            this.set("numberOfItemsInQueue", 0);
            for (var i = this._queue.length - 1; i >= 0; i--) {
                delete this._queue[i];
            }
            this._queue = [];
        },

        resume: function () {
            // summary:
            //    Resume render manager.
            //
            // remarks:
            //    Used when the preview has done reloading.
            //    The render queue was reset before so the render manager will start over fresh.

            if (!this._isSuspending) {
                return;
            }

            // set flag
            this._isSuspending = false;
            this._startRenderingInterval();
        },

        _nextItemToProcessIndex: function () {

            // take first item if items in queue exists
            var index = -1;

            var i = 0;

            while (i < this._queue.length && index === -1) {

                // get item
                var item = this._queue[i];

                // get the key
                var key = this._getRenderHash(item.propertyName, item.renderSettings);

                // if the key is not in the items being rendered, we found our next item
                if (!(key in this._itemsBeingRendered)) {
                    index = i;
                }

                i++;
            }

            return index;
        },

        _processItemInQueue: function (index) {
            // take item
            var item = this._queue.splice(index, 1)[0];

            // increase value of items being rendered
            this.set("numberOfItemsRendering", this.numberOfItemsRendering + 1);

            // update number of items
            this.set("numberOfItemsInQueue", this._queue.length);

            // get the key
            var key = this._getRenderHash(item.propertyName, item.renderSettings);

            // put the item in our hashmap
            this._itemsBeingRendered[key] = item;

            // we're rendering
            this.set("rendering", true);

            var onSuccess = lang.hitch(this, function (result) {

                // check if destroy() was called before callback was fired
                if (this._isDestroyed) {
                    item.deferred.cancel();
                    return;
                }

                // cache value if it is successful
                if (result && result.innerHtml) {
                    this._put(item.propertyName, item.renderSettings, item.value, { doReload: result.doReload, innerHtml: result.innerHtml });
                }

                // remove this item from the items being rendered
                delete this._itemsBeingRendered[key];

                // decrease value of items being rendered
                this.set("numberOfItemsRendering", this.numberOfItemsRendering - 1);

                this.set("rendering", false);

                // resolve rendering deferreds
                item.deferred.resolve(result);
            });

            var onFailure = lang.hitch(this, function (err) {
                // TODO: error handling for server error

                // check if destroy() was called before callback was fired
                if (this._isDestroyed) {
                    item.deferred.cancel();
                    return;
                }

                // remove this item from the items being rendered
                delete this._itemsBeingRendered[key];

                // decrease value of items being rendered
                this.set("numberOfItemsRendering", this.numberOfItemsRendering - 1);

                this.set("rendering", false);

                // reject rendering deferreds
                item.deferred.reject(err);
            });

            Deferred.when(item.renderer.render(item.contentLink, item.propertyName, item.value, item.renderSettings), onSuccess, onFailure);
        },

        cacheRender: function (propertyName, renderSettings, value, content) {
            // summary:
            //    Explicitly update the internal cache with the rendered content for a block.
            //
            // propertyName: String
            //    The content model node. It can be property or sub property.
            //
            // value: String|Object
            //    The value to render.
            //
            // content: String
            //    The rendered content.
            //
            // tags:
            //    public

            var data = {
                innerHtml: content,
                doReload: false
            };

            this._put(propertyName, renderSettings, value, data);
        },

        _queueItem: function (renderer, contentLink, propertyName, renderSettings, value) {
            // summary:
            //      Add or update rendering item

            var key = this._getRenderHash(propertyName, renderSettings);
            var deferred;

            var itemBeingRendered = this._itemsBeingRendered[key];

            if (itemBeingRendered && !itemBeingRendered.deferred.fired && itemBeingRendered.value === value) {
                // The current property is being rendered, return that deferred
                // the deferred should always have fired set to false
                deferred = itemBeingRendered.deferred;
            } else {
                var index = this._queueIndex(renderer, contentLink, propertyName, renderSettings, value);

                if (index < 0) {
                    deferred = new Deferred();

                    // queue item
                    this._queue.push({
                        contentLink: contentLink,
                        renderer: renderer,
                        propertyName: propertyName,
                        renderSettings: renderSettings,
                        renderSettingsString: json.toJson(renderSettings),
                        value: value,
                        deferred: deferred
                    });

                    // update number of items in queue
                    this.set("numberOfItemsInQueue", this._queue.length);
                } else {

                    // it doesn't matter which item we update
                    // update it with new values
                    var item = this._queue[index];

                    // updating with a new renderer could cause errors, ie having two properties on the same
                    // content with same settings, but with different renderers
                    item.contentLink = contentLink;
                    item.renderer = renderer;
                    item.value = value;

                    deferred = item.deferred;
                }
            }

            return deferred;
        },

        _startRenderingInterval: function () {
            if (!this._processIntervalId) {

                // trigger immediate first call
                this.processQueue();

                // create interval
                this._processIntervalId = setInterval(lang.hitch(this, function () {
                    this.processQueue();
                }), this.processInterval);
            }

        },

        _stopRenderingInterval: function () {

            if (this._processIntervalId) {
                clearInterval(this._processIntervalId);
                this._processIntervalId = 0;
            }

            // reset flag
            this.set("rendering", false);
        },


        _getRenderHash: function (propertyName, renderSettings) {
            return SHA1(json.toJson({ p: propertyName, r: renderSettings }));
        },


        _queueIndex: function (renderer, contentLink, propertyName, renderSettings, value) {

            var index = -1;
            var renderSettingsString = json.toJson(renderSettings);

            // find index of item in queue
            array.some(this._queue, function (item, i) {
                if ((item.propertyName === propertyName) && (item.renderSettingsString === renderSettingsString)) {
                    index = i;
                    return true;
                }
            });

            return index;
        },

        _put: function (propertyName, renderSettings, value, data) {
            // summary:
            //    Store the rendered content for a value in the internal cache object
            //
            // propertyName: String
            //    Name of the cached block
            //
            // value: String|Object
            //    The raw value of the object to fetch
            //
            // value: String
            //    The rendered content to put in cache
            //
            // tags:
            //    private

            if (!renderSettings.cacheResults) {
                return;
            }

            var valueHash = this._getCacheHash(propertyName, renderSettings, value);
            if (!this._cache) {
                // Initial internal render cache
                this._cache = {};
            }
            this._cache[valueHash] = { data: data };
        },

        _get: function (propertyName, renderSettings, value) {
            // summary:
            //    Retreive the rendered content for a value from the internal cache
            //
            // propertyName: String
            //    Name of the cached block
            //
            // value: String|Object
            //    The raw value of the object to fetch
            //
            // returns:
            //    The content as a string or undefined if no cached content exists.
            //
            // tags:
            //    private

            var valueHash = this._getCacheHash(propertyName, renderSettings, value);
            var cacheObject = this._cache[valueHash];
            return (cacheObject ? cacheObject.data : undefined);
        },

        _getCacheHash: function (propertyName, renderSettings, value) {
            // summary:
            //    Calculates a hash of the supplied value
            //
            // tags:
            //    private

            // In case the value is an object we serialize before calculating the hash.
            return SHA1(json.toJson({ p: propertyName, r: renderSettings, v: value }));
        }
    });

});
