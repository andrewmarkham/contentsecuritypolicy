import React, { useState } from 'react';
import { Button, Flex, Input, Typography } from 'antd';
import './IpIgnoreHeaderInput.css';

const { Text } = Typography;

type Props = {
    disabled?: boolean;
    isSubmitting?: boolean;
    onAdd: (headerName: string, headerValue: string) => void;
};

const HEADER_NAME_TOKEN_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

export function isValidHeaderName(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) {
        return false;
    }
    return HEADER_NAME_TOKEN_PATTERN.test(trimmed);
}

export function isValidHeaderValue(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) {
        return false;
    }
    return !trimmed.includes('\r') && !trimmed.includes('\n');
}

export function IpIgnoreHeaderInput(props: Props) {
    const [headerName, setHeaderName] = useState('');
    const [headerValue, setHeaderValue] = useState('');

    const nameValid = headerName.trim().length === 0 || isValidHeaderName(headerName);
    const valueValid = headerValue.trim().length === 0 || isValidHeaderValue(headerValue);
    const canAdd = isValidHeaderName(headerName) && isValidHeaderValue(headerValue);

    const handleAdd = () => {
        if (!canAdd) {
            return;
        }
        props.onAdd(headerName.trim(), headerValue.trim());
        setHeaderName('');
        setHeaderValue('');
    };

    return (
        <div className="ip-ignore-header-input">
            <Flex gap={12} wrap>
                <div className="ip-ignore-header-input__field">
                    <Input
                        value={headerName}
                        disabled={props.disabled}
                        onChange={(e) => setHeaderName(e.target.value)}
                        onPressEnter={handleAdd}
                        placeholder="Header name (e.g. X-Internal-Bypass)"
                        status={nameValid ? undefined : 'error'}
                    />
                    {!nameValid && (
                        <Text type="danger" className="ip-ignore-header-input__error">
                            Header names may only contain letters, digits, and the symbols !#$%&apos;*+-.^_`|~ — no spaces or colons.
                        </Text>
                    )}
                </div>

                <div className="ip-ignore-header-input__field">
                    <Input
                        value={headerValue}
                        disabled={props.disabled}
                        onChange={(e) => setHeaderValue(e.target.value)}
                        onPressEnter={handleAdd}
                        placeholder="Header value"
                        status={valueValid ? undefined : 'error'}
                    />
                    {!valueValid && (
                        <Text type="danger" className="ip-ignore-header-input__error">
                            Header value cannot contain line breaks.
                        </Text>
                    )}
                </div>

                <Button type="primary" disabled={props.disabled || !canAdd} loading={props.isSubmitting} onClick={handleAdd}>
                    Add
                </Button>
            </Flex>
        </div>
    );
}
