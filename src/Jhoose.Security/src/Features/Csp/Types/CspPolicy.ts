import type { PolicyOptions } from './PolicyOptions';
import type { SchemaSource } from './SchemaSource';

export interface CspPolicy {
    id: string;
    site: string;
    policyName: string;
    reportOnly: boolean;
    schemaSource: SchemaSource;
    value: string;
    options: PolicyOptions;
}
