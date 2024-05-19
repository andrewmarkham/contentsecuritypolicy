import React from 'react';
import {Typography} from "@episerver/ui-framework";

type Props = {
    message: string,
    visible: boolean,
  }

export function Toaster({message, visible} : Props) {

    return(
        visible 
            ? <div className="toaster" aria-live="polite" role="alert"><Typography use="headline4">{message}</Typography></div> 
            : ""
    );
  }