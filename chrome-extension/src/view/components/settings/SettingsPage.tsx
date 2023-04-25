import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { documentIdSettingChanged, googlePrivateKeyChanged, googleServiceAccountEmailChanged, setSheetSettingExpanded } from '../../application/actions/settings';
import { getSettings } from '../../application/selectors/settings';
import { SettingsState } from '../../application/state/settings';
import ExpandableSection from '../common/ExpandableSection';

function Field(p: {
    label: string,
    value: string,
    getChangeAction: (v: string) => any
}) {
    const dispatch = useDispatch()

    return (
        <p>
            <label>{p.label}</label>
            <input
                type='text'
                value={p.value}
                onChange={(e) => dispatch(p.getChangeAction(e.target.value))} />
        </p>
    )
}

function FieldArea(p: {
    label: string,
    value: string,
    getChangeAction: (v: string) => any
}) {
    const dispatch = useDispatch()

    return (
        <p>
            <label>{p.label}</label>
            <textarea
                value={p.value}
                onChange={(e) => dispatch(p.getChangeAction(e.target.value))} />
        </p>
    )
}

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
            </ExpandableSection>
        </>
    )
}

export default SettingsPage
