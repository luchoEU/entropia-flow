const BACKGROUND_CYCLE_ORDER = [0, 1, 2, 3, 4, 6, 7, 5];
const _pendingBackgroundTypes = new Map<string, number>();

function nextBackgroundType(currentType?: number): number {
    const index = BACKGROUND_CYCLE_ORDER.indexOf(currentType ?? -1);
    if (index === -1) {
        return BACKGROUND_CYCLE_ORDER[0];
    }
    return BACKGROUND_CYCLE_ORDER[(index + 1) % BACKGROUND_CYCLE_ORDER.length];
}

function setPendingBackgroundType(layoutId: string, backgroundType: number): void {
    _pendingBackgroundTypes.set(layoutId, backgroundType);
}

function reconcilePendingBackgroundTypes(layouts: Record<string, { backgroundType?: number }>): void {
    for (const [layoutId, pendingType] of _pendingBackgroundTypes.entries()) {
        const layout = layouts[layoutId];
        if (!layout) {
            _pendingBackgroundTypes.delete(layoutId);
            continue;
        }

        if (layout.backgroundType === pendingType) {
            _pendingBackgroundTypes.delete(layoutId);
            continue;
        }

        layout.backgroundType = pendingType;
    }
}

export {
    nextBackgroundType,
    reconcilePendingBackgroundTypes,
    setPendingBackgroundType,
};
