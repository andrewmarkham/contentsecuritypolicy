define("epi/shell/dgrid/TemplateColumn", [
// dojo
    "dojo/_base/array"
],
function (
// dojo
    array
) {
    return function (/*object*/column, /*array*/formatters) {
        // summary:
        //      Dgrid template column plugin
        // column: [object]
        //      Column definition
        // formatters: [array]
        //      Array of callback function(s)
        // tags:
        //      public

        var originalRenderCell = column.renderCell;

        // accept arguments as parameters to template function, or from column def,
        // but normalize to column def.
        column.formatters = formatters || column.formatters;

        if (column.formatters && column.formatters.length > 0) {
            column.renderCell = function (object, value, cell, options) {
                // Get each formatter and run it.
                array.forEach(column.formatters, function (formatter) {
                    value = formatter(value, object, cell, options);
                });

                if (value) {
                    cell.innerHTML = value;
                }
            };
        }

        // REMARK: This code will most likely fail in the case where renderCell is defined on the column,
        //         since the parameters that get passed through to the method are undefined here.
        return originalRenderCell ? originalRenderCell.call(column /* , object, value, cell, options */) : column;
    };
});
