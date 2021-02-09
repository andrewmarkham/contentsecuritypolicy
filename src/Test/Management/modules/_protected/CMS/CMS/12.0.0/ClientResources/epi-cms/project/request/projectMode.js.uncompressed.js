define("epi-cms/project/request/projectMode", [
    "dojo/Deferred",
    "dojo/when",
    "epi/dependency"
], function (Deferred, when, dependency) {

    return {
        // summary:
        //      Request mutator for adding the currently selected project to the an xhr request
        // description:
        //      Sets the X-EPiCurrentProject header with the currently selected project id as returned
        //      from the epi.cms.ProjectService. The header is not added if the isProfileRequest option
        //      is truthy or the project service isn't registered in the dependency resolver.
        // tags:
        //      internal

        _getCurrentProjectId: function () {
            var serviceId = "epi.cms.ProjectService";
            if (dependency.exists(serviceId)) {
                var projectService = dependency.resolve(serviceId);
                return projectService.getCurrentProjectId();
            }
            return when(null);
        },

        beforeSend: function (params) {
            // summary:
            //      Adds X-EPiCurrentProject to the options.headers of the request parameters.
            // params: Object
            //      The request parameters
            // tags: public

            var options = params.options;
            if (options.isProfileRequest) {
                return when(params);
            }

            var result = new Deferred();
            this._getCurrentProjectId().then(function (projectId) {
                if (projectId) {
                    options.headers["X-EPiCurrentProject"] = projectId;
                }
            }).otherwise(function (err) {
                console.error("Failed to get current project id from project service", err);
            }).always(function () {
                // Log the error but don't stop the request
                result.resolve(params);
            });

            return result.promise;
        }
    };

});
