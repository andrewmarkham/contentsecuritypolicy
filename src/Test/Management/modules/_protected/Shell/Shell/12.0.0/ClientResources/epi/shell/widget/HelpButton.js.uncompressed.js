require({cache:{
'url:epi/shell/widget/templates/HelpButton.htm':"﻿<span><a target=\"_blank\" href=\"${helpUrl}\" title=\"${commonRes.action.help}\" onclick=\"window.open('${helpUrl}','_blank', 'scrollbars=yes, height=500, location=no, menubar=no, resizable=yes, toolbar=no, width=840');return false;\" class=\"epi-helpIcon\">&nbsp;</a></span>"}});
﻿define("epi/shell/widget/HelpButton", [
    "dojo/_base/declare",
    "dojo/i18n",
    "epi",
    "epi/dependency",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/HelpButton.htm"
], function (declare, i18n, epi, dependency, _Widget, _TemplatedMixin, template) {

    return declare([_Widget, _TemplatedMixin], {
        // summary:
        //    Help button widget
        //
        // description:
        //    Displays a button that opens the specified webhelp section
        //
        // tags:
        //    public


        // moduleName: [public] String
        //    Name of Shell Module
        moduleName: null,

        // webHelpAlias: [public] String
        //    Topic alias in the web help
        webHelpAlias: null,

        // helpUrl: [public] String
        //    The web help url
        helpUrl: null,

        // templateString: String
        //    Template for the widget
        templateString: template,

        // commonRes: Object
        //    Common localization resources objects
        commonRes: epi.resources,

        postMixInProperties: function () {
            // summary:
            //     Unless helpUrl was explicitly set, this will get the module
            //     from the module manager and then get the help path from the module
            //
            // tags:
            //    protected

            if (this.helpUrl === null) {
                var _manager = dependency.resolve("epi.ModuleManager");
                var _module = _manager.getModule(this.moduleName);
                this.helpUrl = _module.helpPath + "#" + this.webHelpAlias;
            }

            this.inherited(arguments);
        }
    });
});
