import React from 'react'
import { ConnectionState } from '../../application/state/connection';
import { setConnectionWebSocketAtom, setConnectionStatusAtom } from '../../application/atoms/connection';
import ImgButton from '../common/ImgButton';
import { useAtomValue, useSetAtom } from 'jotai';
import { connectionAtom } from '../../application/atoms/connection';
import ExpandableSection from '../common/ExpandableSection2';
import { Field } from '../common/Field';

function EntropiaFlowClient() {
    const s: ConnectionState = useAtomValue(connectionAtom)
    const setWebSocket = useSetAtom(setConnectionWebSocketAtom)
    const setConnectionStatus = useSetAtom(setConnectionStatusAtom)
    
    return (
        <>
            <ExpandableSection selector='ClientSettings' title='Entropia Flow Client' subtitle='Status of the connection with Client' actionRequired={!s.client.status.startsWith('connected') ? 'Disconnected' : undefined}>
                <div className="form-settings">
                    <Field
                        label='URI'
                        value={s.client.webSocket}
                        getChangeAction={(uri: string) => setWebSocket(uri)} />
                </div>
                <p>
                    Status: {s.client.status}
                    <ImgButton
                        title='Try to connect again'
                        src='img/reload.png'
                        className='img-btn-delta-zero'
                        show
                        dispatch={() => setConnectionStatus('retrying')} />
                </p>
                {!s.client.status.startsWith('connected') && <p>
                    <a href="https://github.com/luchoEU/entropia-flow/releases/download/client-0.1.0/EntropiaFlowClient_v0.1.0.zip" target="_blank">You can download the client from here</a>
                </p>}
            </ExpandableSection>
        </>
    )
}

function ClientSettings() {
    return <>
        <EntropiaFlowClient />
    </>
}

export default ClientSettings;
