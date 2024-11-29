import { fetchJson } from "./fetch";
import { mapResponse } from "./loader";
import { IWebSource, SourceLoadResponse } from "./sources";
import { BlueprintWebData, MaterialWebData, RawMaterialWebData } from "./state";

export class EntropiaNexus implements IWebSource {
    public name: string = "Entropia Nexus";

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        const url = _apiUrl(`acquisition/${materialName}`)
        return await mapResponse(fetchJson<EntropiaNexusAcquisition>(url), _extractRawMaterials(materialName))
    }

    public async loadMaterial(materialName: string, materialUrl?: string): Promise<SourceLoadResponse<MaterialWebData>> {
        const url = materialUrl?.startsWith(API_BASE_URL) ? materialUrl : _apiUrl(`materials/${materialName}`)
        return await mapResponse(fetchJson<EntropiaNexusMaterial>(url), _extractMaterial(materialName))
    }

    public async loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>> {
        const url = _apiUrl(`blueprints/${bpName}`)
        return await mapResponse(fetchJson<EntropiaNexusBlueprint>(url), _extractBlueprint(bpName))
    }
}

const API_BASE_URL = 'https://api.entropianexus.com';
const _encodeURI = (href: string) => href.replace(/\(/g, '%28').replace(/\)/g, '%29');
const _apiUrl = (href: string) => href && _encodeURI(new URL(href, API_BASE_URL).href);
const _wwwUrl = (href: string) => href && new URL(href.replace(/ /g, '~'), 'https://entropianexus.com').href;

const _extractRawMaterials = (materialName: string) => async (acq: EntropiaNexusAcquisition): Promise<SourceLoadResponse<RawMaterialWebData[]>> => ({
    ok: true,
    data: acq.RefiningRecipes.length === 0 ? [] :
        acq.RefiningRecipes[0].Ingredients.map((ingredient) => ({
            name: ingredient.Item.Name,
            quantity: ingredient.Amount,
        })),
    url: acq.RefiningRecipes.length > 0 && _wwwUrl(`items/materials/${materialName}`) // maybe it is not a material if no RefiningRecipes
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

const _extractBlueprint = (bplName: string) => async (bp: EntropiaNexusBlueprint): Promise<SourceLoadResponse<BlueprintWebData>> => ({
    ok: true,
    data: {
        name: bp.Name,
        type: bp.Properties.Type,
        level: bp.Properties.Level,
        profession: bp.Profession.Name,
        item: {
            name: bp.Product.Name,
            type: bp.Product.Properties.Type,
            quantity: undefined,
            value: bp.Product.Properties.Economy?.MaxTT ?? 0,
            url: _apiUrl(bp.Product.Links.$Url)
        },
        materials: bp.Materials.map(m => ({
            name: m.Item.Name,
            type: m.Item.Properties.Type,
            quantity: m.Amount,
            value: m.Item.Properties.Economy.MaxTT,
            url: _apiUrl(m.Item.Links.$Url)
        }))
    },
    url: _wwwUrl(`items/blueprints/${bplName}`)
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

interface EntropiaNexusBlueprint {
    Id: number;
    ItemId: number;
    Name: string;
    Properties: {
      Description: string;
      Type: string;
      Level: number;
      IsBoosted: boolean;
      MinimumCraftAmount: number;
      MaximumCraftAmount: number;
      Skill: {
        LearningIntervalStart: number;
        LearningIntervalEnd: number;
        IsSiB: boolean;
      };
    };
    Profession: {
      Name: string;
      Links: EntropiaNexusLinks;
    };
    Book: {
      Name: string;
      Links: EntropiaNexusLinks;
    };
    Product: EntropiaNexusMaterial;
    Materials: {
      Amount: number;
      Item: EntropiaNexusMaterial;
    }[];
    Links: EntropiaNexusLinks;
}

interface EntropiaNexusLinks {
    $Url: string
}
