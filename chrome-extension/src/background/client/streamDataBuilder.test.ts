import { describe, expect, test } from "@jest/globals"
import MockApiStorage from "../../chrome/mockApiStorage"
import { emptyTemporalValue } from "../../common/state"
import { StreamDataBuilder, IApiStorage } from "./streamDataBuilder"

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
