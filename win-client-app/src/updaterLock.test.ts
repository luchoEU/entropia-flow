import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { releaseUpdateDialogLock, tryAcquireUpdateDialogLock } from "./updateDialogLock";
import { STORE_UPDATE_DIALOG_LOCK } from "./const";

describe('update dialog lock', () => {
    const originalNeutralino = (globalThis as any).Neutralino;
    const storage = new Map<string, string>();

    beforeEach(() => {
        storage.clear();
        (globalThis as any).Neutralino = {
            storage: {
                getData: async (key: string) => storage.get(key) ?? '',
                setData: async (key: string, value: string) => {
                    if (value === null) {
                        storage.delete(key);
                    } else {
                        storage.set(key, value);
                    }
                },
            },
        } as any;
    });

    afterEach(() => {
        (globalThis as any).Neutralino = originalNeutralino;
    });

    it('should allow only one window to acquire the update dialog lock', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================

        // ============================================================================
        // ACT
        // ============================================================================
        const firstOwner = await tryAcquireUpdateDialogLock();
        const secondOwner = await tryAcquireUpdateDialogLock();

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(firstOwner).toBeTruthy();
        expect(secondOwner).toBeNull();
        expect(storage.has(STORE_UPDATE_DIALOG_LOCK)).toBe(true);
    });

    it('should release the lock only for the owning window', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const owner = await tryAcquireUpdateDialogLock();
        expect(owner).toBeTruthy();

        // ============================================================================
        // ACT
        // ============================================================================
        await releaseUpdateDialogLock(owner!);

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(storage.has(STORE_UPDATE_DIALOG_LOCK)).toBe(false);
    });

    it('should replace stale locks from a previous app session', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        storage.set(STORE_UPDATE_DIALOG_LOCK, JSON.stringify({
            owner: 'stale-owner',
            acquiredAt: Date.now() - (60 * 60 * 1000),
            expiresAt: Date.now() + (60 * 60 * 1000),
        }));

        // ============================================================================
        // ACT
        // ============================================================================
        const owner = await tryAcquireUpdateDialogLock();

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(owner).toBeTruthy();
        expect(owner).not.toBe('stale-owner');
    });
});
