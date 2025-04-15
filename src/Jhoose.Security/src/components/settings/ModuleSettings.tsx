
import React from 'react';

import { Tabs, Typography } from 'antd';
import type { TabsProps } from 'antd';

import {CspSettings} from './CspSettings';
import { ApiAccess } from './ApiAccess';
import ImportExport from './ImportExport';

export function ModuleSettings() {

    const { Title } = Typography;

    const items: TabsProps['items'] = [
        {
          key: '',
          label: 'Settings',
          children: <CspSettings /> ,
        },
        {
          key: '2',
          label: 'Api Access',
          children: <ApiAccess  />,
        },
        {
          key: '3',
          label: 'Import/Export',
          children: <ImportExport  />,
        }
      ];
    return(
        <>
            <div className="title">
              <Title level={2}>Jhoose Security module settings</Title>
              <p>&nbsp;</p>
            </div>
            <Tabs defaultActiveKey="1" items={items} />
        </>

    );
}

