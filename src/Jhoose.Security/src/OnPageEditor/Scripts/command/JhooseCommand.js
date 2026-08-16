define([
        "dojo/_base/declare",
        "epi/shell/command/_Command",

        "epi/shell/widget/dialog/Dialog",
        "dijit/form/TextBox"

        //"jhoosesecurity/command/_ContentOverrideCommandMixin",
        //"epi/i18n!epi/cms/nls/jhoose.epi.security.contentoverridecommand"
],
    function(
        declare,
        _ContentOverrideCommandMixin,

        Dialog,
        TextBox
        //resources
    ) {
        console.log("[Jhoose] JhooseCommand.js module loaded");
        return declare("jhoosesecurity/command/ContentOverrideCommand",
            [_ContentOverrideCommandMixin],
            {
            name: "ContentOverrideCommand",
            label: "Jhoose CSP Page Override", //resources.label,
            tooltip: "Overrides Content Security Policy for this page",//resources.tooltip,
            //includeDescendants: false,
            //force: true,
            canExecute: true,
            order: 10000,
            constructor: function() {
                console.log("[Jhoose] JhooseCommand instance constructed");
                this._dialog = null;
                this._contentNode = null;
                this._pendingCommit = null;
            },
            _execute: function() {
                console.log("[Jhoose] JhooseCommand._execute() called");

                // The dojo Dialog's own close affordances (corner "X", overlay click, Escape) don't
                // go through our onClose prop, and its "show"/"hide" events don't fire reliably
                // either - so we can't trust any lifecycle event to tell us the previous dialog is
                // gone. Instead, always tear down whatever we're still tracking before opening a
                // new one, rather than gating on a flag that only we can clear.
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
                    title: "Jhoose Content Security Policy",
                    heading: "Page Content Security Policy Overrides",
                    content: contentNode,
                    description: "Policies listed here only apply to this page, taking priority over the website and global default policies.",
                    iconClass: "epi-iconSettings"
                });

                this._dialog = dialog;
                this._contentNode = contentNode;

                // The dialog's default OK button fires "execute", which dojo/dijit wire up to call
                // hide() synchronously and immediately (before this handler even runs) - but "hide"
                // itself is only actually fired once the fade-out animation finishes, so there's a
                // window to kick off the save here and have the "hide" handler below wait for it
                // before tearing anything down. Cancel/the corner "X"/Escape all fire "cancel"
                // (never "execute"), so nothing is ever staged/saved for those - _pendingCommit
                // simply stays null and the dialog is torn down immediately, discarding whatever
                // unsaved state the React tree was holding.
                dialog.on("execute", function () {
                    self._pendingCommit = window.__commitReactCspDialog(contentNode);
                });

                // React's createRoot/render works on a detached node - no need to wait for a
                // dialog lifecycle event (the widget's "show" never actually fires for this widget).
                console.log("[Jhoose] mounting React into contentNode, window.__mountReactCspDialog is:", typeof window.__mountReactCspDialog);
                window.__mountReactCspDialog(contentNode, {
                    contentLink: contentLink
                });

                dialog.on("hide", function () {
                    if (self._pendingCommit) {
                        var pendingCommit = self._pendingCommit;
                        self._pendingCommit = null;
                        pendingCommit
                            .catch(function (err) {
                                console.error("[Jhoose] failed to save CSP page overrides:", err);
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
                    window.__unmountReactCspDialog(contentNode);
                }
                dialog.hide();
                dialog.destroyRecursive();
            },

            _mountReact: function () {
                // Dynamically import your bundled React component
                require(["MyProject/react-editor-bundle"], (bundle) => {
                    bundle.mount(this.containerNode, {
                        value: this.value,
                        onChange: (newValue) => this._handleChange(newValue)
                    });
                });
            },

            _onModelChange: function() {
                //this.updateSyncStatus();
            }
            //resources: resources
        });
    });