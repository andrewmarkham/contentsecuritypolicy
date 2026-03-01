import type { AuthenticationKey } from './AuthenticationKey';
import type { Mode } from './Mode';
import type { ReportingMode } from './ReportingMode';

export interface SecuritySettings {
    mode: Mode;
    permissionMode: Mode;
    reportingMode: ReportingMode;
    reportingUrl: string;
    reportToUrl: string;
    webhookUrls: Array<string>;
    authenticationKeys: Array<AuthenticationKey>;
    siteModes?: Record<string, Mode>;
    permissionModesBySite?: Record<string, Mode>;
}
