define("epi/shell/dnd/Avatar", [
    "dojo/_base/declare",
    "dojo/_base/window",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dijit/registry",
    "dojo/dnd/common",
    "dojox/html/entities"
], function (
    declare,
    win,
    domClass,
    domConstruct,
    domAttr,
    registry,
    common,
    entities
) {

    return declare(null, {
        // summary:
        //		Object that represents transferred DnD items visually
        // manager: Object
        //		a DnD manager object
        //
        // tags:
        //      internal

        constructor: function (manager) {
            this.manager = manager;
            this.construct();
        },

        // methods
        construct: function () {
            // summary:
            //		constructor function;
            //		it is separate so it can be (dynamically) overwritten in case of need

            // Avatar markup
            // <table class="dojoDndAvatar">
            //      <tbody>
            //          <tr>
            //              <td>
            //                  <div class="epi-DndAvatarContainer">
            //                      <div>
            //                          <table>
            //                             <tbody>
            //                                  <tr class="dojoDndAvatarItem">
            //                                      <td>
            //                                          <!-- Item content goes here -->
            //                                      </td>
            //                                   </tr>
            //                              </tbody>
            //                          </table>
            //                      </div>
            //                      <div class="epi-DndAvatarOverlay"></div>
            //                  </div>
            //              </td>
            //          </tr>
            //      </tbody>
            // </table>

            this.isA11y = domClass.contains(win.body(), "dijit_a11y");
            var a = domConstruct.create("table", {
                    "class": "dojoDndAvatar",
                    style: {
                        position: "absolute",
                        zIndex: "1999",
                        margin: "0px"
                    }
                }),
                source = this.manager.source, node,
                outerb = domConstruct.create("tbody", null, a),
                outertr = domConstruct.create("tr", null, outerb),
                outertd = domConstruct.create("td", null, outertr),
                k = Math.min(5, this.manager.nodes.length), i = 0,
                containerdiv = domConstruct.create("div", null, outertd),
                div = domConstruct.create("div", null, containerdiv),
                overlayDiv = domConstruct.create("div", null, containerdiv),
                innertable = domConstruct.create("table", null, div),
                b = domConstruct.create("tbody", null, innertable);
            domAttr.set(containerdiv, "class", "epi-DndAvatarContainer");
            domAttr.set(overlayDiv, "class", "epi-DndAvatarOverlay");
            domAttr.set(innertable, "style", { width: "100%" });
            for (; i < k; ++i) {
                if (source.creator) {
                    // create an avatar representation of the node
                    var nodeItem = source.getItem(this.manager.nodes[i].id).data;
                    var clonedNode = source._normalizedCreator(nodeItem, "avatar").node;
                    var name = nodeItem.get ? nodeItem.get("name") : nodeItem.name;
                    if (typeof name === "string") {
                        clonedNode.innerHTML = entities.encode(name);
                    } else if (typeof nodeItem === "string") {
                        clonedNode.innerHTML = entities.encode(nodeItem);
                    }
                    node = clonedNode;
                } else {
                    // or just clone the node and hope it works
                    node = this.manager.nodes[i].cloneNode(true);

                    // try to find a widget related to node.
                    if (node.id) {
                        var nodeWidget = registry.byId(node.id);
                        if (nodeWidget && nodeWidget.item && nodeWidget.item.name) {
                            // if we got a item with name attribute - use it as node content
                            node.innerHTML = entities.encode(nodeWidget.item.name);
                        }
                    }
                    if (node.tagName.toLowerCase() === "tr") {
                        // insert extra table nodes
                        var table = domConstruct.create("table"),
                            tbody = domConstruct.create("tbody", null, table);
                        tbody.appendChild(node);
                        node = table;
                    }
                }
                node.id = "";
                var tr = domConstruct.create("tr", null, b);
                var td = domConstruct.create("td", null, tr);
                td.appendChild(node);
                domAttr.set(tr, {
                    "class": "dojoDndAvatarItem",
                    style: { opacity: (9 - i) / 10 }
                });
            }

            // Explicity set the cursor style since IE9 doesn't support CSS cursor styles when dragging.
            a.style.cursor = "move";
            this.node = a;
        },
        destroy: function () {
            // summary:
            //		destructor for the avatar; called to remove all references so it can be garbage-collected
            domConstruct.destroy(this.node);
            this.node = false;
        },
        update: function () {
            // summary:
            //		updates the avatar to reflect the current DnD state
            domClass.toggle(this.node, "dojoDndAvatarCanDrop", this.manager.canDropFlag);
        }
    });

});
