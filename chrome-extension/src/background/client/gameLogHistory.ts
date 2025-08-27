//// GAME LOG HISTORY ////
// Keep the log history and summary from game log

import { emptyTemporalValue } from "../../common/state"
import { emptyGameLogData, GameLogData, GameLogLine } from "./gameLogData"

const MAX_LOG_LINES = 1000

interface IGameLogHistory {
    onLines(lines: GameLogLine[]): Promise<void>;
    clearSession(): Promise<void>;
    getGameLog(): GameLogData;
    subscribeOnChanged(callback: (gameLog: GameLogData) => Promise<void>): void;
    unsubscribeOnChanged(callback: (gameLog: GameLogData) => Promise<void>): void;
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
    private timeout: NodeJS.Timeout
    private listeners: ((gameLog: GameLogData) => Promise<void>)[] = []

    public getGameLog(): GameLogData { return this.gameLog }
    public async setGameLog(gameLog: GameLogData): Promise<void> {
        this.gameLog = gameLog
        await this.notifyChanged()
    }

    public subscribeOnChanged(callback: (gameLog: GameLogData) => Promise<void>): void {
        this.listeners.push(callback);
    }

    public unsubscribeOnChanged(callback: (gameLog: GameLogData) => Promise<void>): void {
        this.listeners = this.listeners.filter(fn => fn !== callback);
    }

    private async notifyChanged(): Promise<void> {
        for (const listener of this.listeners) {
            await listener(this.gameLog);
        }
    }

    public async clearSession(): Promise<void> {
        await this.setGameLog({ ...emptyGameLogData(), trade: this.gameLog.trade || [] });
    }

    public async onLines(lines: GameLogLine[]): Promise<void> {
        if (this.timeout)
            clearTimeout(this.timeout)

        for (const line of lines)
            await this.processLine(line)

        this.timeout = setTimeout(async () => { // use timeout to process all lines in websocket queue before sending to view
            this.timeout = undefined
            await this.notifyChanged()
        }, 100)
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
                if (!this.lastLootDateTime || line.time - this.lastLootDateTime > 1000) {
                    if (!this.gameLog.stats.kills)
                        this.gameLog.stats.kills = emptyTemporalValue();
                    this.gameLog.stats.kills.count++;
                    this.gameLog.stats.kills.total = this.gameLog.stats.kills.count;
                    _unshiftWithMax(this.gameLog.stats.kills.history, { time: line.time, value: 1 });
                }
                this.lastLootDateTime = line.time;
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
                _unshiftWithMax(this.gameLog.stats[key].history, { time: line.time, value })
            })
        }

        if (line.data.trade) {
            this.gameLog.trade = this.gameLog.trade.filter(t => t.player !== line.data.trade!.player || t.message !== line.data.trade!.message);
            _unshiftWithMax(this.gameLog.trade, line.data.trade!)
        }
    }

    private removeFromKillCount(time: number) {
        if (!this.gameLog.stats.kills)
            return;

        if (!this.lastLootDateTime || time - this.lastLootDateTime <= 1000) { // 1 second
            if (this.gameLog.stats.kills.count == 1) {
                this.gameLog.stats.kills = undefined
            } else {
                this.gameLog.stats.kills.history.shift();
                this.gameLog.stats.kills.count--;
                this.gameLog.stats.kills.total = this.gameLog.stats.kills.count;
            }
        }
        this.lastLootDateTime = time
    }
}

export default GameLogHistory
export {
    IGameLogHistory
}
