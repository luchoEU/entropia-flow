/**
 * Stub implementations for Redux actions that were removed during Jotai migration.
 * These functions are placeholders to allow the component to compile.
 * TODO: Implement proper Jotai atoms for blueprint editing
 */

export function showBlueprintMaterialData(bpName: string, materialName?: string) {
  console.log('TODO: Show blueprint material data', bpName, materialName);
}

export function changeBlueprintMaterialQuantity(bpName: string, index: number, quantity: string) {
  console.log('TODO: Change blueprint material quantity', bpName, index, quantity);
}

export function changeBlueprintMaterialName(bpName: string, index: number, name: string) {
  console.log('TODO: Change blueprint material name', bpName, index, name);
}

export function removeBlueprintMaterial(bpName: string, index: number) {
  console.log('TODO: Remove blueprint material', bpName, index);
}

export function moveBlueprintMaterial(bpName: string, fromIndex: number, toIndex: number) {
  console.log('TODO: Move blueprint material', bpName, fromIndex, toIndex);
}

export function addBlueprintMaterial(bpName: string) {
  console.log('TODO: Add blueprint material', bpName);
}

export function startBlueprintEditMode(bpName: string) {
  console.log('TODO: Start blueprint edit mode', bpName);
}

export function endBlueprintEditMode() {
  console.log('TODO: End blueprint edit mode');
}

export function reloadBlueprint(bpName: string) {
  console.log('TODO: Reload blueprint', bpName);
}

export function changeBudgetPageBuyCost(bpName: string, materialName: string, cost: string) {
  console.log('TODO: Change budget page buy cost', bpName, materialName, cost);
}

export function buyBudgetPageMaterial(bpName: string, materialName: string, text: string, value: number, quantity: number) {
  console.log('TODO: Buy budget page material', bpName, materialName, text, value, quantity);
}

export function changeBudgetPageBuyFee(bpName: string, materialName: string, withFee: boolean) {
  console.log('TODO: Change budget page buy fee', bpName, materialName, withFee);
}

export function navigateToTab(navigate: any, tabId: string) {
  if (navigate) {
    navigate(`/${tabId}`);
  }
}
