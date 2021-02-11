import axios from 'axios';

export const appReducer = (state, action) => {
    if (action.actionType === "save") {

      saveRequest(action.dispatcher,action.data);

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
        data: [...newPolicies]
      }

    } else if (action.actionType === "saveerror") { 
      return {
        ...state,
        networkError: true,
        saving: false,
        data: [...state.data]
      }

    } else if (action.actionType === "load") { 
      loadRequest(action.dispatcher);

      return {
        ...state,
        loading: true,
        data: [...state.data]
      }

    } else if (action.actionType === "loaded") { 

      return {
        ...state,
        loading: false,
        data: [...action.data]
      }

    } else if (action.actionType === "loaderror") { 
      return {
        ...state,
        networkError: true,
        loading: false,
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

  function loadRequest(dispatcher) {
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
  
  function saveRequest(dispatcher,policyData) {
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