'use strict';

import "@episerver/ui-framework/dist/main.css";
import "@episerver/platform-navigation/dist/main.css";
import "./css/app.css";

import {ContentArea,WorkItemNavigation,Typography,Workspace,ContextualToolbar, List, ListItem } from "@episerver/ui-framework";

import { SecurityHeaders } from './components/SecurityHeaders';

import { CspDataGrid } from './components/cspdatagrid';
import { CspSettings } from './components/cspsettings';

import { Toaster } from './components/toaster';
import { appReducer } from './reducers/appReducer';

import React, { useEffect, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Link, Redirect,HashRouter } from 'react-router-dom';

function App(props) {

  const initialState = {
    networkError: false,
    loading: false,
    saving: false,
    data: [],
    settingsSaved: true,
    settings: { mode: "on", reportingUrl: "" }
  };

  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    load();
  }, []);
  
  function save(policy) {
    dispatch({actionType: 'save', data: policy, dispatcher: dispatch});
  }

  function saveSettings(settings) {
    dispatch({actionType: 'settingsSave', data: settings, dispatcher: dispatch});
  }

  
  function load() {
    dispatch({actionType: 'load', data:null, dispatcher: dispatch});
    dispatch({actionType: 'settingsLoad', data:null, dispatcher: dispatch});
  }

    return (
      <>
      <HashRouter >
      <Toaster message={state.loading ? "Loading..." : state.saving ? "Saving..." : ""} visible={state.loading | state.saving }></Toaster>
        <ContentArea>    
          <WorkItemNavigation>
            <List>
              <ListItem><Link to="/csp">Policy</Link></ListItem>
              <ListItem><Link to="/csp/settings">Settings</Link></ListItem>
            </List>
          </WorkItemNavigation>
          <Workspace>  
            <div>
              <Typography use="headline2">Content Security Policy</Typography>
              <p>&nbsp;</p>
            </div>
            
            <Route exact path="/">
                <Redirect to="/csp"></Redirect>
            </Route>

            <Route exact path="/csp">
                <CspDataGrid data={state.data} save={save} disabled={state.loading | state.saving} />
            </Route>

            <Route exact path="/headers">
                <SecurityHeaders data={state.data} save={save} disabled={state.loading | state.saving} />
            </Route>

            <Route path="/csp/settings">
                <CspSettings settings={state.settings} 
                  isDirty={!state.settingsSaved}
                  save={saveSettings} 
                  disabled={state.loading | state.saving}>
                </CspSettings>
            </Route>

          </Workspace>
      </ContentArea>
      </HashRouter>
    </>
    );
  }

let domContainer = document.querySelector('#csp-root');

ReactDOM.render(<App />, domContainer);