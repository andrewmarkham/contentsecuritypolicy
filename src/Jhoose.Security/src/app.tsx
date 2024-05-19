'use strict';

import { createRoot } from 'react-dom/client';
import "@episerver/ui-framework/dist/main.css";

import "./css/app.css";

import {Typography } from "@episerver/ui-framework";

import { SecurityHeaders } from './components/securityheaders/SecurityHeaders';
import {NotEnabled} from './components/securityheaders/NotEnabled';

import { Toaster } from './components/toaster';
import { appReducer } from './reducers/appReducer';
import {CspModule} from './components/csp/CspModule';

import React, { useEffect, useReducer, useState } from 'react';

import { Route, Redirect,HashRouter } from 'react-router-dom';

import { CspPolicy, CspSandboxPolicy, SecuritySettings } from './components/csp/types/types';
import { SecurityHeader } from './components/securityheaders/types/securityHeader';
import { ApplicationState } from './types';

function App() {

  const initialState: ApplicationState = {
    networkError: false,
    loading: false,
    saving: false,
    data: [] as Array<CspPolicy | CspSandboxPolicy>,
    useHeadersUI: true,
    headerData: [] as SecurityHeader[],
    settingsSaved: true,
    settings: { mode: "on", reportingUrl: "" } as SecuritySettings
  };

  const [state, dispatch] = useReducer(appReducer, initialState);

  const [title, setTitle] = useState("Content Security Policy");

  useEffect(() => {
    load();
  }, []);
  
  function save(policy: CspPolicy) {
    dispatch({actionType: 'save', cspPolicy: policy, dispatcher: dispatch});
  }

  function saveSettings(settings: SecuritySettings) {
    dispatch({actionType: 'settingsSave', settings: settings, dispatcher: dispatch});
  }

  function saveHeader(securityHeader: SecurityHeader) {
    dispatch({actionType: 'headerSave', securityHeader: securityHeader, dispatcher: dispatch});
  }
  
  function load() {
    dispatch({actionType: 'load', dispatcher: dispatch});
    dispatch({actionType: 'settingsLoad', dispatcher: dispatch});
    dispatch({actionType: 'headerLoad', dispatcher: dispatch});
  }

    return (
      <>
      <HashRouter >
      <Toaster message={state.loading ? "Loading..." : state.saving ? "Saving..." : ""} visible={state.loading || state.saving }></Toaster>
        <div>    
            <div className="title">
              <Typography use="headline2">{title}</Typography>
              <p>&nbsp;</p>
            </div>
            
            <Route exact path="/">
                <Redirect to="/csp"></Redirect>
            </Route>

            <Route exact path="/csp">
                <CspModule  data={state.data} save={save} 
                            settings={state.settings} saveSettings={saveSettings} settingsSaved={state.settingsSaved}
                            disabled={state.loading || state.saving}
                            setTitle={setTitle}/>
            </Route>

            <Route exact path="/headers">
                {state.useHeadersUI ?
                  <SecurityHeaders data={state.headerData} save={saveHeader} disabled={state.loading || state.saving} setTitle={setTitle} /> :
                  <NotEnabled setTitle={setTitle}  />
                }
            </Route>
      </div>
      </HashRouter>
    </>
    );
  }


const container = document.getElementById('csp-root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<App />);