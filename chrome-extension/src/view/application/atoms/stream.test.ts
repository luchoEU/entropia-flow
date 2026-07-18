import { describe, expect, test } from '@jest/globals'
import { mergeBuiltinLayoutWithStoredData } from './stream'

describe('stream startup layout merge', () => {
  test('preserves a stored background selection for builtin layouts', () => {
    // ============================================================================
    // ARRANGE
    // ============================================================================
    const builtin = { name: 'Default', backgroundType: 2 } as any
    const stored = { name: 'Old Default', backgroundType: 5, stared: true } as any

    // ============================================================================
    // ACT
    // ============================================================================
    const merged = mergeBuiltinLayoutWithStoredData(builtin, stored)

    // ============================================================================
    // ASSERT
    // ============================================================================
    expect(merged.backgroundType).toBe(5)
    expect(merged.name).toBe('Default')
    expect(merged.stared).toBe(true)
  })
})
