import { describe, expect, it } from '@jest/globals'
import { Role, ROLE_LABELS, ROLE_EMOJIS, ROLES } from './role'

describe('role model', () => {
    it('should expose fishing as a selectable role', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const role = Role.FISHING

        // ============================================================================
        // ACT
        // ============================================================================
        const label = ROLE_LABELS[role]
        const emoji = ROLE_EMOJIS[role]

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(ROLES).toContain(role)
        expect(label).toBe('Angler')
        expect(emoji).toBe('🎣')
    })
})
