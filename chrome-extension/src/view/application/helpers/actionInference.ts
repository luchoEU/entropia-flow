import { InferredAction } from '../state/activity'
import { ViewItemData } from '../state/history'

const PED_CARD = 'PED Card'

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

    // 2.5 Match auction wins without AUCTION container: item gained + PED Card loss
    if (pedCard && pedCard.v.startsWith('-') && !used.has(pedCard.key)) {
        const gainedItems = diff.filter(d => !used.has(d.key) && !d.q.startsWith('-') && d.q !== '')
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

    // 4. Match refine: consumed items (negative qty) and produced item (positive qty)
    const consumed = diff.filter(d => !used.has(d.key) && d.q.startsWith('-'))
    const produced = diff.filter(d => !used.has(d.key) && !d.q.startsWith('-') && d.q !== '')
    if (consumed.length > 0 && produced.length === 1) {
        const prod = produced[0]
        const amount = Number(prod.q)
        const value = Number(prod.v)
        actions.push({
            type: 'refine',
            item: prod.n,
            amount,
            value,
            relatedItems: [...consumed, prod]
        })
        consumed.forEach(c => used.add(c.key))
        used.add(prod.key)
    }

    // 5. Match moves: items with ⟹ or ⭢ in container
    for (const item of diff) {
        if (used.has(item.key)) continue
        const moveMatch = item.c.match(/(.+?) ⟹ (.+)/) || item.c.match(/(.+?) ⭢ (.+)/)
        if (moveMatch) {
            const from = moveMatch[1]
            const to = moveMatch[2]
            actions.push({
                type: 'moved',
                item: item.n,
                from,
                to,
                relatedItems: [{
                    key: item.key,
                    n: item.n,
                    q: '',
                    v: '',  // Value change handled separately (e.g., in chip_out)
                    c: item.c
                }]
            })
            used.add(item.key)
        }
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

export {
    inferActions
}
