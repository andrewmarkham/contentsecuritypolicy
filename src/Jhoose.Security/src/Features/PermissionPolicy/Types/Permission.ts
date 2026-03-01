export type Permission = {
    id: string;
    key: string;
    mode: "default" | "enabled" | "report" | "disabled";
    scope: "all" | "self" ;
    allowlist: string[];
    site?: string;
};
