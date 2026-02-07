export interface SandboxOptions {
    enabled: boolean;
    allowDownloads: boolean;
    allowForms: boolean;
    allowModals: boolean;
    allowOrientationLock: boolean;
    allowPointerLock: boolean;
    allowPopups: boolean;
    allowPopupsToEscapeSandbox: boolean;
    allowPresentation: boolean;
    allowSameOrigin: boolean;
    allowScripts: boolean;
    allowTopNavigation: boolean;
    allowTopNavigationByUserActivation: boolean;
    allowTopNavigationToCustomProtocols: boolean;
}
