define("epi-cms/ContentRepositoryDescriptorService", [
    "epi/assign"
], function (
    assign
) {
    function ContentRepositoryDescriptorService(contentRepositoryDescriptors) {
        // summary:
        //      Service that contains all registered IContentRepositoryDescriptors from the server
        // tags:
        //      internal

        assign(this, contentRepositoryDescriptors);
    }

    ContentRepositoryDescriptorService.prototype.get = function (key) {
        // summary:
        //      Gets the repository descriptor with the matching key
        // tags:
        //      public

        return !key ? null : this[key.toLowerCase()];
    };

    ContentRepositoryDescriptorService.prototype.list = function () {
        // summary:
        //      Returns all the descriptor keys present in the repository
        // tags:
        //      public

        return Object.keys(this);
    };

    return ContentRepositoryDescriptorService;
});
