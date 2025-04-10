import React from 'react'
import SheetAccess from './SheetAccess';
import { useSelector } from 'react-redux';
import { isFeatureEnabled } from '../../application/selectors/settings';
import FeatureSelector from './FeatureSelector';
import { FEATURE_SHOW_SHEET_SETTINGS } from '../../application/state/settings';

function SettingsPage() {
    const showSheet = useSelector(isFeatureEnabled(FEATURE_SHOW_SHEET_SETTINGS));

    return <>
        <FeatureSelector />
        { showSheet && <SheetAccess /> }
    </>
}

export default SettingsPage
