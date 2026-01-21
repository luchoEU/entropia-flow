import { NavigateFunction, NavigateOptions } from "react-router-dom"
import { TabId } from "../state/navigation"
import { formatToUrl } from "../helpers/navigation"
import { getLocationFromTabId } from "../helpers/navigation"

const navigateTo = (navigate: NavigateFunction, url: string, options?: NavigateOptions) => async () => navigate(url, options)
const navigateToTab = (navigate: NavigateFunction, tab: TabId) => async () => navigate(getLocationFromTabId(tab))

const craftBlueprintUrl = (bpName: string): string => `${TabId.CRAFT}/${formatToUrl(bpName)}`
const streamEditorUrl = (layoutId: string): string => `${TabId.STREAM}/layout/${layoutId}`
const streamTrashUrl = (): string => `${TabId.STREAM}/trash`
const budgetItemUrl = (itemName: string): string => `${TabId.BUDGET}/${formatToUrl(itemName)}`
const budgetItemMaterialUrl = (itemName: string, materialName: string): string => `${TabId.BUDGET}/${formatToUrl(itemName)}/${formatToUrl(materialName)}`

export {
    navigateTo,
    navigateToTab,
    craftBlueprintUrl,
    streamEditorUrl,
    streamTrashUrl,
    budgetItemUrl,
    budgetItemMaterialUrl
}
