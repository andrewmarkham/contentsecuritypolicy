import React from 'react';
import {Typography} from "@episerver/ui-framework";

export function Toaster(props) {

    const {message, visible} = {...props}

    return(
        visible 
            ? <div className="toaster" aria-live="polite" role="alert"><Typography use="headline4">{message}</Typography></div> 
            : ""
    );
  }