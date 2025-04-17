
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES } from "../../application/state/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { getStream, getStreamIn } from "../../application/selectors/stream"
import { addStreamUserVariable, cloneStreamLayout, setStreamAdvanced, setStreamAuthor, setStreamCssTemplate, setStreamHtmlTemplate, setStreamName } from "../../application/actions/stream"
import ExpandableSection from "../common/ExpandableSection2"
import StreamViewLayout from "./StreamViewLayout"
import CodeEditor from "./CodeEditor"
import StreamBackgroundChooser from "./StreamBackground"
import { useNavigate, useParams } from "react-router-dom"
import { useAppDispatch } from "../../application/store"

function StreamLayoutEditor() {
    const { layouts } = useSelector(getStreamIn)
    const { layoutId } = useParams();
    const c = layouts[layoutId]

    return <>
        <ExpandableSection selector='StreamEditor-layout-html' title='HTML Template' subtitle='Variables are available, this a {{mustache}} template' className='stream-layout'>
            <CodeEditor
                language='html'
                readOnly={c.readonly}
                value={c.htmlTemplate}
                dispatchChange={setStreamHtmlTemplate}
            />
        </ExpandableSection>
        <ExpandableSection selector='StreamEditor-layout-css' title='CSS Template' subtitle='Variables are available, this a {{mustache}} template' className='stream-layout'>
            <CodeEditor
                language='css'
                readOnly={c.readonly}
                value={c.cssTemplate}
                dispatchChange={setStreamCssTemplate}
            />
        </ExpandableSection>
    </>
}

function StreamAdvancedEditor() {
    const { in: { layouts }, out: { data } } = useSelector(getStream);
    const { layoutId } = useParams();
    const c = layouts[layoutId];
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    if (!c) return <></>

    function InputRow(label: string, value: string, setValueAction: (value: string) => any): React.ReactNode {
        return <tr>
            <td><label htmlFor={`stream-layout-${label}`}>{label}</label></td>
            <td><input
                id={`stream-layout-${label}`}
                type='text'
                value={value}
                readOnly={c.readonly}
                onClick={(e) => { e.stopPropagation() }}
                onChange={(e) => {
                    e.stopPropagation();
                    dispatch(setValueAction(e.target.value))
                }}
            /></td>
        </tr>
    }

    return <section>
        <h1>Editing Layout - {c.name}
            <button title='Click to switch to Basic Editor if you just want to select the background' className='stream-editor-button' onClick={() => dispatch(setStreamAdvanced(false))}>Advanced</button>
        </h1>
        <table className='stream-layout-data-table'>
            {InputRow('Name', c.name, setStreamName(navigate, layoutId))}
            {InputRow('Author', c.author, setStreamAuthor(layoutId))}
            <tr><td/><td><button title='This layout is Read Only, click here to clone it to be able to modify your own version' onClick={() => dispatch(cloneStreamLayout(navigate, layoutId))}>Clone</button></td></tr>
        </table>
        <div className='flex'>
            <StreamBackgroundChooser layoutId={layoutId} />
            <SortableTabularSection
                selector={STREAM_TABULAR_VARIABLES}
                afterSearch={[ { button: 'Add', dispatch: () => addStreamUserVariable(false) } ]}
            />
            <SortableTabularSection
                selector={STREAM_TABULAR_IMAGES}
                itemHeight={50}
                afterSearch={[ { button: 'Add', dispatch: () => addStreamUserVariable(true) } ]}
            />
            <ExpandableSection selector='StreamEditor-preview' title='Preview' subtitle='Preview your layout'>
                <StreamViewLayout id={'stream-preview'} layoutId={layoutId} single={{ data: data.data, layout: c}} />
            </ExpandableSection>
            <StreamLayoutEditor />
        </div>
    </section>
}

export default StreamAdvancedEditor
