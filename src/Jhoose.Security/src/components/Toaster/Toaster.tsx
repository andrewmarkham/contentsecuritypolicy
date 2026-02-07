import {message } from 'antd';
import React, { useEffect } from 'react';

export type ToasterProps = {
    show: boolean,
    message: string
}

export const Toaster = (props: ToasterProps) => { 
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {  
        if (props.show) {
            messageApi.open({
                type: 'loading',
                content: props.message,
                duration: 0,
              });
        } else {
            messageApi.destroy();
        }
     }, [props.show]);

     return (
            <>
                {contextHolder}
            </>
     )
}

