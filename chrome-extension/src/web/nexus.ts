import { fetchJson } from "./fetch";
import { mapResponse } from "./loader";
import { IWebSource, SourceLoadResponse } from "./sources";
import { BlueprintWebData, BlueprintWebMaterial, ItemUsageWebData, ItemWebData, RawMaterialWebData } from "./state";

export class EntropiaNexus implements IWebSource {
    public name: string = "Entropia Nexus";

    public async loadItem(itemName: string, bpMaterial?: BlueprintWebMaterial): Promise<SourceLoadResponse<ItemWebData>> {
        let item: SourceLoadResponse<ItemWebData>
        if (bpMaterial?.url?.startsWith(API_BASE_URL)) {
            item = {
                ok: true,
                data: {
                    name: bpMaterial.name,
                    type: bpMaterial.type,
                    value: bpMaterial.value
                },
                url: bpMaterial.url
            }
        } else {
            const url = _apiUrl(`items/${itemName}`)
            item = await mapResponse(fetchJson<EntropiaNexusItem>(url), _extractItem(itemName))
        }
        if (item.ok && item.data.type === 'Material') {
            const r = await fetchJson<EntropiaNexusItem>(item.url)
            if (r.ok) {
                item.data.type = r.result.Properties.Type
            }
            item.url = _wwwUrl(`items/materials/${itemName}`)
        }
        return item
    }

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        const url = _apiUrl(`acquisition/${materialName}`)
        return await mapResponse(fetchJson<EntropiaNexusAcquisition>(url), _extractRawMaterials(materialName))
    }

    public async loadUsage(itemName: string): Promise<SourceLoadResponse<ItemUsageWebData>> {
        const url = _apiUrl(`usage/${itemName}`)
        return await mapResponse(fetchJson<EntropiaNexusUsage>(url), _extractUsage(itemName))
    }

    public async loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>> {
        bpName = bpName.replace('(C) ', '')
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

const _extractItem = (itemName: string) => async (m: EntropiaNexusItem): Promise<SourceLoadResponse<ItemWebData>> => ({
    ok: true,
    data: {
        name: m.Name,
        type: m.Properties.Type,
        value: m.Properties.Economy.Value,
    },
    url: _apiUrl(m.Links.$Url)
})

const _extractUsage = (itemName: string) => async (u: EntropiaNexusUsage): Promise<SourceLoadResponse<ItemUsageWebData>> => ({
    ok: true,
    data: {
        blueprints: u.Blueprints.map(_extractBlueprintData),
        refinings: u.RefiningRecipes.map(m => ({
            ingredients: m.Ingredients.map(m => ({
                name: m.Item.Name,
                quantity: m.Amount
            })),
            product: {
                name: m.Product.Name,
                quantity: m.Amount
            }
        }))
    },
    url: _wwwUrl(`items/materials/${itemName}`)
})

const _extractBlueprintData = (bp: EntropiaNexusBlueprint): BlueprintWebData => ({
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
})

const _extractBlueprint = (bpName: string) => async (bp: EntropiaNexusBlueprint): Promise<SourceLoadResponse<BlueprintWebData>> => ({
    ok: true,
    data: _extractBlueprintData(bp),
    url: _wwwUrl(`items/blueprints/${bpName}`)
})

interface EntropiaNexusAcquisition {
    RefiningRecipes: {
        Id: number,
        Ingredients: {
            Amount: number,
            Item: EntropiaNexusItem
        }[]
        Amount: number,
        Product: EntropiaNexusItem,
        Links: EntropiaNexusLinks
    }[]
}

interface EntropiaNexusItem {
    Name: string,
    Properties: {
        Type: string,
        Economy: {
            Value: number
            MaxTT: number
        }
    },
    Links: EntropiaNexusLinks
}

interface EntropiaNexusUsage extends EntropiaNexusAcquisition {
    Blueprints: EntropiaNexusBlueprint[]
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
    Product: EntropiaNexusItem;
    Materials: {
      Amount: number;
      Item: EntropiaNexusItem;
    }[];
    Links: EntropiaNexusLinks;
}

interface EntropiaNexusLinks {
    $Url: string
}
