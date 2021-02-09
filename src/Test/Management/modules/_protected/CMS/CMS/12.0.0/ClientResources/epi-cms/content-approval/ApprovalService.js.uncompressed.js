define("epi-cms/content-approval/ApprovalService", [
    "dojo/topic",
    "dojo/when",
    "dojo/Deferred",

    "epi/shell/xhr/errorHandler",
    "epi/dependency"
], function (
    topic,
    when,
    Deferred,
    errorHandler,
    dependency) {

    function ApprovalService(approvalStore, approvalDefinitionStore) {
        // summary:
        //      A service for interacting with content approvals.
        // tags:
        //      internal

        this.approvalStore = approvalStore || dependency.resolve("epi.storeregistry").get("epi.cms.approval");
        this.approvalDefinitionStore = approvalDefinitionStore || dependency.resolve("epi.storeregistry").get("epi.cms.approval.definition");
    }

    // approvalStore: [readonly] Store
    //      A REST store for saving and loading approval
    ApprovalService.prototype.approvalStore = null;

    // approvalDefinitionStore: [readonly] Store
    //      A REST store for saving and loading approval definitions
    ApprovalService.prototype.approvalDefinitionStore = null;

    ApprovalService.prototype.getApproval = function (contentLink) {
        // summary:
        //      Gets the approval for the given content link.
        // tags:
        //      public

        return when(this.approvalStore.get(contentLink)).otherwise(function () {
            // If the approval doesn't exist then return null.
            return null;
        });
    };

    ApprovalService.prototype.approveChanges = function (approvalId, activeStepIndex, approveReason) {
        // summary:
        //      Approves the changes for the given approval
        // tags:
        //      public

        return errorHandler.wrapXhr(this.approvalStore.executeMethod("ApproveChanges", approvalId, {
            activeStepIndex: activeStepIndex,
            approveReason: approveReason
        }));
    };

    ApprovalService.prototype.forceCompleteApproval = function (approvalId, forceReason) {
        // summary:
        //      Force completes an approval instance as approved.
        // tags:
        //      public

        return errorHandler.wrapXhr(this.approvalStore.executeMethod("ForceComplete", approvalId, {forceReason: forceReason}));
    };

    ApprovalService.prototype.rejectChanges = function (approvalId, activeStepIndex, rejectReason) {
        // summary:
        //      Rejects the changes for the given approval
        // tags:
        //      public

        return errorHandler.wrapXhr(this.approvalStore.executeMethod("RejectChanges", approvalId, {
            activeStepIndex: activeStepIndex,
            rejectReason: rejectReason
        }));
    };

    ApprovalService.prototype.cancelChanges = function (approval) {
        // summary:
        //      Cancels the changes for the given approval
        // tags:
        //      public

        return errorHandler.wrapXhr(this.approvalStore.executeMethod("CancelChanges", approval.id));
    };

    ApprovalService.prototype.commentChanges = function (approvalId, comment) {
        // summary:
        //      Adds a comment to the review request
        // tags:
        //      public
        return errorHandler.wrapXhr(this.approvalStore.executeMethod("CommentChanges", approvalId, {
            comment: comment
        }));
    };

    ApprovalService.prototype.getDefinition = function (contentLink) {
        // summary:
        //      Gets the approval definition for the given content link.
        // tags:
        //      public

        return when(this.approvalDefinitionStore.get(contentLink)).otherwise(function () {
            // If the approval definition doesn't exist then return null.
            return null;
        });
    };

    ApprovalService.prototype.getApprovalRelatedDefinition = function (contentLink) {
        // summary:
        //      Gets the approval definition which belongs to the currently running approval for given content link.
        // tags:
        //      public

        return when(this.approvalDefinitionStore.query({
            id: contentLink,
            getApprovalRelatedDefinition: true
        })).otherwise(function () {
            // If the approval definition doesn't exist then return null.
            return null;
        });
    };

    ApprovalService.prototype.navigateToDefinition = function (contentLink) {
        // summary:
        //      Navigates to the definition for the given content link
        // tags:
        //      public

        topic.publish("/epi/shell/context/request",
            {uri: "epi.cms.approval:///" + contentLink},
            {sender: null});
    };

    ApprovalService.prototype.hasDefinition = function (contentLink) {
        // summary:
        //      Determines whether an approval definition has been created or inherited for the
        //      given content link.
        // tags:
        //      public

        return this.getDefinition(contentLink).then(function (definition) {
            // If a definition exists but has no id then it is the default empty definition.
            return definition !== null && definition.id !== 0;
        });
    };

    ApprovalService.prototype.saveDefinition = function (definition) {
        // summary:
        //      Saves the approval definition.
        // tags:
        //      internal

        if (!definition) {
            return new Deferred().reject();
        }

        return errorHandler.wrapXhr(this.approvalDefinitionStore.put(definition));
    };

    ApprovalService.prototype.deleteDefinition = function (contentLink) {
        // summary:
        //      Deletes the approval definition.
        // tags:
        //      internal

        return errorHandler.wrapXhr(this.approvalDefinitionStore.remove(contentLink));
    };

    ApprovalService.prototype.inheritDefinition = function (contentLink) {
        // summary:
        //      Deletes the approval definition for given contentLink and returns its ancestor's definition.
        // returns: Promise
        //      A promise that resolves to the parent approval definition
        // tags:
        //      internal

        return errorHandler.wrapXhr(this.approvalDefinitionStore.executeMethod("Inherit", contentLink));
    };

    return ApprovalService;
});
