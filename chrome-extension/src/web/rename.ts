export function renameNewBlueprintName(itemName: string): string {
    // 'T1 Weapon Economy Enhancer Blueprint (L)' to 'Weapon Economy Enhancer 1 Blueprint (L)'
    return itemName.replace(/^T(\d+) (.*?) Enhancer (.*)?$/, "$2 Enhancer $1 $3");
}

export function renameOldBlueprintName(itemName: string): string {
    // 'Weapon Economy Enhancer 1 Blueprint (L)' to 'T1 Weapon Economy Enhancer Blueprint (L)'
    return itemName.replace(/^(.*?) Enhancer (\d+) (.*)?$/, "T$2 $1 Enhancer $3");
}
