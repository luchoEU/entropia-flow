import React from 'react'
import { useSelector } from 'react-redux'
import { documentIdSettingChanged, googlePrivateKeyChanged, googleServiceAccountEmailChanged, setSheetSettingExpanded, ttServiceDocumentIdSettingChanged } from '../../application/actions/settings';
import { getSettings } from '../../application/selectors/settings';
import { SettingsState } from '../../application/state/settings';
import ExpandableSection from '../common/ExpandableSection';
import { Field, FieldArea } from '../common/Field';
import { SHOW_TT_SERVICE } from '../../../config';
import { ConnectionState } from '../../application/state/connection';
import { getConnection } from '../../application/selectors/connection';
import { setConnectionClientExpanded, webSocketConnectionChanged, webSocketRetry } from '../../application/actions/connection';
import ImgButton from '../common/ImgButton';

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

function SheetAccess() {
    const s: SettingsState = useSelector(getSettings);

    return (
        <>
            <ExpandableSection title="Sheet Access" expanded={s.sheet.expanded} setExpanded={setSheetSettingExpanded}>
                <div className="form-settings">
                    <Field
                        label='Document Identifier'
                        value={s.sheet.documentId}
                        getChangeAction={documentIdSettingChanged} />
                    {SHOW_TT_SERVICE && <Field
                        label='TT Service Document Identifier'
                        value={s.sheet.ttServiceDocumentId}
                        getChangeAction={ttServiceDocumentIdSettingChanged} />}
                    <Field
                        label='Google Service Account Email'
                        value={s.sheet.googleServiceAccountEmail}
                        getChangeAction={googleServiceAccountEmailChanged} />
                    <FieldArea
                        label='Google Private Key'
                        value={s.sheet.googlePrivateKey}
                        getChangeAction={googlePrivateKeyChanged} />
                </div>
                <div>
                    <a href="https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication">Follow instructions from here, use Service Account</a>
                    <p>TODO: load from json</p>
                </div>
            </ExpandableSection>
        </>
    )
}

function SettingsPage() {
    return <>
        <EntropiaFlowClient />
        <SheetAccess />
    </>
}

export default SettingsPage
