import React from "react";
import { featureList, SettingsState } from "../../application/state/settings";
import ExpandableSection from "../common/ExpandableSection";
import ModeState from "../../application/state/mode";
import { SHOW_FEATURES_IN_DEVELOPMENT } from "../../../config";
import { useAtomValue, useSetAtom } from "jotai";
import { settingsAtom, setFeatureEnabledAtom } from "../../application/atoms/settings";
import { modeAtom } from "../../application/atoms/mode";

function FeatureSelector() {
    const s: SettingsState = useAtomValue(settingsAtom);
    const mode: ModeState = useAtomValue(modeAtom);
    const { showSubtitles } = mode;
    const setFeatureEnabled = useSetAtom(setFeatureEnabledAtom);

    return (
        <>
            <ExpandableSection selector='SettingsPage.FeatureSelector' title='Features' subtitle='Enable or disable features'>
                {
                    featureList.map(f => {
                        if (f.development && !SHOW_FEATURES_IN_DEVELOPMENT) return <></>
                        const enabled = s.features.includes(f.id)
                        return (
                            <div className='feature-container' key={f.id} onClick={() => setFeatureEnabled(f.id, !enabled)}>
                                <input type='checkbox' checked={enabled} onChange={e => {
                                    const checked = (e.target as HTMLInputElement).checked
                                    setFeatureEnabled(f.id, checked)
                                }} />
                                <span className='feature-title'>{f.title}</span>
                                <span className='feature-description' dangerouslySetInnerHTML={{ __html: f.description }} {...(!showSubtitles && f.explanation ? { title: f.explanation } : {}) }></span>
                                { showSubtitles && f.explanation && <span className='feature-explanation' dangerouslySetInnerHTML={{ __html: f.explanation }}></span> }
                            </div>
                        )
                    })
                }
            </ExpandableSection>
        </>
    );
}

export default FeatureSelector
