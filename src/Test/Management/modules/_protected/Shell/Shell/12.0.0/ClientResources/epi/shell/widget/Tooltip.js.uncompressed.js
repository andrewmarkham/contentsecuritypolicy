define("epi/shell/widget/Tooltip", [
    "dojo/_base/declare",
    "dojo/string",

    "dojox/html/entities",
    "dojox/html/ellipsis",

    "dijit/Tooltip"
], function (
    declare,
    string,

    entities,
    ellipsis,

    Tooltip) {
    return declare(Tooltip, {
        // tags:
        //      internal

        showDelay: 600, // tooltip display timeout increased,

        // position: String[]
        //      List of positions to try to position tooltip
        position: ["after", "before", "below", "above"],

        // tooltipRows: [public] Array
        //      If property is set the lable will be overriden
        //      Accepts an array of {label:'', text:'', htmlEncode:false}
        tooltipRows: null,

        // tooltipRowTemplate: [public] String
        //      Detault row template tooltip added to tooltipRows
        tooltipRowTemplate: "<span>${label}</span>: ${text}",
        tooltipRowNoTextTemplate: "<span>${label}</span>",

        getContent: function () {
            //If there are any tooltip rows create a label using the tooltipRowTemplate
            if (this.tooltipRows) {
                var content = "<ul class='dijitInline dijitReset epi-tooltip-ellipsis'>";
                for (var i = 0; i < this.tooltipRows.length; i++) {
                    var row = this.tooltipRows[i];
                    if (!row.text) {
                        row.text = "";
                    }
                    if (row.htmlEncode === undefined || row.htmlEncode === true) {
                        row.label = entities.encode(row.label);
                        row.text = entities.encode(row.text);
                    }
                    if (!row.text) {
                        content += "<li class='dojoxEllipsis'>" + string.substitute(this.tooltipRowNoTextTemplate, row) + "</li>";
                    } else {
                        content += "<li class='dojoxEllipsis'>" + string.substitute(this.tooltipRowTemplate, row) + "</li>";
                    }
                }
                content += "</ul>";

                return content;
            }

            return this.inherited(arguments);
        }
    });
});
