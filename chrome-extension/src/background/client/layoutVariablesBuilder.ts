import { StreamStateVariable } from "../../stream/data";
import { StreamBuilderState, StreamVariablesBuilder } from "./streamVariablesBuilder";

class LayoutVariablesBuilder implements StreamVariablesBuilder {
    public onChanged?: () => Promise<void>

    public getName(): string {
        return 'layout'
    }
    
    public async getVariables(state: StreamBuilderState): Promise<StreamStateVariable[]> {
        if (!state.layouts || !state.showingLayoutId)
            return []

        const layout = state.layouts[state.showingLayoutId]
        if (!layout)
            return []

        const images = layout.images?.map(v => ({
                name: v.name,
                value: v.value,
                description: v.description,
                id: v.id,
                isImage: true
            })) ?? []

        const parameters = layout.parameters?.map(v => ({
                name: v.name,
                value: v.value,
                description: v.description,
                id: v.id,
                isParameter: true
            })) ?? []

        return [...images, ...parameters]
    }
}

export { LayoutVariablesBuilder }
