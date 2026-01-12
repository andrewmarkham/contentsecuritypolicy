export type Mode = "on" | "off" | "report";
export type ReportingMode = 0 | 1 | 2;

export interface AuthenticationKey {
    readonly name: string;
    readonly key: string;
    readonly revoked: boolean;
}

export interface SecuritySettings {
    mode: Mode;
    permissionMode: Mode;
    reportingMode: ReportingMode;
    reportingUrl: string;
    reportToUrl: string;
    webhookUrls: ReadonlyArray<string>;
    authenticationKeys: ReadonlyArray<AuthenticationKey>;
}

export interface ContentSecurityPolicy {
    policyName: string;
    order: number;
    level: number;
    summaryText: string;
}

export type SchemaSource = {
    enabled: boolean;
    http: boolean;
    https: boolean;
    data: boolean;
    mediastream: boolean;
    blob: boolean;
    filesystem: boolean;
    ws?: boolean;
    wss?: boolean;
};

export type PolicyOptionName = "wildcard" | "none" | "self" | "wasmUnsafeEval" | "unsafeEval" | "unsafeHashes" | "unsafeInline" | "strictDynamic" | "nonce";

export type PolicyOptions = Readonly<Record<PolicyOptionName, boolean>>;

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
export interface CspPolicy {
    id: string;
    policyName: string;
    reportOnly: boolean;
    schemaSource: SchemaSource;
    value: string;
    options: PolicyOptions;
}

export type CspSandboxPolicy = Omit<CspPolicy, "schemaSource" | "options"> & {
    sandboxOptions: SandboxOptions;
};

export interface RefForm {
    RequestSave: () => void;
}
