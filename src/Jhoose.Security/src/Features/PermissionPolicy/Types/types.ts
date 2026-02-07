export type PermissionPolicy = {
    name: string;
    description: string;
    defaultAllowlist: string;
    status: string;
    notes: string;
};

export type Permission = {
    id: string;
    key: string;
    mode: "default" | "enabled" | "report" | "disabled";
    scope: "all" | "self" ;
    allowlist: string[];
    site?: string;
};

export type PermissionSource = "default" | "inherited" | "overridden";
