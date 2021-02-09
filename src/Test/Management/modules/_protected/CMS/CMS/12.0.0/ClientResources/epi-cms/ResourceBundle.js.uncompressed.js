/* Required need to get the needed resource root before subnodes */
/* First requires the module to stop IE from balking when language resources are cached on client */
require([
    "epi/i18n",
    "epi/i18n!epi/cms/nls/episerver.cms",
    "epi/i18n!epi/cms/nls/contenttypes"
]);
