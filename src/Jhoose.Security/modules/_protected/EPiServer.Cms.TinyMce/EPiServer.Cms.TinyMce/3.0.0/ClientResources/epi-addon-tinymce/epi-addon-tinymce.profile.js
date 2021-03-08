var isTestRe = /\/test\//;

/*eslint no-unused-vars: "off"*/

var profile = {
    resourceTags: {
        test: function (filename, mid) {
            return isTestRe.test(filename);
        },

        miniExclude: function (filename, mid) {
            return /\/(?:test|demos)\//.test(filename);
        },

        amd: function (filename, mid) {
            return /\.js$/.test(filename);
        }
    }
};
