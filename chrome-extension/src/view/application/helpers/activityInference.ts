import { ActivityItem, UserActionInferenceRule } from '../state/activity'

/**
 * Get detailed reasons why an item does not match a rule
 * If the returned array is empty, the item matches the rule
 */
export function getInferenceRuleMatchReasons(
    item: ActivityItem,
    rule: UserActionInferenceRule['items'][0]
): string[] {
    const reasons: string[] = []

    // Check name
    if (rule.name.type !== 'any') {
        const itemNameStr = String(item.name).toLowerCase()
        const ruleValue = String(rule.name.value).toLowerCase()
        let failed = false

        if (rule.name.type === 'exact' && itemNameStr !== ruleValue) failed = true
        if (rule.name.type === 'contains' && !itemNameStr.includes(ruleValue)) failed = true
        if (rule.name.type === 'regex') {
            try {
                const regex = new RegExp(rule.name.value, 'i')
                if (!regex.test(itemNameStr)) failed = true
            } catch {
                failed = true
            }
        }

        if (failed) {
            reasons.push(`Name does not ${rule.name.type} "${rule.name.value}" (got "${item.name}")`)
        }
    }

    // Check quantity
    if (rule.quantity.type !== 'any') {
        const itemQty = String(item.quantity)
        const ruleValue = String(rule.quantity.value)
        let failed = false

        if (rule.quantity.type === 'exact' && itemQty !== ruleValue) failed = true
        if (rule.quantity.type === 'contains' && !itemQty.includes(ruleValue)) failed = true
        if (rule.quantity.type === 'regex') {
            try {
                const regex = new RegExp(rule.quantity.value)
                if (!regex.test(itemQty)) failed = true
            } catch {
                failed = true
            }
        }

        if (failed) {
            reasons.push(`Quantity does not ${rule.quantity.type} "${rule.quantity.value}" (got ${item.quantity})`)
        }
    }

    // Check value
    if (rule.value.type !== 'any') {
        const itemValue = String(item.value)
        const ruleValue = String(rule.value.value)
        let failed = false

        if (rule.value.type === 'exact' && itemValue !== ruleValue) failed = true
        if (rule.value.type === 'contains' && !itemValue.includes(ruleValue)) failed = true
        if (rule.value.type === 'regex') {
            try {
                const regex = new RegExp(rule.value.value)
                if (!regex.test(itemValue)) failed = true
            } catch {
                failed = true
            }
        }

        if (failed) {
            reasons.push(`Value does not ${rule.value.type} "${rule.value.value}" (got ${item.value})`)
        }
    }

    // Check container
    if (rule.container.type !== 'any') {
        const itemContainer = String(item.container).toLowerCase()
        const ruleValue = String(rule.container.value).toLowerCase()
        let failed = false

        if (rule.container.type === 'exact' && itemContainer !== ruleValue) failed = true
        if (rule.container.type === 'contains' && !itemContainer.includes(ruleValue)) failed = true
        if (rule.container.type === 'regex') {
            try {
                const regex = new RegExp(rule.container.value, 'i')
                if (!regex.test(itemContainer)) failed = true
            } catch {
                failed = true
            }
        }

        if (failed) {
            reasons.push(`Container does not ${rule.container.type} "${rule.container.value}" (got "${item.container}")`)
        }
    }

    return reasons
}

/**
 * Check if an item matches a rule
 * Returns true if all rule conditions are satisfied
 */
export function itemMatchesRule(item: ActivityItem, rule: UserActionInferenceRule['items'][0]): boolean {
    return getInferenceRuleMatchReasons(item, rule).length === 0
}

/**
 * Match items against a full inference rule
 * Performs 1-to-1 matching: each item is matched against corresponding rule item in order
 * Returns array of item IDs only if ALL rule items are matched
 * Returns empty array if any rule item fails to match
 */
export function matchItemsAgainstRule(
    items: ActivityItem[],
    rule: UserActionInferenceRule
): number[] {
    const ruleItems = rule.items

    // If no rule items or not enough items available, no match
    if (ruleItems.length === 0 || items.length < ruleItems.length) {
        return []
    }

    const matchedItemIds: number[] = []

    // Check each rule item against corresponding item
    for (let idx = 0; idx < ruleItems.length; idx++) {
        if (itemMatchesRule(items[idx], ruleItems[idx])) {
            matchedItemIds.push(items[idx].id)
        } else {
            // If any rule item doesn't match, return empty (full match required)
            return []
        }
    }

    return matchedItemIds
}

/**
 * Find all possible matches for a rule within the available items
 * Continues searching through items array for the rule pattern
 * Returns array of arrays - each sub-array contains matched item IDs for one complete rule match
 */
export function findAllMatchesInRule(
    items: ActivityItem[],
    rule: UserActionInferenceRule
): number[][] {
    const ruleItems = rule.items
    const allMatches: number[][] = []

    // If no rule items, return empty
    if (ruleItems.length === 0) {
        return []
    }

    // Track which items have been used
    const usedItemIndices = new Set<number>()

    // Keep searching for matches until no more are found
    let foundMatch = true
    while (foundMatch) {
        foundMatch = false
        const matchedItemIds: number[] = []
        let matchStartIdx = -1

        // Try to find a sequence of items that matches the rule
        for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
            if (usedItemIndices.has(itemIdx)) continue

            const ruleItemIdx = matchedItemIds.length

            // If we have matched all rule items, we have a complete match
            if (ruleItemIdx === ruleItems.length) {
                break
            }

            // Try to match current item against the next rule item
            if (itemMatchesRule(items[itemIdx], ruleItems[ruleItemIdx])) {
                if (matchedItemIds.length === 0) {
                    matchStartIdx = itemIdx
                }
                matchedItemIds.push(items[itemIdx].id)
            } else {
                // Reset if this item doesn't match and we were building a sequence
                if (matchedItemIds.length > 0) {
                    matchedItemIds.length = 0
                }
            }

            // If we've matched all rule items, we have a complete match
            if (matchedItemIds.length === ruleItems.length) {
                foundMatch = true
                break
            }
        }

        // If we found a complete match, mark items as used and record the match
        if (foundMatch && matchedItemIds.length === ruleItems.length) {
            allMatches.push(matchedItemIds)
            // Mark the matched items as used
            for (let idx = 0; idx < items.length; idx++) {
                if (matchedItemIds.includes(items[idx].id)) {
                    usedItemIndices.add(idx)
                }
            }
        }
    }

    return allMatches
}
