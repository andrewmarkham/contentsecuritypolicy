define("epi-cms/request/contentLanguage", ["dojo/Deferred", "dojo/when", "epi/dependency"], function (Deferred, when, dependency) {

    return {
        // summary:
        //      Request mutator for adding the currently selected content language to an xhr request
        // tags:
        //      internal

        beforeSend: function (params) {
            // summary:
            //      Adds X-EPiContentLanguage to the headers for the request
            // description:
            //      Sets the X-EPiContentLanguage header with the currently selected content language in the
            //      epi/shell/Profile. The header is not added if the preventLocalizationHeader option is truthy.

            var deferred = new Deferred();

            var options = params.options;

            // Checking preventLocalizationHeader is redundant, but left for backwards compatibility
            if (!(options.preventLocalizationHeader || options.isProfileRequest)) {
                var profile = dependency.resolve("epi.shell.Profile");
                when(profile.getContentLanguage()).then(function (language) {
                    if (language) {
                        options.headers["X-EPiContentLanguage"] = language;
                    }
                    deferred.resolve(params);
                });
                return deferred.promise;
            }

            deferred.resolve(params);
            return deferred.promise;
        }
    };
});
