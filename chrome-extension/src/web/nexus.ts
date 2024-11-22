import { fetchJson } from "./fetch";
import { mapResponse, SourceMapperOut } from "./loader";
import { IWebSource, SourceLoadResponse } from "./sources";
import { BlueprintWebData, RawMaterialWebData } from "./state";

export class EntropiaNexus implements IWebSource {
    public name: string = "Entropia Nexus";

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        const url = `https://api.entropianexus.com/acquisition/${encodeURIComponent(materialName)}`
        return mapResponse(await fetchJson<EntropiaNexusAcquisition>(url), _extractRawMaterials)
    }

    public async loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>> {
        return { ok: false, errorText: 'not implemented' }
    }
}

function _extractRawMaterials(acq: EntropiaNexusAcquisition): SourceMapperOut<RawMaterialWebData[]> {
    return {
        data: acq.RefiningRecipes.length === 0 ? [] :
            acq.RefiningRecipes[0].Ingredients.map((ingredient) => ({
                name: ingredient.Item.Name,
                quantity: ingredient.Amount,
            })),
        url: acq.RefiningRecipes.length > 0 && acq.RefiningRecipes[0].Links.$Url
    }
}

interface EntropiaNexusAcquisition {
    RefiningRecipes: {
        Id: number,
        Ingredients: {
            Amount: number,
            Item: EntropiaNexusMaterial
        }[]
        Amount: number,
        Product: EntropiaNexusMaterial,
        Links: EntropiaNexusLinks
    }[]
}

interface EntropiaNexusMaterial {
    Name: string,
    Properties: {
        Type: string,
        Economy: {
            MaxTT: number
        }
    },
    Links: EntropiaNexusLinks
}

interface EntropiaNexusLinks {
    "$Url": string
}
