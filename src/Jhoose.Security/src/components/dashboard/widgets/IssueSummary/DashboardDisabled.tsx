import React, { useEffect, useState } from "react"
import { Flex, Typography } from 'antd';


import './DashboardDisabled.css';
export const DashboardDisabled = () => {
    return (
        <div className="dashboardDisabled">
            <Typography.Title level={4}>Dashboard is disabled</Typography.Title>
            <Typography.Text>Enable the dashboard in the settings to view the report</Typography.Text>
        </div>
    )
}
