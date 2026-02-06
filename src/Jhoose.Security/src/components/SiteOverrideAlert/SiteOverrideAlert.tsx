import React from 'react';
import { Alert, Flex, Switch, Typography } from 'antd';

type Props = {
    siteName: string,
    itemLabel: string,
    isOverrideEnabled: boolean,
    onOverrideChange: (checked: boolean) => void
}

export function SiteOverrideAlert(props: Props) {
    const { Text } = Typography;

    return (
        <Alert
            type="info"
            showIcon
            message={`Website: ${props.siteName}`}
            description={
                <Flex vertical gap={6}>
                    <Text>This {props.itemLabel} inherits from Global Default until you create an override.</Text>
                    <Flex align="center" gap={8}>
                        <Text>Override for this website</Text>
                        <Switch
                            checked={props.isOverrideEnabled}
                            onChange={props.onOverrideChange}
                        />
                    </Flex>
                </Flex>
            }
        />
    );
}
