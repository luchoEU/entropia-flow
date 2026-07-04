import { describe, expect, it } from '@jest/globals'
import { buildFishingStats, formatDuration, formatDurationPrecise, formatFishingTime, formatFishingTimeWithDayOffset, getFishingDayOffset, summarizeFishingSession, summarizeFishingStats } from './fishing'
import { ViewInventory } from '../state/history'

describe('fishing helper', () => {
    it('should build per-fish timing stats from inventory history', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const historyItems: ViewInventory[] = [
            {
                key: 1,
                text: '',
                class: '',
                info: '',
                expanded: false,
                diff: [
                    { key: 0, n: 'Blue fish', q: '1', v: '0.50', c: 'CARRIED' }
                ],
                sortType: 0,
                canBeLast: true,
                rawInventory: { meta: { date: 1_000 } } as any,
                showActions: true
            },
            {
                key: 2,
                text: '',
                class: '',
                info: '',
                expanded: false,
                diff: [
                    { key: 1, n: 'Blue fish', q: '2', v: '1.00', c: 'CARRIED' },
                    { key: 2, n: 'Decay', q: '-1', v: '-0.05', c: 'CARRIED' }
                ],
                sortType: 0,
                canBeLast: true,
                rawInventory: { meta: { date: 4_000 } } as any,
                showActions: true
            },
            {
                key: 3,
                text: '',
                class: '',
                info: '',
                expanded: false,
                diff: [
                    { key: 3, n: 'Blue fish', q: '1', v: '0.25', c: 'CARRIED' },
                    { key: 4, n: 'Green fish', q: '1', v: '0.75', c: 'CARRIED' }
                ],
                sortType: 0,
                canBeLast: true,
                rawInventory: { meta: { date: 7_000 } } as any,
                showActions: true
            }
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const stats = buildFishingStats(historyItems)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(stats['Blue fish'].count).toBe(4)
        expect(stats['Blue fish'].firstLootTime).toBe(1_000)
        expect(stats['Blue fish'].lastLootTime).toBe(7_000)
        expect(stats['Blue fish'].lastIntervalMs).toBe(3_000)
        expect(stats['Blue fish'].averageIntervalMs).toBe(3_000)
        expect(stats['Green fish'].count).toBe(1)
        expect(stats['Decay']).toBeUndefined()
    })

    it('should format durations and timestamps safely', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const duration = 61_000
        const timestamp = 1_000

        // ============================================================================
        // ACT
        // ============================================================================
        const formattedDuration = formatDuration(duration)
        const formattedTime = formatFishingTime(timestamp)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(formattedDuration).toBe('1m 01s')
        expect(formattedTime).not.toBe('—')
        expect(formatDuration(undefined)).toBe('—')
        expect(formatFishingTime(undefined)).toBe('—')
    })

    it('should format day offsets and precise durations for summary stats', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const dayZero = 1_000
        const later = dayZero + (24 * 60 * 60 * 1000) * 2 + 5_000
        const historyItems: ViewInventory[] = [
            {
                key: 1,
                text: '',
                class: '',
                info: '',
                expanded: false,
                diff: [{ key: 0, n: 'Blue fish', q: '1', v: '0.50', c: 'CARRIED' }],
                sortType: 0,
                canBeLast: true,
                rawInventory: { meta: { date: dayZero } } as any,
                showActions: true
            },
            {
                key: 2,
                text: '',
                class: '',
                info: '',
                expanded: false,
                diff: [{ key: 1, n: 'Blue fish', q: '1', v: '0.50', c: 'CARRIED' }],
                sortType: 0,
                canBeLast: true,
                rawInventory: { meta: { date: later } } as any,
                showActions: true
            }
        ]

        const stats = buildFishingStats(historyItems)

        // ============================================================================
        // ACT
        // ============================================================================
        const formatted = formatFishingTimeWithDayOffset(later, dayZero)
        const dayOffset = getFishingDayOffset(later, dayZero)
        const summary = summarizeFishingStats(stats, later + 1_234)
        const sessionSummary = summarizeFishingSession(historyItems, [], 0, later + 1_234)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(formatted.timeText).not.toBe('—')
        expect(formatted.dayOffset).toBe(2)
        expect(dayOffset).toBe(2)
        expect(formatDurationPrecise(61_234)).toBe('1m 01.2s')
        expect(summary.totalCount).toBe(2)
        expect(summary.averageIntervalMs).toBe(172805000)
        expect(summary.timerSinceLastMs).toBe(1234)
        expect(sessionSummary.lastIntervalMs).toBe(172805000)
        expect(sessionSummary.totalCount).toBe(2)
    })

    it('should ignore history entries at or before the session start timestamp', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const historyItems: ViewInventory[] = [
            {
                key: 1,
                text: '',
                class: '',
                info: '',
                expanded: false,
                diff: [{ key: 0, n: 'Blue fish', q: '1', v: '0.50', c: 'CARRIED' }],
                sortType: 0,
                canBeLast: true,
                rawInventory: { meta: { date: 1_000 } } as any,
                showActions: true
            },
            {
                key: 2,
                text: '',
                class: '',
                info: '',
                expanded: false,
                diff: [{ key: 1, n: 'Blue fish', q: '2', v: '1.00', c: 'CARRIED' }],
                sortType: 0,
                canBeLast: true,
                rawInventory: { meta: { date: 5_000 } } as any,
                showActions: true
            }
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const statsBeforeReset = buildFishingStats(historyItems)
        const statsAfterReset = buildFishingStats(historyItems, [], 5_000)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(statsBeforeReset['Blue fish'].count).toBe(3)
        expect(statsAfterReset['Blue fish']).toBeUndefined()
    })

    it('should keep first and last equal for a fish looted only once', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const historyItems: ViewInventory[] = [
            {
                key: 1,
                text: '',
                class: '',
                info: '',
                expanded: false,
                diff: [{ key: 0, n: 'Juvenile Siltswimmer', q: '1', v: '0.01', c: 'CARRIED' }],
                sortType: 0,
                canBeLast: true,
                rawInventory: { meta: { date: 1_000 } } as any,
                showActions: true
            }
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const stats = buildFishingStats(historyItems)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(stats['Juvenile Siltswimmer'].count).toBe(1)
        expect(stats['Juvenile Siltswimmer'].firstLootTime).toBe(1_000)
        expect(stats['Juvenile Siltswimmer'].lastLootTime).toBe(1_000)
        expect(stats['Juvenile Siltswimmer'].lastIntervalMs).toBeNull()
        expect(stats['Juvenile Siltswimmer'].averageIntervalMs).toBeNull()
    })
})
