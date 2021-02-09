require({cache:{
'url:dojox/html/resources/ellipsis.css':".dojoxEllipsis,.dojoxEllipsisShown {white-space: nowrap; width: 100%; overflow: hidden; text-overflow: ellipsis; -o-text-overflow: ellipsis; -webkit-text-overflow: ellipsis;}.dojoxEllipsis window {width:100%; -moz-user-focus:normal; -moz-user-select:text;}.dojoxEllipsis description{-moz-user-focus:normal; -moz-user-select:text;}.dojoxEllipsisIFrame{white-space: normal; border: none; width: 100%; display: block; height: 1px; margin-top: -1px; clear: both;}.dojoxEllipsisContainer{width: 100%;}.dojoxEllipsisShown:after{content: \"\\2026\"}"}});
﻿define("epi/shell/dgrid/util/misc", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    // dojox
    "dojox/html/entities",

    // EPi
    "epi/shell/dgrid/Formatter",

    // resources
    "dojo/text!dojox/html/resources/ellipsis.css"
],
function (
// dojo
    declare,
    lang,
    // dojox
    htmlEntities,
    // EPi
    Formatter,
    // resources
    ellipsisCss
) {

    var module = {
        // summary:
        //      This static module defines miscellaneous utility methods.
        // tags:
        //      public

        _attributeEncodeMap: [["&","amp"], ["\"","quot"]],

        htmlEncode: function (text) {
            // summary:
            //      Make html encode for the given value
            // text:
            //      The text you want to apply html encode
            // tags:
            //      public

            return htmlEntities.encode(text);
        },

        attributeEncode: function (text) {
            return htmlEntities.encode(text, module._attributeEncodeMap);
        },

        ellipsis: function (text, title) {
            // summary:
            //      Make ellipsis for the given text
            // text:
            //      The text you want to apply html ellipsis
            // tags:
            //      public

            if (!title || !lang.isString(title)) {
                title = text;
            }

            return lang.replace("<div class=\"dojoxEllipsis\" title=\"{0}\">{1}</div>", [title, text]);
        },

        ellipsisNoTooltip: function (text) {
            // summary:
            //      Make ellipsis for the given text
            // text:
            //      The text you want to apply html ellipsis
            // tags:
            //      public

            return lang.replace("<div class=\"dojoxEllipsis\">{0}</div>", [text]);
        },

        icon: function (icon, text) {
            // summary:
            //      Add an icon span to the front of the given text
            // text:
            //      The text you want to add an icon in front
            // tags:
            //      public

            text = text || "";

            return lang.replace("<span class=\"dijitInline dijitIcon {0}\"></span>{1}", [icon, text]);
        }
    };

    Formatter.addFormatter("htmlEncode", module.htmlEncode, false, true);
    Formatter.addFormatter("icon", function (icon) {
        return function (value) {
            return module.icon(icon, value);
        };
    }, true, true);
    Formatter.addFormatter("ellipsis", module.ellipsis, false, true);
    Formatter.addFormatter("ellipsisNoTooltip", module.ellipsisNoTooltip, false, true);

    return module;

});
