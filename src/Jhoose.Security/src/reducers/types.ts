import { CspPolicy, SecuritySettings } from "../components/csp/types/types";
import { SecurityHeader } from "../components/securityheaders/types/securityHeader";

export type Dispatcher = (action: ApplicationAction | SettingsAction | HeaderAction | CspAction) => void;

export type Action = {
    actionType: string,
    error?: any,
    dispatcher?: React.Dispatch<any>
    
}
export type ApplicationAction = SettingsAction | HeaderAction | CspAction

export type SettingsAction = Action & {
    settings?: SecuritySettings
}

export type HeaderAction = Action & {  
    securityHeader?: SecurityHeader,
    securityHeaders?: SecurityHeader[],
    useHeadersUI?: boolean
}

export type CspAction = Action & {  
    cspPolicy?: CspPolicy,
    cspPolicies?: CspPolicy[]
}