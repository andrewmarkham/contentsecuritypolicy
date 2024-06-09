import { CspPolicy, CspSandboxPolicy, SecuritySettings } from './components/csp/types/types';
import { SecurityHeader } from './components/securityheaders/types/securityHeader';

type BaseState = {
  loading: boolean;
  saving: boolean;
  networkError: boolean;
  errorMessage?: string;
}

export type CspState = BaseState & {
  data: Array<CspPolicy | CspSandboxPolicy>
}

export type HeadersState = BaseState & {
  useHeadersUI: boolean;
  data: Array<SecurityHeader> 
}

export type SettingsState = BaseState & {
  settings: SecuritySettings
}

export type ApplicationState = {
    csp: CspState,
    headers: HeadersState,
    settings: SettingsState
  }