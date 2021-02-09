define("epi-cms/content-approval/Breadcrumb", [
// dojo
    "dojo/_base/declare",
    "dojo/topic",
    // epi
    "epi/dependency",
    "epi-cms/widget/Breadcrumb"
],
function (declare, topic, dependency, Breadcrumb) {
    return declare([Breadcrumb], {
        // summary:
        //      Widget used to show the content's path in the strucuture
        //      and when the user clicks on a node it will load the approval definition for that content item
        //
        // tags:
        //      internal

        postscript: function () {
            this.inherited(arguments);

            this.approvalService = this.approvalService || dependency.resolve("epi.cms.ApprovalService");
        },
        onNodeClick: function (e, content) {
            // summary:
            //      Load the approval context for the clicked content item
            // e: Object
            //      The mouse event object.
            // content: Object
            //      The content object.
            // tags:
            //      protected

            e.preventDefault();

            this.approvalService.navigateToDefinition(content.contentLink);
        }
    });
});
