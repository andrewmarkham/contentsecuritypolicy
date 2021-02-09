define("epi-cms/content-approval/groupMembersListFormatter", [
    "dojo/_base/lang"

], function (
    lang
) {
    var itemTemplate = "<span class='epi-reviewer__name'>{name}</span></span>";

    var module = {
        // tags:
        //      internal

        renderList: function (users) {
            var res = [];
            users.forEach(function (u) {
                res.push(lang.replace(itemTemplate, { name: u }));
            });

            return res.join(" ");
        }
    };

    return module;
});
