define("epi-cms/activity/ActivityFeed", [
    "dojo/_base/declare",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dijit/focus",
    "dijit/registry",
    "epi/debounce",
    "epi/dependency",
    // Parent class and mixins
    "dijit/_WidgetBase",
    "dijit/_CssStateMixin",
    "epi/shell/widget/_FocusableMixin",
    "epi/shell/widget/_ModelBindingMixin",
    // List modules
    "dgrid/OnDemandList",
    "dgrid/extensions/DijitRegistry",
    "epi/shell/dgrid/WidgetRow",
    // Activity modules
    "epi-cms/activity/Activity",
    "epi-cms/activity/ActivityCommentForm"
], function (
    declare,
    aspect,
    domClass,
    domGeometry,
    domStyle,
    focusManager,
    registry,
    debounce,
    dependency,
    // Parent class and mixins
    _WidgetBase,
    _CssStateMixin,
    _FocusableMixin,
    _ModelBindingMixin,
    // List modules
    OnDemandList,
    DijitRegistry,
    WidgetRow,
    // Activity modules
    Activity,
    ActivityCommentForm
) {

    // Create a custom list class for the activity feed.
    var ActivityList = declare([OnDemandList, DijitRegistry, WidgetRow]);

    return declare([_WidgetBase, _CssStateMixin, _FocusableMixin, _ModelBindingMixin], {
        // summary:
        //      A widget used to list activities.
        // tags:
        //      internal

        // baseClass: [protected] String
        //      The base CSS class of the widget, used to construct CSS classes
        //      to indicate widget state.
        baseClass: "epi-activity-feed",

        // noDataMessage: [public] String
        //      The message to display when there is no data returned by the server
        //      or when there is no query.
        noDataMessage: "",

        // query: [public] Object
        //      The object used to query the store for activities.
        query: null,

        // queryOptions: [public] Object
        //      The object used to define query options for the activities store.
        queryOptions: null,

        // modelBindingMap: [protected] Object
        //      A map contain bindings from the model to properties on this object.
        modelBindingMap: {
            isSingleItemSelected: ["isSingleItemSelected"],
            query: ["query"],
            noDataMessage: ["noDataMessage"]
        },

        postMixInProperties: function () {
            // summary:
            //      Processing after the parameters to the widget have been read-in,
            //      but before the widget template is instantiated.
            // tags:
            //      protected

            this.inherited(arguments);

            this.queryOptions = this.queryOptions || { sort: [{ attribute: "created", descending: true }] };
        },

        buildRendering: function () {
            // summary:
            //      Build the list component to be shown within this widget.
            // tags:
            //      protected

            this.inherited(arguments);

            this.commentForm = new ActivityCommentForm({ model: this.model });
            // Style the comment form as a card.
            domClass.add(this.commentForm.domNode, "epi-card");

            this.list = new ActivityList({
                className: "dgrid--centered-no-data-message",
                cleanEmptyObservers: false,
                renderRow: this._renderRow.bind(this),
                keepScrollPosition: true
            });

            // Set tabIndex on bodyNode to mimic the behavior usually handled by dgrid/Keyboard.
            this.list.bodyNode.tabIndex = 0;

            this.own(
                this.commentForm,
                this.model.on("save", this.focus.bind(this)),
                aspect.around(this.list, "resize", this._resizeList.bind(this))
            );

            // Append the child widgets to the DOM.
            this.commentForm.placeAt(this.list.bodyNode, "first");
            this.domNode.appendChild(this.list.domNode);

            this.list.resize();
        },

        startup: function () {
            // summary:
            //      Processing after the DOM fragment is added to the document. Also calls
            //      startup on the list.
            // tags:
            //      public

            this.inherited(arguments);
            this.commentForm.startup();
            this.list.startup();
        },

        focus: function () {
            // summary:
            //      Gives focus to the activity feed.
            // tags:
            //      public

            focusManager.focus(this.list.bodyNode);
        },

        refresh: function () {
            // summary:
            //      Refreshes the list causing it to query the server for new data.
            // tags:
            //      public

            this.list.refresh();
        },

        _renderRow: function (value) {
            // summary:
            //      Renders an activity widget for the row and returns its DOM node.
            // tags:
            //      private
            var activity = new Activity({activity: value});

            // Style each row in the list as a card.
            domClass.add(activity.domNode, "epi-card");

            return activity.domNode;
        },

        _resizeList: function (originalMethod) {
            // summary:
            //      Aspect method that is run when the list is resized.
            //      Sets the size of the body node taking into account
            //      the activity comment form size.
            // tags:
            //      private

            return function () {
                originalMethod.apply(this.list, arguments);

                var height =
                    this.model.isSingleItemSelected ?
                        domGeometry.getMarginBox(this.commentForm.domNode).h : 0;

                domStyle.set(this.list.contentNode, "height", "calc(100% - " + height + "px)");
            }.bind(this);
        },

        _setNoDataMessageAttr: function (noDataMessage) {
            // summary:
            //      Sets the no data message property and updates the grid.
            // tags:
            //      protected

            this.noDataMessage = noDataMessage;

            this.list.set("noDataMessage", noDataMessage);
        },

        _setQueryAttr: function (query) {
            // summary:
            //      Sets the query property and updates the grid, debouncing if needed.
            // tags:
            //      protected

            this._set("query", query);

            if (!this._queryFunction) {
                this._queryFunction = debounce(this._setQueryCallback.bind(this), null, 200);
            }

            this._queryFunction(this.model.store, query);
        },

        _setQueryCallback: function (store, query) {
            // summary:
            //      Callback that sets the grid's query and updates the
            //      grid when debouncing has finished.
            // tags:
            //      private

            // Do an early exit if this widget has been destroyed.
            if (this._destroyed) {
                return;
            }

            var isSingleItem = this.model.isSingleItemSelected;

            // Toggle the single item modifier class when this is one so
            // that content names on activities can be hidden with CSS.
            domClass.toggle(this.domNode, "epi-activity-feed--single-item", isSingleItem);

            // Toggle the visibility of the comment form dependent on the
            // number of items selected.
            domClass.toggle(this.commentForm.domNode, "dijitHidden", !isSingleItem);

            if (query) {
                this.list.set("store", store, query, this.queryOptions);
            } else {
                this.list.set("store", null);
            }

            // Resize the list to account for the size of the comment form.
            this.list.resize();
        }
    });
});
