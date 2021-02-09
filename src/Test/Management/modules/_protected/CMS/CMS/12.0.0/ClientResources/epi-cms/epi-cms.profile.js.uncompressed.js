// This function is used to determine whether or not a resource should be tagged as copy-only.
function copyOnly(mid) {
    var list = {
        "epi-cms/epi.cms.profile": 1,
        "epi-cms/package.json": 1,
        "epi-cms/communicationinjector": 1,
        "epi-cms/edit-region-observer": 1
    };
    return (mid.toLowerCase() in list);
}

function isAmd(filename) {
    return (/\.js$/).test(filename);
}

var profile = {

    resourceTags: {
        // Files that contain test code.
        test: function (filename, mid) {
            return false;
        },

        // Files that should be copied as-is without being modified by the build system.
        copyOnly: function (filename, mid) {
            return copyOnly(mid);
        },

        // Files that are AMD modules.
        amd: function (filename, mid) {
            return !copyOnly(mid) && isAmd(filename);
        }
    },

    trees: [
        [".", ".", /(\/\.)|(~$)/]
    ]
};
