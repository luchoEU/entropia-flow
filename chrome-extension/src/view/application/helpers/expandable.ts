import ExpandableState from "../state/expandable"
import { GAME_LOG_TABULAR_TRADE } from "../state/log"

const initialExpandableState: ExpandableState = {
    collapsed: [],
    hidden: ['TabularSection.[log] missing'],
}

const scrollValueForExpandable = (selector: string): string => {
    switch(selector) {
        case `TabularSection.${GAME_LOG_TABULAR_TRADE}`: return 'trade'
        default: return undefined
    }
}

export {
    initialExpandableState,
    scrollValueForExpandable,
}
