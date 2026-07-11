import { describe, expect, test } from "@jest/globals"
import MockApiStorage from "../../chrome/mockApiStorage"
import { emptyTemporalValue } from "../../common/state"
import { StreamDataBuilder, IApiStorage } from "./streamDataBuilder"
import { Feature } from "../../view/application/state/settings"

describe('stream data builder temporal refresh', () => {
    test('should refresh temporal stream data at least once per second when temporal builders exist', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const apiStorage = new MockApiStorage()
        apiStorage.loadLastMock.mockResolvedValue({})
        apiStorage.loadItemsMock.mockResolvedValue({})
        apiStorage.loadStreamMock.mockResolvedValue({
            layouts: {
                hunt: {
                    name: 'Hunter',
                    backgroundType: 0,
                    htmlTemplate: '{{clock.total}}',
                    author: 'test',
                    lastModified: 0,
                    schema: 1,
                },
            },
        } as any)

        const builder = new StreamDataBuilder(apiStorage as IApiStorage)
        let temporalValue = 0
        builder.addTemporalBuilder({
            getTemporalName: () => 'clock',
            getTemporalVariables: async () => [{ name: 'clock', value: { ...emptyTemporalValue(), total: temporalValue++, count: 1, history: [] } }],
        })
        let sendClientDataCalls = 0
        builder.sendClientData = (async (_data: any) => { sendClientDataCalls++ }) as any

        await builder.updateState('stream')
        await builder.updateState('last')
        await builder.updateState('items')
        builder.setUsedLayouts(['hunt'])

        // ============================================================================
        // ACT
        // ============================================================================
        await builder.tick(0)
        await builder.tick(500)
        await builder.tick(1000)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(sendClientDataCalls).toBe(2)
    })
})

describe('stream data builder next background', () => {
    test('should advance to the next background and persist the full layout', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const apiStorage = new MockApiStorage()
        apiStorage.loadLastMock.mockResolvedValue({})
        apiStorage.loadItemsMock.mockResolvedValue({})
        apiStorage.loadStreamMock.mockResolvedValue({
            layouts: {
                hunt: {
                    name: 'Hunter',
                    backgroundType: 0,
                    htmlTemplate: '',
                    author: 'test',
                    lastModified: 0,
                    schema: 1,
                },
            },
        } as any)

        const builder = new StreamDataBuilder(apiStorage as IApiStorage)
        await builder.updateState('stream')

        // ============================================================================
        // ACT
        // ============================================================================
        await builder.nextBackground('hunt', { sheet: {}, features: [Feature.client] })

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(apiStorage.saveLayoutMock).toHaveBeenCalledTimes(1)
        expect(apiStorage.saveLayoutMock).toHaveBeenCalledWith('hunt', expect.objectContaining({ backgroundType: 1 }))
    })
})
