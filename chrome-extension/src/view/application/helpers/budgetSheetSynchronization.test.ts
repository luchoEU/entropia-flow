import { describe, it, expect, jest } from "@jest/globals"
import { sendBudgetPendingLinesFunc, BudgetSheetInterfaceCallbacks } from './budgetSheetSynchronization'
import { BudgetState } from '../state/budget'
import { SettingsState } from '../state/settings'
import { ItemsState } from '../state/items'
import { BudgetLineData, BudgetSheet } from '../../services/api/sheets/sheetsBudget'

describe('budgetSheetSynchronization', () => {
    describe('sendBudgetPendingLinesFunc', () => {
        const createMockSettings = (): SettingsState => ({} as SettingsState)

        const createMockBudgetState = (itemNames: string[]): BudgetState => ({
            stage: 0,
            loadPercentage: 0,
            materials: {
                disabled: {},
                map: {}
            },
            list: {
                disabled: [],
                items: itemNames.map(name => ({
                    name,
                    totalMU: 0,
                    total: 0,
                    peds: 0,
                    url: `http://example.com/${name}`
                }))
            },
            groups: { list: [], ungroupedExpanded: false }
        })

        const createMockMaterials = (): ItemsState => ({
            map: {}
        } as ItemsState)

        it('should transform material names correctly when adding balance line', async () => {
            const settings = createMockSettings()
            const budget = createMockBudgetState(['Mind Essence'])
            const materials = createMockMaterials()

            const lines: { [itemName: string]: BudgetLineData[] } = {
                "Mind Essence": [
                    {
                        date: 1769260114915,
                        reason: "Balance",
                        ped: 35.67,
                        materials: [
                            { name: "Force Nexus", quantity: -22239 },
                            { name: "Mind Essence", quantity: -298827 }
                        ]
                    }
                ]
            }

            const addLineMock = jest.fn<(d: BudgetLineData) => Promise<void>>()
            const saveMock = jest.fn<() => Promise<void>>()

            const mockSheet = {
                addLine: addLineMock,
                save: saveMock,
                getUrl: () => 'http://example.com/Mind Essence',
                getInfo: async () => ({
                    total: 100,
                    totalMU: 50,
                    peds: 35.67,
                    materials: {}
                })
            } as unknown as BudgetSheet

            const callbacks: BudgetSheetInterfaceCallbacks = {
                onProgress: jest.fn(),
                setStage: jest.fn(),
                getBudgetSheetList: jest.fn<() => Promise<string[]>>()
                    .mockResolvedValue(['Mind Essence']),
                loadBudgetSheet: jest.fn<() => Promise<BudgetSheet>>()
                    .mockResolvedValue(mockSheet),
                removeBudgetItemPendingLines: jest.fn()
            }

            await sendBudgetPendingLinesFunc(settings, budget, materials, lines, callbacks)

            expect(addLineMock).toHaveBeenCalledTimes(1)
            expect(addLineMock).toHaveBeenCalledWith({
                date: 1769260114915,
                reason: "Balance",
                ped: 35.67,
                materials: [
                    { name: "Force Nexus", quantity: -22239 },
                    { name: "Mind Essence", quantity: -298827 }
                ]
            })
            expect(saveMock).toHaveBeenCalledTimes(1)
        })
    })
})
