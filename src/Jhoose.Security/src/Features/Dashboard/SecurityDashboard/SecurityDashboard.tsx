
import React, { useEffect } from 'react';

import { Flex, Typography } from 'antd';
import { IssueSummary } from '../Widgets/IssueSummary/IssueSummary';
import { DashboardDisabled } from '../Widgets/IssueSummary/DashboardDisabled/DashboardDisabled';
import { getErrorMessage, useSettingsQuery } from '../../Settings/settingsQueries';
import { message } from 'antd';

export function SecurityDashboard() {

    const { Title } = Typography;
    const [messageApi, contextHolder] = message.useMessage();
    const settingsQuery = useSettingsQuery();

    useEffect(() => {
        if (settingsQuery.error) {
            messageApi.error(getErrorMessage(settingsQuery.error));
        }
    }, [messageApi, settingsQuery.error]);

    const reportingMode = settingsQuery.data?.reportingMode;
    const isLoading = settingsQuery.isLoading || settingsQuery.isFetching;

    return(
        <>
            {contextHolder}
            <div className="title">
              <Title level={2}>Security Dashboard</Title>
            </div>
            <Flex>
                {reportingMode === 1 && <IssueSummary />}
                {!isLoading && reportingMode !== 1 && <DashboardDisabled />}
            </Flex>
        </>

    );
}
