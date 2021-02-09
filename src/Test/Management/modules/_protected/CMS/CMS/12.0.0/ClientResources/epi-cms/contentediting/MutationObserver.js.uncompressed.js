define("epi-cms/contentediting/MutationObserver", [
    "dojo/_base/declare",
    "dojo/Evented"
], function (
    declare,
    Evented
) {
    return declare([Evented], {
        // summary:
        //      Sets up mutation observers on data-epi-edit and data-epi-property-name attribute to react on changes in the DOM
        // tags:
        //      internal

        // _mutationObserverHandle: [private] Object
        //      Mutation observer handle
        _mutationObserverHandle: null,

        setup: function (doc) {
            // summary:
            //      Sets up observers to react on changes in the dom and publishes dom-updated event.
            //      Disconnects all the observers on teardown.
            // tags:
            //      public

            this.teardown();

            // Early exit in case the document is not available.
            if (!doc) {
                return;
            }

            // We listen to the root document DOM for:
            // * New DOM nodes: see if they have the OPE edit property
            // * Existing DOM nodes: observe changes to see if OPE edit property is added or removed
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    // Check mutation on existing DOM elements
                    // Only publish event if the mutation is an attribute, with the name "data-epi-edit" or "data-epi-property-name"
                    if (mutation.type === "attributes" && (mutation.attributeName === "data-epi-edit" || mutation.attributeName === "data-epi-property-name")) {
                        this._publishEvent();

                    // Check mutation on new DOM elements
                    } else if (mutation.type === "childList") {
                        Array.prototype.slice.call(mutation.addedNodes).forEach(function (addedNode) {
                            var epiPropertyNodes = this._getEpiPropertyNodes(addedNode);
                            // If none of the added child nodes is related with episerver we don't
                            // need to emit a dom-updated event
                            if (epiPropertyNodes.length === 0) {
                                return;
                            }

                            this._publishEvent();
                        }, this);
                    }
                }.bind(this));
            }.bind(this));

            // Setting subtree to true allows us to monitor the entire tree
            // with just one observer since we're watching all nodes
            observer.observe(doc, {
                attributes: true,
                childList: true,
                subtree: true
            });
            this._mutationObserverHandle = observer;
        },
        teardown: function () {
            if (this._mutationObserverHandle !== null) {
                this._mutationObserverHandle.disconnect();
            }
            this._mutationObserverHandle = null;
        },
        _getEpiPropertyNodes: function (target) {
            // If it is not a node type or document type make an early exit
            // this filters #text and #comments nodes for example and much more
            // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
            if (target.nodeType !== Node.ELEMENT_NODE && target.nodeType !== Node.DOCUMENT_NODE) {
                return [];
            }

            // Return an array of elements with the "data-epi-edit" or "data-epi-property-name" attribute.
            if (target.attributes && (target.attributes["data-epi-edit"] || target.attributes["data-epi-property-name"])) {
                return [target];
            } else {
                var result = target.querySelectorAll("[data-epi-edit], [data-epi-property-name]");
                return Array.prototype.slice.call(result);
            }
        },
        _publishEvent: function () {
            this.emit("dom-updated");
        }
    });
});
