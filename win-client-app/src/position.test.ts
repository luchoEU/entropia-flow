import { afterEach, describe, expect, it } from "bun:test";
import { screensChanged } from "./position";

describe('window position screen bounds', () => {
    const originalNeutralino = (globalThis as any).Neutralino;

    afterEach(() => {
        (globalThis as any).Neutralino = originalNeutralino;
    });

    it('should move an existing window back into the new screen bounds', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const moves: Array<{ x: number, y: number }> = [];
        (globalThis as any).Neutralino = {
            window: {
                getSize: async () => ({ width: 400, height: 300 }),
                getPosition: async () => ({ x: 1600, y: 800 }),
                move: async (x: number, y: number) => moves.push({ x, y }),
            },
        } as any;

        // ============================================================================
        // ACT
        // ============================================================================
        screensChanged([{ x: 0, y: 0, width: 1280, height: 720 }]);
        await new Promise(resolve => setTimeout(resolve, 0));

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(moves).toEqual([{ x: 880, y: 420 }]);
    });
});
