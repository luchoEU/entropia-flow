import { BluprintWebData } from "../state/craft"

const ADD_BLUEPRINT = "[craft] add blueprint"
const ADD_BLUEPRINT_DATA = "[craft] add blueprint data"
const SET_BLUEPRINT_QUANTITY = "[craft] set blueprint quantity"

const addBlueprint = (name: string) => ({
    type: ADD_BLUEPRINT,
    payload: {
        name
    }
})

const addBlueprintData = (data: BluprintWebData) => ({
    type: ADD_BLUEPRINT_DATA,
    payload: {
        data
    }
})

const setBlueprintQuantity = (dictionary: { [k: string]: number }) => ({
    type: SET_BLUEPRINT_QUANTITY,
    payload: {
        dictionary
    }
})

export {
    ADD_BLUEPRINT,
    ADD_BLUEPRINT_DATA,
    SET_BLUEPRINT_QUANTITY,
    addBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
}
