define("epi-cms/widget/viewmodel/ContentStatusViewModel", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/lang",
    "dojo/when",
    "dojo/promise/all",
    "dojo/Stateful",

    // epi
    "epi/dependency",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/shell/_ContextMixin",
    "epi-cms/ContentLanguageHelper",

    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.versionstatus"
],
function (
// dojo
    array,
    declare,
    Deferred,
    lang,
    when,
    all,
    Stateful,

    // epi
    dependency,
    ContentActionSupport,
    _ContextMixin,
    ContentLanguageHelper,

    // resources
    versionStatusResources
) {

    return declare([Stateful, _ContextMixin], {
        // tags:
        //      internal

        _contentStructureStore: null,

        // autoLoadStatus: [Boolean]
        //      Set it to true of the status information should be automatically loaded when the contentLink is set
        // tags:
        //      public
        autoLoadStatus: false,

        // statusIcon: [String]
        //      Store content status icon classes
        // tags:
        //      public
        statusIcon: null,

        // statusMessage: [Object]
        //      Store content status message.
        //      Can be [String] or [Array] data type.
        // tags:
        //      public
        statusMessage: null,

        // contentLink: [String]
        //      The content link.
        // tags:
        //      public
        contentLink: null,

        constructor: function () {
            this._statusIconMap = {
                // Not created icon CSS classes
                0: ["epi-statusIndicatorIcon", "epi-statusIndicator0"],
                // Rejected icon CSS classes
                1: ["epi-statusIndicatorIcon", "epi-statusIndicator1"],
                // Checked-out icon CSS classes
                2: ["epi-statusIndicatorIcon", "epi-statusIndicator2"],
                // Checked-in icon CSS classes
                3: ["epi-statusIndicatorIcon", "epi-statusIndicator3"],
                // Published icon CSS classes
                4: ["epi-statusIndicatorIcon", "epi-statusIndicator4"],
                // Previously published icon CSS classes
                5: ["epi-statusIndicatorIcon", "epi-statusIndicator5"],
                // Delayed publish icon CSS classes
                6: ["epi-statusIndicatorIcon", "epi-statusIndicator6"],
                // Awaiting approval icon CSS classes
                7: ["epi-statusIndicatorIcon", "epi-statusIndicator7"],
                // Expired icon CSS classes
                100: ["epi-statusIndicatorIcon", "epi-statusIndicator100"]
            };

            this._statusMessageMap = {
                // Not created message
                0: versionStatusResources.notcreated,
                // Rejected message
                1: versionStatusResources.rejected,
                // Checked-out message
                2: versionStatusResources.checkedout,
                // Checked-in message
                3: versionStatusResources.checkedin,
                // Published message
                4: versionStatusResources.published,
                // Previously published message
                5: versionStatusResources.previouslypublished,
                // Delayed publish message
                6: versionStatusResources.delayedpublish,
                // Awaiting approval
                7: versionStatusResources.awaitingapproval,
                // Expired message
                100: versionStatusResources.expired
            };
        },

        postscript: function () {
            this.inherited(arguments);

            this._contentStructureStore = this._contentStructureStore || dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
        },

        loadStatus: function () {
            // summary:
            //      Loads the status for the current contentLink
            // tags:
            //      public
            if (!this.contentLink) {
                return;
            }
            when(this.getCurrentContext(), lang.hitch(this, function (ctx) {
                //- Using refresh instead get function to load content link
                //- Do not want use cache in this case
                when(this._contentStructureStore.refresh(this.contentLink), lang.hitch(this, function (contentInfo) {
                    if (contentInfo && contentInfo.status !== undefined) {
                        this.set("content", contentInfo);
                    }
                }));
            }));
        },

        _contentLinkSetter: function (/* String */contentLink) {
            // summary:
            //      Content Link setter
            // contentLink: [String]

            if (!contentLink) {
                return;
            }

            this.contentLink = contentLink;

            if (this.autoLoadStatus) {
                this.loadStatus();
            }
        },

        _isDeletedGetter: function () {
            return this.get("content") && this.get("content").isDeleted;
        },

        _isTranslationNeededGetter: function () {
            return this.get("content") && this.get("content").missingLanguageBranch && this.get("content").missingLanguageBranch.isTranslationNeeded;
        },

        _missingLanguageBranchGetter: function () {
            return this.get("content") && this.get("content").missingLanguageBranch;
        },

        _contentSetter: function (content) {
            this.content = content;

            this.set("contentStatus", content.status);
        },

        _contentStatusSetter: function (status) {
            this.contentStatus = status;

            if (!status) {
                return;
            }

            this.set("statusIcon", this._statusIconMap[status]);

            return when(this._getStatusMessage(), lang.hitch(this, function (message) {
                return this.set("statusMessage", message);
            }));
        },

        _getStatusMessage: function () {
            // summary:
            //      Get content version status message.
            //      Override this function to customize content status message.
            // tags:
            //      protected

            //If the content is deleted return version not found
            if (this.get("isDeleted")) {
                return versionStatusResources.versionnotfound;
            }
            if (this.get("isTranslationNeeded")) {
                return ContentLanguageHelper.getMissingLanguageMessage(this.content);
            }

            if (this.get("isVisibleOnSite")) {
                return null;
            }
            return this._statusMessageMap[this.get("contentStatus")];
        },

        _isVisibleOnSiteGetter: function () {
            // summary:
            //      Allow create additional information area or not.
            //      Based on content version status.
            // status: [Integer]
            //      Content status
            // tags:
            //      public

            var missingLanguageBranch = this.get("missingLanguageBranch");
            if (this.get("isDeleted") || missingLanguageBranch && missingLanguageBranch.reason === 6) {
                return false;
            }

            return this.get("contentStatus") === ContentActionSupport.versionStatus.Published;
        }
    });
});
