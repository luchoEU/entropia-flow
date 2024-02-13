//// GAME LOG MANAGER ////
// Receives and processes game chat log messages

import { LootLogData, TeamItemLogData, TeamSharedLogData } from "./logData"

const lineRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(.*?)\] \[(.*?)\] (.*)/
const youRegex = /You received (.*) x \\((.*)\\) Value: (.*) PED/
const itemRegex = /(.*) received a (.*)"/
const sharedRegex = /"(.*) received (.*) \\((.*)\\)"/
const dateFormat = 'yyyy-MM-dd HH:mm:ss'

class GameLogManager {
    public async onMessage(msg: string): Promise<void> {
        this.ParseLine(msg)
    }

    public onLoot: (d: LootLogData) => void
    private onTeamShared: (d: TeamSharedLogData) => void
    private onTeamItem: (d: TeamItemLogData) => void

    private ParseLine(msg: string) {
        var match = lineRegex.exec(msg)
        if (match === null)
            return

        var time = match[1]
        var channel = match[2]
        var avatar = match[3]
        var message = match[4]

        var teamMode = false

        switch (channel) {
            case "System":
                const youMatch = youRegex.exec(message);
                if (youMatch !== null) {
                    if (teamMode) {
                        if (this.onTeamShared) {
                            const ts: TeamSharedLogData = {
                                player: 'You',
                                material: youMatch[1],
                                amount: parseInt(youMatch[2])
                            };
                            this.onTeamShared(ts)
                        }
                    } else {
                        if (this.onLoot) {
                            const l: LootLogData = {
                                material: youMatch[1],
                                amount: parseInt(youMatch[2]),
                                value: parseFloat(youMatch[3])
                            }
                            this.onLoot(l)
                        }
                    }
                }
                break;

            case "Team":
                const itemMatch = itemRegex.exec(message);
                if (itemMatch !== null) {
                    if (this.onTeamItem) {
                       const ti: TeamItemLogData = {
                            player: itemMatch[1],
                            item: itemMatch[2]
                        }
                        this.onTeamItem(ti)
                    }
                } else {
                    if (this.onTeamShared) {
                        const sharedMatch = sharedRegex.exec(message);
                        if (sharedMatch !== null) {
                            const ts: TeamSharedLogData = {
                                player: sharedMatch[1],
                                material: sharedMatch[2],
                                amount: parseInt(sharedMatch[3])
                            };
                            this.onTeamShared(ts)
                        }
                    }
                }
                break;
        }
    }
}

export default GameLogManager