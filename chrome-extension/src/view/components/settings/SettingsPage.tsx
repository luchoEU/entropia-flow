import React from 'react'
import { useSelector } from 'react-redux'
import { documentIdSettingChanged, googlePrivateKeyChanged, googleServiceAccountEmailChanged, setSheetSettingExpanded } from '../../application/actions/settings';
import { getSettings } from '../../application/selectors/settings';
import { SettingsState } from '../../application/state/settings';
import ExpandableSection from '../common/ExpandableSection';
import { Field, FieldArea } from '../common/Field';

function SettingsPage() {
    const s: SettingsState = useSelector(getSettings);

    return (
        <>
            <ExpandableSection title="Sheet Access" expanded={s.sheet.expanded} setExpanded={setSheetSettingExpanded}>
                <div className="form-settings">
                    <Field
                        label='Document Identifier'
                        value={s.sheet.documentId}
                        getChangeAction={documentIdSettingChanged} />
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

export default SettingsPage
