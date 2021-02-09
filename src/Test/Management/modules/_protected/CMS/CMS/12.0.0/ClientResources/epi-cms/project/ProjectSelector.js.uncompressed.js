require({cache:{
'url:dijit/form/templates/Select.html':"<table class=\"dijit dijitReset dijitInline dijitLeft\"\n\tdata-dojo-attach-point=\"_buttonNode,tableNode,focusNode,_popupStateNode\" cellspacing='0' cellpadding='0'\n\trole=\"listbox\" aria-haspopup=\"true\"\n\t><tbody role=\"presentation\"><tr role=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonContents\" role=\"presentation\"\n\t\t\t><div class=\"dijitReset dijitInputField dijitButtonText\"  data-dojo-attach-point=\"containerNode\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitValidationContainer\"\n\t\t\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t/></div\n\t\t\t><input type=\"hidden\" ${!nameAttrSetting} data-dojo-attach-point=\"valueNode\" value=\"${value}\" aria-hidden=\"true\"\n\t\t/></td\n\t\t><td class=\"dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer\"\n\t\t\tdata-dojo-attach-point=\"titleNode\" role=\"presentation\"\n\t\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t\t${_buttonInputDisabled}\n\t\t/></td\n\t></tr></tbody\n></table>\n"}});
define("epi-cms/project/ProjectSelector", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/Deferred",

    "dojox/html/entities",

    "epi",

    // Resources
    "dojo/text!dijit/form/templates/Select.html",
    "epi/i18n!epi/shell/ui/nls/episerver.shared.header",
    "epi/i18n!epi/cms/nls/episerver.cms.components.project",
    // Grid
    "./ProjectSelectorList",

    // Parent class and mixins
    "dijit/form/_FormValueWidget",
    "epi/shell/widget/DeferredDropDownButton",

    // Widgets in template
    "dijit/form/ToggleButton"
],
function (
    declare,
    lang,
    aspect,
    domConstruct,
    on,
    Deferred,

    entities,

    epi,

    // Resources
    template,
    localizations,
    projectResources,
    // Grid
    ProjectSelectorList,

    // Parent class and mixins
    _FormValueWidget,
    DeferredDropDownButton
) {
    return declare([DeferredDropDownButton, _FormValueWidget], {
        // summary:
        //      Drop down button for selecting projects
        // tags:
        //      internal xproduct

        // class: [protected] String
        //      class of the button
        "class": "epi-project-selector epi-chromeless epi-chromeless--with-arrow epi-flat",

        iconClass: "epi-iconProject",

        value: null,

        // store: [public] Store
        //      A store to query for the list of options.
        store: null,

        // sort: [public] Object
        //      How the projects are sorted in the drop down.
        sort: null,

        // query: [public] Object
        //      A query to use when fetching items from the store.
        query: null,

        // enableDefaultValue: [public] Boolean
        //      Enable/Disable the possiblity to select a default value (null)
        enableDefaultValue: false,

        // defaultValueText: [public] String
        //      The text to display for the default value if enabled
        defaultValueText: projectResources.preview.defaultoption,

        // header: [protected] String
        //      A string that will be displayed in the header of the selector.
        header: projectResources.selector.title,

        buildRendering: function () {
            this.inherited(arguments);

            this.own(
                this.dropDown = new ProjectSelectorList({
                    baseClass: "dijitMenu",
                    header: this.header,
                    enableDefaultValue: this.enableDefaultValue,
                    defaultValueText: this.defaultValueText
                }),
                on(this.dropDown, "change", lang.hitch(this, function (e) {
                    this.set("value", e.value, true);
                    this.closeDropDown(true);
                }), true)
            );
        },
        startup: function () {
            if (this._started) {
                return;
            }
            this.inherited(arguments);

            this.dropDown.startup();

            // Set initial value to null if no value has been specified and default values are enabled
            // Set the value after the widget has started to avoid setting the label twice
            // once from the value property setter and one time from the _CssStateMixin
            if (this.enableDefaultValue && !this.value) {
                this.set("value", null);
            }
        },

        compare: function (value1, value2) {
            // summary:
            //      Compare two values (as returned by get("value") for this widget).
            // tags:
            //      protected
            return epi.areEqual(value1, value2) ? 0 : -1;
        },

        loadAndOpenDropDown: function () {
            // summary:
            //      Opens the drop down and refreshes the content.
            // returns: Promise
            //      Promise for the drop down widget that resolves when
            //      the drop down is created and loaded.
            // tags:
            //      protected
            var args = arguments;

            //Refresh the drop down before opening it
            var promise = this.dropDown.refresh();

            return promise.then(lang.hitch(this, function () {
                return this.inherited(args);
            }));
        },

        isLoaded: function () {
            // summary:
            //      Make sure the dropdown is always considered not loaded
            //      if we have defaultValue enabled, to keep the autofocus
            //      on defaultValue working with the dropDown list
            // tags:
            //      protected
            if (this.enableDefaultValue) {
                return false;
            }
            return this.inherited(arguments);
        },

        _getQueryAttr: function () {
            return this.query || {};
        },

        _setQueryAttr: function (value) {
            this._set("query", value);
            if (this.dropDown) {
                this.dropDown.set("query", value);
            }
        },

        _setStoreAttr: function (store) {
            this._set("store", store);
            if (this.dropDown) {
                this.dropDown.set("store", store);
            }
        },

        _setLabelAttr: function (value) {
            // Override the default set label and encode all values before passing them to the drop down
            this.inherited(arguments, [entities.encode(value || "")]);
        },

        _setValueAttr: function (value, internal) {
            this.set("label", value && value.name);

            if (this.enableDefaultValue && !value) {
                this.set("label", this.defaultValueText);
            }
            !internal && this.dropDown && this.dropDown.set("selectedProject", value);

            this.inherited(arguments);
        }
    });
});
