import React, { JSX, useMemo } from "react";
import { backgroundList, BackgroundSpec } from "../../../stream/background";
import { getLogoUrl } from "../../../stream/backgroundGetLogo";
import ExpandableSection from "../common/ExpandableSection2";
import { useAtomValue, useSetAtom } from "jotai";
import { streamStateAtom, setStreamBackgroundSelectedAtom } from "../../application/atoms/stream";
import StreamViewLayout from "./StreamViewLayout";
import { StreamRenderSingle } from "../../../stream/data";
import { settingsAtom } from "../../application/atoms/settings";

const StreamBackground = ({ background, layoutId, isSelected }: {
    background: BackgroundSpec,
    layoutId: string,
    isSelected: boolean,
}): JSX.Element => {
    const setBackgroundSelected = useSetAtom(setStreamBackgroundSelectedAtom)

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
            onClick={() => setBackgroundSelected(layoutId, background.type)}>
            <StreamViewLayout id={`stream-background-${background.type}`} layoutId={'entropiaflow.background'} single={single} />
        </div>
    )
}

const StreamBackgroundChooser = ({layoutId}: {layoutId: string}) => {
    const settings = useAtomValue(settingsAtom)
    const streamState = useAtomValue(streamStateAtom)
    const layoutData = useMemo(() => streamState.in.layouts[layoutId], [streamState.in.layouts, layoutId])
    const c = layoutData
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
