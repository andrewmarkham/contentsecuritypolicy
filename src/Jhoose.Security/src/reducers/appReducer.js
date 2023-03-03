import axios from 'axios';
import { cspAppReducer } from './cspAppReducer';
import {settingsAppReducer} from './settingsAppReducer';
import {headerAppReducer} from './headerAppReducer';

export const appReducer = (state, action) => {

    // CSP AppReducer
    state = cspAppReducer(state, action);

    // Setting App Reducer
    state = settingsAppReducer(state,action);

    // Response Header App Reducer
    state = headerAppReducer(state,action);

    // Global Error Actions
    if (action.actionType === "saveerror") { 
      return {
        ...state,
        networkError: true,
        saving: false,
        settings: {...state.settings},
        data: [...state.data]
      }

    } else if (action.actionType === "loaderror") { 
      return {
        ...state,
        networkError: true,
        loading: false,
        settings: {...state.settings},
        data: [...state.data]
      }
    }

    return state;
  };