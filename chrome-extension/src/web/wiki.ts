import { fetchJson, fetchText } from "./fetch";
import { mapResponse, SourceMapperOut } from "./loader";
import { IWebSource, SourceLoadResponse } from "./sources";
import { BlueprintWebData, RawMaterialWebData } from "./state";

export class EntropiaWiki implements IWebSource {
    public name: string = "Entropia Wiki"

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        const url = `http://www.entropiawiki.com/Search.aspx?searchtext=${encodeURIComponent(materialName)}&type=go`
        return mapResponse(await fetchText(url), _extractRawMaterials)
    }

    public async loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>> {
        // use server to get from entropiawiki to avoid CORS error
        const url = `https://apps5.genexus.com/entropia-flow-helper-1/rest/BlueprintInfo?name=${encodeURIComponent(bpName)}`
        return mapResponse(await fetchJson<BlueprintWebProxyData>(url), _extractBlueprint)
    }
}

interface BlueprintWebProxyData {
    Name: string
    ItemValue: string
    StatusCode: number
    Url: string
    Text?: string
    Material: BlueprintWebProxyMaterial[]
}

interface BlueprintWebProxyMaterial {
    Name: string
    Quantity: number
    Type: string
    Value: string
}

function _extractBlueprint(bp: BlueprintWebProxyData): SourceMapperOut<BlueprintWebData> {
    return {
        data: {
            itemValue: Number(bp.ItemValue),
            materials: bp.Material.map(m => ({
                name: m.Name,
                type: m.Type,
                quantity: m.Quantity,
                value: Number(m.Value)
            }))
        },
        url: bp.Url
    }
}

function _extractRawMaterials(html: string): SourceMapperOut<RawMaterialWebData[]> {
    const materials: RawMaterialWebData[] = [];
    
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');
    const table = document.querySelector('table.Grid');
    if (table) {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (index === 0) return; // Skip the header row

            const columns = row.querySelectorAll('td');
            if (columns.length >= 4) {
                const name = columns[1]?.textContent?.trim() || "";
                const quantity = parseFloat(columns[2]?.textContent?.trim() || "0");

                if (name) {
                    materials.push({
                        name,
                        quantity,
                    });
                }
            }
        });
    }

    return {
        data: materials,
        url: undefined
    };
}
