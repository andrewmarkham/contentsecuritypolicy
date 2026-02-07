import React, { useEffect, useRef, useState } from 'react';

import { SecurityHeader } from './Types/securityHeader';

import { Modal, message } from 'antd';
import { ResponseHeaderForm } from './ResponseHeaderForm';
import { RefForm } from '../Csp/Types/types';
import { SiteOverrideAlert } from '../../components/SiteOverrideAlert/SiteOverrideAlert';
import { useDeleteSecurityHeaderMutation } from './securityHeaderQueries';
import { v4 as uuidv4 } from 'uuid';

type Props = {
    header: SecurityHeader
    isOpen: boolean
    close: () => void
    siteId: string
    siteName: string
    source: "default" | "inherited" | "overridden"
    inheritedHeader?: SecurityHeader | null
}

export function EditSecurityHeader(props: Props){
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [isOverrideEnabled, setIsOverrideEnabled] = useState(props.source === "overridden");
    const [overrideHeaderId, setOverrideHeaderId] = useState<string | null>(
        props.source === "overridden" ? props.header.id : null
    );
    const [header, setHeader] = useState<SecurityHeader>(props.header);
    const [modal, modalContextHolder] = Modal.useModal();
    const [messageApi, contextHolder] = message.useMessage();
    const deleteHeaderMutation = useDeleteSecurityHeaderMutation();
    const canUseSiteOverride = props.source !== "default";
    const isEditable = props.source === "default" || isOverrideEnabled;

    const title = `Edit Response Header`;

    const formRef = useRef<RefForm>(null);

    useEffect(() => {
        setIsOverrideEnabled(props.source === "overridden");
        setOverrideHeaderId(props.source === "overridden" ? props.header.id : null);
        setHeader(props.header);
    }, [props.header, props.source, props.isOpen]);
        
    const handleOk = () => {
        if (canUseSiteOverride && !isOverrideEnabled) {
            if (props.source === "overridden") {
                const headerIdToDelete = overrideHeaderId ?? props.header.id;
                modal.confirm({
                    title: "Revert to inherited header?",
                    content: "This will delete the site-specific override and restore the inherited header.",
                    okText: "Revert",
                    cancelText: "Cancel",
                    onOk: () =>
                        deleteHeaderMutation.mutate(headerIdToDelete, {
                            onSuccess: () => {
                                messageApi.success('Override removed.');
                                props.close();
                            },
                        }),
                });
                return;
            }
            props.close();
            return;
        }
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
            {contextHolder}
            {modalContextHolder}
            {canUseSiteOverride && (
                <SiteOverrideAlert
                    siteName={props.siteName}
                    itemLabel="header"
                    isOverrideEnabled={isOverrideEnabled}
                    onOverrideChange={(checked) => {
                        setIsOverrideEnabled(checked);
                        if (checked) {
                            if (props.source === "inherited") {
                                const newHeader = { ...props.header, id: uuidv4(), site: props.siteId };
                                setHeader(newHeader);
                                setOverrideHeaderId(newHeader.id);
                            } else if (overrideHeaderId === null) {
                                setOverrideHeaderId(props.header.id);
                            }
                        } else {
                            setHeader(props.inheritedHeader ?? props.header);
                        }
                    }}
                />
            )}
            <ResponseHeaderForm 
                header={{ ...header, site: props.siteId }}
                disabled={!isEditable}
                handleSaved={handleSaved}
                ref={formRef} />
        </Modal>
    )
};
