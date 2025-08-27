import { StreamStateVariable, StreamTemporalVariable } from "../../stream/data";
import { StreamVariablesBuilder, StreamTemporalVariablesBuilder, StreamBuilderState } from "./streamVariablesBuilder";
import { IGameLogHistory } from "./gameLogHistory";
import { GameLogData, gameLogStatsDecimals, gameLogStatsKeys } from "./gameLogData";
import { emptyTemporalValue } from "../../common/state";

class GameLogVariablesBuilder implements StreamVariablesBuilder, StreamTemporalVariablesBuilder {
    private gameLogHistory: IGameLogHistory
    public onChanged?: () => Promise<void>
    public onTemporalChanged?: () => Promise<void>
    
    constructor(gameLogHistory: IGameLogHistory) {
        this.gameLogHistory = gameLogHistory
        this.gameLogHistory.subscribeOnChanged(async () => await this.onChanged?.())
    }
    
    getName(): string {
        return 'gameLog'
    }

    async getVariables(state: StreamBuilderState): Promise<StreamStateVariable[]> {
        const gameLog = this.gameLogHistory.getGameLog()
        return gameLogVariables(gameLog)
    }

    getTemporalName(): string {
        return 'gameLogStats'
    }

    async getTemporalVariables(state: StreamBuilderState): Promise<StreamTemporalVariable[]> {
        const gameLog = this.gameLogHistory.getGameLog()
        return gameLogStatsTemporalVariables(gameLog)
    }
}

const gameLogVariables = (gameLog: GameLogData): StreamStateVariable[] => {
    const teamPlayers = Array.from(new Set(gameLog.team.map(d => d.player))).sort()
    const teamLoot = Object.entries(gameLog.team.reduce((acc, t) => {
        acc[t.name] = acc[t.name] || new Array(teamPlayers.length).fill(0);
        acc[t.name][teamPlayers.indexOf(t.player)] += t.quantity;
        return acc;
    }, { } as {[name: string]: number[]}))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => ({ name: k, quantity: v }))

    return [
        { name: 'loot', value: gameLog.loot },
        { name: 'tier', value: gameLog.tier },
        { name: 'skill', value: gameLog.skill },
        { name: 'enhancerBroken', value: gameLog.enhancerBroken },
        { name: 'global', value: gameLog.global },
        { name: 'event', value: gameLog.event as any },
        { name: 'team', value: { players: teamPlayers, loot: teamLoot } }
    ]
}

const gameLogStatsTemporalVariables = (gameLog: GameLogData): StreamTemporalVariable[] =>
    gameLogStatsKeys.map(k => ({
        name: k.toString(),
        value: gameLog.stats?.[k] ?? emptyTemporalValue(),
        decimals: gameLogStatsDecimals[k]
    }));

export { GameLogVariablesBuilder }
