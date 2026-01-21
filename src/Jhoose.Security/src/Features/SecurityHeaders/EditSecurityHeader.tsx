import React, { useRef, useState } from 'react';

import { SecurityHeader } from './Types/securityHeader';

import { Modal } from 'antd';
import { ResponseHeaderForm } from './ResponseHeaderForm';
import { RefForm } from '../Csp/Types/types';

type Props = {
    header: SecurityHeader
    isOpen: boolean
    close: () => void
}

export function EditSecurityHeader(props: Props){
    const [confirmLoading, setConfirmLoading] = useState(false);

    const title = `Edit Response Header`;

    const formRef = useRef<RefForm>(null);
        
    const handleOk = () => {
        setConfirmLoading(true);
        formRef.current?.RequestSave();
    };
    
    const handleSaved = (success: boolean) => {
        setConfirmLoading(false);
        if (success) {
            props.close();
        }
    }

    const handleCancel = () => {
        props.close();
    };

    return (
        <Modal
            destroyOnClose
            title={title}
            open={props.isOpen}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}>
            <ResponseHeaderForm 
                header={props.header}
                handleSaved={handleSaved}
                ref={formRef} />
        </Modal>
    )
};
