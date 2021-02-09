require({cache:{
'url:epi-cms/widget/templates/_HyperLinkLanguageField.html':"<div class=\"epi-form-container__section__row epi-form-container__section__row--field epi-hyperLink\">\r\n    <label for=\"${id}\" title=\"${title}\">${label}</label>\r\n</div>"}});
﻿define("epi-cms/widget/HyperLinkSelector", [
//dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/Deferred",

    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/when",
    "dojo/promise/all",
    "dojo/string",
    //dijit
    "dijit/_Widget",
    "dijit/_Container",
    "dijit/form/ValidationTextBox",
    //epi
    "epi/dependency",
    "epi/Url",
    "epi/shell/widget/_ModelBindingMixin",
    "epi-cms/widget/_HyperLinkFieldItem",
    "epi-cms/contentediting/editors/SelectionEditor",
    "epi-cms/widget/viewmodel/HyperLinkSelectorViewModel",
    "epi-cms/form/EmailValidationTextBox",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.editlink",
    // Template
    "dojo/text!./templates/_HyperLinkLanguageField.html"
],
function (
//dojo
    array,
    declare,
    lang,
    Deferred,

    domStyle,
    domClass,
    domConstruct,
    when,
    all,
    dojoString,
    //dijit
    _Widget,
    _Container,
    ValidationTextBox,
    //epi
    dependency,
    Url,
    _ModelBindingMixin,
    _HyperLinkFieldItem,
    SelectionEditor,
    HyperLinkSelectorViewModel,
    EmailValidationTextBox,

    resources,
    template
) {
    return declare([_Widget, _Container, _ModelBindingMixin], {
        // summary:
        //    Represents the selector for all hyper link, for example: page, media, 3rd party providers.
        // tags:
        //    internal

        value: null,

        // showLanguageSelector: [internal] Boolean
        //      Show or hide the language selector
        showLanguageSelector: true,

        // Set by form _FormMixin and used by validation to determine whether the error state should be shown
        _hasBeenBlurred: false,

        modelClassName: HyperLinkSelectorViewModel,

        modelBindingMap: {
            wrapperSettings: ["wrapperSettings"],
            selectedWrapper: ["selectedWrapper"]
        },

        _languageSelector: null,
        _languageSelectorWrapperNode: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.model && this.modelClassName) {
                var modelClass = declare(this.modelClassName);
                this.model = new modelClass({ providers: this.providers });
            }

            this._languageStore = this._languageStore || dependency.resolve("epi.storeregistry").get("epi.cms.language");
        },

        buildRendering: function () {
            this.inherited(arguments);

            this._createLanguageSelector();
            this._createRemainingUrlInput();

        },

        startup: function () {
            this.inherited(arguments);

            this._languageSelector.startup();
            this._remainingUrl.startup();

            //Add the available languages to the language selector
            var self = this,
                languageSelector = this._languageSelector;
            when(this._languageStore.get(), function (languages) {

                //Show the selector if there are more than one language enabled on the site
                if (self.get("showLanguageSelector")) {
                    if (languages.length <= 1) {
                        self._toggleLanguageSelector(false);
                    } else {
                        self._toggleLanguageSelector(true);
                    }
                }

                var selections = languages.map(function (language) {
                    return {
                        text: language.name,
                        value: language.languageId
                    };
                });

                // Add the automatic option first
                selections.splice(0, 0, {text: resources.automaticlanguage, value: ""});
                languageSelector.set("selections", selections);

                //Select the default (Automatic value)
                languageSelector.set("value", "");

                // createInputWrappers run require for child widgets so the first time we load this widget it runs the startup before the child widgets has created.
                // that's why we're creating child widgets in startup other than buildRendering.

                // Run the create input wrappers after the language selector has been initialized,
                // otherwise the onSelectorsCreated might run before the languages has been initialized
                return self._createInputWrappers();
            }).then(function () {
                // Place the remaining url after all other inputs
                domConstruct.place(this._remainingUrlWrapperNode, this.domNode, "last");
            }.bind(this));
        },

        onSelectorsCreated: function (widget) {
            // summary:
            //    Raise when finish constructing hyperlinkSelector.
            // tags:
            //    public
        },

        _setShowLanguageSelectorAttr: function (value) {
            this._set("showLanguageSelector", value);
            this._toggleLanguageSelector(value);
        },

        _setSelectedWrapperAttr: function (target) {
            // summary:
            //    Disabled all wrappers, enabled selected.
            // tags:
            //    private

            if (!target) {
                return;
            }

            array.forEach(this.wrappers, function (wrapper) {
                wrapper.set("selected", false);
            });

            target.set("selected", true); // mark this widget as selected/enabled

            // Enable/Disable the language selector depending on if the wrapper is used to select ContentReferences
            this._languageSelector.set("disabled", !target.settings.isContentLink);

            // The remaining url input should only be visible if the current wrapper is for internal links
            domClass.toggle(this._remainingUrlWrapperNode, "dijitHidden", !target.settings.isContentLink);

        },

        _createLanguageSelector: function () {
            // summary:
            //      Create the language selector
            // tags:
            //      private

            this.own(this._languageSelector = new SelectionEditor());

            //Create the row for the selector and hide it by default
            this._languageSelectorWrapperNode = domConstruct.toDom(
                dojoString.substitute(template, {
                    id: this._languageSelector.id,
                    label: resources.language,
                    title: ""
                }));
            domConstruct.place(this._languageSelectorWrapperNode, this.domNode, "first");

            //Inject the selector
            this._languageSelector.placeAt(this._languageSelectorWrapperNode, "last");
        },

        _createRemainingUrlInput: function () {
            this.own(this._remainingUrl = new ValidationTextBox({}));
            this._remainingUrlWrapperNode = domConstruct.toDom(
                dojoString.substitute(template, {
                    id: this._remainingUrl.id,
                    label: resources.remainingurl,
                    title: resources.remainingurltitle
                }));
            this._remainingUrl.placeAt(this._remainingUrlWrapperNode, "last");
        },

        _toggleLanguageSelector: function (visible) {
            // summary:
            //      Toggle the visibility of the language selector
            // visible: Boolean
            //      True if it should be visible otherwise false
            // tags:
            //      protected

            domClass.toggle(this._languageSelectorWrapperNode, "dijitHidden", !visible);
        },

        _createInputWrappers: function () {
            // summary:
            //      Create the input wrappers for the providers

            var settings = this.model.wrapperSettings,
                createPromises = [],
                self = this;

            settings.forEach(function (setting) {
                var def = new Deferred();

                createPromises.push(def.promise);

                require([setting.widgetType], function (ctor) {

                    var wrapper = new _HyperLinkFieldItem(lang.mixin(setting, {
                        groupName: setting.groupName + this.id,
                        inputWidgetCtor: ctor,
                        required: self.required
                    }));

                    self.own(wrapper.on("radioButtonChange", lang.hitch(this, function () {
                        self.set("selectedWrapper", wrapper);
                        wrapper.focus();
                    })));

                    //Hide the widget if it set to invisible
                    if (setting.invisible) {
                        domStyle.set(wrapper.domNode, { display: "none" });
                    }

                    def.resolve(wrapper);
                });

            }, this);

            return when(all(createPromises), function (wrappers) {
                if (wrappers.length === 0) {
                    return;
                }

                //Add the wrappers to the child collection
                wrappers.forEach(function (wrapper) {
                    self.addChild(wrapper);
                });

                self.set("wrappers", wrappers);

                var value = self.get("value");
                if (value) {
                    self._setValueForWidgets(value);
                } else {
                    //Select the first wrapper
                    self.set("selectedWrapper", wrappers[0]);
                }

                self.onSelectorsCreated(self);
            });
        },

        _getSelectedWrapper: function () {
            // summary:
            //    Get selected widget.
            // tags:
            //    private
            return array.filter(this.wrappers, function (wrapper) {
                return wrapper.get("selected");
            })[0];
        },

        _getValueAttr: function () {
            // summary:
            //    Get selected href.
            // tags:
            //    private
            var selectedWrapper = this._getSelectedWrapper();
            if (selectedWrapper) {
                if (selectedWrapper.inputWidget && selectedWrapper.settings.isContentLink) {

                    return this.model.getUrlValue(
                        selectedWrapper.inputWidget.get("permanentLink"),
                        this._languageSelector.get("value"),
                        this._remainingUrl.get("value"),
                        this.value
                    );

                } else {
                    return selectedWrapper.get("value");
                }
            }

            return this.value;
        },

        _setValueAttr: function (value) {
            // summary:
            //    Set selected href.
            // tags:
            //    private


            var setValue = function (value) {
                this._set("value", value);

                this._remainingUrl.set("value", this.model.getRemainingUrl(value));
                this._setValueForWidgets(value);
            };

            if (value) {
                // No need to try to resolve a permenent link if there isn't a value
                this.model.getPermanentLink(value).then(setValue.bind(this));
            } else {
                setValue.call(this, value);
            }
        },

        _setValueForWidgets: function (value) {
            // Reset wrappers value to default

            var wrappers = this.get("wrappers");
            if (!wrappers) {
                return;
            }

            array.forEach(wrappers, function (wrapper) {
                wrapper.set("value", null);
            });

            if (!value) {
                return;
            }

            var url = new Url(this.value);
            this._languageSelector.set("value", url.getQueryParameterValue("epslanguage"));

            when(this.model.getContentData(value), lang.hitch(this, function (content) {
                if (content) { // dynamic link (pages, media, products)
                    array.every(wrappers, function (wrapper) {
                        if (wrapper && wrapper.settings.isContentLink) {
                            if (array.some(wrapper.settings.allowedTypes, lang.hitch(this, function (baseType) {
                                return this.model.isBaseTypeIdentifier(content.typeIdentifier, baseType);
                            }))) {
                                wrapper.set("value", content.contentLink);

                                this.set("selectedWrapper", wrapper);
                                return false; // break the loop
                            }
                        }
                        return true; // continue the loop
                    }, this);
                } else { // static link (email, external links)
                    array.every(wrappers, function (wrapper) {
                        if (wrapper && !wrapper.settings.isContentLink) {
                            var widget = wrapper.inputWidget;
                            if (widget && this._isValidEditorWidget(value, widget) && widget.validator(value, widget.constraints)) {
                                wrapper.set("value", value);
                                this.set("selectedWrapper", wrapper);
                                return false; // break the loop
                            }
                        }
                        return true; // continue the loop
                    }, this);
                }
            }));
        },

        _isValidEditorWidget: function (value, widget) {
            // summary:
            //    Checks if it is an valid editor widget. We only want it to validate against email if the url scheme is mailto.
            //
            // tags:
            //    private
            if (widget instanceof EmailValidationTextBox) {
                return Url(value).scheme === "mailto";
            }
            return true;
        },

        validate: function () {
            // summary:
            //    Validation value of Href.
            // tags:
            //    public
            var selectedWrapper = this._getSelectedWrapper();
            if (selectedWrapper) {
                // Set by form _FormMixin and used by validation to determine whether the error state should be shown
                selectedWrapper._hasBeenBlurred = this._hasBeenBlurred;
                return selectedWrapper.validate();
            }
            return false;
        },

        focus: function () {
            // summary:
            //    Set focus to the selected wrapper
            // tags:
            //    public
            var selectedWrapper = this._getSelectedWrapper();

            if (selectedWrapper) {
                selectedWrapper.focus();
            }
        },

        reset: function () {
            // Do as in _FormValueMixin.reset()
            this._hasBeenBlurred = false;
            this.set("value", null);
        }
    });
});
