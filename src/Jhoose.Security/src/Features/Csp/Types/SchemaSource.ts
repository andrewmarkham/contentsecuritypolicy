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
