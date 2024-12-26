//// GAME LOG HISTORY ////
// Keep the log history and summary from game log

import { GameLogData, GameLogLine } from "./gameLogData"

const MAX_LOG_LINES = 100

interface IGameLogHistory {
    onLine(line: GameLogLine)
    getGameLog(): GameLogData
    onChange: (gameLog: GameLogData) => void
}

class GameLogHistory implements IGameLogHistory {
    private gameLog: GameLogData = { raw: [], loot: [], skill: [], global: [], stats: {} }
    public onChange: (gameLog: GameLogData) => void

    public getGameLog(): GameLogData { return this.gameLog }

    public onLine(line: GameLogLine) {
        const lastTime: string = this.gameLog.raw.length > 0 ? this.gameLog.raw[0].time : ''

        this.gameLog.raw.unshift(line)
        if (this.gameLog.raw.length > MAX_LOG_LINES)
            this.gameLog.raw.splice(MAX_LOG_LINES)

        if (line.data.loot) {
            const existing = this.gameLog.loot.find(l => l.player === line.data.loot.player && l.name === line.data.loot.name)
            if (existing) {
                existing.value += line.data.loot.value
                existing.quantity += line.data.loot.quantity
            } else {
                this.gameLog.loot.unshift(line.data.loot)
            }
            if (lastTime !== line.time) {
                if (!this.gameLog.stats.kills)
                    this.gameLog.stats.kills = 0
                this.gameLog.stats.kills++
            }
        }

        if (line.data.global) {
            this.gameLog.global.unshift(line.data.global)
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
            this.onChange(this.gameLog)
    }
}

export default GameLogHistory
export {
    IGameLogHistory
}
