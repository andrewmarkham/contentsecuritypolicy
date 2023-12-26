
import React,  { useEffect, useReducer, useState } from 'react';
import { TabBar, Tab, tab} from "@episerver/ui-framework";

import {CspDataGrid} from './cspdatagrid';
import {CspSettings} from './cspsettings';
import {TabContainer} from '../tabContainer';

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
        </>

    );
}
