define("epi/shell/store/storeDelegate", [
    "dojo/_base/lang",
    "dojo/aspect"
], function (lang, aspect) {

    return function (masterStore, childObject) {
        // summary:
        //      Provides same functionality as lang.delegate but allows the store's notify method
        //      to be propagated from child to master and vice versa
        // masterStore:
        //      The store instance (usually an instance of observable store)
        // childObject:
        //      The object which needs to be extended.
        // tags:
        //      internal

        var store = lang.delegate(masterStore, childObject);

        if ((typeof masterStore.notify !== "function") || (typeof childObject !== "object")) {
            return store;
        }

        var inNotify = false;
        aspect.before(masterStore, "notify", function () {
            if (inNotify) {
                return;
            }

            inNotify = true;
            store.notify.apply(store, arguments);
            inNotify = false;
        }, true);

        store.notify = function () {
            if (!inNotify) {
                inNotify = true;
                masterStore.notify.apply(store, arguments);
            }

            inNotify = false;
        };

        return store;
    };
});
