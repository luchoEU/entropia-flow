//// GAME LOG HISTORY ////
// Keep the log history and summary from game log

import { gameTime } from "../../common/date"
import { emptyTemporalValue } from "../../common/state"
import { emptyGameLogData, GameLogData, GameLogLine } from "./gameLogData"

const MAX_LOG_LINES = 1000

interface IGameLogHistory {
    onLines(lines: GameLogLine[]): Promise<void>
    clearSession(): Promise<void>
    getGameLog(): GameLogData
    onChange: (gameLog: GameLogData) => Promise<void>
}

const ignoreLootForKill = [
    'Brukite', 'Kaldon', 'Nissit', 'Rutol', 'Sopur', 'Trutun',
    'Bombardo', 'Caroot', 'Haimoros', 'Papplon',
    'Common Dung',
]

function _unshiftWithMax<T>(list: T[], item: T) {
    list.unshift(item)
    if (list.length > MAX_LOG_LINES)
        list.splice(MAX_LOG_LINES)
}

class GameLogHistory implements IGameLogHistory {
    private gameLog: GameLogData = emptyGameLogData()
    private lastLootDateTime: number
    public onChange: (gameLog: GameLogData) => Promise<void>

    public getGameLog(): GameLogData { return this.gameLog }
    public async setGameLog(gameLog: GameLogData): Promise<void> {
        this.gameLog = gameLog
        if (this.onChange)
            await this.onChange(this.gameLog)
    }

    public async clearSession(): Promise<void> {
        await this.setGameLog({ ...emptyGameLogData(), trade: this.gameLog.trade || [] });
    }

    public async onLines(lines: GameLogLine[]): Promise<void> {
        for (const line of lines)
            await this.processLine(line)

        if (this.onChange)
            await this.onChange(this.gameLog)
    }

    private async processLine(line: GameLogLine) {
        _unshiftWithMax(this.gameLog.raw, line)

        if (line.data.loot) {
            const existing = this.gameLog.loot.find(l => l.name === line.data.loot!.name);
            if (existing) {
                existing.value += line.data.loot.value;
                existing.quantity += line.data.loot.quantity;
            } else {
                this.gameLog.loot.unshift(line.data.loot);
            }

            if (!ignoreLootForKill.includes(line.data.loot.name)) {
                const lineDateTime: number = gameTime(line.time);
                if (!this.lastLootDateTime || lineDateTime - this.lastLootDateTime > 1000) {
                    if (!this.gameLog.stats.kills)
                        this.gameLog.stats.kills = emptyTemporalValue();
                    this.gameLog.stats.kills.count++;
                    this.gameLog.stats.kills.total = this.gameLog.stats.kills.count;
                    _unshiftWithMax(this.gameLog.stats.kills.history, { time: lineDateTime, value: 1 });
                }
                this.lastLootDateTime = lineDateTime;
            }
        }

        if (line.data.team) {
            const existing = this.gameLog.team.find(l => l.player === line.data.team!.player && l.name === line.data.team!.name)
            if (existing) {
                existing.quantity += line.data.team!.quantity
            } else {
                this.gameLog.team.unshift(line.data.team!)
            }
        }

        if (line.data.global) {
            _unshiftWithMax(this.gameLog.global, line.data.global)
        }

        if (line.data.event) {
            _unshiftWithMax(this.gameLog.event, line.data.event)
        }

        if (line.data.enhancerBroken) {
            this.removeFromKillCount(line.time)
            this.gameLog.enhancerBroken.unshift(line.data.enhancerBroken)
        }

        if (line.data.tier) {
            const existing = this.gameLog.tier.find(t => t.name === line.data.tier!.name)
            if (existing) {
                existing.tier = line.data.tier!.tier
            } else {
                this.gameLog.tier.unshift(line.data.tier!)
            }
        }

        if (line.data.skill) {
            const existing = this.gameLog.skill.find(s => s.name === line.data.skill!.name)
            if (existing) {
                existing.value += line.data.skill!.value
            } else {
                this.gameLog.skill.unshift(line.data.skill!)
            }
        }

        if (line.data.stats) {
            Object.entries(line.data.stats).forEach(([key, value]) => {
                if (this.gameLog.stats[key] === undefined)
                    this.gameLog.stats[key] = emptyTemporalValue()
                this.gameLog.stats[key].count++
                this.gameLog.stats[key].total += value
                _unshiftWithMax(this.gameLog.stats[key].history, { time: gameTime(line.time), value })
            })
        }

        if (line.data.trade) {
            this.gameLog.trade = this.gameLog.trade.filter(t => t.player !== line.data.trade!.player || t.message !== line.data.trade!.message);
            _unshiftWithMax(this.gameLog.trade, line.data.trade!)
        }
    }

    private removeFromKillCount(time: string) {
        if (!this.gameLog.stats.kills)
            return;

        const lineDateTime: number = gameTime(time);
        if (!this.lastLootDateTime || lineDateTime - this.lastLootDateTime <= 1000) { // 1 second
            if (this.gameLog.stats.kills.count == 1) {
                this.gameLog.stats.kills = undefined
            } else {
                this.gameLog.stats.kills.history.shift();
                this.gameLog.stats.kills.count--;
                this.gameLog.stats.kills.total = this.gameLog.stats.kills.count;
            }
        }
        this.lastLootDateTime = lineDateTime
    }
}

export default GameLogHistory
export {
    IGameLogHistory
}
