import React, { useEffect, useState } from "react"
import { Flex, Typography } from 'antd';


import './IssueSummary.css';
import { DashboardFilter } from "./DashboardFilter";
import { IssueTotal } from "./IssueTotal";
import { IssueItems } from "./IssueItems";
import { IssueBox } from "./IssueBox";
import { IssueGraph } from "./IssueGraph";
import { Dashboard } from "./types";

const timeFilters = [
    { label: "30 mins", value: "30m" },
    { label: "1 hr", value: "1h" },
    { label: "6 hrs", value: "6h" },
    { label: "12 hrs", value: "12h" },
    { label: "1 day", value: "1d" },
    { label: "3 days", value: "3d" },
    { label: "7 days", value: "7d" },
]

const typeFilters = [
    { label: "Browser", value: "browser" },
    { label: "Directive", value: "directive" },
    { label: "Page", value: "page" },
];

export const IssueSummary = () => { 

    var [dashboardData, setDashboardData] = useState<Dashboard>({});

    var [isLoading, setIsLoading] = useState(true);
    var [timeframe, setTimeFrame] = useState(timeFilters[0].value);
    var [type, setType] = useState(typeFilters[0].value);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/jhoose/dashboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timeframe: timeframe,
                    type: type
                }),
            });
            if (response.ok) {

                const data = await response.json();
                setDashboardData(data);
                
            } else {
                console.error('Failed to fetch data');
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [timeframe, type]);


    return (
        <div className="issueSummary">
            
            <Flex gap="middle">
                <DashboardFilter title="Show data for the last" filters={timeFilters} onChange={(e) => setTimeFrame(e)} />
                <DashboardFilter title="Issue type" filters={typeFilters}  onChange={(e) => setType(e)}/>
            </Flex>

            <div className="issue-container">

                <IssueBox fixed title={`${dashboardData?.total} issues report since`} >
                    <IssueTotal isLoading={isLoading} title="Total" total={dashboardData?.total}/>
                </IssueBox>
                
                <IssueBox fixed>
                    <IssueItems isLoading={isLoading} title="Pages" issues={dashboardData?.topPages}/>
                </IssueBox>

                <IssueBox fixed>
                    <IssueItems isLoading={isLoading} title="Directives" issues={dashboardData?.topDirectives}/>   
                </IssueBox>

                <IssueBox grow className="issueGraph">
                    <IssueGraph isLoading={isLoading} isEmpty={(dashboardData.total ?? 0) == 0} graphData={dashboardData?.errors}/>
                </IssueBox>
            </div>
        </div>
    )
}









