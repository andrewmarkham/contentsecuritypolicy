import React, { useEffect } from 'react';

import {CspDataRow} from './CspDataRow/CspDefaultDataRow';
import {CspSandboxDataRow} from './CspDataRow/CspSandboxDataRow';

import { CspPolicy, CspSandboxPolicy } from '../Types/types';
import { Table } from '../../../components/DataTable/Table';
import { Cell } from "../../../components/DataTable/Cell";
import { Header } from "../../../components/DataTable/Header";
import { Toaster } from '../../../components/Toaster';
import { getErrorMessage, useCspPoliciesQuery } from '../lib/cspQueries';
import { message } from 'antd';
import { useIsMutating } from '@tanstack/react-query';

import {ContentSecurityPolicyData} from '../Data/ContentSecurityPolicies';

export function CspDataGrid() {

    const [messageApi, contextHolder] = message.useMessage();
    const cspPoliciesQuery = useCspPoliciesQuery();
    const savingCount = useIsMutating({ mutationKey: ['cspPolicy'] });

    useEffect(() => {
        if (cspPoliciesQuery.error) {
            messageApi.error(getErrorMessage(cspPoliciesQuery.error));
        }
    }, [cspPoliciesQuery.error, messageApi]);

    const policies = cspPoliciesQuery.data ?? [];

    return(
        <>
        {contextHolder}
        <Toaster
            show={cspPoliciesQuery.isLoading || cspPoliciesQuery.isFetching || savingCount > 0}
            message={cspPoliciesQuery.isLoading || cspPoliciesQuery.isFetching ? "Loading..." : "Saving..."}
        />

        <Table /*disabled={props.disabled}*/ >
            <Header>
                <Cell width="150px">Policy</Cell>
                <Cell>Options</Cell>
                <Cell>Schema</Cell>
                <Cell>Value</Cell>
                <Cell width="100px">&nbsp;</Cell>
            </Header>
                <>
                {Object.entries(ContentSecurityPolicyData).map(([key, policyData]) => {

                    var policy = policies.find(p => p.policyName === key);

                    return (
                        key !== "sandbox"  ?
                        <CspDataRow key={key} policy={policy as CspPolicy} policyData={policyData} policyName={key} /> :
                        <CspSandboxDataRow key={key} policy={policy as CspSandboxPolicy} policyData={policyData} policyName={key} /> )
                })}
                </>
        </Table>
        </>
    );
}


