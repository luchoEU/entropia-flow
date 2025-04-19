
import React from "react"
import { useSelector } from "react-redux"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES } from "../../application/state/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { getStreamAdvancedEditor, getStreamData, getStreamIn, getStreamLayout } from "../../application/selectors/stream"
import { addStreamUserVariable, cloneStreamLayout, setStreamAdvanced, setStreamAuthor, setStreamCssTemplate, setStreamHtmlTemplate, setStreamName } from "../../application/actions/stream"
import ExpandableSection from "../common/ExpandableSection2"
import StreamViewLayout from "./StreamViewLayout"
import CodeEditor from "./CodeEditor"
import StreamBackgroundChooser from "./StreamBackground"
import { NavigateFunction, useNavigate, useParams } from "react-router-dom"
import { useAppDispatch } from "../../application/store"
import { TabId } from "../../application/state/navigation"
import { navigateToTab } from "../../application/actions/navigation"
import ImgButton from "../common/ImgButton"

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

function StreamEditor({ layoutId }: { layoutId: string }) {
    const layout = useSelector(getStreamLayout(layoutId))
    const advanced = useSelector(getStreamAdvancedEditor)
    const data = useSelector(getStreamData);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    if (!layout) return <></>

    const InputCells = (label: string, value: string, setValueAction: (value: string) => any): React.ReactNode =>
        <>
            <td><label htmlFor={`stream-layout-${label}`}>{label}</label></td>
            <td><input
                id={`stream-layout-${label}`}
                type='text'
                value={value}
                readOnly={layout.readonly}
                onClick={(e) => { e.stopPropagation() }}
                onChange={(e) => {
                    e.stopPropagation();
                    dispatch(setValueAction(e.target.value))
                }}
            /></td>
        </>

    return <section>
        <h1 className='img-hover'>
            <ImgButton title='Back to list' src='img/left.png' beforeText={`Editing Layout - ${layout.name}`} dispatch={(n: NavigateFunction) => navigateToTab(n, TabId.STREAM)}/>
            <button
                title={`Click to switch to ${advanced ? 'Basic Editor if you just want to select the background' : "Advanced Editor where you can edit the layout's templates"}`}
                className='stream-editor-button'
                onClick={() => dispatch(setStreamAdvanced(!advanced))}>
                {advanced ? 'Advanced' : 'Basic'}
            </button>
        </h1>
        <table className='stream-layout-data-table'>
            <tbody>
                <tr>
                    { InputCells('Name', layout.name, setStreamName(navigate, layoutId)) }
                    <td>
                        <button style={{ float: 'right', visibility: advanced ? 'visible' : 'hidden' }}
                            title={layout.readonly ? 'This layout is Read Only, click here to clone it to be able to modify your own version' : 'Click here to clone this layout to be able to modify your own version'}
                            onClick={() => dispatch(cloneStreamLayout(navigate, layoutId))}
                        >Clone</button>
                    </td>
                </tr>
                <tr>{ InputCells('Author', layout.author, setStreamAuthor(layoutId)) }</tr>                
            </tbody>
        </table>
        <div className='flex'>
            <StreamBackgroundChooser layoutId={layoutId} />
            { advanced && <>
                <SortableTabularSection
                    selector={STREAM_TABULAR_VARIABLES}
                    afterSearch={[ { button: 'Add', dispatch: () => addStreamUserVariable(false) } ]}
                />
                <SortableTabularSection
                    selector={STREAM_TABULAR_IMAGES}
                    itemHeight={50}
                    afterSearch={[ { button: 'Add', dispatch: () => addStreamUserVariable(true) } ]}
                />
            </>}
            <ExpandableSection selector='StreamEditor-preview' title='Preview' subtitle='Preview your layout'>
                <StreamViewLayout id={'stream-preview'} layoutId={layoutId} single={{ data, layout}} />
            </ExpandableSection>
            { advanced && <StreamLayoutEditor /> }
        </div>
    </section>
}

export default StreamEditor
