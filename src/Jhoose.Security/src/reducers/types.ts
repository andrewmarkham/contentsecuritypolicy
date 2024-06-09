import { CspPolicy, SecuritySettings } from "../components/csp/types/types";
import { SecurityHeader } from "../components/securityheaders/types/securityHeader";
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
    cspPolicy?: CspPolicy
}