define("epi-cms/contentediting/commandproviders/ContentDetails", [
    "dojo",
    "dojo/_base/declare",

    "epi/shell/command/_CommandProviderMixin",

    "../command/PermanentInUseToggle"
], function (
    dojo,
    declare,

    _CommandProviderMixin,
    PermanentInUseToggle
) {

    return declare([_CommandProviderMixin], {
        // summary:
        //      Command provider, which adds in use notification related commands to content detail area.
        //
        // tags:
        //      internal

        constructor: function () {
            // summary:
            //		Ensure that an array of commands has been initialized.
            // tags:
            //		public
            this.inherited(arguments);

            // permanent inuse notification toggle
            this.add("commands", new PermanentInUseToggle());
        }
    });
});
