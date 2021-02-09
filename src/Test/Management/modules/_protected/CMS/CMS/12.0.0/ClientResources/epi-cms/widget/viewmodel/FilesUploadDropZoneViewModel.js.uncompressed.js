define("epi-cms/widget/viewmodel/FilesUploadDropZoneViewModel", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.uploadmultiplefiles.dropzone"
],
function (
// dojo
    declare,
    lang,
    Stateful,
    // resources
    resources
) {
    return declare([Stateful], {
        // tags:
        //      internal

        // settings: [public] Object
        //      The object that sets all other properties on this view model.
        settings: null,

        // descriptionText: [readonly] String
        //      The text to display in the drop zone.
        descriptionText: null,

        // dropFolderName: [readonly] String
        //      The name of the folder that will be the target of files dropped.
        dropFolderName: null,

        // validSelection: [readonly] Boolean
        //      Flag to indicate if the current selection is valid.
        validSelection: null,

        // enabled: [readonly] Boolean
        //      Flag to indicate whether this drop zone should be enabled for dropping or not.
        enabled: null,

        // _descriptionTemplate: [private] String
        //      Template used to create description. By default it's resources.description
        _descriptionTemplate: null,

        _settingsSetter: function (value) {
            // summary:
            //      Sets all other properties using the values on the settings object.
            //
            // value: Object
            //      Object containing the values for enabled, validSelection and dropFolderName.
            //
            // tags:
            //      protected

            this.settings = value;
            if (!value) {
                value = this._getDefaultValue();
            }

            this.set("enabled", value.enabled);
            this.set("validSelection", value.validSelection);
            this.set("dropFolderName", value.dropFolderName);
            this.set("_descriptionTemplate", value.descriptionTemplate);
            this.set("descriptionText", this._getDescription(value));
        },

        _getDefaultValue: function () {
            // summary:
            //      Gets the default value for this view model.
            //
            // tags:
            //      private

            return {
                enabled: false,
                validSelection: false,
                dropFolderName: null
            };
        },

        _getDescription: function (settings) {
            // summary:
            //      Gets the description using the values on the specified settings object.
            //
            //  settings: Object
            //      Object containing the values for enabled, validSelection and dropFolderName.
            //
            // tags:
            //      private

            if (!settings.validSelection) {
                return resources.toomanyfolders;
            }
            var descriptionTemplate = this._descriptionTemplate || resources.description;
            return lang.replace(descriptionTemplate, [settings.dropFolderName || resources.defaultfoldername]);
        }

    });
});
