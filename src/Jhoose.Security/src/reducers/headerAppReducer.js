import axios from 'axios';

export const headerAppReducer = (state, action) => {
    if (action.actionType === "headerSave") {

        saveRequest(action.dispatcher,action.data);
  
        return {
          ...state,
          showUi: true,
          saving: true,
          settings: {...state.settings},
          headerData: [...state.headerData],
          settingsSaved: false,
          data: [...state.data]
        }
      } else if (action.actionType === "headerSaved") { 

        var newHeaderData = merge(state.headerData, action.data);

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
        useHeadersUI: action.data.useHeadersUI,
        loading: false,
        settings: {...state.settings},
        headerData: [...action.data.headers],
        data: [...state.data]
      }
    } 

    return state;
  };
  
  function merge(data, updatedRecord) {
    return data.map(p => {
        if (p.id === updatedRecord.id){
          return Object.assign(p, updatedRecord);
        } else {
          return p;
        }
      });
  }

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