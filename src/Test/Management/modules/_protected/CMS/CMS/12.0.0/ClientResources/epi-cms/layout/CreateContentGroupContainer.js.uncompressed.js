define("epi-cms/layout/CreateContentGroupContainer", [
    "dojo/_base/declare",
    "dojo/dom-construct",
    "epi/shell/layout/SimpleContainer"
], function (
    declare,
    domConstruct,
    SimpleContainer) {

    return declare([SimpleContainer], {
        // summary:
        //     Group container that have a title.
        //
        // tags:
        //      internal

        templateString: "<div class='epi-containerLayout clearfix'>\
                            <div class='epi-formsHeaderContainer'>\
                                <h2>${title}</h2>\
                            </div>\
                            <ul data-dojo-attach-point='containerNode'></ul>\
                        </div>"
    });
});
