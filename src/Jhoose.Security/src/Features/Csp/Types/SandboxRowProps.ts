import type { ContentSecurityPolicy } from './ContentSecurityPolicy';
import type { CspSandboxPolicy } from './CspSandboxPolicy';
import type { PolicySource } from './PolicySource';

export type SandboxRowProps = {  
    policyName: string,
    policy: CspSandboxPolicy | null,
    policyData: ContentSecurityPolicy,
    source: PolicySource,
    siteId: string,
    siteName: string,
    inheritedPolicy: CspSandboxPolicy | null
}
