'use strict';

import "@episerver/ui-framework/dist/main.css";
import "@episerver/platform-navigation/dist/main.css";
import "./css/app.css";

import {ContentArea,WorkItemNavigation,Typography,Workspace,ContextualToolbar } from "@episerver/ui-framework";

import { CspDataGrid } from './components/cspdatagrid';

import { Toaster } from './components/toaster';
import { AppNavigation } from './components/appnavigation';
import { appReducer } from './reducers/appReducer';

import { NavigationAdjust } from "@episerver/platform-navigation";
import React, { useEffect, useReducer } from 'react';
import ReactDOM from 'react-dom';

function App(props) {

  const initialState = {
    networkError: false,
    loading: false,
    saving: false,
    data: []
  };

  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    load();
  }, []);
  
  function save(policy) {
    dispatch({actionType: 'save', data: policy, dispatcher: dispatch});
  }

  function load() {
    dispatch({actionType: 'load', data:null, dispatcher: dispatch});
  }

    return (
      <>
      <Toaster message={state.loading ? "Loading..." : state.saving ? "Saving..." : ""} visible={state.loading | state.saving }></Toaster>
        <ContentArea>    
          <Workspace>  
            <div>
              <Typography use="headline2">Content Security Policy</Typography>
              <p>....</p>
            </div>
            <CspDataGrid data={state.data} save={save} disabled={state.loading | state.saving} />
          </Workspace>
      </ContentArea>
    </>
    );
  }

let domContainer = document.querySelector('#csp-root');
ReactDOM.render(<App />, domContainer);