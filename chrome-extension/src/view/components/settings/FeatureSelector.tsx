import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSettings } from "../../application/selectors/settings";
import { featureList, SettingsState } from "../../application/state/settings";
import ExpandableSection from "../common/ExpandableSection2";
import { enableFeature } from "../../application/actions/settings";

function FeatureSelector() {
    const s: SettingsState = useSelector(getSettings);
    const dispatch = useDispatch();

    return (
        <>
            <ExpandableSection selector='SettingsPage.FeatureSelector' title='Features' subtitle='Enable or disable features'>
                {
                    featureList.map(f => {
                        const enabled = s.features.includes(f.id)
                        return (
                            <div className='feature-container' key={f.id} onClick={() => dispatch(enableFeature(f.id, !enabled))}>
                                <input type='checkbox' checked={enabled} onChange={e => {
                                    const checked = (e.target as HTMLInputElement).checked
                                    dispatch(enableFeature(f.id, checked))
                                }} />
                                <span className='feature-title'>{f.title}</span>
                                <span className='feature-description' dangerouslySetInnerHTML={{ __html: f.description }}></span>
                            </div>
                        )
                    })
                }
            </ExpandableSection>
        </>
    );
}

export default FeatureSelector
