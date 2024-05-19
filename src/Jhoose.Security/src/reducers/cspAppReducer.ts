import axios from 'axios';
import { ApplicationState } from '../types';
import { Dispatcher, CspAction } from './types';
import { CspPolicy, CspSandboxPolicy, PolicyOptions, SandboxOptions, SchemaSource } from '../components/csp/types/types';

export const cspAppReducer = (state : ApplicationState, action: CspAction): ApplicationState  => {
    if (action.actionType === "save") {

      saveDataRequest(action.dispatcher ,action.cspPolicy);

      return {
        ...state,
        saving: true,
        data: [...state.data]
      }
    } else if (action.actionType === "saved") { 

      var newPolicies = merge(state.data, action.cspPolicy);

      return {
        ...state,
        saving: false,
        settings: {...state.settings},
        headerData: [...state.headerData],
        data: [...newPolicies]
      } 
    } else if (action.actionType === "load") { 
      loadDataRequest(action.dispatcher);

      return {
        ...state,
        loading: true,
        settings: {...state.settings},
        headerData: [...state.headerData],
        data: [...state.data]
      }
    } else if (action.actionType === "loaded") { 

      console.log(action.cspPolicies);

      return {
        ...state,
        loading: false,
        settings: {...state.settings},
        headerData: [...state.headerData],
        data: [...action.cspPolicies || state.data]
      }
    } 
    return state;
  };
  
  function merge(data : Array<CspPolicy | CspSandboxPolicy>, updatedRecord? : CspPolicy | CspSandboxPolicy) {
    if (!updatedRecord) return data;

    return data.map(p => {
        if (p.id === updatedRecord.id){

          

          if (updatedRecord.policyName === "sandbox") {
            var newSandboxPolicy: CspSandboxPolicy = Object.assign(p, updatedRecord) as CspSandboxPolicy;

            newSandboxPolicy.sandboxOptions = (updatedRecord as CspSandboxPolicy).sandboxOptions != null ? Object.assign((p as CspSandboxPolicy).sandboxOptions, (updatedRecord as CspSandboxPolicy).sandboxOptions) : {} as SandboxOptions;
            return newSandboxPolicy;

          } else {
            
            var newPolicy: CspPolicy = Object.assign(p, updatedRecord) as CspPolicy;
            newPolicy.options = (updatedRecord as CspPolicy).options != null ? Object.assign((p as CspPolicy).options, (updatedRecord as CspPolicy).options) : {} as PolicyOptions;
            newPolicy.schemaSource = (updatedRecord as CspPolicy).schemaSource != null ? Object.assign((p as CspPolicy).schemaSource, (updatedRecord as CspPolicy).schemaSource) : {} as SchemaSource;

            return newPolicy;
          }
          
  
        } else {
          return p;
        }
      });
  }

  function loadDataRequest(dispatcher?: Dispatcher) {
    if (!dispatcher) return;

    axios.get('/api/csp')
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "loaded", cspPolicies : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "loaderror", error : e});
          });
  }
  
  function saveDataRequest(dispatcher?: Dispatcher, policyData? : CspPolicy) {
    if (!dispatcher) return;
    
    if (!policyData) {
      dispatcher({actionType: "saveerror", error: "No data to save"});
      return;
    }

    axios.post('/api/csp',policyData)
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "saved", cspPolicy : r.data});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "saveerror", error : e});
          });
  }
