import { NavigateFunction, NavigateOptions } from "react-router-dom"
import { TabId } from "../state/navigation"
import { formatBlueprintToUrl } from "../helpers/navigation"

const navigateTo = (navigate: NavigateFunction, url: string, options?: NavigateOptions) => async () => navigate(url, options)

const craftBlueprintUrl = (bpName: string): string => `${TabId.CRAFT}/${formatBlueprintToUrl(bpName)}`
const streamEditorUrl = (layoutId: string): string => `${TabId.STREAM}/${layoutId}`

export {
    navigateTo,
    craftBlueprintUrl,
    streamEditorUrl,
}
