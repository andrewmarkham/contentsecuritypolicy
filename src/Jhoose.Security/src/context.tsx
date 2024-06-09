import React, { createContext, useReducer, Dispatch } from 'react';

import { CspPolicy, CspSandboxPolicy, SecuritySettings } from "./components/csp/types/types";
import { SecurityHeader } from "./components/securityheaders/types/securityHeader";
import { ApplicationState } from "./types";
import { CspAction, HeaderAction, SettingsAction } from "./reducers/types";
import { cspAppReducer } from "./reducers/cspAppReducer";
import { settingsAppReducer } from "./reducers/settingsAppReducer";
import { headerAppReducer } from "./reducers/headerAppReducer";



const initialState: ApplicationState = {
    csp: {
        loading: false,
        saving: false,
        networkError: false,
        data: [] as  Array<CspPolicy | CspSandboxPolicy>
    },
    headers: {
        loading: false,
        saving: false,
        networkError: false,
        useHeadersUI: true,
        data: [] as Array<SecurityHeader>
    },
    settings: {
        loading: false,
        saving: false,
        networkError: false,
        settings: { 
                mode: "on", 
                reportingUrl: "",
                reportToUrl: "",
                webhookUrls: [],
                authenticationKeys: []
            } as SecuritySettings
    }
  };


const AppContext = createContext<{
    state: ApplicationState;
    dispatch: Dispatch<CspAction | SettingsAction | HeaderAction>;
  }>({
    state: initialState,
    dispatch: () => null
  });

  const mainReducer = ({ csp, headers, settings }: ApplicationState, action: CspAction | SettingsAction | HeaderAction) => ({

    // CSP AppReducer
    csp:cspAppReducer(csp, action),

    // Setting App Reducer
    settings:settingsAppReducer(settings,action),
    
    // Response Header App Reducer
    headers:headerAppReducer(headers,action),
  });
  
  type Props = {
    children: Array<any> | any
  }
  const AppProvider: React.FC<Props> = ({ children }: Props) => {
    const [state, dispatch] = useReducer(mainReducer, initialState);
  
    return (
      <AppContext.Provider value={{state, dispatch}}>
        {children}
      </AppContext.Provider>
    )
  }
  
  export { AppProvider, AppContext };