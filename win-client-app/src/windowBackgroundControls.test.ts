import { describe, expect, it } from "bun:test";
import { setupWindowBackgroundControls } from "./windowBackgroundControls";

function createMockElement() {
    const listeners = new Map<string, ((event?: any) => void)[]>();

    return {
        addEventListener: (type: string, listener: (event?: any) => void) => {
            const current = listeners.get(type) ?? [];
            current.push(listener);
            listeners.set(type, current);
        },
        dispatchEvent: (event: { type: string; stopPropagation?: () => void }) => {
            for (const listener of listeners.get(event.type) ?? []) {
                listener(event);
            }
        },
    };
}

describe('window background controls', () => {
    it('should invoke the next background action when clicked', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const backgroundButton = createMockElement();
        let called = 0;

        // ============================================================================
        // ACT
        // ============================================================================
        setupWindowBackgroundControls(backgroundButton as any, () => { called++; });
        backgroundButton.dispatchEvent({ type: 'click', stopPropagation: () => undefined });

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(called).toBe(1);
    });
});
