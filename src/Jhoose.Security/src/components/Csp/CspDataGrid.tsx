import React, { useContext, useEffect } from 'react';

import {CspDataRow} from './CspDataRow/CspDefaultDataRow';
import {CspSandboxDataRow} from './CspDataRow/CspSandboxDataRow';

import { CspPolicy, CspSandboxPolicy } from './Types/types';
import { Table } from '../DataTable/Table';
import { Cell } from "../DataTable/Cell";
import { Header } from "../DataTable/Header";
import { AppContext } from '../../context';
import { Toaster } from '../Toaster';
import { ContentSecurityPolicyData } from './Data/ContentSecurityPolicies';
import { Row } from '../DataTable/Row';

export function CspDataGrid() {

    //const { state, dispatch } = useContext(AppContext);

    const [ isLoading, setIsLoading ] = React.useState(false);

    const [ isSaving, setIsSaving ] = React.useState(false);

    useEffect(() =>{
        console.log("dispatch called")
        //dispatch({state: state.csp, actionType: "load", dispatcher: dispatch })
    }, []);

    function save(){

    }
    return(
        <>
        <Toaster show={isLoading || isSaving} message={isLoading ? "Loading..." : "Saving..."} />

        <Table /*disabled={props.disabled}*/ >
            <Header>
                <Cell width="150px">Policy</Cell>
                <Cell>Options</Cell>
                <Cell>Schema</Cell>
                <Cell>Value</Cell>
                <Cell width="100px">&nbsp;</Cell>
            </Header>
                <>
                {ContentSecurityPolicyData.map(r => {
                    return (
                        <Row>
                            <Cell width="150px">{r.policyName}</Cell>
                            <Cell>Options</Cell>
                            <Cell>Schema</Cell>
                            <Cell>Value</Cell>
                            <Cell width="100px">&nbsp;</Cell>
                        </Row>
                    )
                })}
                </>
        </Table>
        </>
    );
}



