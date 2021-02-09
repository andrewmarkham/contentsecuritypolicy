var profile = (function () {

    // This function is used to determine whether or not a resource should be tagged as copy-only.
    function copyOnly(mid) {
        var list = {
            "epi/shell/shell": 1,
            "epi/themes/sleek/compile": 1
        };
        var amd = [
            "epi/shell",
            "epi/patch",
            "epi/themes",
            "epi/dnd",
            "epi/layers"
        ];

        return (mid.toLowerCase() in list) || ((mid.split("/").length > 2) && !dojo.some(amd, function (path) {
            return mid.indexOf(path) === 0;
        }));
    }

    return {
        resourceTags: {
            // Files that contain test code.
            test: function (filename, mid) {
                return false;
            },

            // Files that should be copied as-is without being modified by the build system.
            copyOnly: function (filename, mid) {
                return (copyOnly(mid) && !/\.css$/.test(filename)) || /Sleek\.css$/.test(filename);
            },

            // Files that are AMD modules.
            amd: function (filename, mid) {
                return !copyOnly(mid) && /\.js$/.test(filename);
            }
        },

        trees: [
            [".", ".", /(\/\.)|(~$)/]
        ]
    };
})();
