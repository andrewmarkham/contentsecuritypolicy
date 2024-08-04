import { CspPolicy, CspSandboxPolicy } from "./types/types";

export function getPolicyOptionsDisplay(policy: CspPolicy): string {
    var v = "";
    if (policy.options)
    {
        if (policy.options.none) {
            v+= "'none'";
        } else 
        {
            // options
            v = policy.options.wildcard ? v+= "* " : v;
            v = policy.options.self ? v+= "'self' " : v;

            v = policy.options.unsafeEval ? v+= "'unsafe-eval' " : v;
            v = policy.options.unsafeHashes ? v+= "'unsafe-hashes' " : v;
            v = policy.options.unsafeInline ? v+= "'unsafe-inline' " : v;
            v = policy.options.strictDynamic ? v+= "'strict-dynamic' " : v;
            v = policy.options.nonce ? v+= "'nonce-<base64-value>' " : v;
        }
    }
    return v;
}

export function getSchemaSourceDisplay(policy: CspPolicy): string {
    var v = "";

    if (policy.schemaSource)
    {
        //schemaSource
        v = policy.schemaSource.http ? v+= "http: " : v;
        v = policy.schemaSource.https ? v+= "https: " : v;
        v = policy.schemaSource.data ? v+= "data: " : v;
        v = policy.schemaSource.mediastream ? v+= "mediastream: " : v;
        v = policy.schemaSource.blob ? v+= "blob: " : v;
        v = policy.schemaSource.filesystem ? v+= "filesystem: " : v;

        v = policy.schemaSource.ws ? v+= "ws: " : v;
        v = policy.schemaSource.wss ? v+= "wss: " : v;
    }

    return v;
}

export function isScriptPolicy(policy: CspPolicy): boolean{

    if(policy.policyName === "script-src" || policy.policyName === "style-src") {
        return true;
    }        

    return false;
}

export function getSandboxOptionsDisplay(policy: CspSandboxPolicy): string {
    var v = `${policy.policyName} `;
    // sandboxOptions
    if (policy.sandboxOptions?.enabled ?? false) {
        v = policy.sandboxOptions?.allowDownloads ? v+= "allow-downloads " : v;
        v = policy.sandboxOptions?.allowForms ? v+= "allow-forms " : v;
        v = policy.sandboxOptions?.allowSameOrigin ? v+= "allow-same-origin " : v;
        v = policy.sandboxOptions?.allowScripts ? v+= "allow-scripts " : v;
        v = policy.sandboxOptions?.allowPopups ? v+= "allow-popups " : v;
        v = policy.sandboxOptions?.allowModals ? v+= "allow-modals " : v;
        v = policy.sandboxOptions?.allowOrientationLock ? v+= "allow-orientation-lock " : v;
        v = policy.sandboxOptions?.allowPointerLock ? v+= "allow-pointer-lock " : v;
        v = policy.sandboxOptions?.allowPresentation ? v+= "allow-presentation " : v;
        v = policy.sandboxOptions?.allowPopupsToEscapeSandbox ? v+= "allow-popups-to-escape-sandbox " : v;
        v = policy.sandboxOptions?.allowTopNavigation ? v+= "allow-top-navigation " : v;
        v = policy.sandboxOptions?.allowTopNavigationByUserActivation ? v+= "allow-top-navigation-by-user-activation " : v;
        v = policy.sandboxOptions?.allowTopNavigationToCustomProtocols ? v+= "allow-top-navigation-to-custom-protocols " : v;
        
    }
    
    return v;
}