import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSettings } from "../../application/selectors/settings";
import { featureList, SettingsState } from "../../application/state/settings";
import ExpandableSection from "../common/ExpandableSection2";
import { enableFeature } from "../../application/actions/settings";
import ModeState from "../../application/state/mode";
import { getMode } from "../../application/selectors/mode";
import { SHOW_FEATURES_IN_DEVELOPMENT } from "../../../config";

function FeatureSelector() {
    const s: SettingsState = useSelector(getSettings);
    const { showSubtitles }: ModeState = useSelector(getMode)
    const dispatch = useDispatch();

    return (
        <>
            <ExpandableSection selector='SettingsPage.FeatureSelector' title='Features' subtitle='Enable or disable features'>
                {
                    featureList.map(f => {
                        if (f.development && !SHOW_FEATURES_IN_DEVELOPMENT) return <></>
                        const enabled = s.features.includes(f.id)
                        return (
                            <div className='feature-container' key={f.id} onClick={() => dispatch(enableFeature(f.id, !enabled))}>
                                <input type='checkbox' checked={enabled} onChange={e => {
                                    const checked = (e.target as HTMLInputElement).checked
                                    dispatch(enableFeature(f.id, checked))
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
