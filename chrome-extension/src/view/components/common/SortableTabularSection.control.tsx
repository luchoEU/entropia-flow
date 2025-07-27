import { RowValue } from "./SortableTabularSection.data"

const getSwitchButton = (button: string, description: string, enabled: boolean, dispatch: () => any): RowValue => ({
    button,
    class: `button-option-switch ${enabled ? 'active' : ''}`,
    title: `${description} ${enabled ? '[ON]': '[OFF]'}, click to ${enabled ? 'dis' : 'en'}able it`,
    dispatch,
})

export {
    getSwitchButton
}
