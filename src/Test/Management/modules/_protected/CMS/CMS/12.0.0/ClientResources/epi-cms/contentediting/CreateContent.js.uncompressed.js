require({cache:{
'url:epi-cms/contentediting/templates/CreateContent.html':"﻿<div class=\"epi-createContent\">\r\n    <div data-dojo-attach-point=\"layoutContainer\" data-dojo-type=\"dijit/layout/BorderContainer\" data-dojo-props=\"gutters: false, livesplitters: false\">\r\n        <div class=\"epi-static-node\" data-dojo-attach-point=\"topPanel\" data-dojo-type=\"dijit/layout/ContentPane\" data-dojo-props=\"region:'top'\">\r\n            <div data-dojo-attach-point=\"headingPanel\">\r\n                <h1><span data-dojo-attach-point=\"headingTextNode\"></span>:&nbsp;<span data-dojo-attach-point=\"contentTypeNameNode\"></span></h1>\r\n            </div>\r\n            <div data-dojo-attach-point=\"toolbar\" class=\"epi-localToolbar epi-viewHeaderContainer\" data-dojo-type=\"epi/shell/widget/ToolbarSet\" data-dojo-props=\"region:'top'\"></div>\r\n            <div data-dojo-attach-point=\"namePanel\">\r\n                <label>${sharedResources.header.name}</label>\r\n                <input data-dojo-attach-point=\"nameTextBox\"\r\n                       data-dojo-type=\"dijit/form/ValidationTextBox\"\r\n                       data-dojo-props=\"selectOnClick: true, required: true, trim:true\"\r\n                       data-dojo-attach-event=\"onChange: _onContentNameChange, onBlur: _onBlurVerifyContent\"\r\n                       maxlength=\"255\" />\r\n                <span data-dojo-attach-point=\"contentNameHelpTextNode\" class=\"dijitInline dgrid-no-data\"></span>\r\n            </div>\r\n        </div>\r\n        <div class=\"epi-newContentContainer epi-animation-node\" data-dojo-attach-point=\"stackContainer\" data-dojo-type=\"dijit/layout/StackContainer\" data-dojo-props=\"region: 'center'\">\r\n            <div data-dojo-attach-point=\"contentTypeList\" data-dojo-type=\"epi-cms/widget/ContentTypeList\" data-dojo-attach-event=\"onContentTypeSelected: _onContentTypeSelected\">\r\n                <div data-dojo-attach-point='subHeadingPanel' class=\"push-padding--left\">\r\n                    <h1 data-dojo-attach-point=\"subHeadingTextNode\"></h1>\r\n                    <p data-dojo-attach-point=\"subHeadingDescNode\"></p>\r\n                </div>\r\n            </div>\r\n            <div data-dojo-attach-point=\"propertiesForm\" data-dojo-type=\"epi-cms/widget/PropertiesForm\" data-dojo-attach-event=\"onPropertyValidStateChange: _onPropertyValidStateChange\">\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>"}});
﻿define("epi-cms/contentediting/CreateContent", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/topic",
    "dojo/when",

    // dijit
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",

    "dijit/form/ValidationTextBox",

    "dijit/layout/_LayoutWidget",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/StackContainer",

    // epi
    "epi/dependency",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/DialogService",

    "epi-cms/contentediting/NewContentNameInputDialog",

    "epi-cms/contentediting/viewmodel/CreateContentViewModel",

    "epi-cms/widget/ContentTypeList",
    "epi-cms/widget/PropertiesForm",
    "epi-cms/widget/Breadcrumb",
    "epi-cms/widget/BreadcrumbCurrentItem",

    // resources
    "dojo/text!./templates/CreateContent.html",
    "epi/i18n!epi/nls/episerver.shared"
],

