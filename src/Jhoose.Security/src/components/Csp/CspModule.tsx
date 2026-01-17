
import React from 'react';

import { Typography } from 'antd';

import {CspDataGrid} from './CspDataGrid';

export function CspModule() {

    const { Title } = Typography;

    return(
        <>
            <div className="title">
              <Title level={2}>Content Security Policy</Title>
              <p>&nbsp;</p>
            </div>
            <CspDataGrid />
        </>

    );
}

