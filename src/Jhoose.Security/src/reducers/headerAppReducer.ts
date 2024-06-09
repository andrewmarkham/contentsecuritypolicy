import axios from 'axios';

import { Dispatcher, HeaderAction } from './types';
import { ApplicationState, HeadersState } from '../types';
import { SecurityHeader } from '../components/securityheaders/types/securityHeader';

export const headerAppReducer = (state : HeadersState, action: HeaderAction): HeadersState => {
    
  if (action.actionType === "headerSave") {

        saveRequest(action.dispatcher,action.securityHeader);
  
        return {
          ...state,
          useHeadersUI: state.useHeadersUI,
          saving: true,
          data: [...state.data]
        } as HeadersState
      } else if (action.actionType === "headerSaved") { 

        var newHeaderData = merge(state.data, action.securityHeader);

        return {
          ...state,
          useHeadersUI: state.useHeadersUI,
          saving: false,
          data: [...newHeaderData]
        } as HeadersState
    } else if (action.actionType === "headerLoad") { 
      loadRequest(action.dispatcher);

      return {
        ...state,
        loading: true,
        data: [...state.data]
      } as HeadersState
    } else if (action.actionType === "headerLoaded") { 

      return {
        ...state,
        useHeadersUI: (action.state as HeadersState).useHeadersUI || state.useHeadersUI,
        loading: false,
        data: [...(action.state as HeadersState).data || state.data]
      } as HeadersState
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
                dispatcher({
                  actionType: "headerLoaded", 
                  state: {
                    useHeadersUI: r.data.useHeadersUI,
                    data: r.data.headers
                  } as HeadersState
                });
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