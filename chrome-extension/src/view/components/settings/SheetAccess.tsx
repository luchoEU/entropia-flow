import ExpandableSection from "../common/ExpandableSection2";
import React, { useState } from "react";
import { JotaiField, JotaiFieldArea } from "../common/Field";
import { Feature } from "../../application/state/settings";
import { useAtomValue, useSetAtom } from "jotai";
import { sheetSettingsAtom, isFeatureEnabledAtom, setBudgetDocumentIdAtom, setTTServiceDocumentIdAtom, setGoogleServiceAccountEmailAtom, setGooglePrivateKeyAtom, setItemsSheetPersistenceModeAtom } from "../../application/atoms/settings";
import { reloadItemsFromSheetAtom } from "../../application/atoms/items";

function SheetAccess() {
    const sheet = useAtomValue(sheetSettingsAtom);
    const showBudget = useAtomValue(isFeatureEnabledAtom(Feature.budget));
    const showTTService = useAtomValue(isFeatureEnabledAtom(Feature.ttService));
    const setItemsSheetPersistenceMode = useSetAtom(setItemsSheetPersistenceModeAtom);
    const triggerReloadItems = useSetAtom(reloadItemsFromSheetAtom);
    const [reloadError, setReloadError] = useState<string | null>(null);
    const [reloadLoading, setReloadLoading] = useState(false);

    if (!showBudget && !showTTService) return null;

    const handleReloadItems = async () => {
        setReloadError(null);
        setReloadLoading(true);
        try {
            await triggerReloadItems();
        } catch (error) {
            setReloadError(error instanceof Error ? error.message : 'Failed to reload items');
        } finally {
            setReloadLoading(false);
        }
    };

    const persistenceMode = sheet.itemsSheetPersistenceMode || 'browser';

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

            {showBudget && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Items Sheet Settings</h4>
                    <div className="form-settings">
                        <label>
                            Items Persistence Mode:
                            <select
                                value={persistenceMode}
                                onChange={(e) => setItemsSheetPersistenceMode(e.target.value as 'sheet' | 'browser')}
                                style={{ marginLeft: '10px' }}
                            >
                                <option value="browser">Browser Storage</option>
                                <option value="sheet">Google Sheet</option>
                            </select>
                        </label>
                    </div>
                    {persistenceMode === 'sheet' && (
                        <div style={{ marginTop: '10px' }}>
                            <button
                                onClick={handleReloadItems}
                                disabled={reloadLoading}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: reloadLoading ? '#ccc' : '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: reloadLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {reloadLoading ? 'Loading...' : 'Reload Items from Sheet'}
                            </button>
                            {reloadError && (
                                <p style={{ color: 'red', marginTop: '10px' }}>
                                    Error: {reloadError}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <a href="https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication">Follow instructions from here, use Service Account</a>
                <p>TODO: load from json</p>
            </div>
        </ExpandableSection>
    )
}

export default SheetAccess
