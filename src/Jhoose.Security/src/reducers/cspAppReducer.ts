import axios from 'axios';
import { ApplicationState, CspState } from '../types';
import { Dispatcher, CspAction } from './types';
import { CspPolicy, CspSandboxPolicy, PolicyOptions, SandboxOptions, SchemaSource } from '../components/csp/types/types';

export const cspAppReducer = (state : CspState, action: CspAction): CspState  => {
    if (action.actionType === "save") {

      saveDataRequest(action.dispatcher ,action.cspPolicy);

      return {
        ...state,
        saving: true,
        data: [...state.data]
      } as CspState
    } else if (action.actionType === "saved") { 

      var newPolicies = merge(state.data, action.cspPolicy);

      return {
        ...state,
        saving: false,
        data: [...newPolicies]
      } as CspState
    } else if (action.actionType === "load") { 
      console.log("Load CSP")
      loadDataRequest(action.dispatcher);

      return {
        ...state,
        loading: true,
        data: [...state.data]
      } as CspState
    } else if (action.actionType === "loaded") { 

      console.log(action.state);

      return {
        ...state,
        loading: false,
        data: [...(action.state as CspState).data || state.data]
      } as CspState
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

    axios.get('/api/jhoose/csp')
          .then((r) =>
          {
            if (r.status === 200) {
                dispatcher({actionType: "loaded", state : { data: r.data } as CspState});
            }
          })
          .catch((e) => {
            dispatcher({actionType: "loaderror", error : e});
          });
  }
  
  function saveDataRequest(dispatcher?: Dispatcher, policyData? : CspPolicy | CspSandboxPolicy) {
    if (!dispatcher) return;
    
    if (!policyData) {
      dispatcher({actionType: "saveerror", error: "No data to save"});
      return;
    }

    axios.post('/api/jhoose/csp',policyData)
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
