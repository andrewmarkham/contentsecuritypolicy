define([
        "dojo/_base/declare",
        "epi/shell/command/_Command",

        "epi/shell/widget/dialog/Dialog",
        "dijit/form/TextBox"
],
    function(
        declare,
        _ContentOverrideCommandMixin,

        Dialog,
        TextBox
    ) {
        console.log("[Jhoose] JhoosePermissionsCommand.js module loaded");
        return declare("jhoosesecurity/command/PermissionsOverrideCommand",
            [_ContentOverrideCommandMixin],
            {
            name: "PermissionsOverrideCommand",
            label: "Jhoose Permissions Policy Page Override",
            tooltip: "Overrides Permissions-Policy for this page",
            canExecute: true,
            order: 10010,
            constructor: function() {
                console.log("[Jhoose] JhoosePermissionsCommand instance constructed");
                this._dialog = null;
                this._contentNode = null;
                this._pendingCommit = null;
            },
            _execute: function() {
                console.log("[Jhoose] JhoosePermissionsCommand._execute() called");

                // See JhooseCommand.js for the full explanation of why cleanup is unconditional
                // here rather than gated on a flag.
                this._cleanupDialog();

                var self = this;

                var contentLink = (this.model && this.model.contentData && this.model.contentData.contentLink) || "";
                // Strip any work-ID suffix (e.g. "3_182" -> "3") so a saved override matches the
                // published content link resolved at request time, regardless of which version
                // was open in the editor when it was saved.
                contentLink = contentLink.split("_")[0];
                console.log("[Jhoose] resolved contentLink for current page:", contentLink);

                // Create a container node for React to mount into
                var contentNode = document.createElement("div");
                contentNode.id = "react-dialog-root";

                var dialog = new Dialog({
                    title: "Jhoose Permissions Policy",
                    heading: "Page Permissions Policy Overrides",
                    content: contentNode,
                    description: "Policies listed here only apply to this page, taking priority over the website and global default policies.",
                    iconClass: "epi-iconSettings"
                });

                this._dialog = dialog;
                this._contentNode = contentNode;

                // See JhooseCommand.js for the full explanation of the execute/cancel/hide timing.
                dialog.on("execute", function () {
                    self._pendingCommit = window.__commitReactPermissionsDialog(contentNode);
                });

                console.log("[Jhoose] mounting React into contentNode, window.__mountReactPermissionsDialog is:", typeof window.__mountReactPermissionsDialog);
                window.__mountReactPermissionsDialog(contentNode, {
                    contentLink: contentLink
                });

                dialog.on("hide", function () {
                    if (self._pendingCommit) {
                        var pendingCommit = self._pendingCommit;
                        self._pendingCommit = null;
                        pendingCommit
                            .catch(function (err) {
                                console.error("[Jhoose] failed to save Permissions-Policy page overrides:", err);
                            })
                            .then(function () {
                                self._cleanupDialog();
                            });
                    } else {
                        self._cleanupDialog();
                    }
                });

                dialog.show();
            },

            _cleanupDialog: function () {
                if (!this._dialog) {
                    return;
                }
                var dialog = this._dialog;
                var contentNode = this._contentNode;
                this._dialog = null;
                this._contentNode = null;
                this._pendingCommit = null;

                if (contentNode) {
                    window.__unmountReactPermissionsDialog(contentNode);
                }
                dialog.hide();
                dialog.destroyRecursive();
            },

            _onModelChange: function() {
                //this.updateSyncStatus();
            }
        });
    });
