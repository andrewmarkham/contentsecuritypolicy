
import React, { useContext, useEffect } from 'react';

import { Flex, Typography } from 'antd';
import { AppContext } from '../../context';
import { IssueSearch } from './widgets/IssueSearch';
import { DashboardDisabled } from '../dashboard/widgets/IssueSummary/DashboardDisabled';

export function CspIssueSearch() {

    const { Title } = Typography;
    const { state, dispatch } = useContext(AppContext);

    useEffect(() => {
        dispatch({ state: state.settings, actionType: "settingsLoad", dispatcher: dispatch });
      }, []);

    return(
        <>
            <div className="title">
              <Title level={2}>Search CSP Issues</Title>
            </div>
            <div>
                {state.settings.settings.reportingMode === 1 ?
                    <IssueSearch /> :
                    <DashboardDisabled />
                }
            </div>
        </>

    );
}

