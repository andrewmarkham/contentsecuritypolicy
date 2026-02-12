import React, { useEffect, useMemo, useRef } from 'react';
import { Select, Typography } from 'antd';
import { useSitesQuery } from '../../Features/Settings/settingsQueries';
import { Site } from '../../Features/Settings/Types/types';
import './WebsiteSelector.css';

export const GLOBAL_DEFAULT_SITE_ID = '*';
const STORAGE_KEY = 'jhoose.selectedSiteId';

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
    const hasInitialized = useRef(false);

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

    useEffect(() => {
        if (hasInitialized.current) {
            return;
        }

        let storedSiteId: string | null = null;
        try {
            storedSiteId = window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            storedSiteId = null;
        }

        if (storedSiteId && storedSiteId !== props.value) {
            handleChange(storedSiteId);
        }

        hasInitialized.current = true;
    }, [props.value, sites]);

    const handleChange = (siteId: string) => {
        props.onChange(siteId);
        try {
            window.localStorage.setItem(STORAGE_KEY, siteId);
        } catch (error) {
            // ignore storage issues
        }
        const selectedSite = siteId === globalDefaultSite.id
            ? globalDefaultSite
            : sites.find((site) => site.id === siteId);
        if (selectedSite && props.onSiteChange) {
            props.onSiteChange(selectedSite);
        }
    };

    return (
        <div>
            <Text className="website-selector__label">{props.label ?? 'Website'}</Text>
            <Select
                className={`website-selector__select ${getWidthClassName(props.width)}`}
                value={props.value}
                onChange={handleChange}
                options={options}
                loading={sitesQuery.isLoading || sitesQuery.isFetching}
            />
        </div>
    );
}

function getWidthClassName(width?: number | string) {
    if (width === 320 || width === '320px') {
        return 'website-selector__select--wide';
    }
    return 'website-selector__select--default';
}
