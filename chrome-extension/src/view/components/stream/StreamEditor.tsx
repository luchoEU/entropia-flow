
import React, { JSX } from "react"
import { useDispatch, useSelector } from "react-redux"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamVariable } from "../../application/state/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { getStream, getStreamIn } from "../../application/selectors/stream"
import { addStreamUserVariable, setStreamBackgroundSelected, setStreamCssTemplate, setStreamHtmlTemplate, setStreamName, setStreamUserVariablePartial } from "../../application/actions/stream"
import { StreamRenderSingle } from "../../../stream/data"
import ExpandableSection from "../common/ExpandableSection2"
import { backgroundList, BackgroundSpec, getLogoUrl } from "../../../stream/background"
import StreamViewLayout from "./StreamViewLayout"
import CodeEditor from "./CodeEditor"

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

function StreamLayoutEditor() {
    const { editing, layouts } = useSelector(getStreamIn)
    const c = layouts[editing.layoutId]

    return <>
        <ExpandableSection selector='StreamEditor-layout-html' title='HTML Template' className='stream-layout'>
            <CodeEditor
                language='html'
                readOnly={c.readonly}
                value={c.htmlTemplate}
                dispatchChange={setStreamHtmlTemplate}
            />
        </ExpandableSection>
        <ExpandableSection selector='StreamEditor-layout-css' title='CSS Template' className='stream-layout'>
            <CodeEditor
                language='css'
                readOnly={c.readonly}
                value={c.cssTemplate}
                dispatchChange={setStreamCssTemplate}
            />
        </ExpandableSection>
    </>
}

function StreamEditor() {
    const { in: { editing, layouts }, out: { data } } = useSelector(getStream);
    const c = layouts[editing.layoutId];
    const dispatch = useDispatch();

    return <section>
        <h1>Editing {c.name} Layout</h1>
        <label htmlFor='stream-layout-name'>Name</label>
        <input
            id='stream-layout-name'
            type='text'
            value={c.name}
            readOnly={c.readonly}
            style={{ marginLeft: 10 }}
            onClick={(e) => { e.stopPropagation() }}
            onChange={(e) => {
                e.stopPropagation();
                dispatch(setStreamName(e.target.value))
            }}
        />
        <div className='flex'>
            <ExpandableSection selector='StreamEditor.background' title='Background' >
                <div className='stream-background-section'>
                    { backgroundList.map((b: BackgroundSpec) =>
                        <StreamBackground key={b.type} background={b} isSelected={b.type === c.backgroundType} />) }
                </div>
                <p>If you want another background, you can <a href='https://www.google.com/search?q=css+background+animated'>search one on the internet</a>, and contact me.</p>
            </ExpandableSection>
            <SortableTabularSection
                selector={STREAM_TABULAR_VARIABLES}
                afterSearch={[ { button: 'Add', dispatch: () => addStreamUserVariable(false) } ]}
            />
            <SortableTabularSection
                selector={STREAM_TABULAR_IMAGES}
                itemHeight={50}
                afterSearch={[ { button: 'Add', dispatch: () => addStreamUserVariable(true) } ]}
            />
            <ExpandableSection selector='StreamEditor-preview' title='Preview'>
                <StreamViewLayout id={'stream-preview'} layoutId={editing.layoutId} single={{ data: data.data, layout: c}} />
            </ExpandableSection>
            <StreamLayoutEditor />
        </div>
    </section>
}

export default StreamEditor
