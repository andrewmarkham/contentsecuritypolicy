define("epi-cms/content-approval/ApprovalEnums", {
    // summary:
    //      A collection of enums reflecting the server side enums.
    // tags:
    //      internal

    definitionStatus: {
        // summary:
        //      The status of an ApprovalDefinitionViewModel.
        //      Matches EPiServer.Cms.Shell.UI.Rest.Approvals.Internal.ApprovalDefinitionStatus.
        // tags:
        //      internal
        enabled: 0,
        disabled: 1,
        inherited: 2
    },

    reviewerType: {
        // summary:
        //      Specifies the type of reviewer.
        //      Matches EPiServer.Approvals.ApprovalDefinitionReviewerType.
        // tags:
        //      internal
        user: 0,
        role: 1
    },

    status: {
        // summary:
        //      The approval instance is in review.
        //      Matches EPiServer.Approvals.ApprovalDefinitionReviewerType
        // tags:
        //      internal
        inReview: 0,
        approved: 1,
        rejected: 2
    }
});
