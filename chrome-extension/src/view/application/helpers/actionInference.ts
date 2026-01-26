import { InferredAction, StoredAction } from '../state/activity'
import type { BoughtAuctionItems, ListedAuctionItems } from '../state/activity'
import { ViewItemData } from '../state/history'

const PED_CARD = 'PED Card'
const DEFAULT_LOOT_MATCH_WINDOW_MS = 60000 // 60 seconds

interface LootMatch {
    itemName: string
    inventoryItem: ViewItemData
    lootActionIds: string[]
}

interface MatchLootResult {
    matches: LootMatch[]
    unmatched: ViewItemData[]
}

/**
 * Matches inventory diff items to existing loot actions from the client.
 * Items that match loot will be merged with the loot actions instead of
 * creating new inferred actions.
 *
 * @param inventoryItems - The inventory diff items to check
 * @param lootActions - Existing loot actions from the client
 * @param inventoryTimestamp - The timestamp of the inventory snapshot
 * @param timeWindowMs - Time window to consider for matching (default 60s)
 * @returns Object with matches and unmatched items
 */
function matchLootWithInventory(
    inventoryItems: ViewItemData[],
    lootActions: StoredAction[],
    inventoryTimestamp: number,
    timeWindowMs: number = DEFAULT_LOOT_MATCH_WINDOW_MS
): MatchLootResult {
    const matches: LootMatch[] = []
    const unmatched: ViewItemData[] = []
    const matchedItemNames = new Set<string>()

    // Filter loot actions within time window that don't already have inventory source
    const eligibleLootActions = lootActions.filter(action =>
        action.type === 'loot' &&
        !action.sources.includes('inventory') &&
        action.timestamp >= inventoryTimestamp - timeWindowMs &&
        action.timestamp <= inventoryTimestamp
    )

    // For now, loot actions have empty relatedItems in the new structure
    // We'll match based on a different approach or disable matching until loot actions are redesigned
    const itemNameToLootActions = new Map<string, string[]>()
    // Note: Loot matching needs to be redesigned for the new dual storage structure

    // Temporarily disable loot matching until redesigned for new structure
    // All inventory items are considered unmatched for now
    unmatched.push(...inventoryItems)

    return { matches, unmatched }
}

