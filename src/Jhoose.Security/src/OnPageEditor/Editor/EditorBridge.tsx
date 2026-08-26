import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DialogControls as CspDialogControls, PageOverrideDialog, PageOverrideDialogProps } from "./components/PageOverrideDialog/PageOverrideDialog";
import { DialogControls as PermissionsDialogControls, PermissionsPageOverrideDialog, PermissionsPageOverrideDialogProps } from "./components/PermissionsPageOverrideDialog/PermissionsPageOverrideDialog";

declare global {
    interface Window {
        __mountReactCspDialog: (container: HTMLElement, props: PageOverrideDialogProps) => void;
        __unmountReactCspDialog: (container: HTMLElement) => void;
        __commitReactCspDialog: (container: HTMLElement) => Promise<void>;
        __mountReactPermissionsDialog: (container: HTMLElement, props: PermissionsPageOverrideDialogProps) => void;
        __unmountReactPermissionsDialog: (container: HTMLElement) => void;
        __commitReactPermissionsDialog: (container: HTMLElement) => Promise<void>;
    }
}

console.log("[Jhoose] EditorBridge (inline-editor-bundle.js) evaluated, dialog bridge functions being registered");

const cspRoots = new Map<HTMLElement, ReactDOM.Root>();
const cspControls = new Map<HTMLElement, CspDialogControls>();

const permissionsRoots = new Map<HTMLElement, ReactDOM.Root>();
const permissionsControls = new Map<HTMLElement, PermissionsDialogControls>();

// This bundle is a separate webpack entry from csp-app.js and never shares a page/React tree
// with it, so it needs its own QueryClient instance rather than reusing the admin app's. Both
// dialog types below share this one instance - it's a plain cache, not feature-specific.
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

window.__mountReactCspDialog = (container: HTMLElement, props: PageOverrideDialogProps) => {
    console.log("[Jhoose] __mountReactCspDialog called with props:", props);
    const root = ReactDOM.createRoot(container);
    cspRoots.set(container, root);
    root.render(
        <QueryClientProvider client={queryClient}>
            <PageOverrideDialog {...props} registerControls={(c) => cspControls.set(container, c)} />
        </QueryClientProvider>
    );
};

window.__commitReactCspDialog = (container: HTMLElement): Promise<void> => {
    const c = cspControls.get(container);
    return c ? c.commit() : Promise.resolve();
};

window.__unmountReactCspDialog = (container: HTMLElement) => {
    const root = cspRoots.get(container);
    if (root) {
        root.unmount();
        cspRoots.delete(container);
    }
    cspControls.delete(container);
};

window.__mountReactPermissionsDialog = (container: HTMLElement, props: PermissionsPageOverrideDialogProps) => {
    console.log("[Jhoose] __mountReactPermissionsDialog called with props:", props);
    const root = ReactDOM.createRoot(container);
    permissionsRoots.set(container, root);
    root.render(
        <QueryClientProvider client={queryClient}>
            <PermissionsPageOverrideDialog {...props} registerControls={(c) => permissionsControls.set(container, c)} />
        </QueryClientProvider>
    );
};

window.__commitReactPermissionsDialog = (container: HTMLElement): Promise<void> => {
    const c = permissionsControls.get(container);
    return c ? c.commit() : Promise.resolve();
};

window.__unmountReactPermissionsDialog = (container: HTMLElement) => {
    const root = permissionsRoots.get(container);
    if (root) {
        root.unmount();
        permissionsRoots.delete(container);
    }
    permissionsControls.delete(container);
};
