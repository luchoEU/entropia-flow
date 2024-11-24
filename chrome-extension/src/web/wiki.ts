import { fetchText } from "./fetch";
import { mapResponse, SourceMapperOut } from "./loader";
import { IWebSource, SourceLoadResponse } from "./sources";
import { BlueprintWebData, BlueprintWebMaterial, RawMaterialWebData } from "./state";

export class EntropiaWiki implements IWebSource {
    public name: string = "Entropia Wiki"

    public async loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>> {
        return _loadFromSearch(materialName, _extractRawMaterials)
    }

    public async loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>> {
        return _loadFromSearch(bpName, _extractBlueprint)
    }
}

async function _loadFromSearch<T>(text: string, mapper: (html: string) => SourceMapperOut<T>): Promise<SourceLoadResponse<T>> {
    const url = _url(`Search.aspx?searchtext=${encodeURIComponent(text)}&type=go`)
    return mapResponse(await fetchText(url), mapper)
}

const _url = (href: string) => href && new URL(href, 'http://www.entropiawiki.com').href;

function _extractBlueprint(html: string): SourceMapperOut<BlueprintWebData> {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');
    const url = _url(document.querySelector('form')?.getAttribute('action'));

    const table = document.querySelector('#ctl00_ContentPlaceHolder1_InfoList');
    if (!table) {
        return { errorText: 'Content table not found', url }
    }

    const itemValueText = Array.from(table.querySelectorAll("td.IH span"))
        .find(span => span.textContent?.trim() === "Item value:")
        ?.closest("td")?.nextElementSibling?.textContent?.trim();
    if (!itemValueText) {
        return { errorText: 'Item value not found', url }
    }

    const itemValue = Number(itemValueText.match(/\d+/)?.[0]);

    const rows = document.querySelectorAll("table.Grid tr");
    const materials: BlueprintWebMaterial[] = Array.from(rows).map((row) => {
        const link = row.querySelector("a[href^='Info.aspx?chart=Material']") as HTMLAnchorElement;
        if (link) {
            const data = Array.from(row.querySelectorAll("td")).map(td => td.textContent?.trim() || ""); // Extract the data from all <td> elements in this <tr>
            const quantity = Number(data[2])
            const value = Math.round(10000 * Number(data[3]) / quantity) / 10000
            return { name: data[1], type: '_', quantity, value, url: _url(link.getAttribute('href')) };
        }
        return null;
    }).filter(item => item !== null)

    if (materials.length == 0) {
        return { errorText: 'No materials found', url }
    }

    return {
        data: { itemValue, materials },
        url
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

/* TODO: handle cases where there is no match for search
    if &text.Contains("Search for items named")
        &regex = "Info\.aspx\?chart=Blueprint&amp;id=\d+"
        &matches = &text.Matches(&regex)
        if &matches.Count = 0
            &info.StatusCode = 500
            &info.Text = "No Blueprints matches in " + &text
            &info.Url = &url
            &info.Date = Now()
        else
            &url = "http://www.entropiawiki.com/" + &matches.Item(1).Value.Replace('&amp;', '&')
            &httpclient.Execute("GET", &url)
            if &httpclient.StatusCode = 200
                &text = &httpclient.ToString()
            else
                &info.StatusCode = &httpclient.StatusCode
                &info.Text = &httpclient.ToString()
                &info.Url = &url
                &info.Date = Now()
            endif
        endif
    endif*/
