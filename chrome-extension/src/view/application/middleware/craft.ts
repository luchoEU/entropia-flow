import { addBlueprintData, ADD_BLUEPRINT } from "../actions/craft"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case ADD_BLUEPRINT: {
            let name = action.payload.name.replaceAll(' ','%20')
            let url = `https://apps5.genexus.com/entropia-flow-helper/rest/BlueprintInfo?name=${name}`
            let response = await fetch(url)
            let data = await response.json()
            dispatch(addBlueprintData(data))
            break
        }
    }
}

export default [
    requests
]