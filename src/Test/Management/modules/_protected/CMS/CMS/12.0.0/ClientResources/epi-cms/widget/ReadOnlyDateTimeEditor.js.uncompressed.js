require({cache:{
'url:epi-cms/widget/templates/ReadOnlyDateTimeEditor.html':"﻿<div class=\"dijitReset dijitInline epi-previewableTextBox-wrapper\">\r\n    <span data-dojo-attach-point=\"valueNode\" class=\"epi-previewableTextBox-text dijitInline\"></span>\r\n</div>"}});
﻿define("epi-cms/widget/ReadOnlyDateTimeEditor", [
    "dojo/_base/declare",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "epi/datetime",
    "dojo/text!./templates/ReadOnlyDateTimeEditor.html"
], function (
    declare,
    _Widget,
    _TemplatedMixin,
    epiDate,
    template
) {
    return declare([_Widget, _TemplatedMixin], {
        // tags:
        //      internal

        templateString: template,
        value: null,

        _setValueAttr: function (value) {
            this._set("value", value);
            if (value) {
                this.valueNode.innerHTML = epiDate.toUserFriendlyHtml(value);
            }
        }
    });
});
