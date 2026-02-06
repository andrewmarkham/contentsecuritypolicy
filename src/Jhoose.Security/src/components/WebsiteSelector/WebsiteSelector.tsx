import React, { useEffect, useMemo } from 'react';
import { Select, Typography } from 'antd';
import { useSitesQuery } from '../../Features/Settings/settingsQueries';
import { Site } from '../../Features/Settings/Types/types';

export const GLOBAL_DEFAULT_SITE_ID = '*';

type Props = {
    value: string,
    onChange: (siteId: string) => void,
    onSiteChange?: (site: Site) => void,
    label?: string,
    width?: number | string
}

const globalDefaultSite: Site = {
    id: GLOBAL_DEFAULT_SITE_ID,
    name: 'Global Default',
};

export function WebsiteSelector(props: Props) {
    const { Text } = Typography;
    const sitesQuery = useSitesQuery();
    const sites = sitesQuery.data ?? [];

    const options = useMemo(() => {
        const hasGlobalDefault = sites.some((site) => site.id === GLOBAL_DEFAULT_SITE_ID);
        const siteOptions = sites.map((site) => ({
            value: site.id,
            label: site.name,
        }));

        if (hasGlobalDefault) {
            return siteOptions;
        }

        return [{ value: globalDefaultSite.id, label: globalDefaultSite.name }, ...siteOptions];
    }, [sites]);

    useEffect(() => {
        if (!props.onSiteChange) {
            return;
        }

        const selectedSite = props.value === globalDefaultSite.id
            ? sites.find((site) => site.id === GLOBAL_DEFAULT_SITE_ID) ?? globalDefaultSite
            : sites.find((site) => site.id === props.value);

        if (selectedSite) {
            props.onSiteChange(selectedSite);
        }
    }, [props.value, props.onSiteChange, sites]);

    const handleChange = (siteId: string) => {
        props.onChange(siteId);
        const selectedSite = siteId === globalDefaultSite.id
            ? globalDefaultSite
            : sites.find((site) => site.id === siteId);
        if (selectedSite && props.onSiteChange) {
            props.onSiteChange(selectedSite);
        }
    };

    return (
        <div>
            <Text style={{ display: 'block', marginBottom: '6px' }}>{props.label ?? 'Website'}</Text>
            <Select
                style={{ width: props.width ?? '280px' }}
                value={props.value}
                onChange={handleChange}
                options={options}
                loading={sitesQuery.isLoading || sitesQuery.isFetching}
            />
        </div>
    );
}
