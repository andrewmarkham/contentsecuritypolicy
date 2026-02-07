import React, { useEffect, useMemo, useState } from 'react';

import {CspDataRow} from './CspDataRow/CspDefaultDataRow';
import {CspSandboxDataRow} from './CspDataRow/CspSandboxDataRow';

import { CspPolicy, CspSandboxPolicy, PolicySource } from '../Types/types';
import { Table } from '../../../components/DataTable/Table';
import { Cell } from "../../../components/DataTable/Cell";
import { Header } from "../../../components/DataTable/Header";
import { Toaster } from '../../../components/Toaster';
import { getErrorMessage, useCspPoliciesQuery } from '../lib/cspQueries';
import { Alert, Flex, message } from 'antd';
import { useIsMutating } from '@tanstack/react-query';
import { WebsiteSelector, GLOBAL_DEFAULT_SITE_ID } from '../../../components/WebsiteSelector/WebsiteSelector';

import {ContentSecurityPolicyData} from '../Data/ContentSecurityPolicies';

type CspRecord = CspPolicy | CspSandboxPolicy;

export function CspDataGrid() {

    const [messageApi, contextHolder] = message.useMessage();
    const cspPoliciesQuery = useCspPoliciesQuery();
    const savingCount = useIsMutating({ mutationKey: ['cspPolicy'] });
    const [activeWebsiteId, setActiveWebsiteId] = useState<string>(GLOBAL_DEFAULT_SITE_ID);
    const [selectedWebsiteLabel, setSelectedWebsiteLabel] = useState<string>('Global Default');

    useEffect(() => {
        if (cspPoliciesQuery.error) {
            messageApi.error(getErrorMessage(cspPoliciesQuery.error));
        }
    }, [cspPoliciesQuery.error, messageApi]);

    const policies = cspPoliciesQuery.data ?? [];
    const isDefaultWebsite = activeWebsiteId === GLOBAL_DEFAULT_SITE_ID;

    const policiesBySite = useMemo(() => {
        return policies.reduce((acc, policy) => {
            const normalizedSite = (policy.site ?? '').trim() || GLOBAL_DEFAULT_SITE_ID;
            if (!acc[normalizedSite]) {
                acc[normalizedSite] = {};
            }
            acc[normalizedSite][policy.policyName] = policy;
            return acc;
        }, {} as Record<string, Record<string, CspRecord>>);
    }, [policies]);

    const defaultPoliciesByName = policiesBySite[GLOBAL_DEFAULT_SITE_ID] ?? {};
    const sitePoliciesByName = policiesBySite[activeWebsiteId] ?? {};
    const overrideCount = Object.keys(sitePoliciesByName).length;

    return(
        <>
        {contextHolder}
        <Toaster
            show={cspPoliciesQuery.isLoading || cspPoliciesQuery.isFetching || savingCount > 0}
            message={cspPoliciesQuery.isLoading || cspPoliciesQuery.isFetching ? "Loading..." : "Saving..."}
        />

        <Flex gap={12} align="flex-end" style={{marginBottom: "14px"}} wrap>
            <WebsiteSelector
                value={activeWebsiteId}
                onChange={setActiveWebsiteId}
                onSiteChange={(site) => setSelectedWebsiteLabel(site.name)}
            />
        </Flex>

        {!isDefaultWebsite && (
            <Alert
                style={{marginBottom: "14px"}}
                type="info"
                showIcon
                message={`${selectedWebsiteLabel} inherits from Global Default by default`}
                description={`${overrideCount} policy override${overrideCount === 1 ? "" : "s"} configured for this website.`}
            />
        )}

        <Table /*disabled={props.disabled}*/ >
            <Header>
                <Cell width="150px">Policy</Cell>
                <Cell>Options</Cell>
                <Cell>Schema</Cell>
                <Cell>Value</Cell>
                <Cell width="70px">Source</Cell>
                <Cell width="50px">&nbsp;</Cell>
            </Header>
                <>
                {Object.entries(ContentSecurityPolicyData).map(([key, policyData]) => {

                    const defaultPolicy = defaultPoliciesByName[key];
                    const overridePolicy = !isDefaultWebsite ? sitePoliciesByName[key] : undefined;
                    const policy = (overridePolicy ?? defaultPolicy) ?? null;
                    const source: PolicySource = isDefaultWebsite ? "default" : (overridePolicy ? "overridden" : "inherited");

                    return (
                        key !== "sandbox"  ?
                        <CspDataRow
                            key={key}
                            policy={policy as CspPolicy | null}
                            inheritedPolicy={(defaultPolicy as CspPolicy) ?? null}
                            policyData={policyData}
                            policyName={key}
                            source={source}
                            siteId={activeWebsiteId}
                            siteName={selectedWebsiteLabel}
                        /> :
                        <CspSandboxDataRow
                            key={key}
                            policy={policy as CspSandboxPolicy | null}
                            inheritedPolicy={(defaultPolicy as CspSandboxPolicy) ?? null}
                            policyData={policyData}
                            policyName={key}
                            source={source}
                            siteId={activeWebsiteId}
                            siteName={selectedWebsiteLabel}
                        /> )
                })}
                </>
        </Table>
        </>
    );
}
