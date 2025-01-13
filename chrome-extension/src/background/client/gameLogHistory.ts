//// GAME LOG HISTORY ////
// Keep the log history and summary from game log

import { emptyGameLogData, GameLogData, GameLogLine } from "./gameLogData"

const MAX_LOG_LINES = 500

interface IGameLogHistory {
    onLine(line: GameLogLine): Promise<void>
    clear(): Promise<void>
    getGameLog(): GameLogData
    onChange: (gameLog: GameLogData) => Promise<void>
}

class GameLogHistory implements IGameLogHistory {
    private gameLog: GameLogData = emptyGameLogData()
    private lastLootTime: string
    public onChange: (gameLog: GameLogData) => Promise<void>

    public getGameLog(): GameLogData { return this.gameLog }
    public async setGameLog(gameLog: GameLogData): Promise<void> {
        this.gameLog = gameLog
        if (this.onChange)
            await this.onChange(this.gameLog)
    }

    public async clear(): Promise<void> {
        await this.setGameLog(emptyGameLogData())
    }

    public async onLine(line: GameLogLine): Promise<void> {
        this.gameLog.raw.unshift(line)
        if (this.gameLog.raw.length > MAX_LOG_LINES)
            this.gameLog.raw.splice(MAX_LOG_LINES)

        if (line.data.loot) {
            const existing = this.gameLog.loot.find(l => l.name === line.data.loot.name)
            if (existing) {
                existing.value += line.data.loot.value
                existing.quantity += line.data.loot.quantity
            } else {
                this.gameLog.loot.unshift(line.data.loot)
            }
            if (this.lastLootTime !== line.time) {
                if (!this.gameLog.stats.kills)
                    this.gameLog.stats.kills = 0
                this.gameLog.stats.kills++
            }
            this.lastLootTime = line.time
        }

        if (line.data.team) {
            const existing = this.gameLog.team.find(l => l.player === line.data.team.player && l.name === line.data.team.name)
            if (existing) {
                existing.quantity += line.data.team.quantity
            } else {
                this.gameLog.team.unshift(line.data.team)
            }
        }

        if (line.data.global) {
            this.gameLog.global.unshift(line.data.global)
        }

        if (line.data.event) {
            this.gameLog.event.unshift(line.data.event)
        }

        if (line.data.enhancerBroken) {
            this.gameLog.enhancerBroken.unshift(line.data.enhancerBroken)
        }

        if (line.data.tier) {
            const existing = this.gameLog.tier.find(t => t.name === line.data.tier.name)
            if (existing) {
                existing.tier = line.data.tier.tier
            } else {
                this.gameLog.tier.unshift(line.data.tier)
            }
        }

        if (line.data.skill) {
            const existing = this.gameLog.skill.find(s => s.name === line.data.skill.name)
            if (existing) {
                existing.value += line.data.skill.value
            } else {
                this.gameLog.skill.unshift(line.data.skill)
            }
        }

        if (line.data.stats) {
            Object.entries(line.data.stats).forEach(([key, value]) => {
                if (this.gameLog.stats[key] === undefined)
                    this.gameLog.stats[key] = 0
                this.gameLog.stats[key] += value
            })
        }

        if (this.onChange)
            await this.onChange(this.gameLog)
    }
}

export default GameLogHistory
export {
    IGameLogHistory
}
