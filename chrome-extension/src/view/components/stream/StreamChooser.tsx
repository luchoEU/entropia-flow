import React, { useCallback, useMemo } from "react"
import { useSetAtom, useAtomValue } from "jotai"
import { addStreamLayoutAtom, importStreamLayoutFromFileAtom, goToTrashAtom, streamStateAtom } from "../../application/atoms/stream"
import { STREAM_TABULAR_CHOOSER } from "../../application/state/stream"
import { NavigateFunction, useNavigate } from "react-router-dom"
import { StreamExportLayout } from "../../../stream/data"
import schema from "../../../stream/stream-export-layout.schema.json"
import { Validator } from "jsonschema"
import { JotaiSortableTableSection } from "../common/jotai/JotaiSortableTableSection"
import { streamChooserItemsAtom } from "../../application/atoms/streamTables"
import { streamChooserConfig } from "../../application/configs/streamTableConfigs"

function StreamLayoutChooser() {
    const navigate = useNavigate()
    const addStreamLayout = useSetAtom(addStreamLayoutAtom)
    const importStreamLayout = useSetAtom(importStreamLayoutFromFileAtom)
    const goToTrash = useSetAtom(goToTrashAtom)
    const streamState = useAtomValue(streamStateAtom)

    const handleAddLayout = useCallback(() => {
        addStreamLayout('new-layout-' + Date.now(), 'New Layout')
        return true
    }, [addStreamLayout])

    const handleImport = useCallback(() => {
        openFileSelector(navigate, (layout) => importStreamLayout('imported-' + Date.now(), layout))
        return true
    }, [importStreamLayout, navigate])

    const handleTrash = useCallback(() => {
        const hasTrash = Object.keys(streamState.in.trashLayouts).length > 0
        if (hasTrash) {
            goToTrash()
        }
        return true
    }, [goToTrash, streamState.in.trashLayouts])

    const hasTrash = useMemo(() => {
        return Object.keys(streamState.in.trashLayouts).length > 0
    }, [streamState.in.trashLayouts])

    const afterSearch = useMemo(() => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
            <button className="button-option" onClick={handleAddLayout}>➕ Add</button>
            <button className="button-option" onClick={handleImport}>📥 Import</button>
            <button className="button-option" onClick={handleTrash}>
                {hasTrash ? '🗑️ Go to Trash' : '🗑️ Empty Trash'}
            </button>
        </div>
    ), [handleAddLayout, handleImport, handleTrash, hasTrash])

    return (
        <JotaiSortableTableSection
            selector={STREAM_TABULAR_CHOOSER}
            title="Layouts"
            subtitle="Available layouts"
            itemsAtom={streamChooserItemsAtom}
            config={streamChooserConfig}
            afterSearch={afterSearch}
            itemHeight={64}
        />
    )
}

function openFileSelector(navigate: NavigateFunction, importStreamLayout: (layout: StreamExportLayout) => void) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (event: Event) => handleFileChange(event, navigate, importStreamLayout);
    input.click();
}

function handleFileChange(event: Event, navigate: NavigateFunction, importStreamLayout: (layout: StreamExportLayout) => void) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text) as StreamExportLayout;
                if (data.schema !== 1) {
                    console.error('Unsupported schema version:', data.schema);
                    return;
                }

                const validator = new Validator();
                const result = validator.validate(data, schema);
                if (result.valid) {
                    importStreamLayout(data);
                } else {
                    console.error("Validation errors:", result.errors);
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };

        reader.onerror = (err) => {
        console.error("Error reading file:", err);
        };

        reader.readAsText(file);
    }
}


export default StreamLayoutChooser
