define("epi-cms/project/CreateNewDraftConfirmationDialog", [
// dojo
    "dojo/_base/declare",
    "dojo/string",

    //dgrid
    "dgrid/Grid",

    // epi
    "epi/shell/widget/dialog/Confirmation",
    "epi/string",

    // epi-cms
    "epi-cms/dgrid/listItemFormatters",
    "epi-cms/dgrid/formatters",

    // Resources
    "epi/i18n!epi/nls/episerver.shared",
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.newdraftconfirmation"
], function (
// dojo
    declare,
    string,

    //dgrid
    Grid,

    // epi
    Confirmation,
    epiString,

    // epi-cms
    listItemFormatters,
    formatters,

    // Resources
    sharedResources,
    confirmationResources
) {
    return declare([Confirmation], {
        // summary:
        //      Confirmation dialog asking the user if a new draft should be created
        // tags:
        //      internal xproduct

        // projectItems: [readonly] Array
        //      The conflicting project items
        projectItems: null,

        // contentReferences: [readonly] Array
        //      All content references that is going to be added
        contentReferences: null,

        title: confirmationResources.allreadypartofproject,

        cancelActionText: sharedResources.action.cancel,

        dialogClass: "epi-dialog-contentReferences epi-contentReferences",

        setFocusOnConfirmButton: false,

        buildRendering: function () {
            this.inherited(arguments);

            var gridSettings = {
                showHeader: true,
                "class": "epi-plain-grid epi-plain-grid--no-border",
                columns: {
                    name: {
                        sortable: false,
                        label: sharedResources.header.name,
                        className: "epi-grid--30 epi-cursor--default",
                        renderCell: function (object, value, node, options) {
                            //Create a tooltip in the format: "Alloy Meet, ID: 20_2"
                            // The title gets encoded in the formatters.contentItem function
                            var title = object.name + ", ID: " + object.contentLink;
                            node.innerHTML = listItemFormatters.statusFormatter(formatters.contentItem(object.typeIdentifier, "", value, title), object, node, options);
                        }
                    },
                    path: {
                        sortable: false,
                        label: confirmationResources.path,
                        className: "epi-grid--40 epi-cursor--default",
                        formatter: formatters.path
                    },
                    projectName: {
                        sortable: false,
                        className: "epi-grid--30 epi-cursor--default",
                        label: confirmationResources.project,
                        renderCell: function (object, value, node, options) {
                            node.textContent  = object.projectName;
                        }
                    }
                }
            };

            this.own(this.content = new declare([Grid])(gridSettings));
            this.content.renderArray(this.projectItems);

            this.set("description", string.substitute(confirmationResources.confirmationtext, [this.projectItems.length, this.contentReferences.length]));
            this.set("confirmActionText", this.projectItems.length === 1 ? confirmationResources.addnewdraft : confirmationResources.addnewdrafts);
        },

        _size: function () {
            this.inherited(arguments);
            this.content.resize();
        }
    });
});
