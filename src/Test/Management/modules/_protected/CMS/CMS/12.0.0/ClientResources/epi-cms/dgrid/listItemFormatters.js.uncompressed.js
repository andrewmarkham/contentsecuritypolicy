require({cache:{
'url:epi-cms/dgrid/templates/ListItem.html':"<div class=\"epi-mo\">\r\n    <div class=\"epi-mo--img\">\r\n        <div class=\"dijitIcon ${iconResizer}\">${icon}</div>\r\n    </div>\r\n    <div class=\"epi-mo--body\">\r\n        <div class=\"epi-card__menu\">\r\n            ${menu}\r\n        </div>\r\n        <span class=\"epi-secondaryText dijitInline epi-lozenge ${languageBranchClass}\">${languageBranch}</span>\r\n        <div class=\"epi-card__info\">\r\n            <div class=\"dijitInline\">\r\n                <span class=\"epi-card__title\" title=\"${cardTitleTooltip}\">${cardTitle}</span>\r\n                <span class=\"epi-secondaryText\">\r\n                    ${contentTypeDescription}\r\n                    <span class=\"dijitInline epi-lozenge ${languageBranchClass}\">${languageBranch}</span>\r\n                </span>\r\n            </div>\r\n        </div>\r\n        <div class=\"dijitInline epi-card__title--ellipsis-wrapper\">\r\n            <div>\r\n                <span class=\"dijitInline epi-card__title dojoxEllipsis\" title=\"${nameTooltip}\">${name}</span>\r\n            </div>\r\n            ${statusIcon}<span class=\"epi-secondaryText\">${status}</span>\r\n            <span class=\"dijitInline dijitIcon epi-iconBubble epi-icon--warning ${commentsClass}\" title=\"${commentsTooltip}\"></span>\r\n        </div>\r\n    </div>\r\n</div>"}});
define("epi-cms/dgrid/listItemFormatters", [
// dojo
    "dojo/dom-class",
    "dojo/string",

    //dojox
    "dojox/html/entities",

    // epi
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/dgrid/formatters",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.versionstatus",
    "epi/i18n!epi/nls/episerver.shared",

    // template
    "dojo/text!./templates/ListItem.html"

], function (
// dojo
    domClass,
    string,

    // dojox
    entities,

    // epi
    ContentActionSupport,
    formatters,

    // Resources
    res,
    versionStatusRes,
    sharedResources,

    // Template
    template
) {

    var module;

    function titleSelector(item) {
        return item.path ? item.path.join(" > ") :
            item.name;
    }

    function languageSelector(item) {
        //if the item is not ILocalizable it will not have a specific content language
        if (!item.contentLanguage) {
            return null;
        }
        // If the current content language differs from the contentLanguage for the list item
        // return the content language for the list item
        return item.contentLanguage !== module.contentLanguage ?  { language: item.contentLanguage } : null;
    }

    function statusFormatter(value, object, node/*, options*/) {
        // summary:
        //      Usable for the view to get an icon indicating the status of an item.
        // tags:
        //      public

        var accessLevel = ContentActionSupport.accessLevel,
            cssClass = "epi-statusIndicatorIcon epi-statusIndicator" + object.status,
            title = ContentActionSupport.versionLocalizations[object.status] || "";

        if (object.isDeleted) {
            cssClass = "epi-iconWarning epi-icon--warning";
            title = versionStatusRes.versionnotfound;
            domClass.add(node, "epi-content--deleted");
        } else if (!ContentActionSupport.hasAccess(object.accessMask, accessLevel.Read)) {
            cssClass = "epi-iconLock";
            title = res.status.message.noreadaccess;
            domClass.add(node, "epi-content--no-access");
        } else if (!ContentActionSupport.hasAccess(object.accessMask, accessLevel.Publish)) {
            cssClass = "epi-iconWarning epi-icon--warning";
            title = res.status.message.nopublishaccess;
        }

        return "<span class=\"dijitReset dijitInline dijitIcon epi-objectIcon " + cssClass + "\" title=\"" + title + "\"></span>" + value;
    }

    function cardFormatter(baseCss) {
        // summary:
        //      Renders html for a card view of a list item.
        // tags:
        //      public

        return function formatter(value, object, node, options) {

            var language = languageSelector(object),
                name = value.name || "",
                cardTitle = string.substitute(res.list.card.modifiedbyuser, {
                    modified: formatters.localizedDate(object.modified),
                    userName: formatters.userName(object.userName)
                }),
                status = (ContentActionSupport.versionLocalizations[object.status] || "") + (object.delayPublishUntil ? " " + formatters.localizedDate(object.delayPublishUntil) : ""),
                map,
                typeIdentifier = object.typeIdentifier;

            // If the user lacks read permissions remove the card title and set the name to (Not available)
            if (!ContentActionSupport.hasAccess(object.accessMask, ContentActionSupport.accessLevel.Read)) {
                name = res.status.message.notavailable;
                status = res.status.message.insufficient;
                cardTitle = "";
                typeIdentifier = "";
            }

            if (object.isDeleted) {
                status = versionStatusRes.versionnotfound;
            }

            map = {
                iconResizer: object.thumbnailUrl ? "epi-card__icon epi-card__icon--thumbnailresizer" : "epi-card__icon",
                icon: object.thumbnailUrl ? formatters.thumbnail(object.thumbnailUrl) : typeIdentifier && formatters.contentIcon(typeIdentifier, " epi-icon--large") || "",
                name: entities.encode(name, entities.html),
                nameTooltip: entities.encode(titleSelector(object) || "", entities.html),
                statusIcon: statusFormatter("", object, node, options),
                status: status,
                menu: formatters.menu({title: sharedResources.action.options}),
                cardTitle: cardTitle,
                cardTitleTooltip: res.list.card.lastmodified,
                contentTypeDescription: formatters.contentTypeDescription(typeIdentifier) || "",
                languageBranch: language && language.language || "",
                languageBranchClass: language && language.language ? "epi-card__language-branch" : "epi-card__language-branch--hidden",
                commentsClass: object.hasComments ? "" : "dijitHidden",
                commentsTooltip: res.list.card.hascomments
            };

            //Add classname for each row in dgrid list
            domClass.add(node, baseCss);

            return string.substitute(template, map);
        };
    }

    module = {
        // summary:
        //      A collection of formatters and utilities aiding
        //      rendering item lists.
        // tags:
        //      internal

        contentLanguage: null,

        languageSelector: languageSelector,

        titleSelector: titleSelector,

        statusFormatter: statusFormatter,

        card: [
            cardFormatter("epi-card")
        ],

        "card-compact": [
            cardFormatter("epi-card epi-card--compact")
        ]
    };

    return module;
});
