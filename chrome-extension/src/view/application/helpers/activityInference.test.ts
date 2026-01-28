import { describe, test, expect } from "@jest/globals"
import { getInferenceRuleMatchReasons, itemMatchesRule, matchItemsAgainstRule, findAllMatchesInRule } from './activityInference'
import { ActivityItem, UserActionInferenceRule } from '../state/activity'

describe('activityInference', () => {
    const baseItem: ActivityItem = {
        id: 1,
        name: 'PED Card',
        quantity: 0,
        value: -1.19,
        container: 'CARRIED',
        timestamp: 1643289088000,
        source: 'inventory'
    }

    describe('itemMatchesRule', () => {
        test('matches when all conditions use "any"', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('matches with exact name match', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'PED Card' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('does not match with wrong exact name', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'Different Item' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(false)
        })

        test('matches with contains match', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'contains', value: 'PED' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('matches with regex match', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'regex', value: '^PED.*' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('is case insensitive for name exact match', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'ped card' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('matches with exact quantity', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'exact', value: '0' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('does not match with wrong quantity', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'exact', value: '5' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(false)
        })

        test('matches with exact value', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'any' },
                value: { type: 'exact', value: '-1.19' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('matches with value contains', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'any' },
                value: { type: 'contains', value: '-1' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('is case insensitive for container match', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'exact', value: 'carried' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('matches container with contains', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'contains', value: 'CAR' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('matches multiple conditions simultaneously', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'PED Card' },
                quantity: { type: 'exact', value: '0' },
                value: { type: 'exact', value: '-1.19' },
                container: { type: 'exact', value: 'CARRIED' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(true)
        })

        test('fails if one condition does not match', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'PED Card' },
                quantity: { type: 'exact', value: '0' },
                value: { type: 'exact', value: '-1.19' },
                container: { type: 'exact', value: 'STORAGE' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(false)
        })

        test('handles invalid regex gracefully', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'regex', value: '[invalid(' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(baseItem, rule)).toBe(false)
        })
    })

    describe('getInferenceRuleMatchReasons', () => {
        test('returns empty array when item matches all conditions', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'PED Card' },
                quantity: { type: 'exact', value: '0' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            const reasons = getInferenceRuleMatchReasons(baseItem, rule)
            expect(reasons).toEqual([])
        })

        test('returns reason for name mismatch', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'Different Item' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            const reasons = getInferenceRuleMatchReasons(baseItem, rule)
            expect(reasons).toContain('Name does not exact "Different Item" (got "PED Card")')
        })

        test('returns reason for quantity mismatch', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'exact', value: '5' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            const reasons = getInferenceRuleMatchReasons(baseItem, rule)
            expect(reasons).toContain('Quantity does not exact "5" (got 0)')
        })

        test('returns reason for value mismatch', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'any' },
                value: { type: 'exact', value: '10.00' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            const reasons = getInferenceRuleMatchReasons(baseItem, rule)
            expect(reasons).toContain('Value does not exact "10.00" (got -1.19)')
        })

        test('returns reason for container mismatch', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'exact', value: 'STORAGE' },
                fieldName: 'items'
            }

            const reasons = getInferenceRuleMatchReasons(baseItem, rule)
            expect(reasons).toContain('Container does not exact "STORAGE" (got "CARRIED")')
        })

        test('returns multiple reasons when multiple conditions fail', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'Different' },
                quantity: { type: 'exact', value: '10' },
                value: { type: 'exact', value: '10.00' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            const reasons = getInferenceRuleMatchReasons(baseItem, rule)
            expect(reasons.length).toBe(3)
            expect(reasons.some(r => r.includes('Name does not'))).toBe(true)
            expect(reasons.some(r => r.includes('Quantity does not'))).toBe(true)
            expect(reasons.some(r => r.includes('Value does not'))).toBe(true)
        })

        test('returns reason for contains mismatch', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'contains', value: 'Weapon' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            const reasons = getInferenceRuleMatchReasons(baseItem, rule)
            expect(reasons.some(r => r.includes('Name does not contains'))).toBe(true)
        })

        test('returns reason for regex mismatch', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'regex', value: '^Weapon.*' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            const reasons = getInferenceRuleMatchReasons(baseItem, rule)
            expect(reasons.some(r => r.includes('Name does not regex'))).toBe(true)
        })

        test('returns reason for invalid regex', () => {
            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'regex', value: '[invalid(' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            const reasons = getInferenceRuleMatchReasons(baseItem, rule)
            expect(reasons.some(r => r.includes('Name does not regex'))).toBe(true)
        })
    })

    describe('full rule matching (multiple items)', () => {
        test('matches against first rule item (PED Card)', () => {
            const items = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory' as const
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'any' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            expect(itemMatchesRule(items[0], rule.items[0])).toBe(true)
        })

        test('matches against second rule item (any match)', () => {
            const items = [
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory' as const
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'any' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            expect(itemMatchesRule(items[0], rule.items[1])).toBe(true)
        })

        test('matches both items against full rule', () => {
            const items = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory' as const
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory' as const
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'any' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            // Item 0 matches rule item 0
            expect(itemMatchesRule(items[0], rule.items[0])).toBe(true)
            // Item 1 matches rule item 1 (any match)
            expect(itemMatchesRule(items[1], rule.items[1])).toBe(true)
        })

        test('first item does not match first rule item', () => {
            const items = [
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory' as const
                },
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory' as const
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'any' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            // Weapon item does NOT match PED Card rule
            expect(itemMatchesRule(items[0], rule.items[0])).toBe(false)
            // But it DOES match the second rule (any)
            expect(itemMatchesRule(items[0], rule.items[1])).toBe(true)
        })
    })

    describe('matchItemsAgainstRule', () => {
        test('matches both items in correct order', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'any' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            expect(matchItemsAgainstRule(items, rule)).toEqual([1, 2])
        })

        test('returns empty array when no items match', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'Wrong Item',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            expect(matchItemsAgainstRule(items, rule)).toEqual([])
        })

        test('returns empty when second rule item does not match', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'exact', value: 'Specific Weapon' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            // Returns empty because second rule item doesn't match (full match required)
            expect(matchItemsAgainstRule(items, rule)).toEqual([])
        })

        test('stops matching when rule items run out', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 3,
                    name: 'Another Item',
                    quantity: 10,
                    value: 5.00,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'any' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            // Only matches first 2 items because rule only has 2 items
            expect(matchItemsAgainstRule(items, rule)).toEqual([1, 2])
        })

        test('returns empty when not enough items for all rule items', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'any' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            // Returns empty because rule has 2 items but only 1 item available
            expect(matchItemsAgainstRule(items, rule)).toEqual([])
        })

        test('matches with complex rules', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 3,
                    name: 'Daily Token',
                    quantity: 100,
                    value: 1.00,
                    container: 'STORAGE',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'exact', value: '0' },
                        value: { type: 'contains', value: '-' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'contains', value: 'Weapon' },
                        quantity: { type: 'any' },
                        value: { type: 'exact', value: '0' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'any' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            expect(matchItemsAgainstRule(items, rule)).toEqual([1, 2, 3])
        })

        test('returns empty array for empty items list', () => {
            const items: ActivityItem[] = []

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            expect(matchItemsAgainstRule(items, rule)).toEqual([])
        })

        test('returns empty array for rule with no items', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: []
            }

            expect(matchItemsAgainstRule(items, rule)).toEqual([])
        })
    })

    describe('real-world examples', () => {
        test('matches T1 Weapon Economy Enhancer in CARRIED > AUCTION container', () => {
            const weaponItem: ActivityItem = {
                id: 2,
                name: 'T1 Weapon Economy Enhancer',
                quantity: 7,
                value: 0.00,
                container: 'CARRIED ⭢ AUCTION',
                timestamp: 1643289088000,
                source: 'inventory'
            }

            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'contains', value: 'Weapon' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(weaponItem, rule)).toBe(true)
        })

        test('matches with dual rules for name and container', () => {
            const item: ActivityItem = {
                id: 1,
                name: 'PED Card',
                quantity: 0,
                value: -1.19,
                container: 'CARRIED',
                timestamp: 1643289088000,
                source: 'inventory'
            }

            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'PED Card' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'contains', value: 'CARRIED' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(item, rule)).toBe(true)
        })

        test('handles zero quantity correctly', () => {
            const item: ActivityItem = {
                id: 3,
                name: 'Test Item',
                quantity: 0,
                value: 0,
                container: 'CARRIED',
                timestamp: 1643289088000,
                source: 'inventory'
            }

            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'any' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(item, rule)).toBe(true)
        })

        test('handles negative values correctly', () => {
            const item: ActivityItem = {
                id: 1,
                name: 'PED Card',
                quantity: 0,
                value: -1.19,
                container: 'CARRIED',
                timestamp: 1643289088000,
                source: 'inventory'
            }

            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'any' },
                quantity: { type: 'any' },
                value: { type: 'contains', value: '-' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(item, rule)).toBe(true)
        })

        test('handles large quantities', () => {
            const item: ActivityItem = {
                id: 4,
                name: 'Mind Essence',
                quantity: 699485,
                value: 69.94,
                container: 'CARRIED',
                timestamp: 1643289088000,
                source: 'inventory'
            }

            const rule: UserActionInferenceRule['items'][0] = {
                name: { type: 'exact', value: 'Mind Essence' },
                quantity: { type: 'exact', value: '699485' },
                value: { type: 'any' },
                container: { type: 'any' },
                fieldName: 'items'
            }

            expect(itemMatchesRule(item, rule)).toBe(true)
        })
    })

    describe('findAllMatchesInRule', () => {
        test('finds single match when only one exists', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            const matches = findAllMatchesInRule(items, rule)
            expect(matches).toEqual([[1]])
        })

        test('finds multiple non-overlapping matches', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 3,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            const matches = findAllMatchesInRule(items, rule)
            expect(matches).toEqual([[1], [3]])
        })

        test('finds multiple matches with multi-item rules', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 3,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 4,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'contains', value: 'Weapon' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            const matches = findAllMatchesInRule(items, rule)
            expect(matches).toEqual([[1, 2], [3, 4]])
        })

        test('returns empty when no matches found', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'Wrong Item',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            const matches = findAllMatchesInRule(items, rule)
            expect(matches).toEqual([])
        })

        test('returns empty for empty items list', () => {
            const items: ActivityItem[] = []

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            const matches = findAllMatchesInRule(items, rule)
            expect(matches).toEqual([])
        })

        test('returns empty for rule with no items', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: []
            }

            const matches = findAllMatchesInRule(items, rule)
            expect(matches).toEqual([])
        })

        test('finds partial match when not enough items for remaining rule', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 3,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'contains', value: 'Weapon' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            // Should find one complete match (PED Card + Weapon), then can't find another Weapon for the second PED Card
            const matches = findAllMatchesInRule(items, rule)
            expect(matches).toEqual([[1, 2]])
        })

        test('does not reuse items across multiple matches', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'contains', value: 'Weapon' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            // Should find one match only - items can't be reused
            const matches = findAllMatchesInRule(items, rule)
            expect(matches).toEqual([[1, 2]])
        })

        test('handles complex multi-item rules finding multiple matches', () => {
            const items: ActivityItem[] = [
                {
                    id: 1,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 2,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 3,
                    name: 'Daily Token',
                    quantity: 100,
                    value: 1.00,
                    container: 'STORAGE',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 4,
                    name: 'PED Card',
                    quantity: 0,
                    value: -1.19,
                    container: 'CARRIED',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 5,
                    name: 'T1 Weapon Economy Enhancer',
                    quantity: 7,
                    value: 0.00,
                    container: 'CARRIED ⭢ AUCTION',
                    timestamp: 1643289088000,
                    source: 'inventory'
                },
                {
                    id: 6,
                    name: 'Mind Essence',
                    quantity: 100,
                    value: 10.00,
                    container: 'STORAGE',
                    timestamp: 1643289088000,
                    source: 'inventory'
                }
            ]

            const rule: UserActionInferenceRule = {
                items: [
                    {
                        name: { type: 'exact', value: 'PED Card' },
                        quantity: { type: 'exact', value: '0' },
                        value: { type: 'contains', value: '-' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'contains', value: 'Weapon' },
                        quantity: { type: 'any' },
                        value: { type: 'exact', value: '0' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    },
                    {
                        name: { type: 'any' },
                        quantity: { type: 'any' },
                        value: { type: 'any' },
                        container: { type: 'any' },
                        fieldName: 'items'
                    }
                ]
            }

            const matches = findAllMatchesInRule(items, rule)
            expect(matches).toEqual([[1, 2, 3], [4, 5, 6]])
        })
    })
})
