export type Mode = "on" | "off" | "report";
export type ReportingMode = 0 | 1 | 2;

export interface AuthenticationKey {
    name: string;
    key: string;
    revoked: boolean;
    site: string;
}

export interface SecuritySettings {
    mode: Mode;
    permissionMode: Mode;
    reportingMode: ReportingMode;
    reportingUrl: string;
    reportToUrl: string;
    webhookUrls: Array<string>;
    authenticationKeys: Array<AuthenticationKey>;
    siteModes?: Record<string, Mode>;
    permissionModesBySite?: Record<string, Mode>;
}

export interface ContentSecurityPolicy {
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

export type PolicyOptions = Record<PolicyOptionName, boolean>;

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
    site: string;
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

export type PolicySource = "default" | "inherited" | "overridden";

export type RowProps = {  
    policyName: string,
    policy: CspPolicy | null,
    policyData: ContentSecurityPolicy,
    source: PolicySource,
    siteId: string,
    siteName: string,
    inheritedPolicy: CspPolicy | null
}

export type SandboxRowProps = {  
    policyName: string,
    policy: CspSandboxPolicy | null,
    policyData: ContentSecurityPolicy,
    source: PolicySource,
    siteId: string,
    siteName: string,
    inheritedPolicy: CspSandboxPolicy | null
}
