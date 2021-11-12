import { PAGE_LOADED } from "../actions/ui";
import { selectMenu, SELECT_MENU } from "../actions/menu";

const pageLoadedFlow = ({ api }) => ({ dispatch }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const menu = await api.storage.loadMenu()
            if (menu)
                dispatch(selectMenu(menu))
            break
        }
        case SELECT_MENU: {
            const menu = action.payload.menu
            await api.storage.saveMenu(menu)
            break
        }
    }
}

export default [
    pageLoadedFlow
]