import { fetchText } from "./fetch";
import { mapResponse } from "./loader";
import { IWebSource, NOT_IMPLEMENTED, SourceLoadResponse } from "./sources";
import { BlueprintWebData, BlueprintWebMaterial, MaterialWebData, RawMaterialWebData } from "./state";

export class EntropiaWiki implements IWebSource {
    public name: string = "Entropia Wiki"

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        return _loadFromSearch(materialName, _extractRawMaterials)
    }

    public async loadMaterial(materialName: string): Promise<SourceLoadResponse<MaterialWebData>> {
        return NOT_IMPLEMENTED
    }

    public async loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>> {
        return _loadFromSearch(bpName, _extractBlueprint)
    }
}

async function _loadFromSearch<T>(text: string, mapper: (html: string) => Promise<SourceLoadResponse<T>>): Promise<SourceLoadResponse<T>> {
    const url = _url(`Search.aspx?searchtext=${encodeURIComponent(text)}&type=go`)
    return mapResponse(fetchText(url), mapper)
}

const _url = (href: string) => href && new URL(href, 'http://www.entropiawiki.com').href;

async function _extractBlueprint(html: string): Promise<SourceLoadResponse<BlueprintWebData>> {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    const table = document.querySelector('#ctl00_ContentPlaceHolder1_InfoList');
    if (!table) {
        const link = document.querySelector("a[href^='Info.aspx?chart=Blueprint']") as HTMLAnchorElement;
        if (link) {
            const url = _url(link.getAttribute('href'))
            return await mapResponse(fetchText(url), _extractBlueprint)
        }
        return { ok: false, errorText: 'Content table not found' }
    }

    const bpName = document.querySelector('#ctl00_ContentPlaceHolder1_PageContents_PageTitle')?.textContent?.trim();

    const infoMap = Object.fromEntries(
        Array.from(table.querySelectorAll("td.IH"))
            .map(td => [td.textContent?.trim(), td.nextElementSibling?.textContent?.trim()]));

    const rows = document.querySelectorAll("table.Grid tr");
    const materials: BlueprintWebMaterial[] = Array.from(rows).map((row) => {
        const link = row.querySelector("a[href^='Info.aspx?chart=Material']") as HTMLAnchorElement;
        if (link) {
            const data = Array.from(row.querySelectorAll("td")).map(td => td.textContent?.trim() || ""); // Extract the data from all <td> elements in this <tr>
            const quantity = Number(data[2])
            const value = Math.round(10000 * Number(data[3]) / quantity) / 10000
            return { name: data[1], type: 'Material', quantity, value, url: _url(link.getAttribute('href')) };
        }
        return null;
    }).filter(item => item !== null)

    if (materials.length == 0) {
        return { ok: false, errorText: 'No materials found' }
    }

    return {
        ok: true,
        data: {
            name: bpName?.replace(/^Blueprint:\s*/, ''),
            type: infoMap['Type:'],
            level: Number(infoMap['Level:']),
            profession: infoMap['Profession:'],
            itemName: infoMap['Item:'],
            itemValue: Number(infoMap['Item value:']?.match(/\d+/)?.[0]),
            materials
        },
        url: _url(document.querySelector('form')?.getAttribute('action'))
    };

/* TODO get type from material
    &httpclient.Execute("GET", &material.Url)
    if &httpclient.StatusCode = 200
        &itemHtml = &httpclient.ToString()
        
        &beforeIndex = &itemHtml.IndexOf("Specifications")
        &beforeIndex = &itemHtml.IndexOf(">Type:</span>", &beforeIndex)
        &beforeIndex = &itemHtml.IndexOf('">', &beforeIndex)
        &afterIndex = &itemHtml.IndexOf('</td', &beforeIndex)
        &material.Type = trim(&itemHtml.Substring(&beforeIndex + 2, &afterIndex - &beforeIndex - 2))
        
        &beforeIndex = &itemHtml.IndexOf(">Value:</span>", &afterIndex)
        &beforeIndex = &itemHtml.IndexOf('">', &beforeIndex)
        &afterIndex = &itemHtml.IndexOf('PED</td', &beforeIndex)
        &material.Value = trim(&itemHtml.Substring(&beforeIndex + 2, &afterIndex - &beforeIndex - 2))
    endif
    */
}

async function _extractRawMaterials(html: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
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
        ok: true,
        data: materials
    };
}
