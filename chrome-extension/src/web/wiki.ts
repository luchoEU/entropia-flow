import { fetchText } from "./fetch";
import { mapResponse } from "./loader";
import { IWebSource, SourceLoadResponse } from "./sources";
import { RawMaterialWebData } from "./state";

export class EntropiaWiki implements IWebSource {
    public name: string = "Entropia Wiki"

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        const url = `http://www.entropiawiki.com/Search.aspx?searchtext=${encodeURIComponent(materialName)}&type=go`
        return mapResponse(await fetchText(url), _extractRawMaterials)
    }
}

function _extractRawMaterials(html: string): RawMaterialWebData[] {
    const materials: RawMaterialWebData[] = [];
    
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');
    const table = document.querySelector('table.Grid');
    if (!table) return materials;

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

    return materials;
}
