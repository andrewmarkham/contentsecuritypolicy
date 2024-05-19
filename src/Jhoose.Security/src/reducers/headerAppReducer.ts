import axios from 'axios';

import { Dispatcher, HeaderAction } from './types';
import { ApplicationState } from '../types';
import { SecurityHeader } from '../components/securityheaders/types/securityHeader';

export const headerAppReducer = (state : ApplicationState, action: HeaderAction): ApplicationState => {
    
  if (action.actionType === "headerSave") {

        saveRequest(action.dispatcher,action.securityHeader);
  
        return {
          ...state,
          useHeadersUI: true,
          saving: true,
          settings: {...state.settings},
          headerData: [...state.headerData],
          settingsSaved: false,
          data: [...state.data]
        }
      } else if (action.actionType === "headerSaved") { 

        var newHeaderData = merge(state.headerData, action.securityHeader);

        return {
          ...state,
          saving: false,
          settings: {...state.settings},
          settingsSaved: true,
          headerData: [...newHeaderData],
          data: [...state.data]
        }
    } else if (action.actionType === "headerLoad") { 
      loadRequest(action.dispatcher);

      return {
        ...state,
        loading: true,
        settings: {...state.settings},
        headerData: [...state.headerData],
        data: [...state.data]
      }
    } else if (action.actionType === "headerLoaded") { 

      return {
        ...state,
        useHeadersUI: action.useHeadersUI || state.useHeadersUI,
        loading: false,
        settings: {...state.settings},
        headerData: [...action.securityHeaders || state.headerData],
        data: [...state.data]
      }
    } 

    return state;
  };
  
  function merge(data : SecurityHeader[], updatedRecord?: SecurityHeader) {
    if (!updatedRecord) return data;
    return data.map(p => {
        if (p.id === updatedRecord.id){
          return Object.assign(p, updatedRecord);
        } else {
          return p;
        }
      });
  }

  function loadRequest(dispatcher?: Dispatcher) {
    if (!dispatcher) return;

    axios.get('/api/csp/header')
          .then((r) =>
          {
            if (r.status === 200) {

                dispatcher({actionType: "headerLoaded", useHeadersUI: r.data.useHeadersUI, securityHeaders : r.data.headers});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "loaderror", error : e});
          });
  }
  
  function saveRequest(dispatcher?: Dispatcher, securityheader?: SecurityHeader) {
    if (!dispatcher) return;
    
    if (!securityheader) {
      dispatcher({actionType: "saveerror", error: "No data to save"});
      return;
    }

    axios.post('/api/csp/header',securityheader)
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "headerSaved", securityHeader: securityheader});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "saveerror", error: e});
          });
  }