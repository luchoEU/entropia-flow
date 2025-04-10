import { useSelector } from "react-redux";
import { getSheetSettings, isFeatureEnabled } from "../../application/selectors/settings";
import ExpandableSection from "../common/ExpandableSection2";
import React from "react";
import { Field, FieldArea } from "../common/Field";
import { documentIdSettingChanged, ttServiceDocumentIdSettingChanged, googleServiceAccountEmailChanged, googlePrivateKeyChanged } from "../../application/actions/settings";
import { FEATURE_TT_SERVICE_SHEET_SETTING } from "../../application/state/settings";

function SheetAccess() {
    const sheet = useSelector(getSheetSettings);
    const showTTService = useSelector(isFeatureEnabled(FEATURE_TT_SERVICE_SHEET_SETTING));

    return (
        <>
            <ExpandableSection selector='SettingsPage.SheetAccess' title="Sheet Access" subtitle='Access to google spreadsheet'>
                <div className="form-settings">
                    <Field
                        label='Document Identifier'
                        value={sheet.documentId}
                        getChangeAction={documentIdSettingChanged} />
                    {showTTService && <Field
                        label='TT Service Document Identifier'
                        value={sheet.ttServiceDocumentId}
                        getChangeAction={ttServiceDocumentIdSettingChanged} />}
                    <Field
                        label='Google Service Account Email'
                        value={sheet.googleServiceAccountEmail}
                        getChangeAction={googleServiceAccountEmailChanged} />
                    <FieldArea
                        label='Google Private Key'
                        value={sheet.googlePrivateKey}
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

export default SheetAccess
