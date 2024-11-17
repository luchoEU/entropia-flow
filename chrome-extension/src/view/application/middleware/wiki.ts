import { LOAD_ENTROPIA_WIKI_MATERIAL, setEntropiaWikiState } from "../actions/wiki"
import { getEntropiaWiki } from "../selectors/wiki"
import { EntropiaWikiState } from "../state/wiki"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case LOAD_ENTROPIA_WIKI_MATERIAL: {
            const name = action.payload.name
            const apiUrl = `http://www.entropiawiki.com/Search.aspx?searchtext=${encodeURIComponent(name)}&type=go`

            let data: any = {
                loading: false
            }
            try {
                const response = await fetch(apiUrl);
                data.code = response.status
                if (response.ok) {
                    data.result = await response.text();
                }
            } catch (error) {
                data.code = -1
                console.error("Error during http call:", error);
            }

            const state: EntropiaWikiState = { ...getEntropiaWiki(getState()) }
            state.material[name] = {
                ...data,
                result: data.result && JSON.stringify(extractRawMaterials(data.result))
            }
            dispatch(setEntropiaWikiState(state))
            break
        }
    }
}

interface RawMaterial {
    material: string;
    amount: number;
}

const extractRawMaterials = (html: string): RawMaterial[] => {
    const materials: RawMaterial[] = [];
    
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');
    const table = document.querySelector('table.Grid');
    if (!table) return materials;

    const rows = table.querySelectorAll('tr');
    rows.forEach((row, index) => {
        if (index === 0) return; // Skip the header row

        const columns = row.querySelectorAll('td');
        if (columns.length >= 4) {
            const material = columns[1]?.textContent?.trim() || "";
            const amount = parseFloat(columns[2]?.textContent?.trim() || "0");

            if (material) {
                materials.push({
                    material,
                    amount,
                });
            }
        }
    });

    return materials;
};

export default [
    requests
]
