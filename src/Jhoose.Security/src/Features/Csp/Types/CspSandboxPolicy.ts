import type { CspPolicy } from './CspPolicy';
import type { SandboxOptions } from './SandboxOptions';

export type CspSandboxPolicy = Omit<CspPolicy, "schemaSource" | "options"> & {
    sandboxOptions: SandboxOptions;
};
