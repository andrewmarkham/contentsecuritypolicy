define("epi-cms/widget/ContentSearchBox", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",

    "dojo/aspect",
    "dojo/Evented",
    "dojo/keys",

    "dojo/dom-attr",
    "dojo/dom-style",
    // EPi Framework
    "epi/shell/widget/SuggestionBox",
    "epi-cms/widget/SearchResultList",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentlist"
],

function (
// Dojo
    declare,
    lang,
    event,

    aspect,
    Evented,
    keys,

    domAttr,
    domStyle,
    // EPi Framework
    SuggestionBox,
    SearchResultList,

    // Resources
    resources
) {

    return declare([SuggestionBox, Evented], {
        // summary:
        //    A Search box to search for content.
        //
        // tags:
        //    public

        // res: Object
        //      Resource object, for getting text.
        // tags:
        //      Protected
        res: resources,

        // autoComplete: Boolean
        //      If user types in a partial string, and then tab out of the `<input>` box,
        //      automatically copy the first entry displayed in the drop down list to
        //      the `<input>` field
        autoComplete: false,

        // dropDownClass: [protected extension] Function String
        //      Dropdown widget class, which would be used to create a widget, to show the search result.
        //      Subclasses should specify this.
        dropDownClass: SearchResultList,

        // queryExpr: String
        //      This specifies what query ComboBox/FilteringSelect sends to the data store,
        //      based on what the user has typed.  Changing this expression will modify
        //      whether the drop down shows only exact matches, a "starting with" match,
        //      etc.  Use it in conjunction with highlightMatch.
        //      dojo/data query expression pattern.
        //      `${0}` will be substituted for the user text.
        //      `*` is used for wildcards.
        //      `${0}*` means "starts with", `*${0}*` means "contains", `${0}` means "is"
        queryExpr: "${0}",

        // minimumNumberOfChar: Integer
        //      The minimum number of character that is valid for search.
        // tags:
        //      Protected
        minimumNumberOfChar: 1,

        postCreate: function () {
            // summary: Override to:
            //      - mixin additional query params into query before _startSearch
            //      - connect to onSelect event of dropDown, to forward it to ContentSearchBox after _startSearch
            // tags:
            //      protected
            this.inherited(arguments);

            // Delay in milliseconds between when user types something and we start
            // searching based on that value.
            this.searchDelay = this.defaultDelay;
            this.on("beforeSearch", lang.hitch(this, function () {
                // display dropdown with standby
                if (this.dropDown) {
                    this.dropDown.showStandby(true);
                }
            }));

            this.on("searchComplete", lang.hitch(this, function (results) {
                // hide dropdown's standby
                if (this.dropDown) {
                    this.dropDown.showStandby(false);
                }
            }));

            aspect.before(this, "_startSearch", function (method, args) {
                // doing something before the original call
                this.emit("beforeSearch", {});

                return [method, args];
            });
        },

        _openResultList: function (/*Object*/results, /*Object*/query, /*Object*/options) {
            // summary:
            //		Callback when a search completes.
            // description:
            //		Generates drop-down list and calls _showResultList() to display it

            this.emit("searchComplete", results);

            this._fetchHandle = null;

            this.dropDown.clearResultList();

            var dataAvailable = results.length > 0 || options.start !== 0;
            // display the empty text if data is not available
            this.dropDown.showErrorMessage(!dataAvailable, this.res.contentnotfound);
            this.dropDown.showGrid(dataAvailable);

            if (dataAvailable) {
                this.dropDown.createOptions(results, options, lang.hitch(this, "_getMenuLabelFromItem"));
            }

            // show our list
            this._showResultList();
        },

        _onDropDownMouseDown: function (/*Event*/e) {
            // summary:
            //		Callback when the user mousedown's on the arrow icon.
            // tags:
            //      Private override

            // Do nothing, to prevent start search on click to textbox

            // Enable mouse clickable when pinnable pane in un-pinned state.
            e.stopPropagation();
        },

        _onKey: function (/*Event*/evt) {
            // summary:
            //		Listen for Enter key, to start search request.
            // tags:
            //      private override

            switch (evt.keyCode) {
                case keys.ENTER:
                    if (this.dropDown && this.dropDown.selected) {
                        this.dropDown.handleKey(evt);
                        this.closeDropDown();
                    } else if (!this._fetchHandle) {
                        this._startSearchFromInput();
                        event.stop(evt);
                    }
                    break;
                case keys.PAGE_DOWN:
                case keys.DOWN_ARROW:
                case keys.PAGE_UP:
                case keys.UP_ARROW:
                    // let the dropdown handle these keystrokes for navigating between item
                    if (this.dropDown) {
                        this.dropDown.handleKey(evt);
                    }
                    event.stop(evt);
                    break;
                case keys.LEFT_ARROW:
                case keys.RIGHT_ARROW:
                    // do nothing when navigating, selecting text
                    break;
                default:
                    this.inherited(arguments);
            }
        },

        _startSearchFromInput: function () {
            // summary:
            //      Start the search action
            // tags:
            //      private, override

            var key = this.focusNode.value;

            // start the search action only if input text length is more than minimum number
            if (!key || key.length < this.minimumNumberOfChar) {
                this.closeDropDown();
                return;
            }

            if (!this.dropDown) {
                var popupId = this.id + "_popup",
                    dropDownConstructor = lang.isString(this.dropDownClass) ? lang.getObject(this.dropDownClass, false) : this.dropDownClass;

                this.dropDown = new dropDownConstructor({
                    id: popupId,
                    dir: this.dir,
                    textDir: this.textDir
                });

                domAttr.remove(this.textbox, "aria-activedescendant");
                domAttr.set(this.textbox, "area-owns", popupId); // associate popup with textbox

                this.dropDown.on("select", lang.hitch(this, function (value) {
                    this.closeDropDown();
                    this.emit("select", value);
                }));

                // Set dropdown width belong to input text width
                domStyle.set(this.dropDown.domNode, "width", this.textbox.clientWidth + "px");
            }
            this._showResultList();

            // We do not want to call the inherited method here since it will escape wild card characters (* and ?),
            // which will break any searches with wild card.
            this._startSearch(key);
        },

        _startSearchAll: function () {
            // disable search with empty string
        }
    });
});
