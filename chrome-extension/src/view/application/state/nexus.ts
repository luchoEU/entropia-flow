import { EntropiaSiteRequestMap } from "./site"

interface EntropiaNexusState {
    acquisition: EntropiaSiteRequestMap<{
        "RefiningRecipes": {
            "Id": number,
            "Ingredients": {
                "Amount": number,
                "Item": EntropiaNexusMaterial
            }[]
            "Amount": number,
            "Product": EntropiaNexusMaterial,
            "Links": EntropiaNexusLinks
        }[]
    }>
}

interface EntropiaNexusMaterial {
    "Name": string,
    "Properties": {
        "Type": string,
        "Economy": {
            "MaxTT": number
        }
    },
    "Links": EntropiaNexusLinks
}

interface EntropiaNexusLinks {
    "$Url": string
}

export {
    EntropiaNexusState
}
