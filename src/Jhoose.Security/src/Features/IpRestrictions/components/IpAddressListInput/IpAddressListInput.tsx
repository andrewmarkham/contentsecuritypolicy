import React, { useMemo, useState } from 'react';
import { Address4, Address6 } from 'ip-address';
import { Button, Flex, Input, Tag, Typography } from 'antd';
import { splitPastedTokens } from '../../../../lib/splitPastedTokens';
import './IpAddressListInput.css';

const { TextArea } = Input;
const { Text } = Typography;

type Props = {
    disabled?: boolean;
    isSubmitting?: boolean;
    onAdd: (values: string[]) => void;
};

export function isValidIpEntry(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) {
        return false;
    }
    return Address4.isValid(trimmed) || Address6.isValid(trimmed);
}

export function IpAddressListInput(props: Props) {
    const [draft, setDraft] = useState('');

    const tokens = useMemo(() => splitPastedTokens(draft), [draft]);
    const validTokens = useMemo(() => tokens.filter(isValidIpEntry), [tokens]);
    const invalidTokens = useMemo(() => tokens.filter((token) => !isValidIpEntry(token)), [tokens]);

    const handleAdd = () => {
        if (validTokens.length === 0) {
            return;
        }
        props.onAdd(validTokens);
        setDraft('');
    };

    return (
        <div className="ip-address-list-input">
            <TextArea
                value={draft}
                disabled={props.disabled}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Enter or paste one or more IPv4/IPv6 addresses or CIDR ranges — separated by spaces, commas, or new lines"
                autoSize={{ minRows: 3, maxRows: 10 }}
            />

            {tokens.length > 0 && (
                <div className="ip-address-list-input__preview">
                    {tokens.map((token, index) => {
                        const valid = isValidIpEntry(token);
                        return (
                            <Tag key={`${token}-${index}`} color={valid ? 'default' : 'error'}>
                                {token}
                            </Tag>
                        );
                    })}
                </div>
            )}

            {invalidTokens.length > 0 && (
                <Text type="danger" className="ip-address-list-input__error">
                    {invalidTokens.length} invalid {invalidTokens.length === 1 ? 'entry' : 'entries'} will be ignored.
                </Text>
            )}

            <Flex justify="flex-end">
                <Button
                    type="primary"
                    disabled={props.disabled || validTokens.length === 0}
                    loading={props.isSubmitting}
                    onClick={handleAdd}
                >
                    Add {validTokens.length > 0 ? validTokens.length : ''} {validTokens.length === 1 ? 'address' : 'addresses'}
                </Button>
            </Flex>
        </div>
    );
}
