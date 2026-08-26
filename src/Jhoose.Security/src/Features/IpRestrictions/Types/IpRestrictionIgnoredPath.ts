export type IpRestrictionIgnoredPath = {
    id: string;
    value: string;
    site: string;
};

export type BulkIpRestrictionIgnoredPathResult = {
    created: IpRestrictionIgnoredPath[];
    rejected: string[];
};
