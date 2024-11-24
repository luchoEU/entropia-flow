import { fetchJson } from "./fetch";
import { mapResponse } from "./loader";
import { IWebSource, SourceLoadResponse } from "./sources";
import { BlueprintWebData, RawMaterialWebData } from "./state";

export class EntropiaNexus implements IWebSource {
    public name: string = "Entropia Nexus";

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        const url = _apiUrl(`acquisition/${encodeURIComponent(materialName)}`)
        return await mapResponse(fetchJson<EntropiaNexusAcquisition>(url), _extractRawMaterials(materialName))
    }

    public async loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>> {
        return { ok: false, errorText: 'not implemented' }
    }
}

const _apiUrl = (href: string) => href && new URL(href, 'https://api.entropianexus.com').href;
const _wwwUrl = (href: string) => href && new URL(href.replace(' ', '~'), 'https://entropianexus.com').href;

const _extractRawMaterials = (materialName: string) => async (acq: EntropiaNexusAcquisition): Promise<SourceLoadResponse<RawMaterialWebData[]>> => ({
    ok: true,
    data: acq.RefiningRecipes.length === 0 ? [] :
        acq.RefiningRecipes[0].Ingredients.map((ingredient) => ({
            name: ingredient.Item.Name,
            quantity: ingredient.Amount,
        })),
    url: _wwwUrl(`items/materials/${materialName}`)
})

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
