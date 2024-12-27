//// GAME LOG PARSER ////
// Receives and processes game chat log messages

import { GameLogLine } from "./gameLogData"

const lineRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(.*?)\] \[(.*?)\] (.*)/
const youRegex = /You received (.*) x \((.*)\) Value: (.*) PED/
const itemRegex = /(.*) received a (.*)/
const sharedRegex = /(.*) received (.*) \((.*)\)/
const statsRegex = {
    selfHeal: /You healed yourself (.*) points/,
    damageInflicted: /You inflicted (.*) points of damage/,
    damageTaken: /You took (.*) points of damage/,
}
const hofSufix = ' A record has been added to the Hall of Fame!'
const globalRegex = {
    hunt: /(.*) killed a creature \((.*)\) with a value of (.*)!/,
    craft: /(.*) constructed an item \((.*)\) worth (.*)!/,
    found: /(.*) has found a rare item \((.*)\) with a value of (.*)!/,
    mine: /(.*) found a deposit \((.*)\) with a value of (.*)/
}
const skillRegex = /You have gained (.*) experience in your (.*) skill/
const dodgeRegex = /The target Dodged your attack/
const evageRegex = /You Evaded the attack/
const critical = /Critical hit - Additional damage! You inflicted 222.8 points of damage/
const logoutRegex = /(.*) has logged out/
const loginRegex = /(.*) has logged in/
const positionRegex = /^(.*), (\d*), (\d*), (\d*), (.*)$/
const braketRegex = /\[(.*?)]/g

class GameLogParser {
    public onLine: (s: GameLogLine) => void

    public async onMessage(msg: string): Promise<void> {
        var match = lineRegex.exec(msg)
        if (match === null)
            return

        const line: GameLogLine = {
            time: match[1],
            channel: match[2],
            player: match[3],
            message: match[4],
            data: {}
        }

        switch (line.channel) {
            case "System":
                const youMatch = youRegex.exec(line.message);
                if (youMatch !== null) {
                    line.data.loot = {
                        name: youMatch[1],
                        quantity: parseInt(youMatch[2]),
                        value: parseFloat(youMatch[3])
                    }
                }
                Object.entries(statsRegex).forEach(([key, regex]) => {
                    const match = regex.exec(line.message);
                    if (match !== null) {
                        if (!line.data.stats)
                            line.data.stats = {}
                        line.data.stats[key] = parseFloat(match[1])
                    }
                })
                const skillMatch = skillRegex.exec(line.message);
                if (skillMatch !== null) {
                    line.data.skill = {
                        name: skillMatch[2],
                        value: parseFloat(skillMatch[1])
                    }
                }
                const logoutMatch = logoutRegex.exec(line.message);
                if (logoutMatch !== null) {
                    line.data.logout = logoutMatch[1]
                }
                const loginMatch = loginRegex.exec(line.message);
                if (loginMatch !== null) {
                    line.data.login = loginMatch[1]
                }
                break
            case "Globals":
                const isHoF = line.message.endsWith(hofSufix);
                const msg = isHoF ? line.message.substring(0, line.message.length - hofSufix.length) : line.message
                Object.entries(globalRegex).forEach(([key, regex]) => {
                    const match = regex.exec(msg);
                    if (match !== null) {
                        line.data.global = {
                            time: line.time,
                            player: match[1],
                            name: match[2],
                            type: key,
                            value: match[3],
                            isHoF
                        }
                    }
                })
                break;
            case "Team":
                const itemMatch = itemRegex.exec(line.message);
                if (itemMatch !== null) {
                    line.data.loot = {
                        player: itemMatch[1],
                        name: itemMatch[2],
                        quantity: 1
                    }
                } else {
                    const sharedMatch = sharedRegex.exec(line.message);
                    if (sharedMatch !== null) {
                        line.data.loot = {
                            player: sharedMatch[1],
                            name: sharedMatch[2],
                            quantity: parseInt(sharedMatch[3])
                        };
                    }
                }
                break;
        }

        const positions = [];
        const items = [];
        for (const match of Array.from(line.message.matchAll(braketRegex))) {
            const positionMatch = positionRegex.exec(match[1]);
            if (positionMatch) {
                positions.push({
                    planet: positionMatch[1],
                    x: parseInt(positionMatch[2]),
                    y: parseInt(positionMatch[3]),
                    z: parseInt(positionMatch[4]),
                    name: positionMatch[5]
                });
            } else {
                items.push(match[1]);
            }
        }
        if (items.length > 0) {
            line.data.items = items;
        }
        if (positions.length > 0) {
            line.data.positions = positions
        }

        this.onLine?.(line)
    }
}

export default GameLogParser
