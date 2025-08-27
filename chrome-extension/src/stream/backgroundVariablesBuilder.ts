import { StreamBuilderState, StreamVariablesBuilder } from "../background/client/streamVariablesBuilder"
import { BackgroundType, getBackgroundSpec, getLogoUrl } from "./background"
import { StreamStateVariable } from "./data"

class BackgroundVariablesBuilder implements StreamVariablesBuilder {
    public onChanged?: () => Promise<void>

    public getName(): string {
        return 'background'
    }

    public async getVariables(state: StreamBuilderState): Promise<StreamStateVariable[]> {
        let t: BackgroundType | undefined = undefined
        if (state.layouts && state.showingLayoutId) {
            t = state.layouts[state.showingLayoutId]?.backgroundType
        }
        return [
            { name: 'backDark', value: t ? getBackgroundSpec(t)?.dark ?? false : false, description: 'background is dark' },
            { name: 'logoUrl', value: '=IF(backDark, img.logoWhite, img.logoBlack)', description: 'logo url' },
            { name: 'logoWhite', value: getLogoUrl(true), isImage: true },
            { name: 'logoBlack', value: getLogoUrl(false), isImage: true }
        ]
    }
}

export { BackgroundVariablesBuilder }
