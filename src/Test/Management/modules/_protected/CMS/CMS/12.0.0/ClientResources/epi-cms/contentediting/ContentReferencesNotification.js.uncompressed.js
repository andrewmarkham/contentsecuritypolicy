define("epi-cms/contentediting/ContentReferencesNotification", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/dom-construct",
    "dojo/Stateful",
    "dojo/on",
    "dojo/when",
    // epi
    "epi/epi",
    "epi/dependency",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/DestroyableByKey",
    "epi-cms/command/BackCommand",
    "epi-cms/widget/sharedContentDialogHandler",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.notificationbar"
],

function (
// dojo
    array,
    declare,
    event,
    domConstruct,
    Stateful,
    on,
    when,
    // epi
    epi,
    dependency,
    TypeDescriptorManager,
    DestroyableByKey,
    BackCommand,
    sharedContentDialogHandler,
    // resources
    resources
) {

    return declare([Stateful, DestroyableByKey], {
        // tags:
        //      internal

        // order: [public] Number
        //      Sort order of notification
        order: 40,

        // _backCommand: BackCommand
        _backCommand: null,
        _clickHandleKey: "clickHandle",

        constructor: function () {
            this._backCommand = new BackCommand();
        },

        postscript: function () {
            this.inherited(arguments);

            this._store = this._store || dependency.resolve("epi.storeregistry").get("epi.cms.referenced-content");
        },

        _valueSetter: function (/*Object*/value) {
            // summary:
            //      Updates the notification when the property changes.
            // tags:
            //      private

            this.value = value;

            var typeShouldActAsAsset = TypeDescriptorManager.getValue(value.contentData.typeIdentifier, "actAsAnAsset");
            if (!typeShouldActAsAsset) {
                this.set("notification", null);
                return;
            }

            when(this._store.query({ids: [value.contentData.contentLink]}))
                .then(this._updateNotification.bind(this));
        },

        _updateNotification: function (itemsList) {

            if (!itemsList) {
                this.set("notification", null);
                return;
            }

            var references = itemsList[0].references;

            var notificationText = domConstruct.create("div");
            if (references.length > 0) {
                notificationText.innerHTML += resources.affect;

                var referencesText = references.length + " " + (references.length === 1 ? epi.resources.text.item : epi.resources.text.items),
                    self = this,
                    referenceslink = domConstruct.create("a", { href: "#", innerHTML: referencesText, title: resources.referencestooltip }, notificationText);

                this.destroyByKey(this._clickHandleKey);
                this.ownByKey(this._clickHandleKey, on(referenceslink, "click", function (evt) {
                    event.stop(evt);
                    self._showReferenceDialog();
                }));
            } else {
                notificationText.innerHTML += epi.resources.messages.notinuse;
            }

            //to update canExecute on command :'(
            this._backCommand.set("model", {});

            this.set("notification", {
                content: notificationText,
                commands: [this._backCommand]
            });
        },

        _showReferenceDialog: function () {
            sharedContentDialogHandler({
                contentItems: [this.get("value").contentData],
                showToolbar: true,
                mode: sharedContentDialogHandler.mode.show
            });
        }
    });
});
