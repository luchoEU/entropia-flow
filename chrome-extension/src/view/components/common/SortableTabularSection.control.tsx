import { RowValue } from "./SortableTabularSection.data"

const getSwitchButton = (button: string, description: string, enabled: boolean, dispatch: () => any, sub?: RowValue[]): RowValue => sub ? {
    button,
    class: `button-option-switch ${enabled ? 'active' : ''}`,
    sub: [ {
        button, 
        title: `${description} ${enabled ? '[ON]': '[OFF]'}, click to ${enabled ? 'dis' : 'en'}able it`,
        dispatch,
    }, ...sub]
} : {
    button,
    class: `button-option-switch ${enabled ? 'active' : ''}`,
    title: `${description} ${enabled ? '[ON]': '[OFF]'}, click to ${enabled ? 'dis' : 'en'}able it`,
    dispatch,
}

export {
    getSwitchButton
}
