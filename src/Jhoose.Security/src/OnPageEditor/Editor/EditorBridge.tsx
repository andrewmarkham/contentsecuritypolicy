import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DialogControls, PageOverrideDialog, PageOverrideDialogProps } from "./components/PageOverrideDialog/PageOverrideDialog";

declare global {
    interface Window {
        __mountReactDialog: (container: HTMLElement, props: PageOverrideDialogProps) => void;
        __unmountReactDialog: (container: HTMLElement) => void;
        __commitReactDialog: (container: HTMLElement) => Promise<void>;
    }
}

console.log("[Jhoose] EditorBridge (inline-editor-bundle.js) evaluated, window.__mountReactDialog being registered");

const roots = new Map<HTMLElement, ReactDOM.Root>();
const controls = new Map<HTMLElement, DialogControls>();

// This bundle is a separate webpack entry from csp-app.js and never shares a page/React tree
// with it, so it needs its own QueryClient instance rather than reusing the admin app's.
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

window.__mountReactDialog = (container: HTMLElement, props: PageOverrideDialogProps) => {
    console.log("[Jhoose] __mountReactDialog called with props:", props);
    const root = ReactDOM.createRoot(container);
    roots.set(container, root);
    root.render(
        <QueryClientProvider client={queryClient}>
            <PageOverrideDialog {...props} registerControls={(c) => controls.set(container, c)} />
        </QueryClientProvider>
    );
};

window.__commitReactDialog = (container: HTMLElement): Promise<void> => {
    const c = controls.get(container);
    return c ? c.commit() : Promise.resolve();
};

window.__unmountReactDialog = (container: HTMLElement) => {
    const root = roots.get(container);
    if (root) {
        root.unmount();
        roots.delete(container);
    }
    controls.delete(container);
};