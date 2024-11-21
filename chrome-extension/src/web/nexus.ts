import { fetchJson } from "./fetch";
import { mapResponse } from "./loader";
import { IWebSource, SourceLoadResponse } from "./sources";
import { RawMaterialWebData } from "./state";

export class EntropiaNexus implements IWebSource {
    public name: string = "Entropia Nexus";

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        const url = `https://api.entropianexus.com/acquisition/${encodeURIComponent(materialName)}`
        return mapResponse(await fetchJson<EntropiaNexusAcquisition>(url), _extractRawMaterials)
    }
}

function _extractRawMaterials(data: EntropiaNexusAcquisition): RawMaterialWebData[] {
    return data.RefiningRecipes.length === 0 ? [] :
        data.RefiningRecipes[0].Ingredients.map((ingredient) => ({
            name: ingredient.Item.Name,
            quantity: ingredient.Amount,
        }));
}

interface EntropiaNexusAcquisition {
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
