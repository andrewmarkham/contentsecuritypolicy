export type AuthenticationKey = {
    name: string,
    key: string,
    revoked: boolean
}

export type SecuritySettings = {
    mode: "on"|"off"|"report",
    reportingMode: 0 | 1 | 2,
    reportingUrl: string,
    reportToUrl: string,
    webhookUrls: string[],
    authenticationKeys: AuthenticationKey[]
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
}

export type PolicyOptionName = "wildcard" | "none" | "self" | "unsafeEval" | "unsafeHashes" | "unsafeInline" | "strictDynamic" | "nonce";

export interface PolicyOptions extends Record<PolicyOptionName,boolean>{}

export type SandboxOptions = {
    enabled: boolean,
    allowDownloads: boolean,
    allowForms: boolean,
    allowModals: boolean,
    allowOrientationLock: boolean,
    allowPointerLock: boolean,
    allowPopups: boolean,
    allowPopupsToEscapeSandbox: boolean,
    allowPresentation: boolean,
    allowSameOrigin: boolean,
    allowScripts: boolean,
    allowTopNavigation: boolean
    allowTopNavigationByUserActivation: boolean
    allowTopNavigationToCustomProtocols: boolean
}
export type CspPolicy = {
    id: string,
    policyName: string,
    reportOnly: boolean,
    schemaSource: SchemaSource,
    value: string,
    options: PolicyOptions,
    summaryText: string
}

export type CspSandboxPolicy = Omit<CspPolicy, "schemaSource" | "options"> & {
    sandboxOptions: SandboxOptions
}

export interface RefForm {
    RequestSave: () => void
  }