import { ADD_SALE, removeActive, REMOVE_ACTIVE, setActives, SOLD_ACTIVE } from "../actions/actives"
import { addPendingChange } from "../actions/sheets"
import { PAGE_LOADED } from "../actions/ui"
import { getActiveList } from "../selectors/actives"
import { ActivesItem, ActivesList, OPERATION_LME_SOLD, OPERATION_ME_SOLD, OPERATION_NB_SOLD } from "../state/actives"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const actives: ActivesList = await api.storage.loadActives()
            if (actives)
                dispatch(setActives(actives))
            break
        }
        case ADD_SALE:
        case REMOVE_ACTIVE: {
            const list: ActivesList = getActiveList(getState())
            await api.storage.saveActives(list)
            break
        }
        case SOLD_ACTIVE: {
            const list: ActivesList = getActiveList(getState())
            const date = action.payload.date
            const item: ActivesItem = list.find((a: ActivesItem) => a.date == date)
            if (item !== undefined) {
                dispatch(addPendingChange(
                    item.operation,
                    sheet => {
                        switch (item.operation) {
                            case OPERATION_ME_SOLD: return sheet.meSold(item.row, item.quantity, item.buyoutFee, item.buyout)
                            case OPERATION_LME_SOLD: return sheet.lmeSold(item.row, item.quantity, item.buyoutFee, item.buyout)
                            case OPERATION_NB_SOLD: return sheet.nbSold(item.row, item.quantity, item.buyoutFee, item.buyout)
                        }
                    },
                    row => [ removeActive(item.date) ]
                ))
                break
            }
        }
    }
}

export default [
    requests
]
