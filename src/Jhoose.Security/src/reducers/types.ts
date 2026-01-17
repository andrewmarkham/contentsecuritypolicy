import { CspPolicy, CspSandboxPolicy, SecuritySettings } from "../components/Csp/Types/types";
import { SecurityHeader } from "../components/SecurityHeaders/Types/securityHeader";
import { CspState, HeadersState, SettingsState } from "../types";

export type Dispatcher = (action: ApplicationAction | SettingsAction | HeaderAction | CspAction) => void;

export type Action = {
    actionType: string,
    error?: any,
    state?: CspState | SettingsState | HeadersState
    dispatcher?: React.Dispatch<any>
    
}

export type ApplicationAction = SettingsAction | HeaderAction | CspAction

export type SettingsAction = Action & {
}

export type HeaderAction = Action & {  
    securityHeader?: SecurityHeader,
}

export type CspAction = Action & {  
    cspPolicy?: CspPolicy | CspSandboxPolicy
}