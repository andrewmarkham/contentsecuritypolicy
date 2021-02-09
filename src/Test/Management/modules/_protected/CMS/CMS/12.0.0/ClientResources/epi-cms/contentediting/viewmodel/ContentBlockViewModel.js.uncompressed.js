define("epi-cms/contentediting/viewmodel/ContentBlockViewModel", [
    // General application modules
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "dojo/promise/all",
    "dojox/html/entities",
    "epi",
    "epi/dependency",
    // Parent class and mixin
    "./_ViewModelMixin",
    "epi-cms/widget/viewmodel/ContentStatusViewModel",
    "epi-cms/dgrid/formatters",
    "epi/shell/TypeDescriptorManager",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea.personalize"
], function (
    declare,
    lang,
    when,
    all,
    entities,
    epi,
    dependency,
    // Parent class and mixin
    _ViewModelMixin,
    ContentStatusViewModel,
    formatters,
    TypeDescriptorManager,
    // Resources
    resources
) {

    return declare([ContentStatusViewModel, _ViewModelMixin], {
        // summary:
        //      The view model for a content block.
        //
        // tags:
        //      internal xproduct

        // label: [public] String
        //      The label used when displaying the block
        label: null,

        // store: [public] Visitor gruroup store
        //      The Visitor Groups store
        store: null,

        // hasSiblings: [public] Boolean
        //      Is true if the block has any siblings
        hasSiblings: true,

        // isVisible: [public] Boolean
        //      If the block could be seen it is true
        isVisible: true,

        // settings: [public] Object
        //      Settings object for the model
        settings: {
            // displayOptionsAttributeName: [public] String
            //      The name of the display options attribute put in the DOM
            displayOptionsAttributeName: "data-epi-content-display-option",

            // contentGroupAttributeName: [public] String
            //      The name of the content group attribute
            contentGroupAttributeName: "data-contentgroup"
        },

        // roles: [public] Array
        //      An array of the selected role objects.
        roles: null,

        // contentGroup: [public] String
        //      The name of the content group.
        contentGroup: null,

        // name: [public] String
        //      The block name.
        name: null,

        // contentTypeName: [public] String
        //      The name of the content type for the block
        contentTypeName: null,

        // roleIdentities: [public] Array
        //      An array of the role identities.
        roleIdentities: null,

        // typeIdentifier: [public] String
        //      The type identifier.
        typeIdentifier: null,

        // attributes: [public] Object
        //      HTML attributes on the widget.
        attributes: null,

        constructor: function () {
            this.roleIdentities = this.roleIdentities || [];
            this.attributes = {};
        },

        postscript: function () {
            this.inherited(arguments);

            if (!this.store) {
                var registry = dependency.resolve("epi.storeregistry");
                this.store = registry.get("epi.cms.visitorgroup");
            }

            this.contentTypeName = this.contentTypeName || (this.typeIdentifier && TypeDescriptorManager.getResourceValue(this.typeIdentifier, "name"));

            this.set("label", this.name);
            this.set("tooltip", formatters.title(this.name, this.contentLink, this.contentTypeName));
            this._reloadRoles();
        },

        serialize: function () {
            return {
                contentGroup: this.contentGroup,
                contentLink: this.contentLink,
                name: this.name,
                roleIdentities: this.roleIdentities,
                typeIdentifier: this.typeIdentifier,
                attributes: this.attributes
            };
        },

        equals: function (item) {
            // summary:
            //      Returns true if this content block is the same as the given item at a property level.
            // tags:
            //      public
            for (var prop in item) {
                if (!epi.areEqual(this[prop], item[prop])) {
                    return false;
                }
            }
            return true;
        },

        isRoleSelected: function (roleId) {
            // summary:
            //      Returns true if the roles is selected
            // roleId: Guid
            //      The id of the role to check
            // tags:
            //      public

            if (!this.roleIdentities) {
                return false;
            }

            return this.roleIdentities.indexOf(roleId) > -1;
        },

        hasAnyRoles: function () {
            // summary:
            //      Returns true if there are any selected roles
            // tags:
            //      public
            if (!this.roleIdentities) {
                return false;
            }

            return this.roleIdentities.length > 0;
        },

        moveNext: function () {
            // summary:
            //      Move this instance to the next index in the parents child list
            // tags:
            //      internal
            var index = this.parent.indexOf(this);
            this.parent.modify(function () {
                this.parent.move(this, index + 1);
            }, this);
        },

        movePrevious: function () {
            // summary:
            //      Move this instance to the previous index in the parents child list
            // tags:
            //      internal
            var index = this.parent.indexOf(this);
            this.parent.modify(function () {
                this.parent.move(this, index - 1);
            }, this);
        },

        moveOutsideGroup: function () {
            // summary:
            //      If the block is inside a gruop move it outside
            // tags:
            //      internal

            if (!this.contentGroup) {
                return;
            }

            this.parent.modify(function () {
                this.parent.moveOutsideGroup(this);
            }, this);
        },

        remove: function () {
            // summary:
            //      Removes the block from the parent
            // tags:
            //      internal
            this.parent.modify(function () {
                this.parent.removeChild(this);
            }, this);
        },

        personalize: function () {
            // summary:
            //      Personalizes the block
            // tags:
            //      internal

            this.parent.modify(function () {
                this.parent.personalize(this);
            }, this);
        },

        selectRole: function (roleId, select) {
            // summary:
            //      Selects or unselects the role depending on the select param
            //  roleId: Guid
            //      The role id to select/unselect
            //  select: Boolean
            //      True of false depending on if the role should be selected or unselected
            var identities = (this.roles || []).map(function (role) {
                return role.id;
            });

            var index = identities.indexOf(roleId);

            if (index >= 0) {
                if (!select) {
                    identities.splice(index, 1);
                }
            } else if (select) {
                identities.push(roleId);
            }

            //Set the roleIdenties again to emit a change event
            this.set("roleIdentities", identities);
        },

        resetRoleIdentities: function () {
            // summary:
            //      Resets the role identities for the block
            // tags:
            //      public

            this.set("visible", true);
            this.set("roleIdentities", null);
        },

        _displayOptionSetter: function (option) {
            // summary:
            //      Sets the display options attribute on the attribute list
            // tags:
            //      public
            this.attributes[this.settings.displayOptionsAttributeName] = option;
        },

        _displayOptionGetter: function () {
            // summary:
            //      Gets the display options attribute from the attribute list
            // tags:
            //      public
            return this.attributes[this.settings.displayOptionsAttributeName];
        },

        _roleIdentitiesSetter: function (roleIdentities) {
            this.roleIdentities = roleIdentities || [];

            this._reloadRoles();
        },

        _parentSetter: function (parent) {
            this.parent = parent;

            this.set("contentGroup", this.parent.name);
        },

        _contentGroupSetter: function (contentGroup) {
            this.contentGroup = contentGroup || "";
            this.attributes[this.settings.contentGroupAttributeName] = this.contentGroup;
            this._reloadRoles();
        },

        _reloadRoles: function () {
            var store = this.store;

            if (!store) {
                return;
            }

            // Get the role object from the store for each identity.
            var promise = all(this.roleIdentities.map(function (id) {
                return when(store.get(id)).otherwise(function () {
                    // Must return a deferred that doesn't fail otherwise roles will never be set.
                    // So just log a warning that we couldn't load the given vistor group.
                    console.warn("Could not load visitor group with id: " + id);
                });
            }));

            // Run this callback as a seperate chain so that this method
            // returns a promise that resolves in an array of roles.
            promise.then(lang.hitch(this, "set", "roles"));

            return promise;
        },

        _hasSiblingsSetter: function (hasSiblings) {
            this.hasSiblings = hasSiblings;

            this._updateRolesString();
        },

        _selectedSetter: function (selected) {
            this.selected = selected;

            if (selected) {
                this.emit("selected", this);
            }
        },

        _updateRolesString: function () {
            if (!this.contentGroup || this.roles === null) {
                this.set("rolesString", "");
                return;
            }

            if (!this.hasAnyRoles()) {
                if (this.hasSiblings) {
                    this.set("rolesString", resources.everyoneelsesee);
                } else {
                    this.set("rolesString", resources.everyonesees);
                }

                return;
            }

            // If roles has no length then all the selected roles have been removed from the system.
            // Display a specific message that explains this scenario.
            if (!this.roles.length) {
                this.set("rolesString", resources.groupcannotsees);
                return;
            }

            var namesCommaList = this.roles.map(function (r) {
                return "<em>" + entities.encode(r.name) + "</em>";
            }).sort().join(", ");
            var names = namesCommaList.replace(/, (?=[^,]+$)/, " " + resources.groupsand); // an extra space cause resource trims leading whitespace

            var rolesString = "";
            if (this.roles.length > 1) {
                rolesString = lang.replace(resources.groupssee, { groupNames: names });
            } else {
                rolesString = lang.replace(resources.groupsees, { groupName: names });
            }

            this.set("rolesString", rolesString);
        },

        _rolesSetter: function (roles) {
            // Filter out any roles that are undefined. This can happen if someone
            // deletes a visitor group that is in use.
            this.roles = roles.filter(function (role) {
                return !!role;
            });

            this._updateRolesString();
        }
    });
});
