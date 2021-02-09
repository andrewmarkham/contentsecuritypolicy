define("epi/shell/dgrid/Formatter", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/when",

    // DGrid
    "dgrid/Grid",

    // epi
    "epi/shell/dgrid/TemplateColumn"
], function (
// dojo
    declare,
    array,
    when,
    //
    Grid,
    // epi
    TemplateColumn
) {
    var module = declare(null, {
        // summary:
        //      Add formating capability for dgrid column cell.
        // tags:
        //      public

        _isGrid: false,

        configStructure: function () {
            // summary:
            //      Setup templated column(s)
            // tags:
            //      public

            this.inherited(arguments);

            this._isGrid = this instanceof Grid;

            if (this._isGrid) {
                this._setupTemplateColumns();
            } else {
                this._setupList();
            }
        },

        _setupTemplateColumns: function () {
            // summary:
            //      Loop all dgrid columns, check each is able to template column, convert each.
            // tags:
            //      private

            if (!this.subRows) {
                return;
            }

            var formatters;
            array.forEach(this.subRows, function (columns) {
                array.forEach(columns, function (column) {
                    formatters = [];

                    array.forEach(module.shorthands, function (shorthand) {
                        var formatterActive = column[shorthand],
                            formatter = module.formatters[shorthand];

                        if (formatterActive) {
                            if (formatter) {
                                // If not a bool value, execute formatterFunc with value that should be a factory method
                                formatters.push(formatter.isFactory ?
                                    formatter.handler(formatterActive) :
                                    formatter.handler);
                            } else {
                                throw new Error("Formatter with key " + shorthand + " not found");
                            }

                        }
                    });

                    // Add custom formatters
                    if (column.formatters) {
                        this._findFormatters(column.formatters, formatters);
                    }

                    if (formatters.length > 0) {
                        column = TemplateColumn(column, formatters);
                    }
                }, this);
            }, this);
        },

        _setupList: function () {
            // summary:
            //      Add configured formatters when used with dgrid list.
            // tags:
            //      private

            if (this.formatters) {
                this._resolvedFormatters = this._findFormatters(this.formatters);
            } else if (this.field) {
                this._resolvedFormatters = [function (data, object, row) {
                    return data;
                }];
            }
        },

        renderRow: function (object, options) {
            // summary:
            //      Override of default implementation to add formatter execution.
            // tags:
            //      public

            if (this._isGrid) {
                return this.inherited(arguments);
            }

            var row = this.inherited(arguments, ["", options]),
                data = this.field ? object[this.field] : object,
                formatters = this._resolvedFormatters,
                i = -1;

            function executeFormatter(value) {
                var formatter = formatters[i],
                    result;

                if (formatter) {
                    row.innerHTML = value;
                    data = value;
                }

                i++;

                if (formatters.length > i) {
                    formatter = formatters[i];
                    result = formatter(data, object, row);
                    when(result, executeFormatter);
                }
            }

            if (formatters.length > 0) {
                executeFormatter();
            }

            return row;

        },

        _findFormatters: function (formatterConfig, formatters) {
            // summary:
            //      Loops throgh an array that can consist of either formatter functions
            //      or formatter keys as strings. When a string is found it is replaced
            //      by a matching formatter function from the registered formatters.
            // tags:
            //      private

            formatters = formatters || [];

            array.forEach(formatterConfig, function (formatterKey) {
                var type = typeof formatterKey,
                    item, formatter;

                if (type === "string") {
                    item = module.formatters[formatterKey];

                    if (item) {
                        formatter = item.isFactory ? item.handler() : item.handler;
                        formatter.allParameters = item.allParameters;
                    }
                } else if (type === "function") {
                    formatter = formatterKey;
                }

                if (formatter) {
                    formatters.push(formatter);
                } else {
                    throw new Error("Formatter with key " + formatterKey + "not found");
                }
            });

            return formatters;
        }
    });

    module.formatters = {
        // tags:
        //      internal
    };
    module.shorthands = [];

    module.addFormatter = function (name, formatter, isFactory, addShortHand) {
        // summary:
        //      Adds formatter to the formatter registry.
        // tags:
        //      internal

        module.formatters[name] = { handler: formatter, isFactory: !!isFactory };
        if (addShortHand) {
            module.shorthands.push(name);
        }
    };

    return module;
});
