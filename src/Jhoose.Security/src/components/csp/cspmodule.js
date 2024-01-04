
import React,  { useEffect, useReducer, useState } from 'react';
import { TabBar, Tab} from "@episerver/ui-framework";

import {CspDataGrid} from './cspdatagrid';
import {CspSettings} from './cspsettings';
import {TabContainer} from '../tabContainer';
import { ApiAccess } from './ApiAccess';

export function CspModule(props) {

    var [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        props.setTitle("Content Security Policy")
    })

    return(
        <>
            <TabBar
                activeTabIndex={activeIndex}
                onActivate={evt => setActiveIndex(evt.detail.index)}>
                <Tab>Content Security Policy</Tab>
                <Tab>Settings</Tab>
                <Tab>Api Access</Tab>
            </TabBar>
            
            <TabContainer index={0} activeIndex={activeIndex}>
                <CspDataGrid data={props.data} save={props.save} disabled={props.disabled} />
            </TabContainer>
            <TabContainer index={1} activeIndex={activeIndex}>
                <CspSettings settings={props.settings} 
                        isDirty={!props.settingsSaved}
                        save={props.saveSettings} 
                        disabled={props.disabled}>
                </CspSettings>
            </TabContainer>
            <TabContainer index={2} activeIndex={activeIndex}>
                <ApiAccess settings={props.settings} handleUpdate={props.saveSettings}></ApiAccess>
            </TabContainer>
        </>

    );
}
