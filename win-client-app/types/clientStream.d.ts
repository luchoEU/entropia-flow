export function render(single: StreamRenderSingle, dispatch: (action: string) => void, scale?: number, minSize?: StreamRenderSize): Promise<StreamRenderSize | null>;
export function applyDelta<T extends object>(source: T | undefined, delta: Partial<T>): T;
