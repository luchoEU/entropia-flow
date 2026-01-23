import { describe, it, expect } from "@jest/globals"
import { initialState, reduceDeleteBudgetPendingLine } from "./budget"

describe('reduceDeleteBudgetPendingLine', () => {
  it('should delete a specific pending line by index', () => {
    const testState = {
      ...initialState,
      list: {
        items: [
          {
            name: 'Test Item',
            storage: 0,
            totalMU: 0,
            total: 0,
            peds: 0,
            url: 'http://test.com',
            pendingLines: [
              { date: 1, reason: 'Line 1', ped: 10, materials: [] },
              { date: 2, reason: 'Line 2', ped: 20, materials: [] },
              { date: 3, reason: 'Line 3', ped: 30, materials: [] }
            ]
          },
          {
            name: 'Other Item',
            totalMU: 0,
            total: 0,
            peds: 0,
            url: 'http://other.com'
          }
        ]
      }
    }

    // Delete the middle line (index 1)
    const result = reduceDeleteBudgetPendingLine(testState, 'Test Item', 1)

    expect(result.list.items[0].pendingLines).toHaveLength(2)
    expect(result.list.items[0].pendingLines).toEqual([
      { date: 1, reason: 'Line 1', ped: 10, materials: [] },
      { date: 3, reason: 'Line 3', ped: 30, materials: [] }
    ])
    // Other item should be unchanged
    expect(result.list.items[1].pendingLines).toBeUndefined()
  })

  it('should clear pendingLines array when last line is deleted', () => {
    const testState = {
      ...initialState,
      list: {
        items: [
          {
            name: 'Test Item',
            totalMU: 0,
            total: 0,
            peds: 0,
            url: 'http://test.com',
            pendingLines: [
              { date: 1, reason: 'Only Line', ped: 10, materials: [] }
            ]
          }
        ]
      }
    }

    const result = reduceDeleteBudgetPendingLine(testState, 'Test Item', 0)

    expect(result.list.items[0].pendingLines).toEqual([])
  })

  it('should not modify state if item not found', () => {
    const testState = {
      ...initialState,
      list: {
        items: [
          {
            name: 'Test Item',
            totalMU: 0,
            total: 0,
            peds: 0,
            url: 'http://test.com'
          }
        ]
      }
    }

    const result = reduceDeleteBudgetPendingLine(testState, 'Nonexistent Item', 0)

    expect(result).toEqual(testState)
  })
})
