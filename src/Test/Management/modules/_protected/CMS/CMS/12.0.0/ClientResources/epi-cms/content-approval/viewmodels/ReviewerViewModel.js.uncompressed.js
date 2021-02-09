define("epi-cms/content-approval/viewmodels/ReviewerViewModel", [
    "dojo/_base/declare",
    "dojo/Stateful",
    "dojox/html/entities",
    "epi-cms/content-approval/ApprovalEnums"
], function (
    declare,
    Stateful,
    htmlEntities,
    ApprovalEnums
) {
    return declare([Stateful], {
        // summary:
        //      The view model for a reviewer.
        // tags:
        //      internal

        // displayName: [public] String
        //      The displayName for the reviewer.
        displayName: null,

        // name: [public] String
        //      The name for the reviewer.
        name: null,

        // type: [readonly] epi-cms/content-approval/ApprovalDefinitionReviewerType
        //      Specifies the type of reviewer.
        reviewerType: ApprovalEnums.reviewerType.user,

        // numberOfUsers: [public] Number
        //      Total number of group members
        //      Property relevent only for ApprovalEnums.reviewerType.role
        numberOfUsers: 0,

        // numberOfRoleUsersExceededMax: [public] Boolean
        //      True when numberOfUsers exceeded ApprovalMaxRoleUsers
        //      Property relevent only for ApprovalEnums.reviewerType.role
        numberOfRoleUsersExceededMax: false,

        // roleFirstUsersNames: [public] array
        //      List of first 10 users from the group
        //      Property relevent only for ApprovalEnums.reviewerType.role
        roleFirstUsersNames: [],

        postscript: function () {
            this.inherited(arguments);

            if (this.roleInfo != null) {
                this.set("numberOfUsers", this.roleInfo.totalNumberOfUsers);
                this.set("roleFirstUsersNames", this.roleInfo.userNames);
                this.set("numberOfRoleUsersExceededMax", this.roleInfo.numberOfRoleUsersExceededMax);
                this.set("displayNameUsersLimit", this.roleInfo.displayNameUsersLimit);
            }
        },

        _numberOfOtherUsersGetter: function () {
            if (!this.roleFirstUsersNames) {
                return this.numberOfUsers;
            }

            return this.numberOfUsers - this.roleFirstUsersNames.length;
        },

        _displayNameGetter: function () {
            var displayName = this.displayName;
            if (this.reviewerType === ApprovalEnums.reviewerType.role) {
                displayName += " (" + this.displayNameUsersLimit;
                if (this.numberOfRoleUsersExceededMax) {
                    displayName += "+";
                }
                displayName += ")";
            }
            return htmlEntities.encode(displayName);
        },

        _roleFirstUsersNamesGetter: function () {
            if (!this.roleFirstUsersNames || this.roleFirstUsersNames.length === 0) {
                return [];
            }
            return this.roleFirstUsersNames.map(function (roleFirstUsersName) {
                return htmlEntities.encode(roleFirstUsersName);
            });
        },

        // languages: [public] Array
        //      Languages that this reviewer can approve.
        languages: null,

        // canApprove: [public] Boolean
        //      Indicates if the reviewer can approve the selected language.
        canApprove: true,

        serialize: function () {
            // summary:
            //      Serialize reviewer
            // tags:
            //      public

            return {
                name: this.name,
                displayName: this.displayName,
                languages: this.languages,
                reviewerType: this.reviewerType
            };
        },

        _iconGetter: function () {
            // summary:
            //     Returns the icon for current reviewer
            // tags:
            //      private
            return this.reviewerType === ApprovalEnums.reviewerType.role ? "epi-iconUsers" : "epi-iconUser";
        }

    });
});
