import React, { useCallback } from "react"
import { useSetAtom } from "jotai"
import { addStreamLayoutAtom, importStreamLayoutFromFileAtom, goToTrashAtom } from "../../application/atoms/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { STREAM_TABULAR_CHOOSER } from "../../application/state/stream"
import LayoutRowValueRender from "../common/SortableTabularSection.layoutRender"
import { NavigateFunction, useNavigate } from "react-router-dom"
import { StreamExportLayout } from "../../../stream/data"
import schema from "../../../stream/stream-export-layout.schema.json"
import { Validator } from "jsonschema"

function StreamLayoutChooser() {
    const navigate = useNavigate()
    const addStreamLayout = useSetAtom(addStreamLayoutAtom)
    const importStreamLayout = useSetAtom(importStreamLayoutFromFileAtom)
    const goToTrash = useSetAtom(goToTrashAtom)

    const handleAddLayout = useCallback(() => {
        addStreamLayout('new-layout-' + Date.now(), 'New Layout')
        return true
    }, [addStreamLayout])

    const handleImport = useCallback(() => {
        openFileSelector(navigate, (layout) => importStreamLayout('imported-' + Date.now(), layout))
        return true
    }, [importStreamLayout, navigate])

    const handleTrash = useCallback((data: any) => {
        if (data?.hasTrash) {
            goToTrash()
        }
        return true
    }, [goToTrash])

    return <SortableTabularSection
        selector={STREAM_TABULAR_CHOOSER}
        afterSearch={(data) => [
            { button: '➕ Add', dispatch: () => handleAddLayout() },
            { button: '📥 Import', dispatch: () => handleImport() },
            { button: data?.hasTrash ? '🗑️ Go to Trash' : '🗑️ Empty Trash', dispatch: () => handleTrash(data) }
        ]}
        itemHeight={64}
        useTable={true}
        rowValueRender={LayoutRowValueRender}
   />
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
