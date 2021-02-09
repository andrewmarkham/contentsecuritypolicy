define("epi-cms/project/ProjectModeRequestInterceptor", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dijit/Destroyable",

    "epi/dependency"
],
function (
    declare,
    lang,
    Deferred,
    Destroyable,
    dependency) {

    return declare([Destroyable], {
        // summary:
        //      Request interceptor that adds the current project id to all render requests if project mode is enabled
        // tags:
        //      internal

        constructor: function (params) {
            declare.safeMixin(this, params);

            this.projectService = this.projectService || dependency.resolve("epi.cms.ProjectService");

            this.contextService = this.contextService || dependency.resolve("epi.shell.ContextService");
            this.own(this.contextService.registerRequestInterceptor(lang.hitch(this, this._onInterceptRequest)));
        },

        _onInterceptRequest: function (contextParams) {
            // summary:
            //      Request interceptor that adds the current project id to all render requests if project mode is enabled
            // tags:
            //      private

            var dfd = new Deferred();

            // If project mode is enabled we want to add the current project id to all render requests
            if (!this.projectService.isProjectModeEnabled) {
                dfd.resolve();
            } else {
                this.projectService.getCurrentProject().then(function (project) {
                    if (project) {
                        contextParams.epiprojects = project.id;
                        contextParams.epieditmode = true;
                    }
                }).always(dfd.resolve);
            }

            return dfd.promise;
        }
    });
});
