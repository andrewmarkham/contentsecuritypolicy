define("epi-cms/content-approval/viewmodels/ApprovalStepViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    // Epi
    "epi-cms/content-approval/viewmodels/ReviewerViewModel",
    // Parent class
    "dojo/Stateful",
    "dojo/Evented",
    "epi/shell/DestroyableByKey",
    // Commands
    "epi-cms/content-approval/command/AddApprovalStep",
    "epi-cms/content-approval/command/RemoveApprovalStep",
    "epi-cms/content-approval/ApprovalEnums",
    // Store modules
    "dojo/store/Memory",
    "dojo/store/Observable",
    //Resources
    "epi/i18n!epi/nls/episerver.cms.contentapproval"
], function (
    declare,
    lang,

    // Epi
    ReviewerViewModel,
    // Parent class
    Stateful,
    Evented,
    DestroyableByKey,
    // Commands
    AddApprovalStep,
    RemoveApprovalStep,
    ApprovalEnums,
    // Store modules
    Memory,
    Observable,
    //Resources
    localization
) {

    return declare([Stateful, DestroyableByKey, Evented], {
        // summary:
        //      The view model for an approval step.
        // tags:
        //      internal

        // reviewers: [public] Store
        //      Reviewers for the approval step.
        reviewers: null,

        // commands: [public] Array
        //      An array of commands available for the approval step.
        commands: null,

        // userStore: [readonly] Store
        //      A REST store for fetching data for users
        userStore: null,

        // canBeDeleted: [public] Boolean
        //      Indicates if the approval step can be deleted
        canBeDeleted: true,

        // selfApprove: [public] Boolean
        //      Indicates if users can approve their own changes
        selfApprove: true,

        // isReadOnly: [readonly] Boolean
        //      Indicates if the approval step can be modified
        isReadOnly: false,

        // name: [public] String
        //      The name of the approval step that appears in the header.
        name: "",

        // isValid: [public] Boolean
        //      Indicates if the approval step can be saved
        isValid: true,

        // validationMessages: [readonly] Array[object]
        //      Holds the validation message when 'isValid' is false.
        validationMessages: [],

        // languages: [public] Array
        //      All the languages that is enable for the whole approval sequence
        languages: null,

        // showValidations: [public] Boolean
        //      Indicates if we are in a state where we want to show the validation messages.
        showValidations: false,

        addReviewer: function (reviewer) {
            // summary:
            //      Adds an reviewer.
            // reviewer: Object
            //      Reviewer to be added.
            // tags:
            //      public

            reviewer.languages = reviewer.languages || [];

            this.reviewers.add(this._createReviewer(reviewer));
        },

        filterOutExistingUsers: function (users) {
            // summary:
            //      Filters out existing users from the search result that
            //      is already in the reviewer list.
            // tags:
            //      public

            var reviewers = this.get("reviewers")
                .query();

            //Remove already added users/roles before displaying the
            //result so that we can't add them again
            return users = users.filter(function (user) {
                return !reviewers.some(function (reviewer) {
                    return (user.name.toLowerCase() === reviewer.name.toLowerCase() && user.reviewerType === reviewer.reviewerType);
                });
            }, this);
        },

        filterReviewers: function (selectedLanguage) {
            // summary:
            //      Filters out reviewers that cannot approve the given language.
            // tags:
            //      public

            this.reviewers.query().forEach(function (reviewer) {
                // Reviewer can approve when "All languages" is selected,
                // or the reviewer is set for all languages.
                if (selectedLanguage === null || reviewer.languages.length === 0) {
                    reviewer.set("canApprove", true);
                    return;
                }

                // Or an reviewer can only approve languages it's set up for.
                var canApprove = reviewer.languages.some(function (language) {
                    return language === selectedLanguage;
                });
                reviewer.set("canApprove", canApprove);
            });
        },

        createApprovalStep: function () {
            // summary:
            //      Emits event for creating new approval step
            // tags:
            //      public
            this.emit("create-step", this);
        },

        removeApprovalStep: function () {
            // summary:
            //      Emits event for deleting approval step
            // tags:
            //      public
            this.emit("remove-step", this);
        },

        removeReviewer: function (reviewer) {
            // summary:
            //      Removes reviewer by id
            // tags:
            //      public

            if (this.isReadOnly) {
                return;
            }

            this.reviewers.remove(this._getReviewerId(reviewer));
        },

        serialize: function () {
            // summary:
            //      Serialize approval step
            // tags:
            //      public

            var reviewers = this.reviewers.data.map(function (reviewer) {
                return reviewer.serialize();
            });

            return {
                name: this.name,
                reviewers: reviewers
            };
        },

        validate: function () {
            // summary:
            //      Checks if the approval step is valid and sets isValid and validationMessage.
            // tags:
            //      public

            if (!this.reviewers) {
                return;
            }

            var validationMessages = [],
                reviewers = this.reviewers.query(),
                validationMessage = this._validateReviewers(reviewers);

            if (validationMessage) {
                validationMessages.push(validationMessage);
            }

            validationMessage = this._validateLanguages(reviewers);
            if (validationMessage) {
                validationMessages.push(validationMessage);
            }

            validationMessage = this._validateSelfApprove(reviewers);
            if (validationMessage) {
                validationMessages.push(validationMessage);
            }

            validationMessage = this._validateRoles(reviewers);
            if (validationMessage) {
                validationMessages.push(validationMessage);
            }

            // validationMessage should be set before setting isValid as there might be watchers on isValid.
            this.set("validationMessages", validationMessages);
            this.set("isValid", validationMessages.length === 0);
        },

        hasErrors: function () {
            return this.validationMessages.some(function (validationMessage) {
                return validationMessage.level === "error";
            });
        },

        hasWarnings: function () {
            return this.validationMessages.some(function (validationMessage) {
                return validationMessage.level === "warning";
            });
        },

        _createReviewer: function (reviewer) {
            // summary:
            //      Creates ReviewerViewModel and hooking up language event that emits change event. Triggers validation.
            // tags:
            //      private
            var viewModel = new ReviewerViewModel(reviewer);
            viewModel.id = this._getReviewerId(reviewer); // id only used on client to uniquely identify the reviewer

            this.own(
                viewModel.watch("languages", function () {
                    this.validate();
                    this.emit("change");
                }.bind(this))
            );

            this.validate();
            return viewModel;
        },

        _getReviewerId: function (reviewer) {
            // summary:
            //      Returns the id of the reviewer by concatenate name and reviewer type
            // tags:
            //      protected
            return reviewer.name.toLowerCase() + ":" + reviewer.reviewerType;
        },

        _nameSetter: function (value) {
            // summary:
            //      Sets the name property and emit change event
            // tags:
            //      protected

            // If the value is null or undefined then set an empty string instead.
            value = value || "";

            if (value === this.name) {
                return;
            }
            this.name = value;
            this.emit("change");
        },

        _nameGetter: function () {
            // summary:
            //      Gets the name property if any exist; otherwise returns the placeholder.
            // tags:
            //      protected

            return this.name || localization.step.header.placeholder;
        },

        _reviewersSetter: function (reviewers) {
            // summary:
            //      Transforms a list of reviewers into ReviewerViewModels and creates an observable memory store
            //      and observe the store for changes. Triggers validation.
            // tags:
            //      protected

            var viewModels = reviewers.map(function (reviewer) {
                return this._createReviewer(reviewer);
            }, this);

            this.reviewers = Observable(new Memory({
                data: viewModels
            }));

            this.destroyByKey("reviewersObserveHandle");
            this.ownByKey("reviewersObserveHandle", this.reviewers.query().observe(function () {
                // Validate when reviewers change.
                this.validate();
                this.emit("change");
            }.bind(this)));

            // Validate when setting new reviewers.
            this.validate();
        },

        _selfApproveSetter: function (selfApprove) {
            // summary:
            //      Sets selfApprove property and triggers validation.
            // tags:
            //      protected

            this.selfApprove = selfApprove;
            this.validate();
        },

        _commandsGetter: function () {
            // summary:
            //      Lazy loads the commands associated with the approval step.
            // tags:
            //      protected

            if (this.commands === null) {
                this.commands = [
                    new AddApprovalStep({ model: this }),
                    new RemoveApprovalStep({ model: this })
                ];
            }
            return this.commands;
        },

        _validateLanguages: function (reviewers) {
            // summary:
            //      Validates if the approvalStep have reviewers in all languages and
            // returns:
            //      The validationMessage
            // tags:
            //      private

            var validationMessage = null;

            if (!this.languages || reviewers.length === 0) {
                return validationMessage;
            }

            var missingLanguages = [];
            this.languages.forEach(function (definitionLanguage) {
                var hasLanguageReviewers = reviewers.some(function (reviewer) {
                    //When the reviewer is set to approve all languages
                    if (reviewer.languages.length === 0) {
                        return true;
                    }

                    //Otherwise verify that it approves this current language.
                    return reviewer.languages.some(function (reviewerLanguage) {
                        return reviewerLanguage === definitionLanguage.value;
                    });
                });

                if (!hasLanguageReviewers) {
                    // validation message can contain multiple missing languages with the same localized error message
                    if (validationMessage) {
                        validationMessage.languages.push(definitionLanguage.value);
                    } else {
                        validationMessage = {
                            languages: [definitionLanguage.value],
                            level: "warning"
                        };
                    }
                    missingLanguages.push(definitionLanguage.text);
                }
            });

            if (validationMessage) {
                validationMessage.value = lang.replace(localization.validationmessage.notenoughlanguagesmessage.title, { languages: missingLanguages.join(", ") });
            }

            return validationMessage;
        },

        _validateSelfApprove: function (reviewers) {
            // summary:
            //      Validates when selfApprove is false, at least 2 users or 1 group is required
            // returns:
            //      The validationMessage
            // tags:
            //      private

            if (this.selfApprove !== false) {
                return null;
            }

            if (!this.languages) {
                if (reviewers.length === 1 && reviewers[0].reviewerType === ApprovalEnums.reviewerType.user) {
                    return {
                        value: localization.validationmessage.onlyonereviewer.title,
                        languages: null,
                        level: "warning"
                    };
                }
                return null;
            }

            var missingLanguages = this.languages.filter(function (language) {
                var reviewerCount = 0;
                reviewers.forEach(function (reviewer) {
                    if (reviewer.languages.length === 0 || reviewer.languages.indexOf(language.value) !== -1) {
                        if (reviewer.reviewerType === ApprovalEnums.reviewerType.user) {
                            reviewerCount++;
                        } else if (reviewer.reviewerType === ApprovalEnums.reviewerType.role) {
                            //Count a group as 2 users
                            reviewerCount += 2;
                        }
                    }
                });
                return reviewerCount < 2;
            });

            if (missingLanguages.length > 0) {
                return {
                    value: lang.replace(localization.validationmessage.onlyonelanguagereviewer.title, {
                        languages: missingLanguages.map(function (language) {
                            return language.text;
                        }).join(", ")
                    }),
                    languages: missingLanguages.map(function (language) {
                        return language.value;
                    }),
                    level: "warning"
                };
            }

            return null;
        },

        _validateRoles: function (reviewers) {
            // summary:
            //      Validates if there is reviewers of type ApprovalEnums.reviewerType.role
            //      which number of role users that exceeded the limit
            // returns:
            //      The validationMessage
            // tags:
            //      private

            if (reviewers.length === 0) {
                return null;
            }

            var validationResult = [];
            reviewers.forEach(function (reviewer) {
                if (reviewer.reviewerType === ApprovalEnums.reviewerType.role && reviewer.numberOfRoleUsersExceededMax) {
                    validationResult.push(reviewer.displayName);
                }
            });
            if (validationResult.length === 0) {
                return null;
            }

            var text = lang.replace(localization.validationmessage.roleusersexceededmaxmessage.description, { rolenames: validationResult.join(", ") });
            return {
                value: text,
                languages: null,
                level: "warning"
            };
        },

        _validateReviewers: function (reviewers) {
            // summary:
            //      Validates if the approvalStep have any reviewers
            // returns:
            //      The validationMessage
            // tags:
            //      private

            var validationMessage = null;

            if (reviewers.length === 0) {
                validationMessage = {
                    value: localization.validationmessage.notenoughreviewersmessage.title,
                    languages: null,
                    level: "error"
                };
            }

            return validationMessage;
        }
    });
});
