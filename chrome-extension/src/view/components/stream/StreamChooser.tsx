import React from "react"
import { Dispatch } from "react"
import { addStreamLayout, importStreamLayoutFromFile } from "../../application/actions/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { STREAM_TABULAR_CHOOSER } from "../../application/state/stream"
import LayoutRowValueRender from "../common/SortableTabularSection.layoutRender"
import { NavigateFunction } from "react-router-dom"
import { StreamExportLayout } from "../../../stream/data"
import schema from "../../../stream/stream-export-layout.schema.json"
import { Validator } from "jsonschema"

function StreamLayoutChooser() {
    return <SortableTabularSection
        selector={STREAM_TABULAR_CHOOSER}
        afterSearch={[
            { button: 'Add', dispatch: (n: NavigateFunction) => addStreamLayout(n) },
            { button: 'Import', dispatch: (n: NavigateFunction, d: Dispatch<any>) => { openFileSelector(n, d); return undefined } }
        ]}
        itemHeight={64}
        useTable={true}
        rowValueRender={LayoutRowValueRender}
   />
}

function openFileSelector(n: NavigateFunction, dispatch: Dispatch<any>) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (event: Event) => handleFileChange(event, n, dispatch);
    input.click();
}

function handleFileChange(event: Event, n: NavigateFunction, dispatch: Dispatch<any>) {
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
                    dispatch(importStreamLayoutFromFile(data, n));
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
