import axios from 'axios';
import { ApplicationState } from '../types';
import { SecuritySettings } from '../components/csp/types/types';

import { Dispatcher, SettingsAction } from './types';

export const settingsAppReducer = (state: ApplicationState, action : SettingsAction)  : ApplicationState => {
    
    if (action.actionType === "settingsSave") {

        saveRequest(action.dispatcher, action.settings || state.settings);
  
        return {
          ...state,
          saving: true,
          settings: {...state.settings},
          settingsSaved: false,
          headerData: [...state.headerData],
          data: [...state.data]
        }
      } else if (action.actionType === "settingsSaved") { 

        return {
          ...state,
          saving: false,
          settings: {...action.settings || state.settings},
          settingsSaved: true,
          headerData: [...state.headerData],
          data: [...state.data]
        }
    } else if (action.actionType === "settingsLoad") { 
      
      loadRequest(action.dispatcher);

      return {
        ...state,
        loading: true,
        settings: {...state.settings},
        headerData: [...state.headerData],
        data: [...state.data]
      }
    } else if (action.actionType === "settingsLoaded") { 

      return {
        ...state,
        loading: false,
        settings: {...action.settings || state.settings},
        headerData: [...state.headerData],
        data: [...state.data]
      }
    } 

    return state;
  };
  
  function loadRequest(dispatcher?:Dispatcher) {
    if (!dispatcher) return;  

    axios.get('/api/csp/settings')
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "settingsLoaded", settings : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "loaderror", error : e});
          });
  }
  
  function saveRequest(dispatcher? :Dispatcher, settings?: SecuritySettings) {
    if (!dispatcher) return;
    if (!settings) {
      dispatcher({actionType: "saveerror", error: "No data to save"});
      return;
    }

    axios.post('/api/csp/settings',settings)
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "settingsSaved", settings : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "saveerror", error : e});
          });
  }
  
