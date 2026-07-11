import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import {
    normalizeClientSettings,
    readClientSettings,
    saveClientSettings,
    withInspectorEnabled,
} from "./clientSettings";

describe('client settings', () => {
    const originalNeutralino = (globalThis as any).Neutralino;

    beforeEach(() => {
        (globalThis as any).Neutralino = {
            storage: {
                getData: async () => '',
                setData: async () => undefined,
            },
        } as any;
    });

    afterEach(() => {
        (globalThis as any).Neutralino = originalNeutralino;
    });

    it('should default dev tools to disabled when the setting is missing', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const rawSettings = { autoUpdateEnabled: false };

        // ============================================================================
        // ACT
        // ============================================================================
        const result = normalizeClientSettings(rawSettings);

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.autoUpdateEnabled).toBe(false);
        expect(result.devToolsEnabled).toBe(false);
    });

    it('should preserve the dev tools flag when enabled', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const rawSettings = { autoUpdateEnabled: true, devToolsEnabled: true, devManifestUrl: 'http://localhost:9147' };

        // ============================================================================
        // ACT
        // ============================================================================
        const result = normalizeClientSettings(rawSettings);

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.devToolsEnabled).toBe(true);
        expect(result.devManifestUrl).toBe('http://localhost:9147');
    });

    it('should enable inspector for new windows when dev tools are enabled', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const windowOptions = { title: 'Entropia Flow Client' } as any;
        const settings = normalizeClientSettings({ devToolsEnabled: true });

        // ============================================================================
        // ACT
        // ============================================================================
        const result = withInspectorEnabled(windowOptions, settings);

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.enableInspector).toBe(true);
    });

    it('should leave inspector disabled when dev tools are off', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const windowOptions = { title: 'Entropia Flow Client' } as any;
        const settings = normalizeClientSettings({ devToolsEnabled: false });

        // ============================================================================
        // ACT
        // ============================================================================
        const result = withInspectorEnabled(windowOptions, settings);

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.enableInspector).toBe(false);
    });

    it('should read client settings with safe defaults when storage is empty', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        (globalThis as any).Neutralino.storage.getData = async () => { throw new Error('missing'); };

        // ============================================================================
        // ACT
        // ============================================================================
        const result = await readClientSettings();

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.autoUpdateEnabled).toBe(true);
        expect(result.devToolsEnabled).toBe(false);
    });

    it('should persist client settings with the dev tools flag included', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        let savedPayload = '';
        (globalThis as any).Neutralino.storage.setData = async (_key: string, data: string) => {
            savedPayload = data;
        };

        // ============================================================================
        // ACT
        // ============================================================================
        await saveClientSettings(normalizeClientSettings({ autoUpdateEnabled: false, devToolsEnabled: true }));

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(JSON.parse(savedPayload)).toMatchObject({
            autoUpdateEnabled: false,
            devToolsEnabled: true,
        });
    });
});
