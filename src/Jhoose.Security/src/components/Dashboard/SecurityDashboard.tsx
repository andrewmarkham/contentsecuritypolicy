
import React, { useContext, useEffect } from 'react';

import { Flex, Typography } from 'antd';
import { IssueSummary } from './Widgets/IssueSummary/IssueSummary';
import { AppContext } from '../../context';
import { DashboardDisabled } from './Widgets/IssueSummary/DashboardDisabled';

export function SecurityDashboard() {

    const { Title } = Typography;
    const { state, dispatch } = useContext(AppContext);

    useEffect(() => {
        dispatch({ state: state.settings, actionType: "settingsLoad", dispatcher: dispatch });
      }, []);

    return(
        <>
            <div className="title">
              <Title level={2}>Security Dashboard</Title>
            </div>
            <Flex>
                {state.settings.settings.reportingMode == 1 ?
                    <IssueSummary /> :
                    <DashboardDisabled />
                }
            </Flex>
        </>

    );
}
