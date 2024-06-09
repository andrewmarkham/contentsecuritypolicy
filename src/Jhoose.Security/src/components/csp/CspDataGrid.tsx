import React, { useContext, useEffect } from 'react';

import {CspDataRow} from './CspDataRow/CspDefaultDataRow';
import {CspSandboxDataRow} from './CspDataRow/CspSandboxDataRow';

import { CspPolicy, CspSandboxPolicy } from './types/types';
import { Table } from '../DataTable/Table';
import { Cell } from "../DataTable/Cell";
import { Header } from "../DataTable/Header";
import { AppContext } from '../../context';

export function CspDataGrid() {

    const { state, dispatch } = useContext(AppContext);

    useEffect(() =>{
        console.log("dispatch called")
        dispatch({state: state.csp, actionType: "load", dispatcher: dispatch })
    }, []);

    function save(){

    }
    return(
        <Table /*disabled={props.disabled}*/ >
            <Header>
                <Cell width="150px">Policy</Cell>
                <Cell>Options</Cell>
                <Cell>Schema</Cell>
                <Cell>Value</Cell>
            </Header>
                <>
                {state.csp.data?.map(r => {
                    return (r.policyName !== "sandbox"  ?
                        <CspDataRow key={r.id} row={r as CspPolicy} save={save}/> :
                        <CspSandboxDataRow key={r.id} row={r as CspSandboxPolicy} save={save} /> )
                })}
                </>
        </Table>
    );
}



