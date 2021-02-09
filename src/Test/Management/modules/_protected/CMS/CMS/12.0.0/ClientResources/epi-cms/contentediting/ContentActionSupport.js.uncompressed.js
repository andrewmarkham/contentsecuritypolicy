define("epi-cms/contentediting/ContentActionSupport", [
// resources
    "epi/i18n!epi/cms/nls/episerver.cms.versionstatus"
],

function (
// resources
    res
) {

    var versionLocalizations = {},
        actionSupport;

    if (res) {
        versionLocalizations = {
            0: res.notcreated,
            1: res.rejected,
            2: res.checkedout,
            3: res.checkedin,
            4: res.published,
            5: res.previouslypublished,
            6: res.delayedpublish,
            7: res.awaitingapproval,
            100: res.expired
        };
    }

    actionSupport = {
        // summary:
        //    This class helps dealing with the content data structure:
        //      * decode the access level mask provided by content data store
        //      * determine if an action is supported for a given version statuse
        // tags:
        //    public static

        // versionStatus: [public readonly] Object
        //      Version status codes used in contentContext.status
        versionStatus: {
            NotCreated: 0,
            Rejected: 1,
            CheckedOut: 2,
            CheckedIn: 3,
            Published: 4,
            PreviouslyPublished: 5,
            DelayedPublish: 6,
            AwaitingApproval: 7,
            Expired: 100
        },

        // versionLocalizations: [internal readonly] Object
        //      Version translations
        versionLocalizations: versionLocalizations,

        getVersionStatus: function (status) {
            return this.versionLocalizations[status];
        },

        // action: [public readonly] Object
        //      Known actions on a contentData object
        action: {
            Create: "Create",
            Edit: "Edit",
            Delete: "Delete",
            CheckIn: "CheckIn",
            Save: "Save",
            Reject: "Reject",
            Publish: "Publish",
            Administer: "Administer"
        },

        // accessLevel: [public readonly] Object
        //      Access level components of the contentContext.accessMask bitmask.
        accessLevel: {
            NoAccess: 0,
            Read: 1,
            Create: 2,
            Edit: 4,
            CheckIn: 4,
            Delete: 8,
            Publish: 16,
            Administer: 32,
            FullAccess: 63
        },

        // saveAction: [public readonly] Object
        //      Options available when saving content
        saveAction: {
            /// Do not save data.
            None: 0x0,
            /// Save a page, leaving it in a checked out state.
            Save: 0x1,
            /// Save and check in page, creating a new version only if necessary.
            CheckIn: 0x2,
            /// Publish page, creating a new version only if necessary.
            Publish: 0x3,
            /// Reject a checked-in page.
            Reject: 0x4,
            /// Sets a content instance to approval state.
            RequestApproval: 0x5,
            /// Sets a content instance in checked out/draft state.
            CheckOut: 0x6,
            /// Schedules a version for publishing.
            Schedule: 0x7,
            /// Flag that is used to force the creation of a new version.
            ForceNewVersion: 0x80,
            /// Save and check in page, always updating the current version
            ForceCurrentVersion: 0x100,
            /// Does not validate the data against <see cref:"EPiServer.Validation.IValidationService"/>
            SkipValidation: 0x200,
            /// Save and check in page, creating a new version only if necessary and sets the content as delayed publish.
            DelayedPublish: 0x400
        },

        // sortOrder: [public readonly] Object
        //      Sort order of contentData, need to verify when change
        sortOrder: {
            None: 0,
            CreatedDescending: 1,
            CreatedAscending: 2,
            Alphabetical: 3,
            Index: 4,
            ChangedDescending: 5,
            Rank: 6,
            PublishedAscending: 7,
            PublishedDescending: 8
        },

        // providerCapabilities: [public readonly] Object
        //      Capabilities bitmask of a content provider
        providerCapabilities: {
            None: 0,
            Create: 1,
            Edit: 2,
            Delete: 4,
            Move: 8,
            Copy: 16,
            MultiLanguage: 32,
            Security: 64,
            Search: 128,
            PageFolder: 256,
            Wastebasket: 512
        },


        isActionAvailable: function (contentData, actionType, providerCapabilityType, skipMissingLanguageCheck, skipLanguageAccess) {
            // summary:
            //    Returns true if the given action type is authorized and represents an allowed state transition for the given contentData context.
            //    This also checks for the capability of content provider whether is configured to allow the action.
            //    If the specified contentData has the missingLanguageBranch property set it will return false.
            // tags:
            //    public

            return actionSupport.hasAccessToAction(contentData, actionType, providerCapabilityType, skipMissingLanguageCheck, skipLanguageAccess) &&
                   actionSupport.canPerformAction(contentData, actionType);

        },

        hasAccessToAction: function (contentData, actionType, providerCapabilityType, skipMissingLanguageCheck, skipLanguageAccess) {
            // summary:
            //    Returns true if the given action type is authorized and the capability of content provider
            //    whether is configured to allow the action.
            //    If the specified contentData has the missingLanguageBranch property set it will return false.
            // tags:
            //    internal

            var access;

            if (!contentData) {
                return false;
            }

            if (!skipMissingLanguageCheck && contentData.capabilities && contentData.capabilities.language && contentData.missingLanguageBranch && contentData.missingLanguageBranch.isTranslationNeeded) {
                return false;
            }

            if (providerCapabilityType && !actionSupport.hasProviderCapability(contentData.providerCapabilityMask, providerCapabilityType)) {
                return false;
            }

            access = skipLanguageAccess ? contentData.accessRights : contentData.accessMask;

            return actionSupport.hasAccess(access, actionSupport.accessLevel[actionType]);
        },

        canPerformAction: function (contentContext, actionType) {
            // summary:
            //    Returns true if the action represents an allowed state transition.
            // tags:
            //    public

            var contentStatus = contentContext.status,
                versionStatus = actionSupport.versionStatus;

            // If the content is scheduled for published, we considered it locked for edit.
            if (contentStatus === versionStatus.DelayedPublish &&
               (actionType === actionSupport.action.Edit || actionType === actionSupport.action.Publish)) {
                return false;
            }

            if (actionType === actionSupport.action.Publish) {
                // we can publish everything that's not already published or expired
                return !(contentStatus === versionStatus.Published ||
                    contentStatus === versionStatus.Expired);
            }
            if (actionType === actionSupport.action.CheckIn) {
                // we can make "not ready" (checkedout) or rejected content "ready to publish" (checkedin)
                return contentStatus === versionStatus.CheckedOut ||
                    contentStatus === versionStatus.Rejected;
            }
            if (actionType === actionSupport.action.Edit) {
                var readonlyVersion =
                    (contentStatus === versionStatus.Published && !contentContext.isCommonDraft) ||
                    (contentStatus === versionStatus.Expired && !contentContext.isCommonDraft) ||
                    contentStatus === versionStatus.PreviouslyPublished ||
                    (contentStatus === versionStatus.CheckedIn && !contentContext.isPartOfAnotherProject) ||
                    contentStatus === versionStatus.DelayedPublish ||
                    contentStatus === versionStatus.AwaitingApproval;

                return !(readonlyVersion || contentContext.isDeleted || contentContext.isWastebasket);
            }
            return true;
        },

        hasAccess: function (accesLevelMask, requiredAccessLevel) {
            // summary:
            //    Returns true if the required access is part of the given access mask.
            //    The access mask can be accessed from a contentData context or lightweight contentData object.
            // tags:
            //    public
            return (accesLevelMask & requiredAccessLevel) === requiredAccessLevel;
        },

        hasLanguageAccess: function (item) {
            // summary:
            //      Verify the current content have access with the given language or not
            // context: Object
            //      A content data or context object
            // tags:
            //      public

            if (!item) {
                return false;
            }

            // Get the language information from either the context or the content data since we don't know what type we have.
            var language = item.languageContext || item.missingLanguageBranch || item;

            return !language || (language.hasTranslationAccess && language.isPreferredLanguageAvailable); // Boolean
        },

        getPermissionMap: function (accesLevelMask) {
            // summary:
            //    Maps the given access mask onto an object, for example:
            //    { Read:true, Edit:true, Delete:false, Publish:false, Administer:false }
            // tags:
            //    public

            var map = {};
            for (var al in actionSupport.accessLevel) {
                map[al] = actionSupport.hasAccess(accesLevelMask, actionSupport.accessLevel[al]);
            }
            return map;
        },

        hasProviderCapability: function (providerCapabilityMask, requiredCapability) {
            // summary:
            //     Returns true if the required capability is part of the given content provider capability mask.
            // tags:
            //    public

            return (providerCapabilityMask & requiredCapability) === requiredCapability;
        }
    };
    return actionSupport;
});
