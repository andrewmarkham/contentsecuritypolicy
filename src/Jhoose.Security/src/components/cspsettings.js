import React, { useEffect, useState } from 'react';
import { Card, CardContentArea, ExposedDropdownMenu, TextField, GridRow, GridCell, Typography, TextButton, CardActions, CardActionButtons} from "@episerver/ui-framework";

export function CspSettings(props) {

    const [settings, setSettings] = useState(props.settings);

    const [isDirty, setIsDirty] = useState(props.isDirty);

    const options = [
        { label: "On", value: "on"},
        { label: "Off", value: "off"},
        { label: "Report Only", value: "report"}
    ]

    useEffect(() => {
        setIsDirty(props.isDirty);
    }, [props.isDirty]);

    function setSettingsValue(key, value){
        
        setIsDirty(true);

        var newSetting = {...settings};

        switch (key) {
            case "mode":
                newSetting.mode = value;
                break;
            
            case "reporting":
                newSetting.reportingUrl = value;
                break;

            default:
                break;
        }

        setSettings(newSetting);
    };

    return(
        <Card header="Settings">
            <CardContentArea>
                <GridRow>
                    <GridCell span={12}>
                        <Typography use="body1">
                            <p>Control the mode of the module</p>
                            <ul>
                                <li>On - Module is enabled.</li>
                                <li>Off - Module is disbled.</li>
                                <li>Report Only - Module is configured to report errors, either in the browser console, or forwarded onto the reporting service configured below.</li>
                            </ul>
                        </Typography>
                        <ExposedDropdownMenu
                            label="Mode"
                            options={options}
                            value={settings.mode}
                            onValueChange={(value) => {
                                setSettingsValue("mode", value);
                            }}
                            >
                        </ExposedDropdownMenu>
                    </GridCell>
                    <GridCell span={12}>
                        <TextField className="wide-text" 
                            label="Report Url" 
                            outlined="true" 
                            value={settings.reportingUrl}
                            onChange={(e) => {
                                setSettingsValue("reporting", e.currentTarget.value);
                            }}
                            helperText="Endpoint of the service to receive CSP errors "></TextField>
                    </GridCell>
                </GridRow>
            </CardContentArea>
            <CardActions className="content-end">
                <CardActionButtons>
                    <TextButton disabled={!isDirty} contained={true} onClick={(e) => {props.save(settings)}}  >Update</TextButton>
                </CardActionButtons>
            </CardActions>
        </Card>
    );
}



