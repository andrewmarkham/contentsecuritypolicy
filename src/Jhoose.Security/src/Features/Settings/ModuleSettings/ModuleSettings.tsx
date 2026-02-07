
import React, { useMemo, useState } from 'react';

import { Modal, Tabs, Typography } from 'antd';
import type { TabsProps } from 'antd';

import {CspSettings} from '../CspSettings/CspSettings';
import { ReportingSettings } from '../ReportingSettings/ReportingSettings';
import { ApiAccess } from '../ApiAccess/ApiAccess';
import { ImportExport } from '../ImportExport/ImportExport';

export function ModuleSettings() {

    const { Title } = Typography;
    const [modal, modalContextHolder] = Modal.useModal();
    const [activeKey, setActiveKey] = useState('settings');
    const [dirtyByTab, setDirtyByTab] = useState<Record<string, boolean>>({});
    const [refreshTokens, setRefreshTokens] = useState<Record<string, number>>({});
    const [resetDirtyTokens, setResetDirtyTokens] = useState<Record<string, number>>({});

    const bumpRefresh = (key: string) => {
        setRefreshTokens((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    };

    const bumpResetDirty = (key: string) => {
        setResetDirtyTokens((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    };

    const handleTabChange = (nextKey: string) => {
        if (nextKey === activeKey) {
            return;
        }

        const isDirty = dirtyByTab[activeKey];
        if (isDirty) {
            modal.confirm({
                title: 'Discard unsaved changes?',
                content: 'You have unsaved changes. Do you want to discard them and switch tabs?',
                okText: 'Discard changes',
                cancelText: 'Stay here',
                onOk: () => {
                    setDirtyByTab((prev) => ({ ...prev, [activeKey]: false }));
                    bumpResetDirty(activeKey);
                    setActiveKey(nextKey);
                    bumpRefresh(nextKey);
                },
            });
            return;
        }

        setActiveKey(nextKey);
        bumpRefresh(nextKey);
    };

    const items: TabsProps['items'] = useMemo(() => ([
        {
          key: 'settings',
          label: 'Settings',
          children: (
            <CspSettings
                onDirtyChange={(dirty) => setDirtyByTab((prev) => ({ ...prev, settings: dirty }))}
                refreshToken={refreshTokens.settings}
                resetDirtyToken={resetDirtyTokens.settings}
            />
          ),
        },
        {
          key: 'reporting',
          label: 'Reporting',
          children: (
            <ReportingSettings
                onDirtyChange={(dirty) => setDirtyByTab((prev) => ({ ...prev, reporting: dirty }))}
                refreshToken={refreshTokens.reporting}
                resetDirtyToken={resetDirtyTokens.reporting}
            />
          ),
        },
        {
          key: 'api',
          label: 'Api Access',
          children: <ApiAccess refreshToken={refreshTokens.api} />,
        },
        {
          key: 'import',
          label: 'Import/Export',
          children: <ImportExport refreshToken={refreshTokens.import} />,
        }
      ]), [refreshTokens, resetDirtyTokens]);
    return(
        <>
            <div className="title">
              <Title level={2}>Jhoose Security module settings</Title>
              <p>&nbsp;</p>
            </div>
            {modalContextHolder}
            <Tabs activeKey={activeKey} items={items} onChange={handleTabChange} />
        </>

    );
}
