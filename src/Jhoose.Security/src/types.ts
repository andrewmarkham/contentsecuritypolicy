import { CspPolicy, CspSandboxPolicy, SecuritySettings } from './components/csp/types/types';
import { SecurityHeader } from './components/securityheaders/types/securityHeader';

export type ApplicationState = {
    networkError: boolean,
    loading: boolean,
    saving: boolean,
    data: Array<CspPolicy | CspSandboxPolicy>,
    useHeadersUI: boolean,
    headerData: SecurityHeader[],
    settingsSaved: boolean,
    settings: SecuritySettings
  }