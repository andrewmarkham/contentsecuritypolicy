define("epi/RequireModule", [
    "epi/obsolete",
    "dojo/when",
    "epi/dependency"
], function (
    obsolete,
    when,
    dependency
) {
    return {
        // tags:
        //      internal deprecated

        load: function (/*String*/id, /*function*/require, /*function*/load) {

            obsolete("epi/RequireModule", "Use epi/ModuleManager instead", "12");

            var moduleManager = dependency.resolve("epi.ModuleManager");

            when(moduleManager.startModules(id), function () {

                return load(moduleManager.getModule(id));
            });
        }
    };
});
