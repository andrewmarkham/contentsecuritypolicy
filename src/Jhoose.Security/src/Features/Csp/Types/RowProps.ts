import type { ContentSecurityPolicy } from './ContentSecurityPolicy';
import type { CspPolicy } from './CspPolicy';
import type { PolicySource } from './PolicySource';

export type RowProps = {  
    policyName: string,
    policy: CspPolicy | null,
    policyData: ContentSecurityPolicy,
    source: PolicySource,
    siteId: string,
    siteName: string,
    inheritedPolicy: CspPolicy | null
}
