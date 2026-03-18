
import React, { useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { atom } from "jotai"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_PARAMETERS, STREAM_TABULAR_VARIABLES } from "../../application/state/stream"
import { streamInAtom, streamRenderDataAtom, streamUiAtom, setStreamFormulaJavaScriptAtom, setStreamHtmlTemplateAtom, setStreamCssTemplateAtom, setStreamShowingLayoutIdAtom, setStreamNameAtom, setStreamAdvancedAtom, clearStreamLayoutAliasAtom, addStreamUserImageAtom, addStreamUserParameterAtom, setStreamDescriptionAtom, setStreamRolesAtom } from "../../application/atoms/stream"
import { streamVariablesItemsAtom, streamImagesItemsAtom, streamParametersItemsAtom } from "../../application/atoms/streamTables"
import { createStreamImagesConfig, createStreamParametersConfig, streamVariablesConfig } from "../../application/configs/streamTableConfigs"
import { setStreamUserPartialAtom, removeStreamUserAtom } from "../../application/atoms/stream"
import { JotaiSortableTableSection } from "../common/jotai/JotaiSortableTableSection"
import ExpandableSection from "../common/ExpandableSection"
import StreamViewLayout from "./StreamViewLayout"
import CodeEditor from "./CodeEditor"
import StreamBackgroundChooser from "./StreamBackground"
import { useNavigate } from "react-router-dom"
import { TabId } from "../../application/state/navigation"
import { Role, ROLES, ROLE_LABELS } from "../../application/state/role"
import ImgButton from "../common/ImgButton"
import { StreamSavedLayout } from "../../../stream/data"
import { savedToExportLayout } from "../../../stream/data.convert"

function StreamLayoutEditor({ layoutId }: { layoutId: string }) {
    const streamIn = useAtomValue(streamInAtom)
    const streamRenderData = useAtomValue(streamRenderDataAtom)
    const c = streamIn.layouts[layoutId]
    const setHtmlTemplate = useSetAtom(setStreamHtmlTemplateAtom)
    const setCssTemplate = useSetAtom(setStreamCssTemplateAtom)
    const setFormula = useSetAtom(setStreamFormulaJavaScriptAtom)

    if (!c) return <></>

    const error = streamRenderData.layoutData[layoutId]?.['!error'] as string | undefined;
    return <>
        <ExpandableSection selector='StreamEditor-layout-formula' title='Formulas JavaScript' subtitle='Custom variables calculation' className='stream-layout'>
            <CodeEditor
                language='javascript'
                readOnly={c.readonly ?? false}
                value={c.formulaJavaScript ?? ''}
                dispatchChange={(code) => setFormula(layoutId, code)}
            />
            {error && <p>{error}</p>}
        </ExpandableSection>
        <ExpandableSection selector='StreamEditor-layout-html' title='HTML Template' subtitle='Variables are available, this a {{mustache}} template' className='stream-layout'>
            <CodeEditor
                language='html'
                readOnly={c.readonly ?? false}
                value={c.htmlTemplate ?? ''}
                dispatchChange={(template) => setHtmlTemplate(layoutId, template)}
            />
        </ExpandableSection>
        <ExpandableSection selector='StreamEditor-layout-css' title='CSS Template' subtitle='Variables are available, this a {{mustache}} template' className='stream-layout'>
            <CodeEditor
                language='css'
                readOnly={c.readonly ?? false}
                value={c.cssTemplate ?? ''}
                dispatchChange={(template) => setCssTemplate(layoutId, template)}
            />
        </ExpandableSection>
    </>
}

