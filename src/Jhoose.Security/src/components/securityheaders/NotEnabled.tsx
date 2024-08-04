import React, { useEffect } from 'react';
import { Typography } from "antd";

export function NotEnabled() {

    const { Title } = Typography;

    return (

        <div className='notenabled'>
            <Title level={3}>Security Headers Admin screen is not enabled, please enable in the startup options.</Title>
        </div>
    );
}



