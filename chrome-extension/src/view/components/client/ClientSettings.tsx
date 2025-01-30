import React from 'react'
import { ConnectionState } from '../../application/state/connection';
import { getConnection } from '../../application/selectors/connection';
import { setConnectionClientExpanded, webSocketConnectionChanged, webSocketRetry } from '../../application/actions/connection';
import ImgButton from '../common/ImgButton';
import { useSelector } from 'react-redux';
import ExpandableSection from '../common/ExpandableSection';
import { Field } from '../common/Field';

function EntropiaFlowClient() {
    const s: ConnectionState = useSelector(getConnection)
    
    return (
        <>
            <ExpandableSection title='Entropia Flow Client' expanded={s.client.expanded} setExpanded={setConnectionClientExpanded}>
                <div className="form-settings">
                    <Field
                        label='WebSocket'
                        value={s.client.webSocket}
                        getChangeAction={webSocketConnectionChanged} />
                </div>
                <p>
                    Status: {s.client.status}
                    <ImgButton
                        title='Try to connect again'
                        src='img/reload.png'
                        className='img-delta-zero'
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
