define("epi-cms/widget/viewmodel/HyperLinkSelectorViewModel", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    "dojo/io-query",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/when",
    //epi
    "epi/string",
    "epi/Url",
    "epi/shell/TypeDescriptorManager",
    "epi-cms/core/PermanentLinkHelper"

], function (
// dojo
    array,
    declare,
    lang,
    Stateful,
    ioQuery,
    domStyle,
    domConstruct,
    when,
    //epi
    epiString,
    Url,
    TypeDescriptorManager,
    PermanentLinkHelper

) {

    return declare([Stateful], {
        // summary:
        //		Represents the view model for HyperLinkSelector widget.
        //
        // tags:
        //      internal

        _providersSetter: function (providers) {
            var wrapperSettings = [];

            array.forEach(providers, lang.hitch(this, function (provider) {
                wrapperSettings.push({
                    name: provider.name,
                    displayName: provider.displayName ? provider.displayName : provider.name,
                    title: provider.title ? provider.title : "",
                    groupname: "hyperLink_",
                    widgetType: provider.widgetType,
                    invisible: provider.invisible,
                    settings: lang.mixin({
                        roots: provider.roots,
                        allowedTypes: provider.linkableTypes,
                        isContentLink: (provider.linkableTypes && provider.linkableTypes.length > 0),
                        allowedDndTypes: [],
                        disabled: true, // Disable all link input as default
                        value: null,
                        searchArea: provider.searchArea
                    }, provider.widgetSettings)
                });
            }));

            this.set("wrapperSettings", wrapperSettings);
        },

        getContentData: function (value) {
            if (value) {
                return PermanentLinkHelper.getContent(value, { allLanguages: true });
            }

            return null;
        },

        isBaseTypeIdentifier: function (type, base) {
            return TypeDescriptorManager.isBaseTypeIdentifier(type, base);
        },

        getPermanentLink: function (href) {
            // summary:
            //     Get the permanent link for the given href, if it can be converted. Otherwise it returns the given href
            // tags:
            //      internal

            return PermanentLinkHelper.getPermanentLink(href);
        },

        getUrlValue: function (newValue, selectedLanguage, remainingUrl, oldValue) {
            // summary:
            //      Creates a new url based on the new value the selected language and the query params on the old value.
            //      If the newValue and the oldValue points to the same url (except the query params)
            //      the query params from the oldValue will be appended to the new value.
            // tags:
            //      internal

            if (!newValue) {
                return "";
            }

            var url = new Url(newValue);

            //If the old url is the same as the new one append the old query params to
            //Get the old query string
            if (oldValue) {
                var oldUrl = new Url(oldValue);
                if (this._areEqual(oldUrl, url)) {
                    //Append the old query params
                    url.query = lang.mixin(oldUrl.query, url.query);
                }
            }

            //If the user has selected a language add that to the query
            if (selectedLanguage === "") {
                delete url.query.epslanguage;
            } else {
                url.query.epslanguage = selectedLanguage;
            }

            // Add the remaining url to the url
            if (remainingUrl) {
                var rUrl = new Url(remainingUrl);

                // If there is a path segment add it to the epsremainingpath query parameter
                if (rUrl.path) {
                    url.query["epsremainingpath"] = rUrl.path;
                }

                // Add the fragment
                if (rUrl.fragment) {
                    url.fragment = rUrl.fragment;
                }

                //Add all query string parameters
                Object.keys(rUrl.query).forEach(function (key) {
                    url.query[key] = rUrl.query[key];
                });
            }


            return url.toString();
        },

        getRemainingUrl: function (value) {
            // summary:
            //      Returns the query string and fragments of the url as a new url
            //      If the epsremainingpath query parameter set it set as the path on the new url
            // tags:
            //      public

            if (!value) {
                return "";
            }

            // replace some encoded characters get from CMS
            value = value.replace(/\+/g, "%20");

            var url = new Url(value);

            // reset the authority and scheme as we do not want these in the url
            url.authority = "";
            url.scheme = "";


            // Delete known query strings
            delete url.query["epslanguage"];
            delete url.query["epieditmode"];

            // set the epsremainingpath as the path on the url
            if (url.query.epsremainingpath) {
                url.path = url.query.epsremainingpath;
            } else {
                url.path = "";
            }

            // delete it from the query string
            delete url.query["epsremainingpath"];

            return url.toString();
        },

        _areEqual: function (url1, url2) {
            // summary:
            //      Determines if the two urls are the same but ignoring the query string params
            // tags:
            //      private

            return url1.scheme === url2.scheme &&
                url1.authority === url2.authority &&
                url1.path === url2.path &&
                url1.fragment === url2.fragment;
        }
    });
});
