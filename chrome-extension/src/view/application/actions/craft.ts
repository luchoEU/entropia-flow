import { BluprintWebData } from "../state/craft"

const ADD_BLUEPRINT = "[craft] add blueprint"
const ADD_BLUEPRINT_DATA = "[craft] add blueprint data"

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

export {
    ADD_BLUEPRINT,
    ADD_BLUEPRINT_DATA,
    addBlueprint,
    addBlueprintData,
}
