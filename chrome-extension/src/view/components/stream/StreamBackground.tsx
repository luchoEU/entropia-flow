import React, { JSX } from "react";
import { backgroundList, BackgroundSpec, getLogoUrl } from "../../../stream/background";
import ExpandableSection from "../common/ExpandableSection2";
import { useDispatch, useSelector } from "react-redux";
import { getStream } from "../../application/selectors/stream";
import StreamViewLayout from "./StreamViewLayout";
import { StreamRenderSingle } from "../../../stream/data";
import { setStreamBackgroundSelected } from "../../application/actions/stream";
import { LUCHO } from "../about/AboutPage";

const StreamBackground = (p: {
    background: BackgroundSpec,
    isSelected: boolean,
}): JSX.Element => {
    const dispatch = useDispatch()

    const single: StreamRenderSingle = {
        data: {
            logoUrl: getLogoUrl(p.background.dark),
            backgroundName: p.background.title
        },
        layout: {
            name: 'Entropia Flow Background',
            author: LUCHO,
            backgroundType: p.background.type,
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
        <div {...(p.isSelected ? { className: 'stream-selected' } : {})}
            onClick={() => dispatch(setStreamBackgroundSelected(p.background.type))}>
            <StreamViewLayout id={`stream-background-${p.background.type}`} layoutId={'entropiaflow.background'} single={single} />
        </div>
    )
}

function StreamBackgroundChooser() {
    const { in: { editing, layouts } } = useSelector(getStream);
    const c = layouts[editing.layoutId];

    return <ExpandableSection selector='StreamBackground' title='Background' subtitle='Select a background'>
                <div className='stream-background-section'>
                    { backgroundList.map((b: BackgroundSpec) =>
                        <StreamBackground key={b.type} background={b} isSelected={b.type === c.backgroundType} />) }
                </div>
                <p>If you want another background, you can <a href='https://www.google.com/search?q=css+background+animated'>search one on the internet</a>, and contact me.</p>
            </ExpandableSection>
}

export default StreamBackgroundChooser
