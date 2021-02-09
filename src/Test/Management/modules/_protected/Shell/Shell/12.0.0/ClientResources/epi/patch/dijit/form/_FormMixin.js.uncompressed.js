// Currently only a place holder for the core epi namespace
// Needed to get the amd loading properly defined, but should contain core epi parts

define("epi/patch/dijit/form/_FormMixin", [
    "dojo/_base/array",
    "dojo/_base/lang",
    "dijit/form/_FormMixin"
], function (array, lang, _FormMixin) {
    // module:
    //		dijit/patch/form/_FormMixin
    // summary:
    //		Fix issue with null array when setting value to form

    lang.mixin(_FormMixin.prototype, {
        _setValueAttr: function (/*Object*/ obj) {
            // summary:
            //		Fill in form values from according to an Object (in the format returned by get('value'))

            // generate map from name --> [list of widgets with that name]

            var map = { };
            array.forEach(this._getDescendantFormWidgets(), function (widget) {
                if (!widget.name) {
                    return;
                }
                var entry = map[widget.name] || (map[widget.name] = []);
                entry.push(widget);
            });

            for (var name in map) {
                if (!map.hasOwnProperty(name)) {
                    continue;
                }
                var widgets = map[name],						// array of widgets w/this name
                    values = lang.getObject(name, false, obj);	// list of values for those widgets

                if (values === undefined) {
                    continue;
                }
                if (!lang.isArray(values)) {
                    /* THE FIX GOES HERE */
                    /* --------------------------------------------------------------------------------------------- */
                    // If widget expects an array and value is null, it shouldn't get [null] like the value which dijit._FormMixin sets.
                    if (values === null && widgets[0].multiple) {
                        values = null;
                    } else {
                        values = [values];
                    }
                    /* --------------------------------------------------------------------------------------------- */
                    /* END FIX */
                }
                if (typeof widgets[0].checked == 'boolean') {
                    // for checkbox/radio, values is a list of which widgets should be checked
                    array.forEach(widgets, function (w) {
                        w.set('value', array.indexOf(values, w.value) !== -1);
                    });
                } else if (widgets[0].multiple) {
                    // it takes an array (e.g. multi-select)
                    widgets[0].set('value', values);
                } else {
                    // otherwise, values is a list of values to be assigned sequentially to each widget
                    array.forEach(widgets, function (w, i) {
                        w.set('value', values[i]);
                    });
                }
            }
        }
    });

    _FormMixin.prototype._setValueAttr.nom = "_setValueAttr";
});
