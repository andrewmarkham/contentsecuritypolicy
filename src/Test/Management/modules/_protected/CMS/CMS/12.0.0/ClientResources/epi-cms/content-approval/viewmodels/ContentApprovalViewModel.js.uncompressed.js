define("epi-cms/content-approval/viewmodels/ContentApprovalViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/when",
    "epi/epi",
    "epi/dependency",
    "epi/shell/DialogService",
    "epi/shell/TypeDescriptorManager",
    "epi-cms/content-approval/ApprovalEnums",
    "epi-cms/content-approval/viewmodels/ApprovalStepViewModel",
    "epi/shell/command/withConditionalConfirmation",
    // Parent class
    "dojo/Stateful",
    "epi/shell/DestroyableByKey",
    "epi/shell/_ContextMixin",
    // Commands
    "epi-cms/content-approval/command/SaveApprovalDefinition",
    "epi-cms/content-approval/command/CancelChanges",
    // Store modules
    "epi/shell/store/SortableMemory",
    "dojo/store/Observable",
    //Resources
    "epi/i18n!epi/nls/episerver.cms.contentapproval",
    "epi/i18n!epi/nls/episerver.cms.languageselector",
    "epi/i18n!epi/nls/episerver.shared.action"
], function (
    declare,
    lang,
    on,
    when,
    epi,
    dependency,
    dialogService,
    TypeDescriptorManager,
    ApprovalEnums,
    ApprovalStepViewModel,
    withConditionalConfirmation,
    // Parent class
    Stateful,
    DestroyableByKey,
    _ContextMixin,
    // Commands
    SaveApprovalDefinition,
    CancelChanges,
    // Store modules
    SortableMemory,
    Observable,
    //Resources
    localizationContentApproval,
    localizationLanguageSelector,
    localizationSharedAction
) {

    return declare([Stateful, DestroyableByKey, _ContextMixin], {
        // summary:
        //      The view model for the content approval component.
        // tags:
        //      internal

        // approvalSteps: [readonly] Store
        //      A store containing the approval steps.
        approvalSteps: null,

        // approvalService: [readonly] ApprovalService
        //      A service for interacting with content approvals.
        approvalService: null,

        // userStore: [readonly] Store
        //      A REST store for fetching data for users.
        userStore: null,

        // commands: [public] Array
        //      An array of commands available for the component.
        commands: null,

        // isDirty: [readonly] Boolean
        //      Indicates whether the approval steps are different from the original value and can
        //      be saved.
        isDirty: false,

        // isDeclineCommentRequired: [readonly] Boolean
        //      Indicates whether a comment is required when declining
        isDeclineCommentRequired: false,

        // isApproveCommentRequired: [readonly] Boolean
        //      Indicates whether a comment is required when approving
        isApproveCommentRequired: false,

        // isStartCommentRequired: [readonly] Boolean
        //      Indicates whether a comment is required when requesting a review
        isStartCommentRequired: false,

        // selfApprove: [readonly] Boolean
        //      Indicates whether users can approve their own changes
        selfApprove: true,

        // isEnabled: [readonly] Boolean
        //      Indicates whether the approval is enabled explicitly or it is enabled by inheritance
        isEnabled: false,

        // isInherited: [readonly] Boolean
        //      Indicates whether the approval is inherited from one of its ancestors
        isInherited: false,

        // selectedLanguage: [readonly] String
        //      The selected language.
        selectedLanguage: null,

        // approvalLink: [public] String
        //      The content link of the current approval sequence.
        approvalLink: null,

        // content: [readonly] ContentDataStoreModel
        //      The content belonging to the approval definition.
        content: null,

        // isValid: [readonly] Boolean
        //      Indicates if the approval definition can be saved.
        isValid: true,

        // isReadOnly: [public] Boolean
        //      Set whether the whole approval sequence is in readOnly mode.
        isReadOnly: false,

        // isOptionsEnabled: [readonly] Boolean
        //      Indicates if the approval options are enabled or not
        isOptionsEnabled: true,

        // languages: [public] Array
        //      All the languages that are enabled for the whole approval sequence.
        languages: null,

        // filterOptions: [public] Array
        //      All the languages in dijit/Select options format, for the languageFilter.
        filterOptions: null,

        // approvalInheritedFrom: [public] InheritedApprovalDefinitionViewModel
        //      Gets the inherited approval definition.
        approvalInheritedFrom: null,

        // filterOptions: [public] Array
        //      All the languages in dijit/Select options format, for the reviewers.
        languageOptions: null,

        // showValidations: [public] Boolean
        //      Indicates if we are in a state where we want to show the validation messages.
        showValidations: false,

        // status: [public] ApprovalEnums.definitionStatus
        //      The status of the approval definition.
        status: ApprovalEnums.definitionStatus.inherited,

        // _approvalStepsQuery: [private] QueryResults
        //      The query results for the approval steps query.
        _approvalStepsQuery: null,

        // _originalDefinition: [private] ApprovalDefinition
        //      Original approvalDefinition from the server that is used to compare with before saving.
        _originalDefinition: null,

        // validationMessageIds: [private] Array
        //      An array of error messages given to NotificationStatusBar through MessageService.
        _validationMessageIds: [],

        // _contextService: [private] ContextService
        //      Service for managing context changes.
        _contextService: null,

        // _messageService: [private] MessageService
        //      Service to send validation messages to NotificationStatusBar.
        _messageService: null,

        constructor: function (kwArgs, approvalService, contextService, messageService, userStore, contentStore, typeDescriptorManager) {
            this.approvalService = approvalService || dependency.resolve("epi.cms.ApprovalService");
            this._contextService = contextService || dependency.resolve("epi.shell.ContextService");
            this._messageService = messageService || dependency.resolve("epi.shell.MessageService");
            this.userStore = userStore || dependency.resolve("epi.storeregistry").get("epi.cms.notification.users");
            this._contentStore = contentStore || dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
            this._typeDescriptorManager = typeDescriptorManager || TypeDescriptorManager;
        },

        postscript: function () {
            this.inherited(arguments);

            when(this.getCurrentContext()).then(this.contextChanged.bind(this));
        },

        destroy: function () {
            this.inherited(arguments);

            this._removeEventListeners();
        },

        contextChanged: function (context) {
            // summary:
            //      Update the approval definition and content data when the context has changed.
            // tags:
            //      public

            this.set("approvalLink", context.id);

            this.approvalService.getDefinition(context.id)
                .then(this.loadApprovalDefinition.bind(this))
                .then(function () {
                    // Wait with loading and setting the current content until the approval definition has successfully loaded.
                    this._contentStore.get(context.id)
                        .then(this.set.bind(this, "content"));
                }.bind(this));
        },

        createApprovalStep: function (afterStep) {
            // summary:
            //      Creates a new approval step after the given step.
            // tags:
            //      public

            // Block modification when the approval definition is not enabled or it is read-only.
            if (!this._canEditApprovalSteps()) {
                return;
            }

            var steps = this.approvalSteps,
                nextSibling = steps.getSibling(afterStep),
                viewModel;

            viewModel = new ApprovalStepViewModel({
                languages: this.languages,
                reviewers: [],
                userStore: this.userStore,
                showValidations: this.showValidations
            });

            this._addEventListeners(viewModel);

            steps.add(viewModel, { before: nextSibling });
        },

        getWarningMessage: function () {
            // summary:
            //      Gets the warning message based on current approval definition.
            // tags:
            //      public

            if (this.get("isInherited") && this.approvalInheritedFrom) {
                var text = this.get("isEnabled") ? localizationContentApproval.component.inheritedenabled : localizationContentApproval.component.inheriteddisabled;
                return lang.replace(text, {
                    name: this.approvalInheritedFrom.name
                });
            } else if (!this.get("isEnabled")) {
                return localizationContentApproval.component.disabledwarning;
            }
        },

        goToInheritedSequence: function () {
            // summary:
            //      Navigates to the approval definition that was inherited by the current definition.
            // tags:
            //      public

            this.approvalService.navigateToDefinition(this.get("approvalInheritedFrom").contentLink);
        },

        inheritDefinition: function () {
            // summary:
            //      Clears the current approval definition and loads the ancestor's definition.
            // tags:
            //      public

            var contentLink = this.get("approvalLink"),
                previousStatus = this.status;

            this.set("status", ApprovalEnums.definitionStatus.inherited);

            return this.approvalService.inheritDefinition(contentLink)
                .then(this.loadApprovalDefinition.bind(this))
                .otherwise(this.set.bind(this, "status", previousStatus));
        },

        moveApprovalStep: function (approvalStep, up) {
            // summary:
            //      Moves the approval step up or down in the list.
            // tags:
            //      public

            // Block modification when the approval definition is not enabled or it is read-only.
            if (!this._canEditApprovalSteps()) {
                return;
            }

            var steps = this.approvalSteps,
                beforeSibling = steps.getSibling(approvalStep, up);

            // Do an early exit in the case the step is being moved up but is already first or it is
            // being moved down but is already last. The sibling will be null in both cases.
            if (!beforeSibling) {
                return;
            }

            // If the step is moving down then get the next sibling to insert before.
            if (!up) {
                beforeSibling = steps.getSibling(beforeSibling);
            }

            steps.put(approvalStep, { before: beforeSibling });
        },

        removeApprovalStep: function (approvalStep) {
            // summary:
            //      Removes the approval step if it can be deleted.
            // tags:
            //      public

            // Block modification when the approval definition is not enabled or it is read-only.
            if (!this._canEditApprovalSteps()) {
                return;
            }

            if (approvalStep.canBeDeleted) {
                this.approvalSteps.remove(approvalStep.id);
            }
        },

        loadApprovalDefinition: function (definition) {
            // summary:
            //      Updates the view model with the data from the given approval definition.
            // tags:
            //      public

            //Set the originalDefinition to null to clear the old definition
            this._originalDefinition = null;

            this.set({
                approvalInheritedFrom: definition.approvalInheritedFrom,
                languages: definition.languages,
                status: definition.status,
                isReadOnly: definition.isReadOnly,
                isDeclineCommentRequired: definition.isDeclineCommentRequired,
                isApproveCommentRequired: definition.isApproveCommentRequired,
                isStartCommentRequired: definition.isStartCommentRequired,
                selfApprove: definition.selfApprove,
                showValidations: false
            });

            this._createApprovalSteps(definition.approvalSteps);

            // Save a copy of the definition to be used to determine when the definition has changed.
            this._originalDefinition = this.serialize();
        },

        saveApprovalDefinition: function () {
            // summary:
            //      Saves the approval definition.
            // tags:
            //      public

            var definition = this.serialize();
            return this.approvalService.saveDefinition(definition).then(this.loadApprovalDefinition.bind(this));
        },

        serialize: function () {
            // summary:
            //      Serializes the approval definition.
            // tags:
            //      public

            var approvalSteps = this.approvalSteps.data.map(function (step) {
                return step.serialize();
            });

            return {
                contentLink: this.get("approvalLink"),
                approvalSteps: approvalSteps,
                isDeclineCommentRequired: this.isDeclineCommentRequired,
                isApproveCommentRequired: this.isApproveCommentRequired,
                isStartCommentRequired: this.isStartCommentRequired,
                selfApprove: this.selfApprove,
                status: this.status
            };
        },

        validate: function () {
            // summary:
            //      Validates the viewModel. Triggers validation on the steps.
            // tags:
            //      public

            var validationMessage = null;

            this.approvalSteps.data.forEach(function (step) {
                step.validate();
            });

            if (this._hasErrors()) {
                validationMessage = {
                    level: "error",
                    dialog: {
                        description: localizationContentApproval.validationmessage.notenoughreviewersmessage.description
                    }
                };
            } else if (this._hasWarnings()) {
                validationMessage = {
                    level: "warning",
                    dialog: {
                        title: localizationContentApproval.validationmessage.stephaswarnings.title,
                        description: localizationContentApproval.validationmessage.stephaswarnings.description,
                        confirmActionText: localizationContentApproval.action.saveanyway,
                        cancelActionText: localizationSharedAction.cancel
                    }
                };
            }

            return validationMessage;
        },

        enable: function () {
            // summary:
            //      Enables the definition.
            // tags:
            //      public

            this.set("status", ApprovalEnums.definitionStatus.enabled);
            this._updateIsSequenceEnabled();
        },

        disable: function () {
            // summary:
            //      Disables the definition and immediately saves it.
            // tags:
            //      public

            this.set("showValidations", false);

            // Update the status now instead of waiting for the server to respond.
            this.set("status", ApprovalEnums.definitionStatus.disabled);

            // Update the approval steps now instead of waiting for the server to respond.
            this._updateApprovalSteps();
            this._updateIsSequenceEnabled();
            return this.saveApprovalDefinition()
                .otherwise(function () {
                    this.set("showValidations", true);
                    this.enable();
                }.bind(this));
        },

        iconClass: function () {
            // summary:
            //      The icon representing the content belonging to the approval definition.
            // tags:
            //      public

            return this.content ? this._typeDescriptorManager.getValue(this.content.typeIdentifier, "iconClass") : null;
        },

        _createApprovalSteps: function (steps) {
            // summary:
            //      Transforms a list of approval steps into an observable memory store and observe
            //      the store for changes.
            // tags:
            //      private

            var approvalSteps = (steps || [this._createEmptyStep()]).map(this._createStepViewModel.bind(this)),
                store = Observable(new SortableMemory({ data: approvalSteps }));

            this.set("approvalSteps", store);
            this.set("isDirty", false);

            //Queries the approvalSteps store and observe so that we can
            //we can set canBeDeleted flag on a approval step.
            this._approvalStepsQuery = store.query();

            // Update the approval steps to set the initial values, e.g. canBeDeleted.
            this._updateApprovalSteps();

            // Listen for changes to the approval steps.
            this.destroyByKey("observeHandle");
            this.ownByKey("observeHandle", this._approvalStepsQuery.observe(function () {
                this._updateApprovalSteps();
            }.bind(this)));
        },

        _createEmptyStep: function () {
            // summary:
            //      Creates an empty approval step with no reviewers.
            // tags:
            //      private

            return { reviewers: [] };
        },

        _createStepViewModel: function (step, index) {
            // summary:
            //      Create approval step view models.
            // tags:
            //      private

            //Clone the step so it will not references the object
            //from the original approval steps from the server
            step = lang.clone(step);

            // Set the id for the step so it is possible to find in the store later.
            var viewModel = new ApprovalStepViewModel({
                id: index,
                //Languages need to be set before the reviewers setter because it is used in the validate
                //method that is called from the reviewers setter.
                languages: this.languages,
                selfApprove: this.selfApprove,
                reviewers: step.reviewers,
                name: step.name,
                userStore: this.userStore
            });

            this._addEventListeners(viewModel);

            return viewModel;
        },

        _updateApprovalSteps: function () {
            // summary:
            //      Updates the state of the approval steps.
            // tags:
            //      private

            var approvalStepsQuery = this._approvalStepsQuery;
            if (approvalStepsQuery) {
                // Step can be delete if there are more than one step.
                var canBeDeleted = approvalStepsQuery.length > 1,
                    isReadOnly = !this._canEditApprovalSteps(),
                    selectedLanguage = this.selectedLanguage,
                    selfApprove = this.selfApprove;

                approvalStepsQuery.forEach(function (step) {
                    step.set({
                        canBeDeleted: canBeDeleted,
                        isReadOnly: isReadOnly,
                        selfApprove: selfApprove
                    });
                    step.filterReviewers(selectedLanguage);
                });

                this._onApprovalStepsChanged();
            }
        },

        _resetValidationMessageIds: function () {
            // summary:
            //      Reset errors and re add if there is errors.
            // tags:
            //      private

            // Remove errors
            this._validationMessageIds.forEach(function (messageId) {
                this._messageService.remove({id: messageId});
            }.bind(this));
            this._validationMessageIds = [];

            // Add new errors, if we want to show them.
            if (this.showValidations) {
                // Add new errors
                this._approvalStepsQuery.forEach(function (step) {
                    if (!step.isValid) {
                        step.validationMessages.forEach(function (stepValidationMessage) {
                            var messageType;
                            if (stepValidationMessage.level === "error") {
                                messageType = "error";
                            } else if (stepValidationMessage.level === "warning") {
                                messageType = "warn";
                            }
                            var messageId = this._messageService.put(messageType, stepValidationMessage.value, "epi.cms.approval", this.get("approvalLink"));
                            this._validationMessageIds.push(messageId);
                        }, this);
                    }
                }, this);
            }
        },

        _onApprovalStepsChanged: function () {
            // summary:
            //      Update the isDirty and isValid flags.
            // tags:
            //      private

            this._resetValidationMessageIds();

            // Validate filterOptions based on new validation info in the steps.
            this._validateFilterOptions();

            // Compares originalDefinition from the server with the serialized
            // definition and toggles the save button.
            var serialized = this.serialize();
            var equal = epi.areEqual(serialized, this._originalDefinition);
            //Only set the isDirty flag if the originalDefinition is set
            //because initially it will be empty when some setters are called.
            this._originalDefinition && this.set("isDirty", !equal);
        },

        _addEventListeners: function (step) {
            // summary:
            //      Adds event listeners to the step view model.
            // tags:
            //      private

            this.own(
                step.on("create-step", this.createApprovalStep.bind(this)),
                step.on("remove-step", this.removeApprovalStep.bind(this)),
                step.on("change", this._onApprovalStepsChanged.bind(this)),
                step.watch("isValid", this._onApprovalStepsChanged.bind(this))
            );

        },

        _canEditApprovalSteps: function () {
            // summary:
            //      Determines whether the approval stesp can be modified.
            // tags:
            //      private

            return !this.isReadOnly && this.status === ApprovalEnums.definitionStatus.enabled;
        },

        _commandsGetter: function () {
            // summary:
            //      Lazy loads the commands associated with the component.
            // tags:
            //      protected

            if (this.commands === null) {
                this.commands = [
                    new SaveApprovalDefinition({ model: this, order: 10 }),
                    new CancelChanges({ model: this, order: 20 })
                ];
            }
            return this.commands;
        },

        _createLanguageOptions: function (languages) {
            // summary:
            //      Create languages options if there are any.
            // tags:
            //      private

            if (!languages) {
                this.set("languageOptions", null);
                this.set("filterOptions", null);
                return;
            }

            var languageOptions = languages.map(function (language) {
                return { label: language.text, value: language.value };
            });
            this.set("languageOptions", languageOptions);

            // Deep copy the languageOptions array so languageOptions and
            // filterOptions don't reference to the same objects.
            var filterOptions = lang.clone(languageOptions);
            filterOptions.unshift(this._getDefaultLanguageOption());
            this.set("filterOptions", filterOptions);
        },

        _getDefaultLanguageOption: function () {
            // summary:
            //      Creates a new select item with the "All language" text that is selected.
            // tags:
            //      private

            return {
                label: localizationLanguageSelector.alllanguages,
                value: "",
                selected: true
            };
        },

        _validateFilterOptions: function () {
            // summary:
            //      Create filter options if there are language options.
            // tags:
            //      private

            // When set to "All Languages" there is nothing to validate.
            if (!this.filterOptions) {
                return;
            }

            // Set an isValid flag for views (e.g. ApprovalComponent) to indicate validation status of each option.
            var stepsMissingLanguageReviewer = this._stepsMissingLanguageReviewer();

            this.filterOptions.forEach(function (filter) {
                filter.isValid = stepsMissingLanguageReviewer.every(function (step) {
                    // A filterOption is invalid if it has any language validation issues.
                    return step.get("validationMessages").every(function (validationMessage) {
                        if (!validationMessage.languages) {
                            return true;
                        }
                        return validationMessage.languages.indexOf(filter.value) === -1;
                    });
                });
            });

            // Update the property to trigger watchers.
            this.set("filterOptions", this.filterOptions);
        },

        _hasErrors: function () {
            return this.approvalSteps.data.some(function (step) {
                return !step.isValid && step.hasErrors();
            });
        },

        _hasWarnings: function () {
            return this.approvalSteps.data.some(function (step) {
                return !step.isValid && step.hasWarnings();
            });
        },

        _stepsMissingLanguageReviewer: function () {
            return this.approvalSteps.data.filter(function (step) {
                return !step.isValid &&
                    step.validationMessages.some(function (validationMessage) {
                        return validationMessage.languages;
                    });
            });
        },

        _isDeclineCommentRequiredSetter: function (commentRequired) {
            // summary:
            //      Sets the comment required state of the approval sequence.
            // tags:
            //      protected

            this.isDeclineCommentRequired = commentRequired;

            this._updateApprovalSteps();
        },

        _isApproveCommentRequiredSetter: function (commentRequired) {
            // summary:
            //      Sets the comment required state of the approval sequence.
            // tags:
            //      protected

            this.isApproveCommentRequired = commentRequired;

            this._updateApprovalSteps();
        },

        _isStartCommentRequiredSetter: function (commentRequired) {
            // summary:
            //      Sets the comment required state of the approval sequence.
            // tags:
            //      protected

            this.isStartCommentRequired = commentRequired;

            this._updateApprovalSteps();
        },

        _selfApproveSetter: function (selfApprove) {
            // summary:
            //      Sets the self approve setting of the approval sequence.
            // tags:
            //      protected

            this.selfApprove = selfApprove;

            this._updateApprovalSteps();
        },

        _isDirtySetter: function (isDirty) {
            this.isDirty = isDirty;

            if (!isDirty) {
                this._removeEventListeners();
                return;
            }

            if (this._interceptor) {
                return;
            }

            this._beforeUnloadHandler = on(window, "beforeunload", function (e) {
                var confirmationMessage = localizationContentApproval.command.cancelchanges.description;

                e.returnValue = confirmationMessage;
                return confirmationMessage;
            });

            this._interceptor = this._contextService.registerRequestInterceptor(function () {
                var settings = {
                    title: localizationContentApproval.command.cancelchanges.title,
                    description: localizationContentApproval.command.cancelchanges.description
                };

                return dialogService.confirmation(settings).then(this._removeEventListeners.bind(this));
            }.bind(this));
        },

        _isReadOnlySetter: function (value) {
            // summary:
            //      Set whether the approval definition is in readonly mode.
            // tags:
            //      protected

            this.isReadOnly = value;

            this._updateApprovalSteps();
            this._updateIsSequenceEnabled();
        },

        _languagesSetter: function (value) {
            // summary:
            //      Sets the languages property, and the dependent options lists.
            // tags:
            //      protected

            this.languages = value;

            this._createLanguageOptions(this.languages);
            this._updateApprovalSteps();
        },

        _selectedLanguageSetter: function (selectedLanguage) {
            // summary:
            //      Sets the selected language for the approval definition.
            // tags:
            //      protected

            this.selectedLanguage = !selectedLanguage ? null : selectedLanguage;

            this._updateApprovalSteps();
        },

        _showValidationsSetter: function (showValidations) {
            // summary:
            //      Sets the model into "show validations mode", including all it's children.
            // tags:
            //      protected

            this.showValidations = showValidations;

            if (this.approvalSteps && this.approvalSteps.data) {
                this.approvalSteps.data.forEach(function (step) {
                    step.set("showValidations", showValidations);
                });
            }
        },

        _updateIsSequenceEnabled: function () {
            // summary:
            //      Update the inherit button enable status depending on the value of isEnabled and isReadOnly
            // tags:
            //      private

            this.set("isOptionsEnabled", this._canEditApprovalSteps());
        },

        _statusSetter: function (status) {
            // summary:
            //      Sets the status of the approval definition.
            // tags:
            //      protected

            this.status = status;
            this._updateApprovalSteps();
        },

        _isInheritedGetter: function () {
            return this.get("status") === ApprovalEnums.definitionStatus.inherited;
        },

        _isEnabledGetter: function () {

            if (this.get("status") === ApprovalEnums.definitionStatus.inherited) {
                return this.approvalInheritedFrom && this.approvalInheritedFrom.isEnabled;
            }
            return this.get("status") === ApprovalEnums.definitionStatus.enabled;
        },

        _removeEventListeners: function () {
            this._interceptor && this._interceptor.remove();
            this._interceptor = null;

            this._beforeUnloadHandler && this._beforeUnloadHandler.remove();
            this._beforeUnloadHandler = null;
        }
    });
});
