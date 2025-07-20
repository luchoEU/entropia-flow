import React from 'react'
import { ConnectionState } from '../../application/state/connection';
import { getConnection } from '../../application/selectors/connection';
import { webSocketConnectionChanged, webSocketRetry } from '../../application/actions/connection';
import ImgButton from '../common/ImgButton';
import { useSelector } from 'react-redux';
import ExpandableSection from '../common/ExpandableSection2';
import { Field } from '../common/Field';

function EntropiaFlowClient() {
    const s: ConnectionState = useSelector(getConnection)
    
    return (
        <>
            <ExpandableSection selector='ClientSettings' title='Entropia Flow Client' subtitle='Status of the connection with Client' actionRequired={!s.client.status.startsWith('connected') ? 'Disconnected' : undefined}>
                <div className="form-settings">
                    <Field
                        label='URI'
                        value={s.client.webSocket}
                        getChangeAction={webSocketConnectionChanged} />
                </div>
                <p>
                    Status: {s.client.status}
                    <ImgButton
                        title='Try to connect again'
                        src='img/reload.png'
                        className='img-btn-delta-zero'
                        dispatch={() => webSocketRetry} />
                </p>
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
