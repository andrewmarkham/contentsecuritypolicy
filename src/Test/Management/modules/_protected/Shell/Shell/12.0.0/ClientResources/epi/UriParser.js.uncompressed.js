define("epi/UriParser", ["dojo", "epi"], function (dojo, epi) {
    return dojo.declare(null, {
        // tags:
        //      public

        constructor: function (uri) {
            var ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$");

            var r = uri.match(ore);

            if (!this.scheme) {
                this.scheme = r[2] || (r[1] ? "" : null);
            }

            if (!this.authority) {
                this.authority = r[4] || (r[3] ? "" : null);
            }

            if (!this.path) {
                this.path = r[5]; // can never be undefined
            }
        },

        getModuleArea: function () {
            return this.scheme.split(".")[1];
        },

        getStoreName: function () {
            return this.scheme.split(".")[2];
        },

        getType: function () {
            return this.scheme;
        },

        getId: function () {
            return this.path.substr(1);
        },

        toString: function () {
            return this.scheme + "://" + this.authority + this.path;
        }
    });
});
