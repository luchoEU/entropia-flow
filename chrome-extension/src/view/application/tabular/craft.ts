import { CRAFT_TABULAR_BLUEPRINTS, CraftState } from "../state/craft"
import { TabularDefinitions, TabularRawData } from "../state/tabular"
import { InventoryState } from "../state/inventory"
import { setBlueprintStared } from "../actions/craft";
import { craftBlueprintUrl, navigateTo } from "../actions/navigation";
import { NavigateFunction } from "react-router-dom";
import { getBlueprintList } from "../helpers/inventory";

interface BlueprintTabularItem {
    name: string;
    stared: boolean;
    quantity: number;
}

const craftTabularData = (state: CraftState, inventoryState: InventoryState): TabularRawData<BlueprintTabularItem> => {
    const groupedMap = new Map<string, { name: string; stared: boolean; quantity: number }>();

    if (!state.options.owned) {
        for (const bpName of state.web?.blueprintList.data?.value ?? []) {
            const stared = state.stared.list.includes(bpName);
            groupedMap.set(bpName, { name: bpName, stared, quantity: 0 });
        }
    }

    for (const bp of getBlueprintList(inventoryState)) {
        const name = bp.n;
        const quantity = Number(bp.q);

        if (groupedMap.has(name)) {
            const existing = groupedMap.get(name)!;
            existing.quantity += quantity;
        } else {
            const stared = state.stared.list.includes(name);
            groupedMap.set(name, { name, stared, quantity });
        }
    }

    return {
        [CRAFT_TABULAR_BLUEPRINTS]: {
            items: Array.from(groupedMap.values()),
        },
    };
};

const craftTabularDefinitions: TabularDefinitions = {
    [CRAFT_TABULAR_BLUEPRINTS]: {
        title: 'Blueprints',
        subtitle: 'List of Blueprints',
        itemTypeName: 'blueprint',
        columns: ['Name', "Quantity"],
        getRow: (g: BlueprintTabularItem) => [
            [ // Name
                g.name,
                {
                    img: 'img/right.png',
                    title: 'Show item details',
                    dispatch: (n: NavigateFunction) => navigateTo(n, craftBlueprintUrl(g.name)) },
                { flex: 1 },
                {
                    img: g.stared ? 'img/staron.png' : 'img/staroff.png',
                    title: g.stared ? 'Remove from Favorites' : 'Add to Favorites',
                    dispatch: () => setBlueprintStared(g.name, !g.stared)
                },
            ],
            g.quantity.toString()
        ],
        getRowForFilter: (g: BlueprintTabularItem) => [g.name, ''],
        getRowForSort: (g: BlueprintTabularItem) => [g.name, g.quantity],
    }
}

export {
    craftTabularData,
    craftTabularDefinitions
}