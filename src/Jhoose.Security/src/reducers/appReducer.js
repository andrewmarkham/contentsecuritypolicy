import axios from 'axios';

export const appReducer = (state, action) => {
    if (action.actionType === "save") {

      saveDataRequest(action.dispatcher,action.data);

      return {
        ...state,
        saving: true,
        data: [...state.data]
      }
    } else if (action.actionType === "saved") { 

      var newPolicies = merge(state.data);

      return {
        ...state,
        saving: false,
        settings: {...state.settings},
        data: [...newPolicies]
      } 
    }else if (action.actionType === "settingsSave") {

        saveSettingsRequest(action.dispatcher,action.data);
  
        return {
          ...state,
          saving: true,
          settings: {...state.settings},
          settingsSaved: false,
          data: [...state.data]
        }
      } else if (action.actionType === "settingsSaved") { 

        return {
          ...state,
          saving: false,
          settings: {...action.data},
          settingsSaved: true,
          data: [...state.data]
        }
    } else if (action.actionType === "saveerror") { 
      return {
        ...state,
        networkError: true,
        saving: false,
        settings: {...state.settings},
        data: [...state.data]
      }

    } else if (action.actionType === "load") { 
      loadDataRequest(action.dispatcher);

      return {
        ...state,
        loading: true,
        settings: {...state.settings},
        data: [...state.data]
      }
    } else if (action.actionType === "settingsLoad") { 
      loadSettingsRequest(action.dispatcher);

      return {
        ...state,
        loading: true,
        settings: {...state.settings},
        data: [...state.data]
      }
    } else if (action.actionType === "loaded") { 

      return {
        ...state,
        loading: false,
        settings: {...state.settings},
        data: [...action.data]
      }
    } else if (action.actionType === "settingsLoaded") { 

      return {
        ...state,
        loading: false,
        settings: {...action.settings},
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
  
  function merge(data) {
    return data.map(p => {
        if (p.id === data.id){
          var newPolicy = Object.assign(p, data);
          newPolicy.options = Object.assign(p.options, data.options);
  
          return newPolicy;
  
        } else {
          return p;
        }
      });
  }

  function loadDataRequest(dispatcher) {
    axios.get('/api/csp')
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "loaded", data : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "loaderror", data : e});
          });
  }
  
  function saveDataRequest(dispatcher,policyData) {
    axios.post('/api/csp',policyData)
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "saved", data : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "saveerror", data : e});
          });
  }

  function loadSettingsRequest(dispatcher) {
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
  
  function saveSettingsRequest(dispatcher,policyData) {
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