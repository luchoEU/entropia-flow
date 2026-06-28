import { extractVarsFromRenderData, describeVariableTypes } from './streamAgentService'

describe('streamAgentService', () => {
    describe('extractVarsFromRenderData', () => {
        it('should correctly flatten nested data fields into dot-notated variables', () => {
            // ============================================================================
            // ARRANGE
            // ============================================================================
            const commonData = {
                ped: 100,
                nested: {
                    value: 'test',
                    more: {
                        deep: true
                    }
                }
            }
            const layoutData = {
                nested: {
                    other: 42
                },
                unique: 'hello'
            }

            // ============================================================================
            // ACT
            // ============================================================================
            const result = extractVarsFromRenderData(commonData, layoutData)

            // ============================================================================
            // ASSERT
            // ============================================================================
            expect(result).toContain('ped')
            expect(result).toContain('nested.value')
            expect(result).toContain('nested.more.deep')
            expect(result).toContain('nested.other')
            expect(result).toContain('unique')
            expect(result.length).toBe(5)
        })
    })

    describe('describeVariableTypes', () => {
        it('should describe types and structures of MERGED variables recursively', () => {
            // ============================================================================
            // ARRANGE
            // ============================================================================
            const commonData = {
                global: [{ time: 123456, player: 'Coffee Shop', value: 96 }]
            }
            const layoutData = {
                lootStats: {
                    total: 100,
                    history: ['wait', 'test']
                }
            }

            const varDescMap = {
                global: 'Latest global loot logs',
                lootStats: 'Computed stats object'
            }

            // ============================================================================
            // ACT
            // ============================================================================
            const result = describeVariableTypes(commonData, layoutData, varDescMap)

            // ============================================================================
            // ASSERT
            // ============================================================================
            expect(result).toContain('- **global** (Array of { time: number, player: string, value: number }) - *Latest global loot logs*')
            expect(result).toContain('- **lootStats** (')
            expect(result).toContain(' - *Computed stats object*')
            expect(result).toContain('total: number')
            expect(result).toContain('history: Array of string')
        })
    })
})
