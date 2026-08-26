import React, { useMemo, useState } from 'react';
import { Button, Flex, Input, Tag, Typography } from 'antd';
import { splitPastedTokens } from '../../../../lib/splitPastedTokens';
import './IpPathListInput.css';

const { TextArea } = Input;
const { Text } = Typography;

type Props = {
    disabled?: boolean;
    isSubmitting?: boolean;
    onAdd: (values: string[]) => void;
};

export function isValidPathEntry(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) {
        return false;
    }
    return trimmed.startsWith('/') && !/\s/.test(trimmed) && !trimmed.includes('?') && !trimmed.includes('#');
}

export function IpPathListInput(props: Props) {
    const [draft, setDraft] = useState('');

    const tokens = useMemo(() => splitPastedTokens(draft), [draft]);
    const validTokens = useMemo(() => tokens.filter(isValidPathEntry), [tokens]);
    const invalidTokens = useMemo(() => tokens.filter((token) => !isValidPathEntry(token)), [tokens]);

    const handleAdd = () => {
        if (validTokens.length === 0) {
            return;
        }
        props.onAdd(validTokens);
        setDraft('');
    };

    return (
        <div className="ip-path-list-input">
            <TextArea
                value={draft}
                disabled={props.disabled}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Enter or paste one or more path prefixes (e.g. /healthz, /webhooks/stripe) — separated by spaces, commas, or new lines"
                autoSize={{ minRows: 3, maxRows: 10 }}
            />

            {tokens.length > 0 && (
                <div className="ip-path-list-input__preview">
                    {tokens.map((token, index) => {
                        const valid = isValidPathEntry(token);
                        return (
                            <Tag key={`${token}-${index}`} color={valid ? 'default' : 'error'}>
                                {token}
                            </Tag>
                        );
                    })}
                </div>
            )}

            {invalidTokens.length > 0 && (
                <Text type="danger" className="ip-path-list-input__error">
                    {invalidTokens.length} invalid {invalidTokens.length === 1 ? 'entry' : 'entries'} will be ignored. Paths must start with &quot;/&quot; and contain no spaces, &quot;?&quot; or &quot;#&quot;.
                </Text>
            )}

            <Flex justify="flex-end">
                <Button
                    type="primary"
                    disabled={props.disabled || validTokens.length === 0}
                    loading={props.isSubmitting}
                    onClick={handleAdd}
                >
                    Add {validTokens.length > 0 ? validTokens.length : ''} {validTokens.length === 1 ? 'path' : 'paths'}
                </Button>
            </Flex>
        </div>
    );
}
