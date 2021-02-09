define("epi-cms/component/Media", [
// dojo
    "dojo/_base/declare",

    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",

    "dojo/on",
    "dojo/topic",
    // epi-cms
    "epi-cms/component/MediaViewModel",
    "epi-cms/asset/HierarchicalList",
    "epi-cms/widget/FilesUploadDropZone",
    "epi-cms/widget/UploadUtil",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.hierachicallist",
    "epi/i18n!epi/cms/nls/episerver.cms.components.media"
],

function (
// dojo
    declare,

    domClass,
    domConstruct,
    domStyle,

    on,
    topic,
    // epi
    MediaViewModel,
    HierarchicalList,
    FilesUploadDropZone,
    UploadUtil,
    // Resources
    hierarchicalListResources,
    resources
) {

    return declare([HierarchicalList], {
        // summary:
        //      Media management component
        // tags:
        //      internal

        res: resources,

        // showCreateContentArea: [public] Boolean
        //      Flag to indicate this widget allowed to show create content area by default or not.
        showCreateContentArea: true,

        showThumbnail: true,

        modelClassName: MediaViewModel,

        noDataMessages: resources.nodatamessages,

        // hierarchicalListClass: [readonly] String
        //      The CSS class to be used on the content list.
        hierarchicalListClass: "epi-mediaList",

        // createContentText: [public] String
        //      Upload file text
        createContentText: resources.dropareatitle,

        postMixInProperties: function () {
            this.inherited(arguments);

            this.modelBindingMap.dropZoneSettings = ["dropZoneSettings"];
        },

        buildRendering: function () {
            this.inherited(arguments);

            this._setupDropZone();
        },

        postCreate: function () {

            this.inherited(arguments);

            this.list.set("noDataMessage", this.res.nocontent);
            var uploadDefaultCommand = this.model.getCommand("uploadDefault");
            this.own(
                uploadDefaultCommand.watch("canExecute", function (name, oldValue, newValue) {
                    this._toggleCreateContentArea(newValue);
                }.bind(this)),
                uploadDefaultCommand.watch("isAvailable", function (name, oldValue, newValue) {
                    this._toggleCreateContentArea(newValue);
                }.bind(this))
            );
        },

        _setupDropZone: function () {
            // summary:
            //      Setup drop zone for entire widget.
            // tags:
            //      private

            var uploadCommand = this.model.getCommand("uploadDefault");
            if (!uploadCommand) {
                return;
            }

            // Create drop zone
            this.own(this._dropZone = new FilesUploadDropZone({ outsideDomNode: this.container.domNode }));
            domConstruct.place(this._dropZone.domNode, this.domNode, "first");

            this.connect(this._dropZone, "onDrop", this._onDrop);
        },

        _onDrop: function (evt, fileList) {
            fileList = UploadUtil.filterFileOnly(fileList);
            if (!fileList || fileList.length <= 0) { // ignore folder dropping
                return;
            }

            var uploadCommand = this.model.getCommand("uploadDefault");
            if (!uploadCommand) {
                return;
            }

            uploadCommand.set("fileList", fileList);
            uploadCommand.execute();

            // Hide the search result list by clearing the search box
            this.searchBox.clearValue();
        },

        _setDropZoneSettingsAttr: function (settings) {
            if (this._dropZone) {
                this._dropZone.set("settings", settings);
            }
        },

        _onCreateAreaClick: function () {
            // summary:
            //      A callback function which is executed when the create area is clicked.
            // tags:
            //      protected
            this.inherited(arguments);
            this.model.getCommand("uploadDefault").execute();
        },

        // =======================================================================
        // List setup

        _setupCreateContentArea: function () {
            // summary:
            //      Setup create content area for list widget
            // tags:
            //      protected
            this.inherited(arguments);

            var buttonNode = this.createContentAreaButton.domNode;
            domClass.remove(buttonNode, "epi-flat");
            domClass.add(buttonNode, "epi-button--full-width");
        }
    });

});
