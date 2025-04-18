import { useSelector } from "react-redux";
import { getSheetSettings } from "../../application/selectors/settings";
import ExpandableSection from "../common/ExpandableSection2";
import React from "react";
import { Field, FieldArea } from "../common/Field";
import { budgetDocumentIdChanged, ttServiceDocumentIdChanged, googleServiceAccountEmailChanged, googlePrivateKeyChanged } from "../../application/actions/settings";
import { Feature } from "../../application/state/settings";
import { selectIsFeatureEnabled } from "../../application/selectors/settings";

function SheetAccess() {
    const sheet = useSelector(getSheetSettings);
    const showBudget = useSelector(selectIsFeatureEnabled(Feature.budget));
    const showTTService = useSelector(selectIsFeatureEnabled(Feature.ttService));
    if (!showBudget && !showTTService) return null;

    return (
        <ExpandableSection selector='SettingsPage.SheetAccess' title='Sheet Access' subtitle='Access to google spreadsheet'>
            <div className="form-settings">
                {showBudget && <Field
                    label='Budget Document Identifier'
                    value={sheet.budgetDocumentId}
                    getChangeAction={budgetDocumentIdChanged} />}
                {showTTService && <Field
                    label='TT Service Document Identifier'
                    value={sheet.ttServiceDocumentId}
                    getChangeAction={ttServiceDocumentIdChanged} />}
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
    )
}

export default SheetAccess
