import ExpandableSection from "../common/ExpandableSection2";
import React from "react";
import { JotaiField, JotaiFieldArea } from "../common/Field";
import { Feature } from "../../application/state/settings";
import { useAtomValue } from "jotai";
import { sheetSettingsAtom, isFeatureEnabledAtom, setBudgetDocumentIdAtom, setTTServiceDocumentIdAtom, setGoogleServiceAccountEmailAtom, setGooglePrivateKeyAtom } from "../../application/atoms/settings";

function SheetAccess() {
    const sheet = useAtomValue(sheetSettingsAtom);
    const showBudget = useAtomValue(isFeatureEnabledAtom(Feature.budget));
    const showTTService = useAtomValue(isFeatureEnabledAtom(Feature.ttService));
    if (!showBudget && !showTTService) return null;

    return (
        <ExpandableSection selector='SettingsPage.SheetAccess' title='Sheet Access' subtitle='Access to google spreadsheet'>
            <div className="form-settings">
                {showBudget && <JotaiField
                    label='Budget Document Identifier'
                    value={sheet.budgetDocumentId}
                    setAtom={setBudgetDocumentIdAtom} />}
                {showTTService && <JotaiField
                    label='TT Service Document Identifier'
                    value={sheet.ttServiceDocumentId}
                    setAtom={setTTServiceDocumentIdAtom} />}
                <JotaiField
                    label='Google Service Account Email'
                    value={sheet.googleServiceAccountEmail}
                    setAtom={setGoogleServiceAccountEmailAtom} />
                <JotaiFieldArea
                    label='Google Private Key'
                    value={sheet.googlePrivateKey}
                    setAtom={setGooglePrivateKeyAtom} />
            </div>
            <div>
                <a href="https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication">Follow instructions from here, use Service Account</a>
                <p>TODO: load from json</p>
            </div>
        </ExpandableSection>
    )
}

export default SheetAccess
