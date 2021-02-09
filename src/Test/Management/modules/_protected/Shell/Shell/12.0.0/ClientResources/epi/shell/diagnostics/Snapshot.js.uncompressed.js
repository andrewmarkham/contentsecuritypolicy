define("epi/shell/diagnostics/Snapshot", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/registry"
], function (
    array,
    declare,
    lang,
    registry
) {

    return declare(null, {
        // tags:
        //      internal

        time: null,
        widgets: null,

        constructor: function (params) {
            lang.mixin(this, params);
        },

        postscript: function () {
            this._init();
        },

        destroy: function () {

        },

        _init: function () {
            this.time = new Date();

            var widgets = {};

            this.widgets = widgets;

            // map widget id to class
            array.forEach(registry.toArray(), function (w) {
                widgets[w.id] = w.declaredClass;
            });
        },

        toString: function () {

            var s = "Snapshot \"" + this.time + "\" [\n";

            for (var c in this.items) {
                s += "\t" + c + ":\t\t" + this.items[c].length + "\n";
            }

            s += "]";

            return s;
        },

        toClassMap: function () {

            var items = {};
            // map classes to list of widget ids

            for (var id in this.widgets) {
                var c = this.widgets[id];

                if (c in items) {
                    items[c].push(id);
                } else {
                    items[c] = [id];
                }
            }

            return items;
        },

        toClassMapArray: function () {

            var items = this.toClassMap();
            // map classes to list of widget ids

            var map = [];

            for (var p in items) {
                map.push({
                    type: p,
                    items: items[p]
                });
            }

            return map;
        }

    });
});
