import { ViewInventory } from '../state/history'

interface FishingStat {
    count: number
    totalValue: number
    firstLootTime: number
    lastLootTime: number
    intervals: number[]
    lastIntervalMs: number | null
    averageIntervalMs: number | null
}

type FishingStatsMap = Record<string, FishingStat>

interface FishingSummary {
    totalValue: number
    totalCount: number
    firstLootTime: number | null
    lastLootTime: number | null
    lastIntervalMs: number | null
    averageIntervalMs: number | null
    timerSinceLastMs: number | null
}

const DAY_MS = 24 * 60 * 60 * 1000

const formatDuration = (ms: number | null | undefined): string => {
    if (ms === undefined || ms === null || !Number.isFinite(ms) || ms < 0) return '—'

    const totalSeconds = Math.round(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad = (value: number) => value.toString().padStart(2, '0')

    if (hours > 0) return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
    if (minutes > 0) return `${minutes}m ${pad(seconds)}s`
    return `${seconds}s`
}

const formatDurationPrecise = (ms: number | null | undefined): string => {
    if (ms === undefined || ms === null || !Number.isFinite(ms) || ms < 0) return '—'

    const totalSeconds = ms / 1000
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = (totalSeconds % 60).toFixed(1).padStart(4, '0')

    if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
}

const formatFishingTime = (time: number | null | undefined): string => {
    if (!time) return '—'
    const date = new Date(time)
    return date.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}

const getFishingDayOffset = (time: number | null | undefined, dayZeroTime: number | null | undefined): number | null => {
    if (time === undefined || time === null || dayZeroTime === undefined || dayZeroTime === null) return null
    return Math.max(0, Math.floor((time - dayZeroTime) / DAY_MS))
}

const formatFishingTimeWithDayOffset = (time: number | null | undefined, dayZeroTime: number | null | undefined): { timeText: string, dayOffset: number | null } => ({
    timeText: formatFishingTime(time),
    dayOffset: getFishingDayOffset(time, dayZeroTime)
})

const summarizeFishingStats = (stats: FishingStatsMap, now: number = Date.now()): FishingSummary => {
    const values = Object.values(stats)
    const totalValue = values.reduce((sum, stat) => sum + stat.totalValue, 0)
    const totalCount = values.reduce((sum, stat) => sum + stat.count, 0)
    const firstLootTime = values.length > 0
        ? Math.min(...values.map(stat => stat.firstLootTime))
        : null
    const lastLootTime = values.length > 0
        ? Math.max(...values.map(stat => stat.lastLootTime))
        : null
    const intervals = values.flatMap(stat => stat.intervals)
    const lastIntervalMs = values.length > 0
        ? values.reduce((max, stat) => {
            if (stat.lastIntervalMs === null) return max
            return max === null ? stat.lastIntervalMs : Math.max(max, stat.lastIntervalMs)
        }, null as number | null)
        : null
    const averageIntervalMs = intervals.length > 0
        ? intervals.reduce((sum, value) => sum + value, 0) / intervals.length
        : null
    const timerSinceLastMs = lastLootTime === null ? null : now - lastLootTime

    return {
        totalValue,
        totalCount,
        firstLootTime,
        lastLootTime,
        lastIntervalMs,
        averageIntervalMs,
        timerSinceLastMs
    }
}

const summarizeFishingSession = (history: ViewInventory[], excludedNames: string[] = [], sessionStartTime: number = 0, now: number = Date.now()): FishingSummary => {
    const excluded = new Set(excludedNames)
    const ordered = [...history]
        .filter(view => view.diff && view.diff.length > 0)
        .filter(view => (view.rawInventory.meta.lastDate ?? view.rawInventory.meta.date) > sessionStartTime)
        .sort((a, b) => {
            const timeDiff = (a.rawInventory.meta.lastDate ?? a.rawInventory.meta.date) - (b.rawInventory.meta.lastDate ?? b.rawInventory.meta.date)
            if (timeDiff !== 0) return timeDiff
            return a.key - b.key
        })

    let totalValue = 0
    let totalCount = 0
    let firstLootTime: number | null = null
    let lastLootTime: number | null = null
    let lastEventTime: number | null = null
    const intervals: number[] = []

    for (const view of ordered) {
        const eventTime = view.rawInventory.meta.lastDate ?? view.rawInventory.meta.date
        for (const item of view.diff ?? []) {
            if (excluded.has(item.n) || item.e || item.x) continue

            const quantity = Number(item.q)
            if (!Number.isFinite(quantity) || quantity <= 0) continue

            const value = Number(item.v) || 0
            totalCount += quantity
            totalValue += value
            firstLootTime = firstLootTime === null ? eventTime : Math.min(firstLootTime, eventTime)
            lastLootTime = lastLootTime === null ? eventTime : Math.max(lastLootTime, eventTime)
            if (lastEventTime !== null) {
                intervals.push(eventTime - lastEventTime)
            }
            lastEventTime = eventTime
        }
    }

    const averageIntervalMs = intervals.length > 0
        ? intervals.reduce((sum, value) => sum + value, 0) / intervals.length
        : null
    const lastIntervalMs = intervals.length > 0 ? intervals[intervals.length - 1] : null
    const timerSinceLastMs = lastLootTime === null ? null : now - lastLootTime

    return {
        totalValue,
        totalCount,
        firstLootTime,
        lastLootTime,
        lastIntervalMs,
        averageIntervalMs,
        timerSinceLastMs
    }
}

const buildFishingStats = (history: ViewInventory[], excludedNames: string[] = [], sessionStartTime: number = 0): FishingStatsMap => {
    const excluded = new Set(excludedNames)
    const ordered = [...history]
        .filter(view => view.diff && view.diff.length > 0)
        .filter(view => (view.rawInventory.meta.lastDate ?? view.rawInventory.meta.date) > sessionStartTime)
        .sort((a, b) => {
            const timeDiff = (a.rawInventory.meta.lastDate ?? a.rawInventory.meta.date) - (b.rawInventory.meta.lastDate ?? b.rawInventory.meta.date)
            if (timeDiff !== 0) return timeDiff
            return a.key - b.key
        })

    const stats: Record<string, Omit<FishingStat, 'lastIntervalMs' | 'averageIntervalMs'>> = {}

    for (const view of ordered) {
        const eventTime = view.rawInventory.meta.lastDate ?? view.rawInventory.meta.date
        for (const item of view.diff ?? []) {
            if (excluded.has(item.n) || item.e || item.x) continue

            const quantity = Number(item.q)
            if (!Number.isFinite(quantity) || quantity <= 0) continue

            const value = Number(item.v) || 0
            const current = stats[item.n] ?? {
                count: 0,
                totalValue: 0,
                firstLootTime: eventTime,
                lastLootTime: eventTime,
                intervals: []
            }

            if (current.count > 0) {
                current.intervals.push(eventTime - current.lastLootTime)
            }

            current.count += quantity
            current.totalValue += value
            current.firstLootTime = Math.min(current.firstLootTime, eventTime)
            current.lastLootTime = Math.max(current.lastLootTime, eventTime)

            stats[item.n] = current
        }
    }

    return Object.fromEntries(Object.entries(stats).map(([name, stat]) => {
        if (stat.count <= 1) {
            return [name, {
                ...stat,
                lastLootTime: stat.firstLootTime,
                lastIntervalMs: null,
                averageIntervalMs: null
            }]
        }
        const averageIntervalMs = stat.intervals.length > 0
            ? stat.intervals.reduce((sum, value) => sum + value, 0) / stat.intervals.length
            : null
        const lastIntervalMs = stat.intervals.length > 0
            ? stat.intervals[stat.intervals.length - 1]
            : null

        return [name, {
            ...stat,
            lastIntervalMs,
            averageIntervalMs
        }]
    }))
}

export {
    buildFishingStats,
    formatDuration,
    formatDurationPrecise,
    formatFishingTime,
    formatFishingTimeWithDayOffset,
    getFishingDayOffset,
    summarizeFishingStats,
    summarizeFishingSession,
    FishingStat,
    DAY_MS,
}

export type {
    FishingStatsMap
}
