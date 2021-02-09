define("epi/shell/widget/_SectionedTemplatedMixin", [
// dojo
    "dojo/_base/declare",
    "dojo/query",
    "dojo/string",

    // dijit
    "dijit/_TemplatedMixin"
],

function (
// dojo
    declare,
    query,
    string,

    // dijit
    _TemplatedMixin
) {

    return declare([_TemplatedMixin], {
        // summary:
        //	    Mixin for widgets that are based on a template containing multiple sections
        //      that can be populated when instantiated.
        //
        // description:
        //      To compose content in a widget with multiple sections define attach-points
        //      where content should be inserted and reference these in the sections property.
        //      When using the widget, define which content  should go where by specifying
        //      a data-epi-section property tying the source and destination together.
        //
        // |    <div>
        // |        <div data-dojo-type="dijit/Toolbar" data-dojo-attach-point="toolbar">
        // |            <span data-dojo-attach-point="toolbarSection"></span>
        // |        </div>
        // |        <span data-dojo-attach-point="statusSection"></span>
        // |    </div>
        //
        //      Source markup example:
        //
        // |    <div data-dojo-type="epi/shell/widget/_SectionedTemplatedMixin">
        // |        <span data-epi-section="toolbarSection">Hello World!</span>
        // |        <span data-epi-section="statusSection">
        // |            <ul>
        // |                <li>Good evening!</li>
        // |            </ul>
        // |        </span>
        // |    </div>
        //
        // tags:
        //      internal

        // sections: String[]
        //      An array of attach-point names to inject content into.
        sections: [],

        _fillContent: function (/*DomNode*/ source) {
            // summary:
            //      Overridden from _TemplatedMixin to populate the templated sections defined by the sections array
            // tags:
            //		protected

            this.sections.forEach(function (sectionId) {
                var targetNode = this[sectionId],
                    sections = query(string.substitute("[data-epi-section=${0}]", [sectionId]), source);

                sections.forEach(function (section) {
                    while (section.childNodes.length > 0) {
                        targetNode.appendChild(section.childNodes[0]);
                    }
                });
            }, this);
        }

    });
});
