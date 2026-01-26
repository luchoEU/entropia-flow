import { InferredAction, StoredAction } from '../state/activity'
import { ViewItemData } from '../state/history'
import { inferActions, matchLootWithInventory } from './actionInference'

describe('actionInference', () => {
  describe('inferActions', () => {
    it('should infer basic actions without errors', () => {
      const diff: ViewItemData[] = [
        { key: 0, n: 'PED Card', q: '', v: '111.95', c: 'CARRIED' },
        { key: 1, n: 'Light Mind Essence', q: '-1006245', v: '-100.62', c: 'AUCTION' }
      ]

      const actions = inferActions(diff)

      // Basic check that it returns actions without throwing
      expect(Array.isArray(actions)).toBe(true)
      expect(actions.length).toBeGreaterThan(0)
      expect(actions[0]).toHaveProperty('type')
      expect(actions[0]).toHaveProperty('relatedItems')
      expect(typeof actions[0].relatedItems).toBe('object')
    })
  })
})
