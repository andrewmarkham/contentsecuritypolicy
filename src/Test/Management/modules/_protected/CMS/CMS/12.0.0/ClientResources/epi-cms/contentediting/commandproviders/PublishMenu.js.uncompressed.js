define("epi-cms/contentediting/commandproviders/PublishMenu", [
    "dojo",
    "dojo/_base/declare",

    "epi/shell/command/_CommandProviderMixin",
    "epi-cms/contentediting/command/ForPublishMenu",
    "epi-cms/contentediting/command/IgnoreInUseNotification"
], function (
    dojo,
    declare,

    _CommandProviderMixin,
    ForPublishMenu,
    IgnoreInUseNotification) {

    return declare([_CommandProviderMixin], {
        // summary:
        //      Command provider, which adds in use notification related commands to publish menu.
        //
        // tags:
        //      internal

        constructor: function () {
            // summary:
            //		Ensure that an array of commands has been initialized.
            // tags:
            //		public
            this.inherited(arguments);

            // ignore inuse notification
            this.add("commands", ForPublishMenu(new IgnoreInUseNotification(), {
                priority: 10000
            }));
        }
    });
});
