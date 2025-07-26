
import React from "react"
import { useSelector } from "react-redux"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES } from "../../application/state/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { getStreamAdvancedEditor, getStreamData, getStreamLayout, getStreamShowingLayoutId } from "../../application/selectors/stream"
import { clearStreamLayoutAlias, cloneStreamLayout, setStreamAdvanced, setStreamAuthor, setStreamCssTemplate, setStreamFormulaJavaScript, setStreamHtmlTemplate, setStreamName, addStreamUserImage, setStreamShowingLayoutId } from "../../application/actions/stream"
import ExpandableSection from "../common/ExpandableSection2"
import StreamViewLayout from "./StreamViewLayout"
import CodeEditor from "./CodeEditor"
import StreamBackgroundChooser from "./StreamBackground"
import { NavigateFunction, useNavigate, useParams } from "react-router-dom"
import { useAppDispatch } from "../../application/store"
import { TabId } from "../../application/state/navigation"
import { navigateToTab } from "../../application/actions/navigation"
import ImgButton from "../common/ImgButton"
import { StreamRenderData, StreamSavedLayout } from "../../../stream/data"
import { savedToExportLayout } from "../../../stream/data.convert"

function StreamLayoutEditor({ layoutId }: { layoutId: string }) {
    const { layout: c } = useSelector(getStreamLayout(layoutId))
    const data: StreamRenderData | undefined = useSelector(getStreamData)
    if (!c) return <></>

    const error = data?.layoutData[layoutId]?.['!error'] as string | undefined;
    return <>
        <ExpandableSection selector='StreamEditor-layout-formula' title='Formulas JavaScript' subtitle='Custom variables calculation' className='stream-layout'>
            <CodeEditor
                language='javascript'
                readOnly={c.readonly ?? false}
                value={c.formulaJavaScript ?? ''}
                dispatchChange={setStreamFormulaJavaScript(layoutId)}
            />
            {error && <p>{error}</p>}
        </ExpandableSection>
        <ExpandableSection selector='StreamEditor-layout-html' title='HTML Template' subtitle='Variables are available, this a {{mustache}} template' className='stream-layout'>
            <CodeEditor
                language='html'
                readOnly={c.readonly ?? false}
                value={c.htmlTemplate ?? ''}
                dispatchChange={setStreamHtmlTemplate(layoutId)}
            />
        </ExpandableSection>
        <ExpandableSection selector='StreamEditor-layout-css' title='CSS Template' subtitle='Variables are available, this a {{mustache}} template' className='stream-layout'>
            <CodeEditor
                language='css'
                readOnly={c.readonly ?? false}
                value={c.cssTemplate ?? ''}
                dispatchChange={setStreamCssTemplate(layoutId)}
            />
        </ExpandableSection>
    </>
}

function StreamEditor({ layoutId: parmlayoutId }: { layoutId: string }) {
    const { layout, id: layoutId, shouldClearAlias } = useSelector(getStreamLayout(parmlayoutId))
    const advanced = useSelector(getStreamAdvancedEditor)
    const { commonData, layoutData } = useSelector(getStreamData) ?? { commonData: {}, layoutData: {} }
    const showingLayoutId = useSelector(getStreamShowingLayoutId)
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    if (shouldClearAlias) dispatch(clearStreamLayoutAlias)
    if (!layout) return <></>

    if (showingLayoutId !== layoutId) {
        dispatch(setStreamShowingLayoutId(layoutId))
    }
    
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
        <h1 className='img-container-hover'>
            <ImgButton title='Back to list' src='img/left.png' beforeText={`Editing Layout - ${layout.name}`} show={true} dispatch={(n: NavigateFunction) => navigateToTab(n, TabId.STREAM)}/>
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
                    { InputCells('Name', layout.name, setStreamName(layoutId)) }
                    <td>
                        <button style={{ visibility: advanced ? 'visible' : 'hidden' }}
                            title={layout.readonly ? 'This layout is Read Only, click here to clone it to be able to modify your own version' : 'Click here to clone this layout to be able to modify your own version'}
                            onClick={() => dispatch(cloneStreamLayout(navigate, layoutId))}
                        >Clone</button>
                        <button style={{ visibility: advanced ? 'visible' : 'hidden' }}
                            title='Click here to export this layout to a file'
                            onClick={() => downloadExport(layout)}
                        >Export</button>
                    </td>
                </tr>
                <tr>{ InputCells('Author', layout.author, setStreamAuthor(layoutId)) }</tr>
                <tr>
                    <td><label>Last Modified</label></td>
                    <td><input type='text' value={new Date(layout.lastModified).toLocaleString()} readOnly /></td>
                </tr>
            </tbody>
        </table>
        <div className='flex'>
            <StreamBackgroundChooser layoutId={layoutId} />
            { advanced && <>
                <SortableTabularSection
                    selector={STREAM_TABULAR_VARIABLES}
                />
                <SortableTabularSection
                    selector={STREAM_TABULAR_IMAGES}
                    itemHeight={50}
                    afterSearch={ () => [ { button: 'Add', dispatch: () => addStreamUserImage(layoutId) } ]}
                />
            </>}
            <ExpandableSection selector='StreamEditor-preview' title='Preview' subtitle='Preview your layout'>
                <StreamViewLayout id={'stream-preview'} layoutId={layoutId} single={{ data: { ...commonData, ...layoutData[layoutId] }, layout}} />
            </ExpandableSection>
            { advanced && <StreamLayoutEditor layoutId={layoutId} /> }
        </div>
    </section>
}

function downloadExport(layout: StreamSavedLayout) {
    const exportableData = savedToExportLayout(layout)
    const data = JSON.stringify(exportableData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layout.name.replace(/\s/g, '_')}.entropiaflow.layout.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default StreamEditor
