import React, { useEffect } from 'react';
import {Typography} from "@episerver/ui-framework";

export function NotEnabled(props) {

    useEffect(() => {
        props.setTitle("Security Headers")
    })

    return (

        <div className='notenabled'>
            <Typography use="headline3">Security Headers Admin screen is not enabled, please enable in the startup options.</Typography>
        </div>
    );
}



