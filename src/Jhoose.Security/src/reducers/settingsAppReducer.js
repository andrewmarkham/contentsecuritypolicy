import axios from 'axios';

export const settingsAppReducer = (state, action) => {
    if (action.actionType === "settingsSave") {

        saveRequest(action.dispatcher,action.data);
  
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
          settings: {...action.data},
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
        settings: {...action.settings},
        headerData: [...state.headerData],
        data: [...state.data]
      }
    } 

    return state;
  };
  
  function loadRequest(dispatcher) {
    axios.get('/api/csp/settings')
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "settingsLoaded", settings : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "loaderror", data : e});
          });
  }
  
  function saveRequest(dispatcher,policyData) {
    axios.post('/api/csp/settings',policyData)
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "settingsSaved", data : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "saveerror", data : e});
          });
  }