function (
// dojo
    declare,
    lang,
    aspect,
    domStyle,
    domClass,
    topic,
    when,

    // dijit
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    ValidationTextBox,

    _LayoutWidget,
    BorderContainer,
    ContentPane,
    StackContainer,

    // epi
    dependency,
    _ModelBindingMixin,
    dialogService,

    NewContentNameInputDialog,

    CreateContentViewModel,

    ContentTypeList,
    PropertiesForm,
    BreadCrumbs,
    BreadcrumbCurrentItem,

    // resources
    template,
    sharedResources
) {

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //      A stack container that acts as a content creation wizard.
        // description:
        //      A wizard-like widget that is responsible for showing the widget for
        //      selecting a content type, then determines whether content editing or the
        //      mandatory fields editor is displayed.
        // tags:
        //      internal

        templateString: template,
        sharedResources: sharedResources,

        modelType: CreateContentViewModel,

        // _contextService: [private] epi/shell/ContextService
        _contextService: null,

        // _beingSuspended: [private] boolean
        //      Indicate that the component is being suspended and another view component is being requested.
        _beingSuspended: null,

        modelBindingMap: {
            parent: ["parent"],
            requestedType: ["requestedType"],
            metadata: ["metadata"],
            isContentTypeSelected: ["isContentTypeSelected"],

            headingText: ["headingText"],
            createAsLocalAssetHelpText: ["createAsLocalAssetHelpText"],
            contentName: ["contentName"],
            contentNameHelpText: ["contentNameHelpText"],
            wizardStep: ["wizardStep"],
            showAllProperties: ["showAllProperties"],
            createAsLocalAsset: ["createAsLocalAsset"],

            seamlessTopPanel: ["seamlessTopPanel"],
            namePanelIsVisible: ["namePanelIsVisible"],
            headingPanelIsVisible: ["headingPanelIsVisible"],
            saveButtonIsVisible: ["saveButtonIsVisible"],
            saveButtonDisabled: ["saveButtonDisabled"],
            showCurrentNodeOnBreadcrumb: ["showCurrentNodeOnBreadcrumb"],
            notificationContext: ["notificationContext"],
            actualParentLink: ["actualParentLink"],
            propertyFilter: ["propertyFilter"],
            allowedTypes: ["allowedTypes"],
            restrictedTypes: ["restrictedTypes"]
        },

        // Setters
        _setParentAttr: function (parent) {
            // summary:
            //      set parent attribute
            // tags:
            //      private

            if (parent) {
                this.toolbar.setItemProperty("currentcontent", "currentItemInfo", {
                    name: parent.name,
                    dataType: parent.typeIdentifier
                });
            }
        },

        _setPropertyFilterAttr: function (propertyFilter) {
            // summary:
            //      Set the property filter used when building the property form
            // tags:
            //      private

            this._set("propertyFilter", propertyFilter);
            this.propertiesForm.propertyFilter = propertyFilter;
        },

        _setAllowedTypesAttr: function (value) {
            // summary:
            //      set the allowed types
            // tags:
            //      private

            this.contentTypeList.set("allowedTypes", value);
        },

        _setRestrictedTypesAttr: function (value) {
            // summary:
            //      set the restricted types
            // tags:
            //      private

            this.contentTypeList.set("restrictedTypes", value);
        },

        _setRequestedTypeAttr: function (requestType) {
            // summary:
            //      set requested type attribute
            // tags:
            //      private

            this.contentTypeList.set("requestedType", requestType);
        },

        _setMetadataAttr: function (metadata) {
            // summary:
            //      set metadata attribute
            // tags:
            //      private

            if (metadata) {
                this.propertiesForm.set("metadata", metadata);
            }
        },

        _setHeadingTextAttr: function (headingText) {
            // summary:
            //      set heading text attribute
            // tags:
            //      private

            this.headingTextNode.textContent = this.subHeadingTextNode.textContent = headingText;
        },

        _setContentNameHelpTextAttr: {
            // summary:
            //      Setter for setting the help text next to the name input
            // tags:
            //      private
            node: "contentNameHelpTextNode",
            type: "innerText"
        },

        _setCreateAsLocalAssetAttr: function (/*Boolean*/createAsLocalAsset) {
            // summary:
            //      Reset breadcrumb in case createAsLocalAsset had updated its value
            // createAsLocalAsset: [Boolean]
            //      TRUE if a new content will be create as a local asset
            // tags:
            //      private

            this._set("createAsLocalAsset", createAsLocalAsset);

            var parent = this.model.get("parent");
            if (parent) {
                this.toolbar.setItemProperty("breadcrumbs", "contentLink", createAsLocalAsset ? parent.assetsFolderLink : parent.contentLink);
            }

            this.contentTypeList.set("localAsset", createAsLocalAsset);
        },

        _setCreateAsLocalAssetHelpTextAttr: {
            // summary:
            //      set sub heading's help text
            // tags:
            //      private

            node: "subHeadingDescNode",
            type: "innerHTML"
        },

        _setContentNameAttr: function (contentName) {
            // summary:
            //      set content name attribute
            // tags:
            //      private

            this.nameTextBox.set("value", contentName);
        },

        _setWizardStepAttr: function (wizardStep) {
            // summary:
            //      set wizard step attribute
            // tags:
            //      private

            // NOTE: this check should probably be done in the viewmodel, but we have no
            // value there that tells us how many wizard steps are available. This check
            // ensures we don't try to select outside the bounds

            var children;
            var child;

            if (wizardStep < 0 || wizardStep === this.wizardStep) {
                return;
            }

            children = this.stackContainer.getChildren();

            if (wizardStep < children.length) {

                child = children[wizardStep];

                this.stackContainer.selectChild(child);
                this._set("wizardStep", wizardStep);
            }
        },

        _setShowAllPropertiesAttr: function (showAllProperties) {
            // summary:
            //      set show all properties attribute
            // tags:
            //      private

            this._set("showAllProperties", showAllProperties);
            this.propertiesForm.set("showAllProperties", showAllProperties);
        },

        _setSeamlessTopPanelAttr: function (value) {
            // summary:
            //      set whether the top panel should show seamlessly.
            // tags:
            //      private

            domClass.toggle(this.topPanel.domNode, "epi-listingTopContainer", value);
        },

        _setNamePanelIsVisibleAttr: function (isVisible) {
            // summary:
            //      set name panel visibility
            // tags:
            //      private

            domStyle.set(this.namePanel, "display", isVisible ? "" : "none");
        },

        _setHeadingPanelIsVisibleAttr: function (isVisible) {
            // summary:
            //      set heading panel visibility
            // description:
            //      If the heading panel is visible, the sub heading panel will be invisible and vice versa.
            // tags:
            //      private

            domStyle.set(this.headingPanel, "display", isVisible ? "" : "none");
            domStyle.set(this.subHeadingPanel, "display", isVisible ? "none" : "");
        },

        _setSaveButtonIsVisibleAttr: function (isVisible) {
            // summary:
            //      set save button visibility
            // tags:
            //      private

            this.toolbar.setItemVisibility("saveButton", isVisible);
        },

        _setSaveButtonDisabledAttr: function (disabled) {
            // summary:
            //      set save button visibility
            // tags:
            //      private

            this.toolbar.setItemProperty("saveButton", "disabled", disabled);
        },

        _setShowCurrentNodeOnBreadcrumbAttr: function (show) {
            // summary:
            //      set whether the breadcrumd should display the current content node.
            // description:
            //      If the current content node is displayed, content name label in the heading is not and vice versa
            // tags:
            //      private

            this.toolbar.setItemProperty("breadcrumbs", "showCurrentNode", show);
            this.toolbar.setItemVisibility("currentcontent", !show);
        },

        _setNotificationContextAttr: function (context) {
            // summary:
            //      set context on the notification center
            // context: Object
            //      The notification context
            // tags:
            //      private

            this.toolbar.setItemProperty("notificationCenter", "notificationContext", context);
        },

        _setActualParentLinkAttr: function (parentLink) {
            // summary:
            //      set actual parent link
            // tags:
            //      private

            this.contentTypeList.set("parentLink", parentLink);
        },

        _setContentTypeNameAttr: {
            type: "innerHTML",
            node: "contentTypeNameNode"
        },

        postMixInProperties: function () {
            // summary:
            //      Post properties mixin handler.
            // description:
            //		Set up model and resource for template binding.
            // tags:
            //		protected

            this.inherited(arguments);

            this.model = new this.modelType();

            this.own(this.model.on("saveSuccess", lang.hitch(this, this._onSaveSuccess)));
            this.own(this.model.on("saveError", lang.hitch(this, this._onSaveError)));
            this.own(this.model.on("invalidContentName", lang.hitch(this, this._onInvalidContentName)));
        },

        postCreate: function () {
            // summary:
            //		Post widget creation handler.
            // description:
            //      Set up local toolbar
            // tags:
            //		protected

            this.inherited(arguments);

            this._contextService = this._contextService || dependency.resolve("epi.shell.ContextService");

            this._setupToolbar();
        },

        layout: function () {
            // summary:
            //      Layout the widget
            // description:
            //      Set the widget's size to the top layout container
            // tags:
            //    protected

            if (this._started) {
                this.layoutContainer.resize(this._containerContentBox || this._contentBox);
                domClass.add(this.stackContainer.domNode, "epi-animation-node-reset");
            }
        },

        updateView: function (data) {
            // summary:
            //      Update the current view with new data from the main widget switcher.
            // data: Object
            //      The settings data. The data requires parent and requestedType property in order to update the view
            // tags:
            //    public

            // content can only be created when it has parent and requestedType (when creating via New Page, Block buttons)
            // or content can be created when it has contentData and languageBranch (when creating via Translate notification)
            // if incoming data doesn't have parent and requestedType then no need to update the view & model.

            // WidgetSwitcher calls the updateView when a context change occurs or when a view change happens. If the view change is initiated by the NewContent command then the required information is supplied.
            // but on a context change the required information is not being supplied correctly.
            if (data && ((data.parent && data.requestedType) || (data.contentData && data.languageBranch))) {

                this.view = data.view;
                this._setCreateMode();
                this._beingSuspended = false;

                // TODO: Incorporate content type list with model and use data binding.
                this.set("contentTypeName", "");

                when(this.model.update(data), lang.hitch(this, function () {
                    this.layout();

                    //We want the name text box to have focus and the content selected when the view has loaded
                    if (this.nameTextBox) {
                        this.nameTextBox.focus();
                        this.nameTextBox.textbox.select();
                    }

                }), function (err) {
                    console.log(err);
                });
            }
        },

        _onSaveSuccess: function (result) {
            // summary:
            //    Handle save success event from the model.
            //
            // tags:
            //    private

            this._clearCreateMode();

            this._beingSuspended = true;

            if (result.changeContext) {
                this._changeContext(result.newContentLink);
            } else {
                this._backToCurrentContext();
            }

            if (this.createAsLocalAsset === true) {
                topic.publish("/epi/cms/action/createlocalasset");
            }
        },

        _onSaveError: function () {
            // summary:
            //    Handle save error event from the model.
            //
            // tags:
            //    private

            this._clearCreateMode();

            topic.publish("/epi/cms/action/showerror");
        },

        _onInvalidContentName: function (defaultName) {
            // summary:
            //    Handle invalid content name event from the model.
            //
            // tags:
            //    private

            var contentNameInput = new NewContentNameInputDialog({ defaultContentName: defaultName });

            dialogService.dialog({
                defaultActionsVisible: false,
                autofocus: true,
                content: contentNameInput,
                title: contentNameInput.title
            }).then(function () {
                var name = contentNameInput.get("value");
                if (name === defaultName) {
                    this.model.set("ignoreDefaultNameWarning", true);
                }
                this.model.set("contentName", name);
                this.model.save();
            }.bind(this)).otherwise(function () {
                if (this.contentTypeList.shouldSkipContentTypeSelection) {
                    this._cancel();
                } else {
                    this.model.set("isContentTypeSelected", false);
                }
            }.bind(this));
        },

        _onContentTypeSelected: function (item) {
            // summary:
            //    Handle content type selected event from the content type list widget.
            //
            // tags:
            //    private

            if (!this.isContentTypeSelected) {
                this.model.set("contentTypeId", item.id);

                this.set("contentTypeName", item.localizedName);
            }
        },

        _onPropertyValidStateChange: function (property, error) {
            // summary:
            //      Handle property validity change event from the properties form widget.
            // property: String
            //      The property name
            // error: String
            //      The error message
            // tags:
            //    private

            if (error) {
                this.model.addInvalidProperty(property, error);
            } else {
                this.model.removeInvalidProperty(property);
            }
        },

        _onBlurVerifyContent: function () {
            // summary:
            //    check if the textfield content is empty on blur,
            //    set to default value if it is.
            //
            // tags:
            //    private
            if (this.nameTextBox.get("value") === "") {
                this.nameTextBox.set("value", this.model.defaultName);
            }
        },

        _onContentNameChange: function (name) {
            // summary:
            //    Handle change event from the content name textbox.
            //
            // tags:
            //    private

            this.model.set("contentName", name);
        },

        _onSave: function () {
            // summary:
            //    Handle action of the save button.
            //
            // tags:
            //    private

            if (this._beingSuspended) {
                return;
            }

            // Kick off the client validation. Validation result will be handled by the model later on.
            this.propertiesForm.validate();

            this.model.set("properties", this.propertiesForm.get("value"));
            this.model.save();
        },

        _onCancel: function () {
            // summary:
            //    Handle action of the cancel button.
            //
            // tags:
            //    private

            this._cancel();
        },

        _cancel: function () {
            this._clearCreateMode();

            this.model.cancel();
            this._backToCurrentContext();
        },

        _setupToolbar: function () {
            // summary:
            //    Set up the local toolbar.
            //
            // tags:
            //    private

            var toolbarGroups = [{
                name: "leading",
                type: "toolbargroup",
                settings: { region: "leading" }
            }, {
                name: "trailing",
                type: "toolbargroup",
                settings: { region: "trailing" }
            }];

            var toolbarButtons = [{
                parent: "leading",
                name: "breadcrumbs",
                widgetType: "epi-cms/widget/Breadcrumb",
                settings: { showCurrentNode: false }
            }, {
                parent: "leading",
                name: "currentcontent",
                widgetType: "epi-cms/widget/BreadcrumbCurrentItem"
            }, {
                parent: "trailing",
                name: "notificationCenter",
                widgetType: "epi-cms/widget/NotificationStatusBar"
            }, {
                parent: "trailing",
                name: "saveButton",
                title: sharedResources.action.create,
                label: sharedResources.action.create,
                type: "button",
                action: lang.hitch(this, this._onSave),
                settings: { "class": "epi-button--bold epi-primary" }
            }, {
                parent: "trailing",
                name: "cancelButton",
                title: sharedResources.action.cancel,
                label: sharedResources.action.cancel,
                type: "button",
                action: lang.hitch(this, this._onCancel),
                settings: { "class": "epi-button--bold" }
            }];

            when(this.toolbar.add(toolbarGroups), lang.hitch(this, function () {
                this.toolbar.add(toolbarButtons);
            }));
        },

        _changeContext: function (contentLink) {
            // summary:
            //    Redirect the newly created content to editmode.
            //
            // contentLink:
            //    The content link.
            //
            // tags:
            //    private

            topic.publish("/epi/shell/context/request", {
                uri: "epi.cms.contentdata:///" + contentLink
            }, {
                sender: this,
                viewName: this.view,
                forceContextChange: true,
                forceReload: true
            });
        },

        _backToCurrentContext: function () {
            // summary:
            //    Get back to the default main widget of the current context.
            //
            // tags:
            //    private

            topic.publish("/epi/shell/action/changeview/back");
        },

        _setCreateMode: function () {
            // summary:
            //      Set create new content state for current mode
            // tags:
            //      private

            lang.mixin(this._contextService.currentContext, {
                currentMode: "create"
            });

            topic.publish("/epi/cms/action/togglecreatemode", true);
        },

        _clearCreateMode: function () {
            // summary:
            //      Clear create new content state for current mode
            // tags:
            //      private

            domClass.remove(this.stackContainer.domNode, "epi-animation-node-reset");

            lang.mixin(this._contextService.currentContext, {
                currentMode: undefined
            });

            topic.publish("/epi/cms/action/togglecreatemode", false);
        }

    });

});
