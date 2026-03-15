import MemoryStorageArea from '../../chrome/memoryStorageArea'
import ViewSettings from './viewSettings'

describe('ViewSettings', () => {
    describe('webSocketUrl persistence', () => {
        it('should persist webSocketUrl through save and load cycle', async () => {
            // ============================================================================
            // ARRANGE
            // ============================================================================
            const storage = new MemoryStorageArea()
            const settings = new ViewSettings(storage)
            const TEST_URL = 'ws://localhost:1234'

            // ============================================================================
            // ACT
            // ============================================================================
            await settings.setWebSocketUrl(TEST_URL)

            // Create a new instance to simulate extension restart
            const reloaded = new ViewSettings(storage)
            const result = await reloaded.getWebSocketUrl()

            // ============================================================================
            // ASSERT
            // ============================================================================
            expect(result).toBe(TEST_URL)
        })

        it('should return empty string when no url was saved', async () => {
            // ============================================================================
            // ARRANGE
            // ============================================================================
            const storage = new MemoryStorageArea()
            const settings = new ViewSettings(storage)

            // ============================================================================
            // ACT
            // ============================================================================
            const result = await settings.getWebSocketUrl()

            // ============================================================================
            // ASSERT
            // ============================================================================
            expect(result).toBe('')
        })

        it('should persist both last and webSocketUrl together', async () => {
            // ============================================================================
            // ARRANGE
            // ============================================================================
            const storage = new MemoryStorageArea()
            const settings = new ViewSettings(storage)
            const TEST_URL = 'ws://game-server:5678'
            const TEST_LAST = 1234567890

            // ============================================================================
            // ACT
            // ============================================================================
            await settings.setLast(TEST_LAST)
            await settings.setWebSocketUrl(TEST_URL)

            // Create a new instance to simulate extension restart
            const reloaded = new ViewSettings(storage)
            const loadedUrl = await reloaded.getWebSocketUrl()
            const loadedLast = await reloaded.getLast()

            // ============================================================================
            // ASSERT
            // ============================================================================
            expect(loadedUrl).toBe(TEST_URL)
            expect(loadedLast).toBe(TEST_LAST)
        })
    })
})
