define("epi-cms/widget/UploadUtil", [
// dojo
    "dojo/_base/array",
    "dojo/_base/lang",

    "dojo/dom-style"
],

function (
// dojo
    array,
    lang,

    domStyle
) {

    return {
        // summary:
        //      Utility for multiple file upload.
        // tags:
        //      internal

        StatusScope: {
            // summary:
            //      Upload file status scope
            //          Single: will be apply for only one row
            //          All: will be apply for all rows
            // tags:
            //      public

            Single: 0,
            All: 1
        },

        validUploadFiles: function (/*Array*/files) {
            // summary:
            //      Validate input upload file array
            // tags:
            //      public

            if (!files || !(files instanceof Array) || files.length === 0) {
                return false;
            }

            return !array.some(files, function (item) {
                return (item.name == null || item.size == null);
            });
        },

        addStatus: function (/*Array*/store, /*Integer*/scope, /*String*/itemName, /*String*/message) {
            // summary:
            //      Append new one status message to the given store
            // store: [Array]
            //
            // scope: [Integer]
            //
            // itemName: [String]
            //
            // message: [String]
            //
            // tags:
            //      public

            var newStore = [];

            if (store instanceof Array) {
                newStore = lang.clone(store);
            }

            var existed = array.some(newStore, function (item) {
                return (item.scope === scope && item.itemName === itemName && item.message === message);
            });

            if (!existed) {
                newStore.push({ scope: scope, itemName: itemName, message: message });
            }

            return newStore;
        },

        filterFileOnly: function (/*Array*/files) {
            // summary:
            //      Returns list of file only, not directory
            // tags:
            //      public

            return array.filter(files, function (file) {
                if (file.type === "" && (file.size === 0 || file.size % 4096 === 0)) {
                    return false;
                }

                return true;
            });
        },

        toggleVisibility: function (/*DOM*/domNode, /*Boolean*/display) {
            // summary:
            //      Toogle visibility of the given dom node
            // domNode: [DOM]
            //
            // display: [Boolean]
            //
            // tags:
            //      public

            domStyle.set(domNode, "display", (display ? "block" : "none"));
        },

        getFileArray: function (/*Object*/inputList) {
            // summary:
            //      Get Array object from the given object list
            // inputList: [Object]
            //      Object list that wants to convert to Array
            // returns: [Array]
            //      Collection of uploading files in Array
            // tags:
            //      public

            if (!inputList) {
                return null;
            }

            if (inputList instanceof Array) {
                return inputList;
            }

            if (typeof inputList.item !== "function") {
                return null;
            }

            var i = 0,
                total = inputList.length,
                fileArray = [];

            for (i; i < total; i++) {
                fileArray.push(inputList.item(i));
            }

            return fileArray;
        }

    };
});
