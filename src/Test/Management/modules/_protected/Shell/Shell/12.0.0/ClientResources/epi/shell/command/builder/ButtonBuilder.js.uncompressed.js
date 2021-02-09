define("epi/shell/command/builder/ButtonBuilder", [
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dijit/Menu",
    "dijit/form/Button",
    "dijit/form/DropDownButton",
    "dijit/form/ToggleButton",

    "epi/shell/command/ToggleCommand",
    "../_CommandModelBindingMixin",
    "./_Builder",
    "./OptionsBuilderMixin"

], function (
    declare,
    lang,

    Menu,
    Button,
    DropDownButton,
    ToggleButon,

    ToggleCommand,
    _CommandModelBindingMixin,
    _Builder,
    OptionsBuilderMixin
) {

    var dropDownClass = declare([DropDownButton, _CommandModelBindingMixin], {
        onClick: function () {}
    });

    var CommandToggleButton = declare([ToggleButon, _CommandModelBindingMixin]);

    return declare([_Builder], {
        // summary:
        //      Builds a button widget and connects events based on a command object.
        //
        // tags:
        //      internal xproduct

        // optionClass: string
        //      default css class for the dropdown created for the options
        // tags:
        //      internal
        optionClass: "",

        // optionItemClass: string
        //      default css class for the dropdown created for the options
        // tags:
        //      internal
        optionItemClass: "",

        // _buttonClass: [protected] class
        //      The class used for representing a button bound to a command
        _buttonClass: declare([Button, _CommandModelBindingMixin]),

        _dropDownClass: dropDownClass,

        _optionsMenuClass: declare([Menu, OptionsBuilderMixin], { baseClass: "epi-optionsMenu"}),

        _create: function (/*epi/shell/command/_Command*/command) {
            // tags:
            //		protected

            var hasOptions = command.get("options") instanceof Array,
                options = this._createOptions(command);

            if (hasOptions) {

                return new this._dropDownClass(lang.mixin({
                    "class": "epi-chromeless epi-mediumButton",
                    dropDown: new this._optionsMenuClass({
                        "class": this.optionClass,
                        model: command,
                        optionItemClass: this.optionItemClass
                    })
                }, options));
            }

            if (command instanceof ToggleCommand) {
                return new CommandToggleButton(options);
            }

            return new this._buttonClass(options);
        },

        _createOptions: function (/*epi/shell/command/_Command*/command) {
            // tags:
            //		protected

            var options = lang.mixin({
                model: command
            }, this.settings);

            // if the label text is not set we should ensure that the domNode is not rendered by setting showLabel to false
            if (options.hasOwnProperty("showLabel") && !command.label) {
                options.showLabel = false;
                options.model.label = options.model.tooltip || "";
            }

            return options;
        }
    });
});
