export type IpRestrictionEntry = {
    id: string;
    value: string;
    site: string;
};

export type BulkIpRestrictionResult = {
    created: IpRestrictionEntry[];
    rejected: string[];
};
