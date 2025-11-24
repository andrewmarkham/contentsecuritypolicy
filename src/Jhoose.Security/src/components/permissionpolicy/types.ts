export type PermissionPolicy = {
    name: string;
    description: string;
    defaultAllowlist: string;
    status: string;
    notes: string;
};

export type Permission = {
    key: string;
    mode: "default" | "enabled" | "report" | "disabled";
    scope: "all" | "self" ;
    allowlist: string[];
};