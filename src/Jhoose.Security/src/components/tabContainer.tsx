import React from 'react';
import { PropsWithChildren } from 'react'

type Props = {
    index: number,
    activeIndex: number,
  }

export function TabContainer(props: PropsWithChildren<Props>) {

    const {index, activeIndex} = props;
    
    return(
        index === activeIndex 
            ? <div className="tab-container">{props.children}</div> 
            : ""
    );
  }