'use strict';

import "@episerver/ui-framework/dist/main.css";
import "@episerver/platform-navigation/dist/main.css";
import "./css/app.css";

import {Typography } from "@episerver/ui-framework";

import { SecurityHeaders } from './components/securityheaders/SecurityHeaders';
import {NotEnabled} from './components/securityheaders/NotEnabled';

import { Toaster } from './components/toaster';
import { appReducer } from './reducers/appReducer';
import {CspModule} from './components/csp/cspmodule';

import React, { useEffect, useReducer, useState } from 'react';
import ReactDOM from 'react-dom';
import { Route, Redirect,HashRouter } from 'react-router-dom';

function App(props) {

  const initialState = {
    networkError: false,
    loading: false,
    saving: false,
    data: [],
    useHeadersUI: true,
    headerData: [],
    settingsSaved: true,
    settings: { mode: "on", reportingUrl: "" }
  };

  const [state, dispatch] = useReducer(appReducer, initialState);

  const [title, setTitle] = useState("Content Security Policy");

  useEffect(() => {
    load();
  }, []);
  
  function save(policy) {
    dispatch({actionType: 'save', data: policy, dispatcher: dispatch});
  }

  function saveSettings(settings) {
    dispatch({actionType: 'settingsSave', data: settings, dispatcher: dispatch});
  }

  function saveHeader(requestHeaders) {
    dispatch({actionType: 'headerSave', data: requestHeaders, dispatcher: dispatch});
  }
  
  function load() {
    dispatch({actionType: 'load', data:null, dispatcher: dispatch});
    dispatch({actionType: 'settingsLoad', data:null, dispatcher: dispatch});
    dispatch({actionType: 'headerLoad', data:null, dispatcher: dispatch});
  }

    return (
      <>
      <HashRouter >
      <Toaster message={state.loading ? "Loading..." : state.saving ? "Saving..." : ""} visible={state.loading | state.saving }></Toaster>
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
                            disabled={state.loading | state.saving}
                            setTitle={setTitle}/>
            </Route>

            <Route exact path="/headers">
                {state.useHeadersUI ?
                  <SecurityHeaders data={state.headerData} save={saveHeader} disabled={state.loading | state.saving} setTitle={setTitle} /> :
                  <NotEnabled setTitle={setTitle}  />
                }
            </Route>
      </div>
      </HashRouter>
    </>
    );
  }

let domContainer = document.querySelector('#csp-root');

ReactDOM.render(<App />, domContainer);