function inferActions(diff: ViewItemData[]): InferredAction[] {
    const actions: InferredAction[] = []
    const used = new Set<number>()

    // Find PED Card item
    const pedCard = diff.find(d => d.n === PED_CARD)

    // 1. Match auction sales: item with negative qty from AUCTION + PED Card gain
    for (const item of diff) {
        if (used.has(item.key)) continue
        if (item.c === 'AUCTION' && item.q.startsWith('-') && pedCard && !pedCard.v.startsWith('-')) {
            actions.push({
                type: 'sold_auction',
                relatedItems: {
                    item: diff.indexOf(item),
                    payment: diff.indexOf(pedCard)
                }
            })
            used.add(item.key)
            used.add(pedCard.key)
        }
    }

    // 2. Match auction wins: item with positive qty from AUCTION + optional PED Card loss
    for (const item of diff) {
        if (used.has(item.key)) continue
        if (item.c === 'AUCTION' && !item.q.startsWith('-')) {
            const relatedItems: BoughtAuctionItems = {
                item: diff.indexOf(item)
            }

            // Include PED Card if present with negative value
            if (pedCard && pedCard.v.startsWith('-') && !used.has(pedCard.key)) {
                relatedItems.payment = diff.indexOf(pedCard)
                used.add(pedCard.key)
            }

            actions.push({
                type: 'bought_auction',
                relatedItems
            })
            used.add(item.key)
        }
    }

      // 2.5 Match auction listing: item moved to AUCTION + PED Card loss
      if (pedCard && pedCard.v.startsWith('-') && !used.has(pedCard.key)) {
          const listedItems = diff.filter(d => !used.has(d.key) && d.c.includes('⭢ AUCTION'))
          if (listedItems.length === 1) {
              const item = listedItems[0]
              actions.push({
                  type: 'listed_auction',
                  relatedItems: {
                      item: diff.indexOf(item),
                      fee: diff.indexOf(pedCard)
                  }
              })
              used.add(item.key)
              used.add(pedCard.key)
          }
      }

      // 2.75 Match auction wins without AUCTION container: item gained + PED Card loss
      if (pedCard && pedCard.v.startsWith('-') && !used.has(pedCard.key)) {
          const gainedItems = diff.filter(d => !used.has(d.key) && !d.q.startsWith('-') && d.q !== '' && !d.c.includes('⭢ AUCTION'))
          if (gainedItems.length === 1) {
              const item = gainedItems[0]
              actions.push({
                  type: 'bought_auction',
                  relatedItems: {
                      item: diff.indexOf(item),
                      payment: diff.indexOf(pedCard)
                  }
              })
              used.add(item.key)
              used.add(pedCard.key)
          }
      }

    // 3. Match chip_out: item consumed in an Implant Inserter + skill chip gained + inserter decay
    for (const item of diff) {
        if (used.has(item.key)) continue
        // Item consumed in an inserter (container is the inserter name)
        if (item.c.includes('Implant Inserter') && !item.c.includes('⟹') && !item.c.includes('⭢')) {
            const inserterName = item.c
            // Find the skill chip that appeared
            const skillChip = diff.find(d =>
                !used.has(d.key) &&
                d.n.includes('Skill Implant') &&
                d.q && !d.q.startsWith('-') &&
                d.c === 'CARRIED'
            )
            // Find the inserter decay (item with inserter name that has value change and container move)
            const inserterDecay = diff.find(d =>
                !used.has(d.key) &&
                d.n === inserterName &&
                d.v.startsWith('-') &&
                d.c.includes('⟹')
            )

            if (skillChip) {
                const chipOutAction: InferredAction = {
                    type: 'chip_out',
                    relatedItems: {
                        consumed: diff.indexOf(item),
                        skillChip: diff.indexOf(skillChip),
                        ...(inserterDecay ? { inserterDecay: diff.indexOf({
                            key: inserterDecay.key,
                            n: inserterDecay.n,
                            q: '',
                            v: inserterDecay.v,
                            c: 'CARRIED'
                        }) } : {})
                    }
                }
                actions.push(chipOutAction)
                used.add(item.key)
                used.add(skillChip.key)
                // Note: inserterDecay.key is NOT added to used - it will be processed again for the move
            }
        }
    }

    // 3.5 Match convert_ammo: Shrapnel consumed + Universal Ammo gained (or vice versa)
    const shrapnelItem = diff.find(d => !used.has(d.key) && d.n === 'Shrapnel' && d.c === 'CARRIED')
    const universalAmmoItem = diff.find(d => !used.has(d.key) && d.n === 'Universal Ammo' && d.c === 'CARRIED')
    if (shrapnelItem && universalAmmoItem) {
        const shrapnelQty = Number(shrapnelItem.q)
        const universalQty = Number(universalAmmoItem.q)
        // One should be negative (consumed) and one positive (gained)
        if ((shrapnelQty < 0 && universalQty > 0) || (shrapnelQty > 0 && universalQty < 0)) {
            const consumedItem = shrapnelQty < 0 ? shrapnelItem : universalAmmoItem
            const gainedItem = shrapnelQty < 0 ? universalAmmoItem : shrapnelItem
            actions.push({
                type: 'convert_ammo',
                relatedItems: {
                    consumed: diff.indexOf(consumedItem),
                    produced: diff.indexOf(gainedItem)
                }
            })
            used.add(shrapnelItem.key)
            used.add(universalAmmoItem.key)
        }
    }

    // 4. Match craft: one or more consumed items (negative qty) and multiple positive items (crafted item + residues)
    const consumed = diff.filter(d => !used.has(d.key) && d.q.startsWith('-'))
    const positiveItems = diff.filter(d => !used.has(d.key) && !d.q.startsWith('-') && d.q !== '')
    if (consumed.length >= 1 && positiveItems.length >= 2 && !consumed.some(c => c.c === 'AUCTION')) {
        actions.push({
            type: 'craft',
            relatedItems: {
                consumed: consumed.map(item => diff.indexOf(item)),
                produced: positiveItems.map(item => diff.indexOf(item))
            }
        })
        consumed.forEach(c => used.add(c.key))
        positiveItems.forEach(p => used.add(p.key))
    }

    // 4.5 Match refine: consumed items (negative qty) and produced item (positive qty)
    const refineConsumed = diff.filter(d => !used.has(d.key) && d.q.startsWith('-'))
    const refineProduced = diff.filter(d => !used.has(d.key) && !d.q.startsWith('-') && d.q !== '')
    if (refineConsumed.length > 0 && refineProduced.length === 1) {
        const prod = refineProduced[0]
        actions.push({
            type: 'refine',
            relatedItems: {
                consumed: refineConsumed.map(item => diff.indexOf(item)),
                produced: diff.indexOf(prod)
            }
        })
        refineConsumed.forEach(c => used.add(c.key))
        used.add(prod.key)
    }

    // 4.75 Match pet dismissal: pets with negative quantity
    for (const item of diff) {
        if (used.has(item.key)) continue
        if (item.n.includes('Pet') && item.q.startsWith('-') && item.c === 'CARRIED') {
            actions.push({
                type: 'dismiss_pet',
                relatedItems: {
                    pet: diff.indexOf(item)
                }
            })
            used.add(item.key)
        }
    }

    // 5. Match moves: items with ⟹ or ⭢ in container, grouped by from/to
    const moveGroups = new Map<string, { from: string, to: string, itemIndices: number[] }>()
    for (const item of diff) {
        if (used.has(item.key)) continue
        const moveMatch = item.c.match(/(.+?) ⟹ (.+)/) || item.c.match(/(.+?) ⭢ (.+)/)
        if (moveMatch) {
            const from = moveMatch[1]
            const to = moveMatch[2]
            const groupKey = `${from}|${to}`
            if (!moveGroups.has(groupKey)) {
                moveGroups.set(groupKey, { from, to, itemIndices: [] })
            }
            moveGroups.get(groupKey)!.itemIndices.push(diff.indexOf(item))
            used.add(item.key)
        }
    }
    for (const group of moveGroups.values()) {
        actions.push({
            type: 'moved',
            relatedItems: {
                items: group.itemIndices
            }
        })
    }

    // 6. Remaining items go to unknown
    const remaining = diff.filter(d => !used.has(d.key))
    if (remaining.length > 0) {
        actions.push({
            type: 'unknown',
            relatedItems: {
                items: remaining.map(item => diff.indexOf(item))
            }
        })
    }



    return actions
}

function normalizeDiff(items: ViewItemData[]): Map<string, { q: number; v: number }> {
    const map = new Map<string, { q: number; v: number }>()
    for (const item of items) {
        const key = `${item.n}|${item.c}`
        const q = parseFloat(item.q) || 0
        const v = parseFloat(item.v) || 0
        if (map.has(key)) {
            const existing = map.get(key)!
            existing.q += q
            existing.v += v
        } else {
            map.set(key, { q, v })
        }
    }
    return map
}

function mapsEqual(a: Map<string, { q: number; v: number }>, b: Map<string, { q: number; v: number }>): boolean {
    if (a.size !== b.size) return false
    for (const [key, valA] of a) {
        const valB = b.get(key)
        if (!valB || valA.q !== valB.q || valA.v !== valB.v) return false
    }
    return true
}



export {
    inferActions,
    matchLootWithInventory,
    LootMatch,
    MatchLootResult
}