function StreamEditor({ layoutId }: { layoutId: string }) {
    const streamIn = useAtomValue(streamInAtom)
    const streamUi = useAtomValue(streamUiAtom)
    const streamRenderData = useAtomValue(streamRenderDataAtom)
    const layout = streamIn.layouts[layoutId]
    const advanced = streamIn.advanced
    const showingLayoutId = streamUi.showingLayoutId

    const setShowingLayout = useSetAtom(setStreamShowingLayoutIdAtom)
    const setAdvanced = useSetAtom(setStreamAdvancedAtom)
    const clearAlias = useSetAtom(clearStreamLayoutAliasAtom)
    const setStreamNameAtomSetter = useSetAtom(setStreamNameAtom)
    const addStreamUserImageSetter = useSetAtom(addStreamUserImageAtom)
    const addStreamUserParameterSetter = useSetAtom(addStreamUserParameterAtom)
    const setUserPartial = useSetAtom(setStreamUserPartialAtom)
    const removeUser = useSetAtom(removeStreamUserAtom)
    const cloneLayoutSetter = useSetAtom(atom(
        null,
        (get, set) => {
            // TODO: Implement clone functionality
            console.log('Clone layout - not implemented')
        }
    ))

    const setDescriptionSetter = useSetAtom(setStreamDescriptionAtom)
    const setRolesSetter = useSetAtom(setStreamRolesAtom)

    // Wrapper functions for compatibility
    const setStreamName = (lid: string) => (name: string) => {
        setStreamNameAtomSetter(lid, lid, name)
    }
    const setStreamAuthor = (lid: string) => (author: string) => {
        // TODO: Implement set author
        console.log('Set author - not implemented', lid, author)
    }
    const setStreamDescription = (lid: string) => (description: string) => {
        setDescriptionSetter(lid, description)
    }
    const setStreamRoles = (lid: string) => (rolesStr: string) => {
        const roles = rolesStr.split(',').map(r => r.trim()).filter(r => r.length > 0)
        setRolesSetter(lid, roles)
    }

    // Create table configs with handlers
    const imagesConfig = useMemo(() => createStreamImagesConfig({
        setUserPartial: (lid, itemId, partial) => setUserPartial(lid, itemId, partial),
        removeUser: (lid, itemId) => removeUser(lid, itemId),
        getLayoutId: () => layoutId
    }), [setUserPartial, removeUser, layoutId])

    const parametersConfig = useMemo(() => createStreamParametersConfig({
        setUserPartial: (lid, itemId, partial) => setUserPartial(lid, itemId, partial),
        removeUser: (lid, itemId) => removeUser(lid, itemId),
        getLayoutId: () => layoutId
    }), [setUserPartial, removeUser, layoutId])

    const navigate = useNavigate();

    if (streamIn.layoutAlias?.realLayoutId && streamIn.layoutAlias.urlLayoutId === layoutId) {
        clearAlias()
    }
    if (!layout) return <></>

    if (showingLayoutId !== layoutId) {
        setShowingLayout(layoutId)
    }

    const InputCells = (label: string, value: string, onChange: (value: string) => void): React.ReactNode =>
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
                    onChange(e.target.value)
                }}
            /></td>
        </>

    return <section>
        <h1 className='img-hover-container'>
            <ImgButton title='Back to list' src='img/left.png' beforeText={`Editing Layout - ${layout.name}`} show={true} action={() => { navigate(TabId.STREAM); return true }}/>
            <button
                title={`Click to switch to ${advanced ? 'Basic Editor if you just want to select the background' : "Advanced Editor where you can edit the layout's templates"}`}
                className='stream-editor-button'
                onClick={() => setAdvanced(!advanced)}>
                {advanced ? '⚡ Advanced' : '📋 Basic'}
            </button>
        </h1>
        <table className='stream-layout-data-table'>
            <tbody>
                <tr>
                    { InputCells('Name', layout.name, setStreamName(layoutId)) }
                    <td>
                        <button style={{ visibility: advanced ? 'visible' : 'hidden', marginLeft: '10px' }}
                            title={layout.readonly ? 'This layout is Read Only, click here to clone it to be able to modify your own version' : 'Click here to clone this layout to be able to modify your own version'}
                            onClick={() => { cloneLayoutSetter(); navigate(`${TabId.STREAM}/layout/${layoutId}`) }}
                        >📋 Clone</button>
                        <button style={{ visibility: advanced ? 'visible' : 'hidden' }}
                            title='Click here to export this layout to a file'
                            onClick={() => downloadExport(layout)}
                        >💾 Export</button>
                    </td>
                </tr>
                <tr>{ InputCells('Author', layout.author, setStreamAuthor(layoutId)) }</tr>
                <tr>
                    <td><label>Description</label></td>
                    <td colSpan={2}>
                        <input
                            className='stream-layout-description'
                            type='text'
                            value={layout.description ?? ''}
                            readOnly={layout.readonly}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => { e.stopPropagation(); setStreamDescription(layoutId)(e.target.value) }}
                        />
                    </td>
                </tr>
                <tr>
                    <td><label>Roles</label></td>
                    <td colSpan={2} className='stream-layout-roles'>
                        {ROLES.filter(r => r !== Role.ADVANCED).map(role => (
                            <label key={role}>
                                <input
                                    type='checkbox'
                                    checked={layout.roles?.includes(role) ?? false}
                                    disabled={layout.readonly}
                                    onChange={(e) => {
                                        const current = layout.roles ?? []
                                        const next = e.target.checked
                                            ? [...current, role]
                                            : current.filter(r => r !== role)
                                        setStreamRoles(layoutId)(next.join(', '))
                                    }}
                                />
                                {ROLE_LABELS[role]}
                            </label>
                        ))}
                    </td>
                </tr>
                <tr>
                    <td><label>Last Modified</label></td>
                    <td><input type='text' value={new Date(layout.lastModified).toLocaleString()} readOnly /></td>
                </tr>
            </tbody>
        </table>
        <div className='flex'>
            <StreamBackgroundChooser layoutId={layoutId} />
            { advanced && <>
                <JotaiSortableTableSection
                    selector={STREAM_TABULAR_VARIABLES}
                    title="Variables"
                    subtitle="Available variables to use on template"
                    itemsAtom={streamVariablesItemsAtom}
                    config={streamVariablesConfig}
                />
                <JotaiSortableTableSection
                    selector={STREAM_TABULAR_IMAGES}
                    title="Images"
                    subtitle="Available images to use on template"
                    itemsAtom={streamImagesItemsAtom}
                    config={imagesConfig}
                    itemHeight={50}
                    afterSearch={layout.readonly ? undefined : (
                        <button className="button-option" onClick={() => addStreamUserImageSetter(layoutId)}>
                            Add
                        </button>
                    )}
                    useFixedSizeList={true}
                />
            </>}
            { (advanced || (layout.parameters?.length ?? 0) > 0) && (
                <JotaiSortableTableSection
                    selector={STREAM_TABULAR_PARAMETERS}
                    title="Parameters"
                    subtitle="Available parameters of the layout"
                    itemsAtom={streamParametersItemsAtom}
                    config={parametersConfig}
                    afterSearch={layout.readonly ? undefined : (
                        <button className="button-option" onClick={() => addStreamUserParameterSetter(layoutId)}>
                            Add
                        </button>
                    )}
                    useFixedSizeList={true}
                />
            )}
            <ExpandableSection selector='StreamEditor-preview' title='Preview' subtitle='Preview your layout'>
                <StreamViewLayout id={'stream-preview'} layoutId={layoutId} single={{ data: streamRenderData.commonData, layout }} />
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
