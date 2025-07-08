import { nexusWwwUrl } from "./nexus.url";

export async function loadBlueprintList(): Promise<string[]> {
    const url = nexusWwwUrl(`items/blueprints`);
    const response = await _fetch(url);
    return response ? _extractBlueprintList(url)(response) : undefined;
}

async function _fetch(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return undefined;
        }
        return await response.text()
    } catch (error) {
        console.error(`Error during http call:`, error);
        return undefined;
    }
}

const _extractBlueprintList = (url: string) => (page: string): string[] => {
    const regex = /<a href="\/items\/blueprints\/[^<]+"><!-- HTML_TAG_START -->([^<]+)<!-- HTML_TAG_END --><\/a>/g;
    const matches = Array.from(page.matchAll(regex));
    return matches.map(([_, bpName]) => bpName.trim());
}
