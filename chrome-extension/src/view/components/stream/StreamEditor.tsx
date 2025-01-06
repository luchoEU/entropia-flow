
import React, { JSX } from "react"
import { useDispatch, useSelector } from "react-redux"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamVariable } from "../../application/state/stream"
import SortableTabularSection, { RowValue } from "../common/SortableTabularSection"
import { getStream, getStreamIn } from "../../application/selectors/stream"
import { addStreamUserVariable, removeStreamUserVariable, setStreamBackgroundSelected, setStreamCssTemplate, setStreamHtmlTemplate, setStreamName, setStreamUserVariablePartial } from "../../application/actions/stream"
import { StreamRenderSingle, StreamRenderValue } from "../../../stream/data"
import ExpandableSection from "../common/ExpandableSection2"
import { backgroundList, BackgroundSpec, getLogoUrl } from "../../../stream/background"
import StreamViewLayout from "./StreamViewLayout"

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
    const dispatch = useDispatch()
    const c = layouts[editing.layoutId]

    const handleKeyDown = (setText: (text: string) => any) =>(event) => {
        if (event.key === "Tab") {
            event.preventDefault();

            const textarea: HTMLTextAreaElement = event.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // Insert indentation
            const tab = "  ";
            const text = event.target.value;
            const updatedText = text.substring(0, start) + tab + text.substring(end);
            dispatch(setText(updatedText));

            requestAnimationFrame(() => {
                // Set the cursor position after the tab
                textarea.selectionStart = textarea.selectionEnd = start + tab.length;
            });
        }
    };

    return <ExpandableSection selector='StreamEditor-layout' title='Layout' className='stream-layout'>        
        <div>
            <label htmlFor='stream-html-template'>HTML Template</label>
            <textarea
                id='stream-html-template'
                readOnly={c.readonly}
                value={c.htmlTemplate}
                onClick={(e) => { e.stopPropagation() }}
                onKeyDown={handleKeyDown(setStreamHtmlTemplate)}
                onChange={(e) => {
                    e.stopPropagation();
                    dispatch(setStreamHtmlTemplate(e.target.value));
                }}
            />
        </div>
        <div>
            <label htmlFor='stream-css-template'>CSS Template</label>
            <textarea
                id='stream-css-template'
                readOnly={c.readonly}
                value={c.cssTemplate}
                onClick={(e) => { e.stopPropagation() }}
                onKeyDown={handleKeyDown(setStreamCssTemplate)}
                onChange={(e) => {
                    e.stopPropagation();
                    dispatch(setStreamCssTemplate(e.target.value));
                }}
            />
        </div>
    </ExpandableSection>
}

function StreamEditor() {
    const { in: { editing, layouts }, out: { data } } = useSelector(getStream);
    const c = layouts[editing.layoutId];
    const dispatch = useDispatch();

    const field = (g: StreamVariable, selector: string, maxWidth?: number, readonly?: boolean, addRemove?: boolean): RowValue => {
        if (!readonly && g.source === 'user') {
            const w = { input: g[selector], width: maxWidth, dispatchChange: (v: string) => setStreamUserVariablePartial(g.id, { [selector]: v }) }
            return addRemove ? { sub: [ w, { img: 'img/cross.png', title: 'Remove variable', dispatch: () => removeStreamUserVariable(g.id) } ] } : w;
        } else if (maxWidth) {
            const v = g[selector];
            return { text: typeof v === 'string' ? v : JSON.stringify(v), maxWidth };
        } else {
            return g[selector];
        }
    }

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
                title='Variables'
                selector={STREAM_TABULAR_VARIABLES}
                columns={['Source', 'Name', 'Value', 'Computed', 'Description']}
                getRow={(g: StreamVariable) => [
                    g.source,
                    field(g, 'name', 100, false, true),
                    field(g, 'value', 300),
                    field(g, 'computed', 120, true),
                    field(g, 'description', 300),
                ]}
                afterSearch={[ { button: 'Add', dispatch: () => addStreamUserVariable } ]}
            />
            <SortableTabularSection
                title='Images'
                selector={STREAM_TABULAR_IMAGES}
                columns={['Source', 'Name', 'Image', 'Description']}
                getRow={(g: StreamVariable) => [ g.source, g.name, { img: g.value as string, title: `${g.name} image`, show: true, style: { height: '90%' } }, { text: g.description, maxWidth: 300 } ]}
                itemHeight={50}
            />
            <ExpandableSection selector='StreamEditor-preview' title='Preview'>
                <StreamViewLayout id={'stream-preview'} layoutId={editing.layoutId} single={{ data: data.data, layout: c}} />
            </ExpandableSection>
            <StreamLayoutEditor />
        </div>
    </section>
}

export default StreamEditor
