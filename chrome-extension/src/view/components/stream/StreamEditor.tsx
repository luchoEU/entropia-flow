
import React, { JSX } from "react"
import { useDispatch, useSelector } from "react-redux"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamVariable } from "../../application/state/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { getStream, getStreamIn } from "../../application/selectors/stream"
import { setStreamBackgroundSelected, setStreamContainerStyle, setStreamName, setStreamTemplate } from "../../application/actions/stream"
import { StreamRenderValue } from "../../../stream/data"
import ExpandableSection from "../common/ExpandableSection2"
import { backgroundList, BackgroundSpec, getLogoUrl } from "../../../stream/background"
import useBackground from "../hooks/UseBackground"
import StreamViewLayout from "./StreamViewLayout"
import { isLayoutReadonly } from "../../application/helpers/stream"

const StreamBackground = (p: {
    background: BackgroundSpec,
    isSelected: boolean,
}): JSX.Element => {
    const dispatch = useDispatch()
    const id = `stream-background-${p.background.title}`

    useBackground(p.background.type, id)

    return (
        <div {...(p.isSelected ? { className: 'stream-selected' } : {})}
            onClick={() => dispatch(setStreamBackgroundSelected(p.background.type))}>
            <div id={id} className='stream-view demo'>
                <div className='stream-frame demo'>
                    <img className='stream-logo' src={getLogoUrl(p.background.dark)} alt='Logo'></img>
                    <div className='stream-title'>Entropia Flow</div>
                    <div className='stream-subtitle'>{p.background.title}</div>
                </div>
            </div>
        </div>
    )
}

function StreamLayoutEditor() {
    const { editing, layouts } = useSelector(getStreamIn)
    const dispatch = useDispatch()
    const c = layouts[editing]
    const readonly = isLayoutReadonly(c.name)

    return <ExpandableSection selector='StreamEditor-layout' title='Layout'>
            <h1>Layout</h1>
            <label htmlFor='stream-container-style'>Container Style</label>
            <input
                id='stream-container-style'
                type='text'
                readOnly={readonly}
                style={{ width: 1200 }}
                value={c.containerStyle}
                onClick={(e) => { e.stopPropagation() }}
                onChange={(e) => {
                    e.stopPropagation();
                    dispatch(setStreamContainerStyle(e.target.value))
                }}
            />
            <label htmlFor='stream-template'>Template</label>
            <textarea
                id='stream-template'
                readOnly={readonly}
                style={{ width: 1200, height: 300 }}
                value={c.template}
                onClick={(e) => { e.stopPropagation() }}
                onChange={(e) => {
                    e.stopPropagation();
                    dispatch(setStreamTemplate(e.target.value))
                }}
            />
        </ExpandableSection>
    }

function StreamEditor() {
    const { in: { editing, layouts }, out: { data } } = useSelector(getStream)
    const c = layouts[editing]
    const dispatch = useDispatch()

    const str = (v: StreamRenderValue): string => typeof v === 'string' ? v : JSON.stringify(v)
    return <section>
        <h1>Editing {editing} Layout</h1>
        <label htmlFor='stream-layout-name'>Name</label>
        <input
            id='stream-layout-name'
            type='text'
            value={c.name}
            readOnly={isLayoutReadonly(c.name)}
            style={{ marginLeft: 10 }}
            onClick={(e) => { e.stopPropagation() }}
            onChange={(e) => {
                e.stopPropagation();
                dispatch(setStreamName(e.target.value))
            }}
        />
        <div className='flex'>
            <ExpandableSection selector='StreamEditor.background' title='Background' >
                <div className='flex'>
                    { backgroundList.map((b: BackgroundSpec) =>
                        <StreamBackground key={b.type} background={b} isSelected={b.type === c.backgroundType} />) }
                </div>
                <p>If you want another background, you can <a href='https://www.google.com/search?q=css+background+animated'>search one on the internet</a>, and contact me.</p>
            </ExpandableSection>
            <SortableTabularSection
                title='Variables'
                selector={STREAM_TABULAR_VARIABLES}
                columns={['Source', 'Name', 'Value', 'Computed', 'Description']}
                getRow={(g: StreamVariable) => [ g.source, g.name, str(g.value), str(g.computed), g.description ]}
            />
            <SortableTabularSection
                title='Images'
                selector={STREAM_TABULAR_IMAGES}
                columns={['Source', 'Name', 'Image', 'Description']}
                getRow={(g: StreamVariable) => [ g.source, g.name, { img: g.value as string, title: `${g.name} image` }, g.description ]}
            />
            <ExpandableSection selector='StreamEditor-preview' title='Preview'>
                <StreamViewLayout id={`stream-StreamEditor-preview`} data={{ data: data.data, layout: c}} />
            </ExpandableSection>
            <StreamLayoutEditor />
        </div>
    </section>
}

export default StreamEditor
