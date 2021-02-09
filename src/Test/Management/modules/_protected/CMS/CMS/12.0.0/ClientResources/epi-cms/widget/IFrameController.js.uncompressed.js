define("epi-cms/widget/IFrameController", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "epi/shell/widget/Iframe",
    "epi-cms/contentediting/StandardToolbar"
], function (array, declare, Iframe, StandardToolbar) {

    return declare([Iframe], {
        // summary:
        //    A widget that shows a custom view inside an Iframe.
        //
        // description:
        //    Can be used to display a custom view using for instance web forms or MVC to create the view.
        //
        // tags:
        //    internal

        templateString: "<div data-dojo-attach-point=\"toolbarArea\" /><iframe data-dojo-attach-point=\"iframe\" class=\"dijitReset\" src=\"${url}\" role=\"presentation\" frameborder=\"0\" style=\"width:100%;\"></iframe>",

        postCreate: function () {
            this.inherited(arguments);

            this.toolbar = new StandardToolbar();
            this.toolbar.placeAt(this.toolbarArea, "first");
        },

        _constructQuery: function (context) {
            return {
                uri: context.uri,
                id: context.id || ""
            };
        },

        updateView: function (data, context, additionalParams) {
            // summary:
            //    Sets up the view by loading the URL of the inner iframe.
            if (data && data.skipUpdateView) {
                return;
            }

            this.toolbar.update({
                currentContext: context,
                viewConfigurations: {
                    availableViews: data.availableViews,
                    viewName: data.viewName
                }
            });

            var matchingItems = array.filter(data.availableViews, function (item) {
                return item.key === data.viewName;
            });

            if (matchingItems.length === 0) {
                return;
            }

            this.load(matchingItems[0].viewType, { query: this._constructQuery(context) }, true);
        }
    });
});
