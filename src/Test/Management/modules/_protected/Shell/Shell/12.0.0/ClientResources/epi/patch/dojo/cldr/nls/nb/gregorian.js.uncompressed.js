define("epi/patch/dojo/cldr/nls/nb/gregorian", [
    "dojo/cldr/nls/nb/gregorian",
    "dojo/i18n"
],
    function (localeObj, i18n) {

        // the patch covers the scenario where norwegian date/time format is not correct.

        // dojo has fixed this in new version
        // https://github.com/dojo/dojo/commit/85313a9a39a337b6678de3bbc24b6bec7a4f2d18#diff-67d90b2312634d3a4e0973a095c2899dR76
        // the fix belong to this ticket https://bugs.dojotoolkit.org/ticket/17770

        localeObj["dateTimeFormat-medium"] = "{1} {0}";
        localeObj["dateTimeFormat-long"] = "{1} {0}";
        localeObj["dateTimeFormat-short"] = "{1} {0}";
        localeObj["dateTimeFormat-full"] = "{1} {0}";

        // we need to patch i18n cache if it has already loaded the norwegian gregorian file
        var cacheKey = "dojo/cldr/nls/gregorian/nb-no";
        if (i18n.cache[cacheKey]) {
            i18n.cache[cacheKey] = localeObj;
        }
    }
);
