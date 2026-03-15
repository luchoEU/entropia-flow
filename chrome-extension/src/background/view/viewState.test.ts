import MemoryStorageArea from "../../chrome/memoryStorageArea"
import { STATE_LOADING_ITEMS } from "../stateConst"
import ViewStateManager from "./viewState"
import ViewSettings from "../settings/viewSettings"

describe('view state', () => {
    test('when setStatus expect onChange', async () => {
        const onChange = jest.fn()
        const viewState = new ViewStateManager(undefined!, undefined!, undefined!, undefined!, undefined!, undefined!)
        viewState.onChange = onChange

        await viewState.setStatus(STATE_LOADING_ITEMS.status)

        expect(onChange.mock.calls.length).toBe(1)
        expect(onChange.mock.calls[0].length).toBe(1)
        expect(onChange.mock.calls[0][0]).toEqual(STATE_LOADING_ITEMS)
    })

    test('get() includes webSocketUrl from viewSettings', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const storage = new MemoryStorageArea()
        const viewSettings = new ViewSettings(storage)
        await viewSettings.setWebSocketUrl('ws://custom:9999')

        const mockInventory = { getList: jest.fn().mockResolvedValue([]) }
        const mockRefresh = { getStatus: jest.fn().mockResolvedValue({ class: '', message: '', isMonitoring: false }) }
        const mockGameLog = { getGameLog: jest.fn().mockResolvedValue(undefined) }
        const mockWsClient = { getState: jest.fn().mockResolvedValue({ code: 0, message: 'ok' }) }
        const mockStreamBuilder = { getVariablesAndData: jest.fn().mockResolvedValue({ variables: {}, renderData: undefined }) }

        const viewState = new ViewStateManager(
            mockRefresh as any,
            viewSettings,
            mockInventory as any,
            mockGameLog as any,
            mockWsClient as any,
            mockStreamBuilder as any
        )

        // ============================================================================
        // ACT
        // ============================================================================
        const result = await viewState.get()

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.webSocketUrl).toBe('ws://custom:9999')
    })

    test('setClientState() includes webSocketUrl in onChange', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const storage = new MemoryStorageArea()
        const viewSettings = new ViewSettings(storage)
        await viewSettings.setWebSocketUrl('ws://persisted:4444')

        const onChange = jest.fn()
        const viewState = new ViewStateManager(undefined!, viewSettings, undefined!, undefined!, undefined!, undefined!)
        viewState.onChange = onChange

        // ============================================================================
        // ACT
        // ============================================================================
        await viewState.setClientState({ code: 1, message: 'connected' })

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange.mock.calls[0][0]).toEqual({
            clientState: { code: 1, message: 'connected' },
            webSocketUrl: 'ws://persisted:4444'
        })
    })
})
