define("epi-cms/contentediting/viewmodel/_ContentViewModelObserver", [
    "dojo/_base/declare",
    "dojo/Stateful",

    "epi/shell/DestroyableByKey"
],

function (
    declare,
    Stateful,

    DestroyableByKey
) {

    return declare([Stateful, DestroyableByKey], {
        // tags:
        //      internal

        // dataModel: [public] epi-cms/contentediting/ContentViewModel
        dataModel: null,

        _dataModelHandlesKey: "dataModelHandles",

        _dataModelSetter: function (dataModel) {
            this.destroyByKey(this._dataModelHandlesKey);

            this.dataModel = dataModel;

            this.onDataModelChange();

            this.ownByKey(this._dataModelHandlesKey,
                this.dataModel.watch("status", this.onDataModelChange.bind(this)),
                this.dataModel.watch("contentData", this.onDataModelChange.bind(this)));
        },

        onDataModelChange: function (name, oldValue, value) {
            // when data model changes, update view model properties accordingly.
        }

    });
});
