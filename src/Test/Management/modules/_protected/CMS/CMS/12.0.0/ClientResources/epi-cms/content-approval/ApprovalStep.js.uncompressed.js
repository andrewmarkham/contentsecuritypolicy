require({cache:{
'url:epi-cms/content-approval/templates/ApprovalStep.html':"<div class=\"epi-approval-step\">\r\n    <div class=\"epi-approval-step__header\">\r\n        <div class=\"dijitInline dojoDndHandle\">\r\n            <span class=\"dijitInline epi-iconDnD\"></span>\r\n        </div>\r\n        <div placeholder=\"${resources.header.placeholder}\" title=\"${resources.header.tooltip}\" data-dojo-attach-point=\"headerTextbox\" data-dojo-type=\"dijit/form/TextBox\"></div>\r\n        <div class=\"dijitInline\" data-dojo-attach-point=\"removeNode\"></div>\r\n    </div>\r\n    <div class=\"epi-approval-step__container\">\r\n        <div data-dojo-attach-point=\"listNode\"></div>\r\n        <div class=\"epi-reviewer__add\">\r\n            <span class=\"dijitInline dijitIcon epi-iconUser\"></span>\r\n            <div class=\"dijitInline\" data-dojo-attach-point=\"searchNode\"></div>\r\n        </div>\r\n    </div>\r\n    <div class=\"epi-approval-step__add-step\" data-dojo-attach-point=\"arrowNode\"></div>\r\n</div>\r\n"}});
define("epi-cms/content-approval/ApprovalStep", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/keys",
    "epi/shell/command/builder/ButtonBuilder",
    "epi/shell/command/builder/MenuAssembler",
    "epi-cms/content-approval/viewmodels/ReviewerViewModel",
    "./ApprovalEnums",
    // Parent class and mixins
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "epi/shell/widget/_ModelBindingMixin",
    // List and mixins
    "dgrid/List",
    "epi/shell/dgrid/SingleQuery",
    "epi/shell/dgrid/Formatter",
    "dgrid/Keyboard",
    "dgrid/extensions/DijitRegistry",
    "epi/shell/dgrid/WidgetRow",
    //Search box
    "dijit/form/ComboBox",
    // reviewer widget
    "./Reviewer",
    // Resources
    "dojo/text!./templates/ApprovalStep.html",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.step",
    //Widgets in template
    "dijit/form/TextBox"
], function (
    declare,
    lang,
    aspect,
    domClass,
    keys,
    ButtonBuilder,
    MenuAssembler,
    ReviewerViewModel,
    ApprovalEnums,
    // Parent class and mixins
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _ModelBindingMixin,
    // List and mixins
    List,
    SingleQuery,
    Formatter,
    Keyboard,
    DijitRegistry,
    WidgetRow,
    //Search box
    ComboBox,
    // reviewer widget
    Reviewer,
    //Resources
    widgetTemplate,
    localization,
    //Widgets in template
    Textbox
) {

    var ReviewerList = declare([List, Keyboard, DijitRegistry, Formatter, SingleQuery, WidgetRow]);

    var NavigableComboBox = declare([ComboBox], {

        labelType: "html",

        _onKey: function (evt) {

            if (evt.keyCode === keys.UP_ARROW && !this._opened) {
                this.onMoveUp(evt);
                return;
            }

            if (evt.keyCode === keys.ENTER &&
                    this._hasSuggestions() &&
                    this._hasNoItemSelected()) {
                this.set("item", this.dropDown.items[0]);
            }

            this.inherited(arguments);
        },

        labelFunc: function (item) {
            var iconTemplate = "<span class=\"dijitInline dijitIcon {icon}\"></span>{displayName}";

            var viewModel = new ReviewerViewModel(item);
            return lang.replace(iconTemplate, {
                icon: viewModel.get("icon"),
                displayName: viewModel.get("displayName")
            });
        },

        onMoveUp: function () {},

        _hasSuggestions: function () {
            return this._opened &&
                !!this.get("value") &&
                this.dropDown.items.length > 0;
        },

        _hasNoItemSelected: function () {
            return !this.item;
        }
    });

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //      The approval step component, responsible for showing the reviewers.
        // tags:
        //      internal

        // model: [readonly] ApprovalStepViewModel
        //      The model containing the reviewers to be listed.
        model: null,

        // modelBindingMap: [protected] Object
        //      The binding mappings from model properties to local properties.
        modelBindingMap: {
            isReadOnly: ["isReadOnly"],
            isValid: ["isValid"]
        },

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: widgetTemplate,

        // resources: [protected] Object
        //      An object containing resource strings in the current language.
        resources: localization,

        buildRendering: function () {
            // summary:
            //      Build the approvalStep widget
            // tags:
            //      protected

            this.inherited(arguments);

            var store = this.model.get("reviewers");

            this.headerTextbox.set("value", this.model.name);

            this.list = new ReviewerList({
                className: "epi-chromeless",
                maintainOddEven: false,
                store: store,
                //Added sort because without sort you get console logs
                sort: "default",
                renderRow: this._renderReviewer.bind(this)
            }, this.listNode);

            //Stop the propagation of the DOWN and UP arrow key presses
            this.own(
                this.list.addKeyHandler(keys.DOWN_ARROW, function (evt) {
                    evt.stopPropagation();
                    if (evt.target === evt.currentTarget.lastElementChild) {
                        this.searchBox.focus();
                    }
                }.bind(this)),
                this.list.addKeyHandler(keys.UP_ARROW, function (evt) {
                    evt.stopPropagation();
                }),
                this.headerTextbox.on("change", function (value) {
                    this.model.set("name", value);
                }.bind(this))
            );

            var settings = {
                    "class": "epi-approval-step__add-step__button",
                    showLabel: false,
                    tabIndex: -1
                },
                builder = new ButtonBuilder({ settings: settings }),
                configuration = [
                    { category: "add", builder: builder, target: this.arrowNode },
                    { category: "remove", builder: builder, target: this.removeNode }
                ];

            new MenuAssembler({
                configuration: configuration,
                commandSource: this
            });

            var userStore = this.model.get("userStore");

            this.searchBox = new NavigableComboBox({
                labelAttr: "displayName",
                queryExpr: "${0}",
                query: { includeRoles: true },
                store: userStore,
                searchAttr: "name",
                autoComplete: false,
                // This mirrors the height set in epi-autocomplete-list styling
                maxHeight: 294
            }, this.searchNode);

            this.own(
                aspect.before(this.searchBox, "onSearch",  this._searchBoxOnSearch.bind(this)),
                this.searchBox.on("change", this._searchBoxOnChange.bind(this)),
                this.searchBox.on("moveUp", function (evt) {
                    Keyboard.moveFocusEnd.call(this.list, evt);
                }.bind(this)),
                //Stops the propagation when pressing for example + button so that
                //we don't get a new approvalStep.
                this.searchBox.on("keypress", function (evt) {
                    evt.stopPropagation();
                })
            );
        },

        _renderReviewer: function (model) {
            // summary:
            //      Renders an reviewer widget for the row and returns its DOM node.
            // tags:
            //      private

            var reviewer = new Reviewer({
                model: model,
                languageOptions: this.languageOptions
            });

            this.own(
                reviewer.on("remove-reviewer", function (reviewer) {
                    this.model.removeReviewer(reviewer);
                }.bind(this))
            );

            return reviewer.domNode;
        },

        _searchBoxOnSearch: function (users, query, options) {
            // summary:
            //      Handles changes when searching in the searchBox
            // tags:
            //      private

            users = this.model.filterOutExistingUsers(users);

            // Return all the arguments to the aspect since they
            // will be used when displaying the result list.
            return [users, query, options];
        },

        _searchBoxOnChange: function (value) {
            // summary:
            //      Handles value changes on the searchBox
            // tags:
            //      private

            //Early exit because when we clear the value
            //below it will call this method again or if someone
            //tries to add something that is not in the user list
            if (!value || !this.searchBox.item) {
                return;
            }

            //Uses the searchBox item because the value only
            //return the displayName not the whole object
            this.model.addReviewer(this.searchBox.item);

            //Reset value because the selected value would
            //otherwise still be there
            this.searchBox.set("value", "");
        },

        startup: function () {
            // summary:
            //      Processing after the DOM fragment is added to the document.
            // tags:
            //      protected

            if (this._started) {
                return;
            }
            this.inherited(arguments);

            this.list.startup();
            this.searchBox.startup();

            // Stop the contentNode from being a tab stop as we don't want to focus an empty list.
            this.list.contentNode.tabIndex = -1;
        },

        getCommands: function () {
            return this.model.get("commands");
        },

        _setIsReadOnlyAttr: function (isReadOnly) {
            this._set("isReadOnly", isReadOnly);

            domClass.toggle(this.domNode, "epi-approval-step--read-only", isReadOnly);

            // Set the textbox as read-only so that the text is selectable but set the tabIndex to -1
            // so that the textbox is no longer a tab stop.
            this.headerTextbox.set({
                readOnly: isReadOnly,
                tabIndex: isReadOnly ? -1 : 0
            });
        },

        _setIsValidAttr: function (isValid) {
            this._set("isValid", isValid);

            var hasValidationMessage = !isValid && this.model.get("showValidations");

            var hasErrors = this.model.hasErrors();
            domClass.toggle(this.domNode, "epi-approval-step--error", hasValidationMessage && hasErrors);
            domClass.toggle(this.domNode, "epi-approval-step--warning", hasValidationMessage && (!hasErrors && this.model.hasWarnings()));
        }
    });
});
