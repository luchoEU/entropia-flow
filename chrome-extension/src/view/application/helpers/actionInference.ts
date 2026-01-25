import { InferredAction, StoredAction } from '../state/activity'
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

    // Build a map of item names to loot actions that contain them
    const itemNameToLootActions = new Map<string, string[]>()
    for (const action of eligibleLootActions) {
        for (const relatedItem of action.relatedItems) {
            if (!itemNameToLootActions.has(relatedItem.n)) {
                itemNameToLootActions.set(relatedItem.n, [])
            }
            const actionIds = itemNameToLootActions.get(relatedItem.n)!
            if (!actionIds.includes(action.id)) {
                actionIds.push(action.id)
            }
        }
    }

    // Check each inventory item for matches
    for (const item of inventoryItems) {
        // Only match positive quantity items (gained, not consumed)
        const qty = Number(item.q)
        if (qty <= 0 && item.q !== '' && item.q !== '0') {
            unmatched.push(item)
            continue
        }

        // Check if this item name appears in any loot action
        const matchingActionIds = itemNameToLootActions.get(item.n)
        if (matchingActionIds && matchingActionIds.length > 0 && !matchedItemNames.has(item.n)) {
            matches.push({
                itemName: item.n,
                inventoryItem: item,
                lootActionIds: matchingActionIds
            })
            matchedItemNames.add(item.n)
        } else {
            unmatched.push(item)
        }
    }

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
            const amount = Math.abs(Number(item.q))
            const value = Number(pedCard.v)
            actions.push({
                type: 'sold_auction',
                item: item.n,
                amount,
                value,
                relatedItems: [pedCard, item]
            })
            used.add(item.key)
            used.add(pedCard.key)
        }
    }

    // 2. Match auction wins: item with positive qty from AUCTION + optional PED Card loss
    for (const item of diff) {
        if (used.has(item.key)) continue
        if (item.c === 'AUCTION' && !item.q.startsWith('-')) {
            const amount = Number(item.q) || 1
             let value: number | undefined = undefined
            const relatedItems: ViewItemData[] = [item]
            
             // Include PED Card if present with negative value
             if (pedCard && pedCard.v.startsWith('-') && !used.has(pedCard.key)) {
                 relatedItems.push(pedCard)
                 used.add(pedCard.key)
                 value = -Number(pedCard.v)
             }

             // If no PED Card deduction, use the item's value as the purchase cost
             if (value === undefined) {
                 value = Number(item.v)
             }

             actions.push({
                type: 'bought_auction',
                item: item.n,
                amount,
                value,
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
              const amount = Number(item.q) || 1
              const value = -Number(pedCard.v)
              actions.push({
                  type: 'listed_auction',
                  item: item.n,
                  amount,
                  value,
                  relatedItems: [item, pedCard]
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
              const amount = Number(item.q)
              const value = -Number(pedCard.v)
              actions.push({
                  type: 'bought_auction',
                  item: item.n,
                  amount,
                  value,
                  relatedItems: [item, pedCard]
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
                const value = Math.abs(Number(item.v))
                const amount = Number(skillChip.q) || 1
                const relatedItems: ViewItemData[] = [item, skillChip]

                // Add inserter decay as separate item (just the decay part)
                if (inserterDecay) {
                    relatedItems.push({
                        key: inserterDecay.key,
                        n: inserterDecay.n,
                        q: '',
                        v: inserterDecay.v,
                        c: 'CARRIED'  // The decay happened in CARRIED before the move
                    })
                }

                actions.push({
                    type: 'chip_out',
                    item: skillChip.n,
                    from: item.n,  // The implant the chip was extracted from
                    amount,
                    value,
                    relatedItems
                })
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
            const amount = Math.abs(Number(consumedItem.q))
            const value = Math.abs(Number(consumedItem.v))
            actions.push({
                type: 'convert_ammo',
                item: consumedItem.n,
                amount,
                value,
                relatedItems: [consumedItem, gainedItem]
            })
            used.add(shrapnelItem.key)
            used.add(universalAmmoItem.key)
        }
    }

    // 4. Match craft: one or more consumed items (negative qty) and multiple positive items (crafted item + residues)
    const consumed = diff.filter(d => !used.has(d.key) && d.q.startsWith('-'))
    const positiveItems = diff.filter(d => !used.has(d.key) && !d.q.startsWith('-') && d.q !== '')
    if (consumed.length >= 1 && positiveItems.length >= 2 && !consumed.some(c => c.c === 'AUCTION')) {
        // Identify the main crafted item - prioritize items that don't sound like residues
        const craftedItem = positiveItems.reduce((best, current) => {
            const isBestResidue = best.n.toLowerCase().includes('residue') || best.n.toLowerCase().includes('shrapnel')
            const isCurrentResidue = current.n.toLowerCase().includes('residue') || current.n.toLowerCase().includes('shrapnel')
            
            if (isBestResidue && !isCurrentResidue) return current
            if (!isBestResidue && isCurrentResidue) return best
            
            // If both are residues or both are not residues, use value as tiebreaker
            return Number(current.v) > Number(best.v) ? current : best
        })
        
        const amount = Number(craftedItem.q)
        const value = Number(craftedItem.v)
        actions.push({
            type: 'craft',
            item: craftedItem.n,
            amount,
            value,
            relatedItems: [consumed[0], ...positiveItems]
        })
        consumed.forEach(c => used.add(c.key))
        positiveItems.forEach(p => used.add(p.key))
    }

    // 4.5 Match refine: consumed items (negative qty) and produced item (positive qty)
    const refineConsumed = diff.filter(d => !used.has(d.key) && d.q.startsWith('-'))
    const refineProduced = diff.filter(d => !used.has(d.key) && !d.q.startsWith('-') && d.q !== '')
    if (refineConsumed.length > 0 && refineProduced.length === 1) {
        const prod = refineProduced[0]
        const amount = Number(prod.q)
        const value = Number(prod.v)
        actions.push({
            type: 'refine',
            item: prod.n,
            amount,
            value,
            relatedItems: [...refineConsumed, prod]
        })
        refineConsumed.forEach(c => used.add(c.key))
        used.add(prod.key)
    }

    // 4.75 Match pet dismissal: pets with negative quantity
    for (const item of diff) {
        if (used.has(item.key)) continue
        if (item.n.includes('Pet') && item.q.startsWith('-') && item.c === 'CARRIED') {
            const amount = Math.abs(Number(item.q)) || 1
            const value = Math.abs(Number(item.v)) || 0
            actions.push({
                type: 'dismiss_pet',
                item: item.n,
                amount,
                value: value || undefined,
                relatedItems: [item]
            })
            used.add(item.key)
        }
    }

    // 5. Match moves: items with ⟹ or ⭢ in container, grouped by from/to
    const moveGroups = new Map<string, { from: string, to: string, items: ViewItemData[] }>()
    for (const item of diff) {
        if (used.has(item.key)) continue
        const moveMatch = item.c.match(/(.+?) ⟹ (.+)/) || item.c.match(/(.+?) ⭢ (.+)/)
        if (moveMatch) {
            const from = moveMatch[1]
            const to = moveMatch[2]
            const groupKey = `${from}|${to}`
            if (!moveGroups.has(groupKey)) {
                moveGroups.set(groupKey, { from, to, items: [] })
            }
            moveGroups.get(groupKey)!.items.push({
                key: item.key,
                n: item.n,
                q: '',
                v: '',  // Value change handled separately (e.g., in chip_out)
                c: item.c
            })
            used.add(item.key)
        }
    }
    for (const group of moveGroups.values()) {
        const itemNames = group.items.map(i => i.n)
        const displayName = itemNames.length > 3
            ? `${itemNames.slice(0, 3).join(', ')} and ${itemNames.length - 3} more`
            : itemNames.join(', ')
        actions.push({
            type: 'moved',
            item: displayName,
            from: group.from,
            to: group.to,
            relatedItems: group.items
        })
    }

    // 6. Remaining items go to unknown
    const remaining = diff.filter(d => !used.has(d.key))
    if (remaining.length > 0) {
        const itemNames = remaining.map(r => r.n)
        const displayName = itemNames.length > 3
            ? `${itemNames.slice(0, 3).join(', ')} and ${itemNames.length - 3} more`
            : itemNames.join(', ')

        const totalValue = remaining.reduce((sum, r) => sum + (Number(r.v) || 0), 0)

        actions.push({
            type: 'unknown',
            item: displayName,
            value: totalValue,
            relatedItems: remaining
        })
    }

    return actions
}

function reverseInferActions(actions: InferredAction[]): ViewItemData[] {
    const groupedItems = new Map<string, ViewItemData>()
    for (const action of actions) {
        for (const item of action.relatedItems) {
            const key = `${item.n}|${item.c}`
            if (groupedItems.has(key)) {
                const existing = groupedItems.get(key)!
                const existingQ = parseInt(existing.q) || 0
                const itemQ = parseInt(item.q) || 0
                const existingV = parseFloat(existing.v) || 0
                const itemV = parseFloat(item.v) || 0
                existing.q = (existingQ + itemQ) ? String(existingQ + itemQ) : ''
                existing.v = (existingV + itemV) ? (existingV + itemV).toFixed(2) : ''
            } else {
                groupedItems.set(key, { ...item })
            }
        }
    }
    return Array.from(groupedItems.values())
}

export {
    inferActions,
    reverseInferActions,
    matchLootWithInventory,
    LootMatch,
    MatchLootResult
}
