define("epi-cms/contentediting/CreateLanguageBranch", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    // epi
    "epi-cms/contentediting/CreateContent",
    "epi-cms/contentediting/viewmodel/CreateLanguageBranchViewModel"
],

function (
// dojo
    declare,
    lang,
    // epi
    CreateContent,
    CreateLanguageBranchViewModel
) {

    return declare([CreateContent], {
        // summary:
        //      Widget for language branch creation.
        // tags:
        //      internal xproduct

        modelType: CreateLanguageBranchViewModel,

        _setCreateMode: function () {
            // summary:
            //      Set create new content state for current mode
            // tags:
            //      protected extension

            lang.mixin(this._contextService.currentContext, {
                currentMode: "translate"
            });
        }

    });

});
