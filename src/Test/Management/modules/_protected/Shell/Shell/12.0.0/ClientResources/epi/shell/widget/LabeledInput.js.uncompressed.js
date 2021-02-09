require({cache:{
'url:epi/shell/widget/templates/_LabeledInput_Top.htm':"﻿<div>\r\n\t<div class=\"editor-label\" dojoAttachPoint=\"labelContainer\">\r\n\t\t<label dojoAttachPoint=\"label\"></label>\r\n\t</div>\r\n\t<div class=\"editor-field\" dojoAttachPoint=\"inputContainer\">\r\n\t\t<div dojoAttachPoint=\"input\"></div>\r\n\t</div>\r\n</div>\r\n",
'url:epi/shell/widget/templates/_LabeledInput_Bottom.htm':"﻿<div>\r\n\t<div class=\"editor-field\" dojoAttachPoint=\"inputContainer\">\r\n\t\t<div dojoAttachPoint=\"input\"></div>\r\n\t</div>\r\n\t<div class=\"editor-label\" dojoAttachPoint=\"labelContainer\">\r\n\t\t<label dojoAttachPoint=\"label\"></label>\r\n\t</div>\r\n</div>\r\n",
'url:epi/shell/widget/templates/_LabeledInput_Left.htm':"﻿<div>\r\n\t<div class=\"editor-label\" style=\"float:left;\" dojoAttachPoint=\"labelContainer\">\r\n\t\t<label dojoAttachPoint=\"label\"></label>\r\n\t</div>\r\n\t<div class=\"editor-field\" dojoAttachPoint=\"inputContainer\">\r\n\t\t<div dojoAttachPoint=\"input\"></div>\r\n\t</div>\r\n\t<div style=\"clear: both;\"></div>\r\n</div>\r\n",
'url:epi/shell/widget/templates/_LabeledInput_Right.htm':"﻿<div>\r\n\t<div class=\"editor-label\" style=\"float: right;\" dojoAttachPoint=\"labelContainer\">\r\n\t\t<label dojoAttachPoint=\"label\"></label>\r\n\t</div>\r\n\t<div class=\"editor-field\" dojoAttachPoint=\"inputContainer\">\r\n\t\t<div dojoAttachPoint=\"input\"></div>\r\n\t</div>\r\n\t<div style=\"clear: both;\"></div>\r\n</div>\r\n"}});
﻿define("epi/shell/widget/LabeledInput", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/_LabeledInput_Top.htm",
    "dojo/text!./templates/_LabeledInput_Bottom.htm",
    "dojo/text!./templates/_LabeledInput_Left.htm",
    "dojo/text!./templates/_LabeledInput_Right.htm"],

function (declare, lang, domAttr,_Widget, _TemplatedMixin, topTemplate, bottomTemplate, leftTemplate, rightTemplate) {

    return declare([_Widget, _TemplatedMixin], {
        // summary:
        //      A widget which wrap another widget and create a label for it.
        //
        // tags:
        //      public

        // templateString: [protected] String
        //		A string that represents the widget template.
        templateString: null,

        postMixInProperties: function () {
            // summary:
            //		Create label, wrapped widget, and tight them up together

            var labelPos = this.params.labelPos;

            switch (labelPos) {
                case 2: // Bottom
                    this.templateString = bottomTemplate;
                    break;
                case 3: // Left
                    this.templateString = leftTemplate;
                    break;
                case 4: // Right
                    this.templateString = rightTemplate;
                    break;
                    //case 1:
                default: // Top
                    this.templateString = topTemplate;
                    break;
            }
        },

        postCreate: function () {
            // summary:
            //		Create label, wrapped widget, and tight them up together

            //settings passed to constructor
            var settings = this.params;

            if (settings.wrappedDojoType) {
                //extract label information
                var wrappedDojoType = settings.wrappedDojoType;

                var labelText = settings.label;

                //don't send not neccessary settings to the wrapped widget
                delete settings.wrappedDojoType;
                delete settings.labelPos;

                //create widget to be wrapped
                require([wrappedDojoType], lang.hitch(this, function (ctor) {
                    var wrappedWidget = new ctor(settings, this.input);

                    //point the label to the right element
                    domAttr.set(this.label, "for", wrappedWidget.id);
                }));

                this.label.innerHTML = labelText;
            }
        }
    });
});
