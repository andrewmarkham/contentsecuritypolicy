
import React, { useEffect } from 'react';

import { Typography } from 'antd';
import { IssueSearch } from '../Widgets/IssueSearch/IssueSearch';
import { DashboardDisabled } from '../../Dashboard/Widgets/IssueSummary/DashboardDisabled/DashboardDisabled';
import { getErrorMessage, useSettingsQuery } from '../../Settings/settingsQueries';
import { message } from 'antd';

export function CspIssueSearch() {

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
              <Title level={2}>Search Issues</Title>
            </div>
            <div>
                {reportingMode === 1 && <IssueSearch />}
                {!isLoading && reportingMode !== 1 && <DashboardDisabled />}
            </div>
        </>

    );
}
