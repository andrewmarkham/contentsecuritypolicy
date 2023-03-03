import axios from 'axios';

export const headerAppReducer = (state, action) => {
    if (action.actionType === "headerSave") {

        saveRequest(action.dispatcher,action.data);
  
        return {
          ...state,
          saving: true,
          settings: {...state.settings},
          headerData: [...state.headerData],
          settingsSaved: false,
          data: [...state.data]
        }
      } else if (action.actionType === "headerSaved") { 

        return {
          ...state,
          saving: false,
          settings: {...state.data},
          settingsSaved: true,
          headerData: [...action.data],
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
        loading: false,
        settings: {...state.settings},
        headerData: [...action.data],
        data: [...state.data]
      }
    } 

    return state;
  };
  
  function loadRequest(dispatcher) {
    axios.get('/api/csp/header')
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "headerLoaded", data : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "loaderror", data : e});
          });
  }
  
  function saveRequest(dispatcher,policyData) {
    axios.post('/api/csp/header',policyData)
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "headerSaved", data : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "saveerror", data : e});
          });
  }