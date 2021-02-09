define("epi-cms/contentediting/editors/ContentBlockEditorViewModel", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",

    // EPi
    "epi-cms/widget/viewmodel/ContentStatusViewModel"
], function (

    // Dojo
    declare,
    lang,
    Stateful,

    // EPi
    ContentStatusViewModel

) {
    return declare([Stateful, ContentStatusViewModel], {
        // tags:
        //      internal

        contentLink: "",
        contentGroup: "",
        roleIdentities: null,

        selected: false,
        name: "",
        index: 0,

        getValue: function () {
            return {
                contentLink: this.contentLink,
                name: this.name,
                contentGroup: this.contentGroup,
                roleIdentities: this.roleIdentities
            };
        }
    });
});
