
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamVariable } from "../../application/state/stream"
import SortableTableSection from "../common/SortableTableSection2"
import { getStreamIn } from "../../application/selectors/stream"
import { setStreamBackgroundExpanded, setStreamBackgroundSelected, setStreamContainerStyle, setStreamTemplate } from "../../application/actions/stream"
import { StreamRenderValue } from "../../../stream/data"
import ExpandableSection from "../common/ExpandableSection"
import { backgroundList, BackgroundSpec, getLogoUrl } from "../../../stream/background"
import useBackground from "../hooks/UseBackground"

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

    return <section>
        <h1>Layout</h1>
        <label>Container Style</label>
        <input
            style={{ width: 1200 }}
            value={c.containerStyle}
            onClick={(e) => { e.stopPropagation() }}
            onChange={(e) => {
                e.stopPropagation();
                dispatch(setStreamContainerStyle(e.target.value))
            }}
        />
        <label>Template</label>
        <textarea
            style={{ width: 1200, height: 300 }}
            value={c.template}
            onClick={(e) => { e.stopPropagation() }}
            onChange={(e) => {
                e.stopPropagation();
                dispatch(setStreamTemplate(e.target.value))
            }}
        />
    </section>
    }

function StreamEditor() {
    const { expanded, editing, layouts } = useSelector(getStreamIn)
    const c = layouts[editing]

    const str = (v: StreamRenderValue): string => typeof v === 'string' ? v : JSON.stringify(v)
    return <section>
        <h1>Editing {editing} Layout</h1>
        <div className='flex'>
            <ExpandableSection title='Background' expanded={expanded.background} setExpanded={setStreamBackgroundExpanded}>
                <div className='flex'>
                    { backgroundList.map((b: BackgroundSpec) =>
                        <StreamBackground key={b.type} background={b} isSelected={b.type === c.backgroundType} />) }
                </div>
                <p>If you want another background, you can <a href='https://www.google.com/search?q=css+background+animated'>search one on the internet</a>, and contact me.</p>
            </ExpandableSection>
            <SortableTableSection
                title='Variables'
                selector={STREAM_TABULAR_VARIABLES}
                columns={['Source', 'Name', 'Value', 'Computed', 'Description']}
                getRow={(g: StreamVariable) => [g.source, g.name, str(g.value), str(g.computed), g.description]}
            />
            <SortableTableSection
                title='Images'
                selector={STREAM_TABULAR_IMAGES}
                columns={['Source', 'Name', 'Image', 'Description']}
                getRow={(g: StreamVariable) => [g.source, g.name, { img: g.value as string }, g.description]}
            />
            <StreamLayoutEditor />
        </div>
    </section>
}

export default StreamEditor
