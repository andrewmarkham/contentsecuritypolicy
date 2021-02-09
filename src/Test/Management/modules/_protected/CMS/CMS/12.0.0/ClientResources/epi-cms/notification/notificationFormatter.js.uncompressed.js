require({cache:{
'url:epi-cms/notification/templates/InternalNotification.html':"<div class=\"epi-event ${additionalEventClass}\">\r\n    ${contentIcon}<span class=\"dijitInline epi-floatRight epi-lozenge ${languageBranchClass}\">${languageBranch}</span><h3 class=\"epi-event__title dojoxEllipsis\">${title}</h3>\r\n    <div class=\"epi-event__message\">${message}</div>\r\n    <div class=\"epi-event__timestamp\">${postedAt}</div>\r\n</div>\r\n",
'url:epi-cms/notification/templates/ExternalNotification.html':"<div class=\"epi-event ${additionalEventClass}\">\r\n    ${contentIcon}\r\n    <a href=${url} target=\"_blank\">\r\n        <h3 class=\"epi-event__title dojoxEllipsis\">${title}</h3>\r\n        <div class=\"epi-event__message dojoxEllipsis\">${message}</div>\r\n        <div class=\"epi-event__timestamp\">${postedAt}</div>\r\n    </a>\r\n</div>\r\n"}});
define("epi-cms/notification/notificationFormatter", [
// dojo
    "dojo/dom-class",
    "dojo/string",

    //dojox
    "dojox/html/entities",

    // epi
    "epi/shell/TypeDescriptorManager",
    "epi-cms/dgrid/formatters",
    "epi/shell/dgrid/util/misc",
    "epi/string",

    // template
    "dojo/text!./templates/InternalNotification.html",
    "dojo/text!./templates/ExternalNotification.html",

    // resources
    "epi/i18n!epi/nls/episerver.shared"

], function (
// dojo
    domClass,
    string,

    // dojox
    entities,

    // epi
    TypeDescriptorManager,
    formatters,
    misc,
    epiString,

    // Template
    internalTemplate,
    externalTemplate,

    // resources
    sharedResources
) {

    var module;

    function cardFormatter() {
        // summary:
        //      Renders html for a card view of a User Notification list item.
        // tags:
        //      public

        function languageSelector(item) {
            //if the item is not ILocalizable it will not have a specific content language
            if (!item.contentLanguage) {
                return "";
            }
            // If the current content language differs from the contentLanguage for the list item
            // return the content language for the list item
            return item.contentLanguage !== module.contentLanguage ? item.contentLanguage : "";
        }

        function titleSelector(object) {

            if (object.subject) {
                return entities.encode(object.subject);
            }

            return "";
        }

        function iconSelector(iconKey) {
            // Message is posted on the project feed
            if (iconKey === "projectIcon") {
                return misc.icon("epi-iconObjectProject epi-objectIcon");
            }

            // Notification from the feature feed
            if (iconKey === "featureIcon") {
                return misc.icon("epi-iconObjectFeature epi-objectIcon");
            }

            // when message is posted on an IContent then the iconKey must be typeIdentifier
            if (iconKey) {
                var iconNodeClass = TypeDescriptorManager.getValue(iconKey, "iconClass");

                if (iconNodeClass) {
                    return misc.icon(iconNodeClass + " epi-objectIcon");
                }
            }

            // Otherwise no icon
            return "";
        }

        function getNotificationTemplate(notification) {
            return (notification && notification.isExternal) ? externalTemplate : internalTemplate;
        }

        return function formatter(value, object, node) {

            var template = getNotificationTemplate(value);
            var language = languageSelector(object);
            var map = {
                title: titleSelector(object),
                languageBranch: entities.encode(language),
                languageBranchClass: language ? "epi-card__language-branch" : "epi-card__language-branch--hidden",
                contentIcon: iconSelector(object.iconKey),
                message: epiString.toHTML(object.content),
                postedAt: formatters.localizedDate(object.posted),
                additionalEventClass: object.subject ? "" : "epi-event--no-title",
                url: value ? value.link : ""
            };

            var unread = (object.hasRead ? "" : " epi-card--unread");
            domClass.add(node, "epi-card epi-card--compact" + unread);

            return string.substitute(template, map);
        };
    }

    module = {
        // summary:
        //      A collection of formatters and utilities aiding
        //      rendering item lists.
        // tags:
        //      internal

        card: [
            cardFormatter()
        ]
    };

    return module;
});
