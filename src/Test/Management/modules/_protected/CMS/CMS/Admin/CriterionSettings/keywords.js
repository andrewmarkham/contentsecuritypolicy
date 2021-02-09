(function () {
    return {
        createUI: function (namingContainer, container) {
            dojo.place('<input type="text" id="' + namingContainer + 'keywords">', container);
        },

        setData: function (namingContainer, data) {
            dojo.byId(namingContainer + 'keywords').value = data.keywords;
        },

        getData: function (namingContainer) {
            return {
                keywords: dojo.byId(namingContainer + 'keywords').value
            }
        }
    }
})();
