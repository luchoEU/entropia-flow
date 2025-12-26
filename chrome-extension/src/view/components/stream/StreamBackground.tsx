import React, { JSX } from "react";
import { backgroundList, BackgroundSpec } from "../../../stream/background";
import { getLogoUrl } from "../../../stream/backgroundGetLogo";
import ExpandableSection from "../common/ExpandableSection2";
import { useDispatch, useSelector } from "react-redux";
import { getStreamLayout } from "../../application/selectors/stream";
import StreamViewLayout from "./StreamViewLayout";
import { StreamRenderSingle } from "../../../stream/data";
import { setStreamBackgroundSelected } from "../../application/actions/stream";
import { getSettings } from "../../application/selectors/settings";

const StreamBackground = ({ background, layoutId, isSelected }: {
    background: BackgroundSpec,
    layoutId: string,
    isSelected: boolean,    
}): JSX.Element => {
    const dispatch = useDispatch()

    const single: StreamRenderSingle = {
        data: {
            logoUrl: getLogoUrl(background.dark),
            backgroundName: background.title
        },
        layout: {
            name: 'Entropia Flow Background',
            backgroundType: background.type,
            htmlTemplate: `
<div style='display: flex; align-items: start; font-size: 14px; margin: 20px;'>
    <img style='width: 50px;' src='{{logoUrl}}' alt='Logo'></img>
    <div style='display: flex; flex-direction: column; margin: 0px 10px;'>
        <div style='font-size: 20px; font-weight: bold;'>Entropia Flow</div>
        <div style='margin-left: 10px'>{{backgroundName}}</div>
    </div>
</div>`
        }
    }

    return (
        <div {...(isSelected ? { className: 'stream-selected' } : {})}
            onClick={() => dispatch(setStreamBackgroundSelected(layoutId, background.type))}>
            <StreamViewLayout id={`stream-background-${background.type}`} layoutId={'entropiaflow.background'} single={single} />
        </div>
    )
}

const StreamBackgroundChooser = ({layoutId}: {layoutId: string}) => {
    const settings = useSelector(getSettings)
    const { layout: c } = useSelector(getStreamLayout(layoutId))
    if (!c) return <></>

    return (
        <ExpandableSection selector='StreamBackground' title='Background' subtitle='Select a background'>
            <div className='stream-background-section'>
                { backgroundList(settings).map((b: BackgroundSpec) =>
                    <StreamBackground key={b.type} background={b} layoutId={layoutId} isSelected={b.type === c.backgroundType} />) }
            </div>
            <p>If you want another background, you can <a href='https://www.google.com/search?q=css+background+animated'>search one on the internet</a>, and contact me.</p>
        </ExpandableSection>
    )
}

export default StreamBackgroundChooser
