import React from 'react'
import { useSelector } from 'react-redux'
import { documentIdSettingChanged, googlePrivateKeyChanged, googleServiceAccountEmailChanged, ttServiceDocumentIdSettingChanged } from '../../application/actions/settings';
import { getSettings } from '../../application/selectors/settings';
import { SettingsState } from '../../application/state/settings';
import ExpandableSection from '../common/ExpandableSection2';
import { Field, FieldArea } from '../common/Field';
import { SHOW_SHEET_SETTINGS, SHOW_TT_SERVICE } from '../../../config';

function SheetAccess() {
    const s: SettingsState = useSelector(getSettings);

    return (
        <>
            <ExpandableSection selector='SettingsPage.SheetAccess' title="Sheet Access" subtitle='Access to google spreadsheet'>
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
        { SHOW_SHEET_SETTINGS && <SheetAccess /> }
    </>
}

export default SettingsPage
