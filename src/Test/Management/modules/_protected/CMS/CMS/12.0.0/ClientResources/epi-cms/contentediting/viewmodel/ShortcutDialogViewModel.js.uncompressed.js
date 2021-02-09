define("epi-cms/contentediting/viewmodel/ShortcutDialogViewModel", [
// Dojo
    "dojo/_base/declare",
    "dojo/Stateful",
    "dojo/string",

    //EPi
    "epi-cms/contentediting/PageShortcutTypeSupport",
    "epi/epi"
],

function (
// Dojo
    declare,
    Stateful,
    dojoString,

    // EPi
    PageShortcutTypeSupport,
    epi
) {

    return declare([Stateful], {
        // summary:
        //      View model used by epi-cms/contentediting/ShortcutDialog
        // tags:
        //      internal

        // value: [public] Object
        //      The value
        value: null,

        // intermediateValue: [public] Object
        //      Changes to the model are stored on this property
        intermediateValue: null,

        // savedValue: [public] Object
        //      Initial value
        savedValue: null,

        // contentLink: [public] String
        //      The content link id
        contentLink: null,

        // contentName: [public] String
        //      The name for the content
        contentName: null,

        // enableSaveButton: [public] Boolean
        //      Determines if the save button should be enabled
        enableSaveButton: null,

        // enableShortcutLink: [public] Boolean
        //      Determines if should be possible to set the shortcut link
        enableShortcutLink: null,

        // enableExternalLink: [public] Boolean
        //      Determines if should be possible to set an external link
        enableExternalLink: null,

        // enableOpenIn: [public] Boolean
        //      Determines if should be possible to select the target frame for a link
        enableOpenIn: true,

        postscript: function () {
            this.inherited(arguments);

            this.set("savedValue", this.value);
        },

        _intermediateValueSetter: function (value) {
            // summary:
            //  Set the intermediate value for the model
            // tags:
            //      public

            this.intermediateValue = value;
            this.set("enableSaveButton", !epi.areEqual(this.intermediateValue, this.savedValue));
            this.set("enableShortcutLink", value && (value.pageShortcutType === PageShortcutTypeSupport.pageShortcutTypes.Shortcut || value.pageShortcutType === PageShortcutTypeSupport.pageShortcutTypes.FetchData) ? true : false);
            this.set("enableExternalLink", value && value.pageShortcutType === PageShortcutTypeSupport.pageShortcutTypes.External ? true : false);
            this.set("clearExternalLink", value && value.pageShortcutType === PageShortcutTypeSupport.pageShortcutTypes.External && this.savedValue.pageShortcutType !== PageShortcutTypeSupport.pageShortcutTypes.External ? true : false);
            this.set("enableOpenIn", value && value.pageShortcutType !== PageShortcutTypeSupport.pageShortcutTypes.Inactive);
        },

        _savedValueSetter: function (value) {
            // summary:
            //      Sets the saved value
            // tags:
            //      public

            this.savedValue = value;
            this.set("enableSaveButton", false);
        },

        save: function () {
            // summary:
            //      Stores the value in the 'savedValue' property
            // tags:
            //      public
            this.set("savedValue", this.intermediateValue);
        }
    });
});
