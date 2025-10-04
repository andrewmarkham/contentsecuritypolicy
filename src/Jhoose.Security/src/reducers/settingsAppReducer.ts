import axios from 'axios';
import { ApplicationState, SettingsState } from '../types';
import { SecuritySettings } from '../components/csp/types/types';

import { Dispatcher, SettingsAction } from './types';

export const settingsAppReducer = (state: SettingsState, action : SettingsAction)  : SettingsState => {
    
    if (action.actionType === "settingsSave") {

        saveRequest(action.dispatcher, (action.state as SettingsState).settings || state.settings);
  
        return {
          ...state,
          saving: true,
          settings: {...state.settings},
        } as SettingsState
      } else if (action.actionType === "settingsSaved") { 

        return {
          ...state,
          saving: false,
          settings: {...(action.state as SettingsState).settings || state.settings},
        } as SettingsState
    } else if (action.actionType === "settingsLoad") { 
      
      loadRequest(action.dispatcher);

      return {
        ...state,
        loading: true,
        settings: {...state.settings}
      } as SettingsState
    } else if (action.actionType === "settingsLoaded") { 

      return {
        ...state,
        loading: false,
        settings: {...(action.state as SettingsState).settings || state.settings}
      } as SettingsState
    } 

    return state;
  };
  
  function loadRequest(dispatcher?:Dispatcher) {
    if (!dispatcher) return;  

    axios.get('/api/jhoose/settings')
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher(
                  {
                    actionType: "settingsLoaded", 
                    state : {
                      settings: r.data
                    } as SettingsState});
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

    axios.post('/api/jhoose/settings',settings)
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "settingsSaved", state : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "saveerror", error : e});
          });
  }
  
