import { fetchJson } from "./fetch";
import { mapResponse } from "./loader";
import { IWebSource, NOT_IMPLEMENTED, SourceLoadResponse } from "./sources";
import { BlueprintWebData, MaterialWebData, RawMaterialWebData } from "./state";

export class EntropiaNexus implements IWebSource {
    public name: string = "Entropia Nexus";

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        const url = _apiUrl(`acquisition/${encodeURIComponent(materialName)}`)
        return await mapResponse(fetchJson<EntropiaNexusAcquisition>(url), _extractRawMaterials(materialName))
    }

    public async loadMaterial(materialName: string): Promise<SourceLoadResponse<MaterialWebData>> {
        const url = _apiUrl(`materials/${encodeURIComponent(materialName)}`)
        return await mapResponse(fetchJson<EntropiaNexusMaterial>(url), _extractMaterial(materialName))
    }

    public async loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>> {
        return NOT_IMPLEMENTED
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

const _extractMaterial = (materialName: string) => async (m: EntropiaNexusMaterial): Promise<SourceLoadResponse<MaterialWebData>> => ({
    ok: true,
    data: {
        name: m.Name,
        type: m.Properties.Type,
        value: m.Properties.Economy.MaxTT
    },
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
