import { describe, expect, it } from "bun:test";
import { setupWindowHoverControls } from "./windowHoverControls";

function createMockElement() {
    const listeners = new Map<string, ((event?: any) => void)[]>();
    const classes = new Set<string>();

    return {
        classList: {
            add: (...tokens: string[]) => {
                tokens.forEach((token) => classes.add(token));
            },
            remove: (...tokens: string[]) => {
                tokens.forEach((token) => classes.delete(token));
            },
            toggle: (token: string, force?: boolean) => {
                const shouldAdd = force ?? !classes.has(token);
                if (shouldAdd) {
                    classes.add(token);
                    return true;
                }
                classes.delete(token);
                return false;
            },
            contains: (token: string) => classes.has(token),
        },
        addEventListener: (type: string, listener: (event?: any) => void) => {
            const current = listeners.get(type) ?? [];
            current.push(listener);
            listeners.set(type, current);
        },
        dispatchEvent: (event: { type: string }) => {
            for (const listener of listeners.get(event.type) ?? []) {
                listener(event);
            }
        },
    };
}

describe('window hover controls', () => {
    it('should show the close button when hovering the window chrome', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const hoverArea = createMockElement();
        const minimizeButton = createMockElement();

        // ============================================================================
        // ACT
        // ============================================================================
        setupWindowHoverControls(hoverArea as any, minimizeButton as any);
        hoverArea.dispatchEvent({ type: 'mouseenter' });

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(hoverArea.classList.contains('entropia-flow-client-close-visible')).toBe(true);
    });

    it('should clear the close visibility when the pointer leaves the window', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const hoverArea = createMockElement();
        const minimizeButton = createMockElement();

        // ============================================================================
        // ACT
        // ============================================================================
        setupWindowHoverControls(hoverArea as any, minimizeButton as any);
        hoverArea.dispatchEvent({ type: 'mouseenter' });
        hoverArea.dispatchEvent({ type: 'mouseleave' });

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(hoverArea.classList.contains('entropia-flow-client-close-visible')).toBe(false);
        expect(hoverArea.classList.contains('entropia-flow-client-expanded')).toBe(false);
    });

    it('should still expand the full controls when hovering the minimize icon', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const hoverArea = createMockElement();
        const minimizeButton = createMockElement();

        // ============================================================================
        // ACT
        // ============================================================================
        setupWindowHoverControls(hoverArea as any, minimizeButton as any);
        minimizeButton.dispatchEvent({ type: 'mouseenter' });

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(hoverArea.classList.contains('entropia-flow-client-expanded')).toBe(true);
    });
});
