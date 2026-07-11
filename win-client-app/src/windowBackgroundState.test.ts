import { describe, expect, it } from "bun:test";
import { nextBackgroundType, reconcilePendingBackgroundTypes, setPendingBackgroundType } from "./windowBackgroundState";

describe('window background state', () => {
    it('should cycle through the same background order as the extension', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================

        // ============================================================================
        // ACT
        // ============================================================================
        const fromDark = nextBackgroundType(1);
        const fromTransparentWhite = nextBackgroundType(7);
        const fromUnknown = nextBackgroundType(undefined);

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(fromDark).toBe(2);
        expect(fromTransparentWhite).toBe(5);
        expect(fromUnknown).toBe(0);
    });

    it('should keep a pending background change when stale state is received', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const layouts = {
            hunt: { backgroundType: 0 },
        };
        setPendingBackgroundType('hunt', 3);

        // ============================================================================
        // ACT
        // ============================================================================
        layouts.hunt.backgroundType = 0;
        reconcilePendingBackgroundTypes(layouts);

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(layouts.hunt.backgroundType).toBe(3);
    });

    it('should clear the pending background change when the server confirms it', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const layouts = {
            hunt: { backgroundType: 4 },
        };
        setPendingBackgroundType('hunt', 4);

        // ============================================================================
        // ACT
        // ============================================================================
        reconcilePendingBackgroundTypes(layouts);

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(layouts.hunt.backgroundType).toBe(4);

        // second pass should be a no-op once the pending change is cleared
        layouts.hunt.backgroundType = 1;
        reconcilePendingBackgroundTypes(layouts);
        expect(layouts.hunt.backgroundType).toBe(1);
    });
});
