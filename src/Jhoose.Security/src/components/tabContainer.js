import React from 'react';

export function TabContainer(props) {

    const {index, activeIndex} = {...props};

    return(
        index === activeIndex 
            ? <div className="tab-container">{props.children}</div> 
            : ""
    );
  }