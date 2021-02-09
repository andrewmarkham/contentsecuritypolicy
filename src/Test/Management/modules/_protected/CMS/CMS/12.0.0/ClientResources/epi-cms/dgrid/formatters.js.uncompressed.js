define("epi-cms/dgrid/formatters", [
// dojo
    "dojo/_base/lang",
    "dojo/dom-class",

    // epi
    "epi/datetime",
    "epi/username",
    "epi/string",

    "epi/shell/dgrid/Formatter",
    "epi/shell/dgrid/util/misc",
    "epi/shell/TypeDescriptorManager",

    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/widget/viewmodel/ContentStatusViewModel",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.versions",
    "epi/i18n!epi/cms/nls/episerver.shared.header"
],
function (
// dojo
    lang,
    domClass,

    // epi
    epiDate,
    username,
    epiString,

    Formatter,
    misc,
    TypeDescriptorManager,

    ContentActionSupport,
    ContentStatusViewModel,

    resources,
    headerResources
) {
    var module = {
        // summary:
        //      Static module that defines miscellaneous formatter methods
        //      for use with the dgrid.
        // tags:
        //      public

        defaultIconClass: "epi-iconObjectUnknown",

        thumbnail: function (thumbnailUrl) {
            var template = "<image src=\"{0}?{1}\" class=\"epi-floatLeft epi-thumbnail\"/>";
            return thumbnailUrl ? lang.replace(template, [thumbnailUrl, new Date().getTime()]) : "";
        },

        contentIcon: function (typeIdentifier, additionalClass) {
            // summary:
            //      Adds an icon as specified for the type or a default object icon
            // typeIdentifier:
            //      key for the type
            // additionalClass: String?
            //      additional css class
            // tags:
            //      public

            return misc.icon(module.contentIconClass(typeIdentifier, additionalClass));
        },

        contentIconClass: function (typeIdentifier, additionalClass) {
            // summary:
            //      class name of an icon as specified for the type or a default object icon
            // typeIdentifier:
            //      key for the type
            // additionalClass: String?
            //      additional css class
            // tags:
            //      internal

            var iconNodeClass = TypeDescriptorManager.getValue(typeIdentifier, "iconClass");

            var input = iconNodeClass + " epi-objectIcon";
            if (additionalClass) {
                input += " " + additionalClass;
            }

            return input;
        },

        contentTypeDescription: function (typeIdentifier) {
            // summary:
            //      Return content type description
            // typeIdentifier:
            //      key for the type
            // tags:
            //      public
            return TypeDescriptorManager.getResourceValue(typeIdentifier, "name", false);
        },

        languageBranch: function (languageBranch) {
            // summary:
            //      Adds an indicator of the true language for the content object
            // languageBranch:
            //      Language branch object.
            // tags:
            //      public
            return languageBranch ? "<span class=\"epi-missingLanguageIndicator\">" + languageBranch.language + "</span>" : "";
        },

        menu: function (/*Object*/settings) {
            // summary:
            //      Adds a menu icon
            // settings:
            //      Settings information for menu
            // tags:
            //      public

            return lang.replace("<span class=\"dijitInline dijitIcon epi-iconContextMenu epi-floatRight\" title=\"{title}\">&nbsp;</span>", settings);
        },

        path: function (path, options) {
            // summary:
            //      Returns markup for the path to an item created from the names in the path array
            // path: String[]
            //      An array of with the path to render
            // options: Object?
            //      Optional object, supporting the following parameters:
            //      * skipEncode: do not encode the path segments
            //      * skipDefaultClass: do not add the default 'treePath' css class
            // tags:
            //      public

            if (path && path.length) {
                options = options || {};

                var tooltip = path.join(" > ");
                var title = options.skipEncode ? tooltip : misc.attributeEncode(tooltip);
                path = epiString.truncateMiddle(path, 40, "\u2026");

                var text = path.map(function (value) {
                    return options.skipEncode ? value : misc.htmlEncode(value);
                }).join("<span class=\"epi-breadCrumbsSeparator\">&gt;</span>");

                return lang.replace("<span class=\"{className} dojoxEllipsis\" title=\"{title}\">{text}</span>", {
                    className: options.skipDefaultClass ? "" : "dgrid-column-treePath", title: title, text: text
                });
            }
            return "";
        },

        userName: function (userName) {
            // summary:
            //      Shim for the epi/username/toUserFriendlyHtml function
            // userName:
            //      The user name.
            // tags:
            //      public
            return username.toUserFriendlyHtml(userName);
        },

        localizedDate: function (date) {
            // summary:
            //      Shim for the epi/date/toUserFriendlyHtml function
            // date:
            //      The date to format.
            // tags:
            //      public
            return epiDate.toUserFriendlyHtml(date);
        },

        friendlyBoolean: function (value) {
            // summary:
            //      Creates a div with a "checked/not checked" css class.
            // tags:
            //      public
            var cssClass = value ? "epi-iconCheckmark" : "epi-iconStop";
            return "<div class=\"" + cssClass + "\" />";
        },

        versionStatus: function (versionId) {
            // summary:
            //      Shim for the epi-cms/contentediting/ContentActionSupport.getVersionStatus function
            // versionId:
            //      The value to format.
            // tags:
            //      public
            return ContentActionSupport.getVersionStatus(versionId);
        },

        commonDraft: function (item, value, node) {
            // summary:
            //      Adds an addition node to the inner HTML of the node if the item is a common draft.
            // tags:
            //      public
            if (item.isCommonDraft) {
                node.innerHTML = "<span class=\"dijitReset dijitInline dijitIcon epi-iconPrimary epi-floatRight\" title=\"" + resources.primarydraft + "\"></span>";
            }
            node.innerHTML += module.versionStatus(value);
        },

        visibleLink: function (value, valueIsHtml) {
            // summary:
            //      Wraps the value with a span with the 'epi-visibleLink' css class
            // valueIsHtml:
            //      Pass true to skip html encoding of the value. The default is to encode the value.
            // tags:
            //      public

            if (!value) {
                return "";
            }

            var text = !valueIsHtml ? misc.htmlEncode(value) : value;

            return "<span class=\"epi-visibleLink\">" + text + "</span>";
        },

        secondaryText: function (value, valueIsHtml) {
            // summary:
            //      Wraps the value with a span with the 'epi-secondaryText' css class
            // valueIsHtml:
            //      Pass true to skip html encoding of the value. The default is to encode the value.
            // tags:
            //      public

            if (!value) {
                return "";
            }

            var text = !valueIsHtml ? misc.htmlEncode(value) : value;

            return "<span class=\"epi-secondaryText\">" + text + "</span>";
        },

        title: function (name, contentLink, contentTypeName) {
            // summary:
            //      Returns a title string that looks like "{name}, ID: {contentLink} (Type: {contentTypeName})"
            // name: String
            //      The name of the item
            // contentLink: String
            //      The content link
            // contentTypeName: String
            //      The name of the content type
            // tags:
            //      public

            return name + ", " + headerResources.id + ": " + contentLink + " (" + headerResources.type + ": " + contentTypeName + ")";
        },

        contentItemFactory: function (textSelector, titleSelector, iconSelector, menuSettings, thumbnailSelector, languageSelector, isEncoded, showStatus) {
            // summary:
            //      Factory function for configuring the contentItem formatter
            // textSelector:
            //      Selector function or property key of content object
            // titleSelector:
            //      Selector function or property key of content object
            // iconSelector:
            //      Selector function or property key of content object
            // menuSettings:
            //      Settings information for menu
            // isEncoded: Boolean
            //      Flags which is used to enabled/disable encode mode. (default true)
            // showStatus: Boolean?
            //      Flags which is used to enabled/disable status icon display. (default false)
            // tags:
            //      public

            return function (value, object, node, options) {
                var returnValue,
                    typeIdentifier,
                    text,
                    title,
                    missingLanguageBranch,
                    valueIsString,
                    thumbnailUrl,
                    status;

                function get(name) {
                    if (typeof object.get === "function") {
                        return object.get(name);
                    }
                    return object[name];
                }

                function selectorExecutor(selector) {
                    if (selector) {
                        if (typeof selector === "function") {
                            return selector(object);
                        } else {
                            return get(selector);
                        }
                    }
                    return value;
                }

                valueIsString = typeof value === "string";
                typeIdentifier = selectorExecutor(iconSelector || (valueIsString ? false : "typeIdentifier"));
                text = selectorExecutor(textSelector || (valueIsString ? false : "text"));
                title = selectorExecutor(titleSelector || (valueIsString ? false : "title"));
                missingLanguageBranch = (languageSelector && selectorExecutor(languageSelector)) || object.missingLanguageBranch;
                thumbnailUrl = thumbnailSelector && selectorExecutor(thumbnailSelector);
                status = showStatus ? object.status : null;

                returnValue = module.contentItem(typeIdentifier, missingLanguageBranch, text, title, menuSettings, thumbnailUrl, isEncoded, status);

                node.innerHTML = returnValue;

                //If in a list add css-class for the row as well
                if (node.nodeName !== "TD" && missingLanguageBranch) {
                    domClass.add(node, "epi-ct-missingLanguageRow");
                }

                return returnValue;
            };
        },

        contentItem: function (typeIdentifier, missingLanguageBranch, text, title, menuSettings, thumbnailUrl, isEncoded, status) {
            // summary:
            //      Formats a content object with icon missing language indicator and an optional menu
            // typeIdentifier:
            //      content type key for selecting the icon
            // missingLanguageBranch:
            //      Content items language information
            // text:
            //      The name or description of the content
            // title:
            //      The name or description of the content used for the title attribute.
            //      If not specified, the text value will be used
            // menuSettings:
            //      Settings information for menu
            // thumbnailUrl:
            //      The image public url of content
            // isEncoded: Boolean
            //      The flag which is used to enable/disable encode mode. (default true)
            // status: Integer?
            //      content status code
            // tags:
            //      public

            var menu = (menuSettings && menuSettings.hasMenu) ? module.menu(menuSettings.settings) : "",
                languageBranch = module.languageBranch(missingLanguageBranch);

            isEncoded = (isEncoded === null || isEncoded === undefined) ? true : isEncoded;
            title = isEncoded ? misc.attributeEncode(title || text) : (title || text);
            text = isEncoded ? misc.htmlEncode(text) : text;
            var statusIcon = "";

            if (status) {
                statusIcon = module._statusIcon(status);
            }

            return (thumbnailUrl ? module.thumbnail(thumbnailUrl) : module.contentIcon(typeIdentifier)) + menu + statusIcon + languageBranch + misc.ellipsis(text, title);
        },

        _statusIcon: function (status) {
            // summary:
            //      Create element for status icon
            // status: Integer?
            //      content status code
            // tags:
            //      private

            if (status === ContentActionSupport.versionStatus.Published) {
                return "";
            }

            var model = new ContentStatusViewModel({ contentStatus: status });
            var statusData = {
                cssClass: model.statusIcon && model.statusIcon.join(" "),
                message: model.statusMessage
            };

            return lang.replace("<span class=\"dijitIcon epi-statusIcon {cssClass}\" title=\"{message}\">&nbsp;</span>", statusData);
        }
    };

    Formatter.addFormatter("contentIcon", module.contentIcon);
    Formatter.addFormatter("userName", module.userName);
    Formatter.addFormatter("versionStatus", module.versionStatus);
    Formatter.addFormatter("localizedDate", module.localizedDate);
    Formatter.addFormatter("contentItem", module.contentItemFactory, true);

    return module;
});
