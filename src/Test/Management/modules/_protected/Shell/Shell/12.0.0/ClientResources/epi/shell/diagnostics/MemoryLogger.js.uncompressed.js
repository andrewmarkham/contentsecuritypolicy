define("epi/shell/diagnostics/MemoryLogger", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "./Snapshot"
], function (
    declare,
    lang,
    Snapshot
) {

    return declare(null, {
        // tags:
        //      internal

        snapshots: null,

        constructor: function (params) {
            lang.mixin(this, params);

            this.snapshots = [];

        },

        takeSnapshot: function () {

            var snapshot = new Snapshot();
            this.snapshots.push(snapshot);

            var total = this.countItems(snapshot.widgets);

            var delta = {
                total: total,
                same: total,
                destroyed: 0,
                created: 0,
                snapshot: snapshot
            };

            if (this.snapshots.length > 1) {
                var previous = this.snapshots[this.snapshots.length - 2];
                var diff = this.diff(snapshot, previous);

                delta.destroyed = this.countItems(diff.destroyed);
                delta.created = this.countItems(diff.created);
                delta.same = this.countItems(diff.same);
            }

            return delta;
        },

        countItems: function (obj) {
            return Object.keys(obj).length;
        },

        last: function () {
            var l = this.snapshots.length;

            if (l === 0) {
                throw "No snapshots";
            }

            return this.snapshots[l - 1];
        },

        lastDiff: function () {

            var l = this.snapshots.length;

            if (l === 0) {
                throw "No snapshots";
            }
            if (l === 1) {
                throw "Only one snapshot";
            }

            var a = this.snapshots[l - 1];
            var b = this.snapshots[l - 2];

            return this.diff(a, b);
        },

        computeLastLeftBehind: function () {
            var l = this.snapshots.length;

            if (l < 3) {
                throw "Not enough snapshots, must have at least 3";
            }

            var a = this.snapshots[l - 1];
            var b = this.snapshots[l - 2];
            var c = this.snapshots[l - 3];

            var d1 = this.diff(a, b);
            var d2 = this.diff(b, c);
            var o = {};

            for (var p in d2.created) {
                if (!(p in d1.destroyed)) {
                    o[p] = d2.created[p];
                }
            }

            return o;
        },

        diff: function (newerSnapshot, olderSnapshot) {

            var newer = newerSnapshot.widgets;
            var older = olderSnapshot.widgets;

            var newItems = {};
            var sameItems = {};
            var destroyedItems = {};
            var c;
            var id;

            // check all newer
            for (id in newer) {
                c = newer[id];

                if (id in older) {
                    // both in newer and older => same
                    sameItems[id] = c;
                } else {
                    // in newer but not in older => new
                    newItems[id] = c;
                }
            }

            // find destroyed items
            for (id in older) {
                c = older[id];

                if (!(id in newer)) {
                    // not in newer => destroyed
                    destroyedItems[id] = c;
                }
            }

            return {
                created: newItems,
                same: sameItems,
                destroyed: destroyedItems
            };
        }
    });
});
