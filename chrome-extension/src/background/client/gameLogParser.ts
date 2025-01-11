//// GAME LOG PARSER ////
// Receives and processes game chat log messages

import { GameLogLine } from "./gameLogData"

const lineRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(.*?)\] \[(.*?)\] (.*)/
const youRegex = /You received (.*) x \((.*)\) Value: (.*) PED/
const itemRegex = /(.*) received a (.*)/
const sharedRegex = /(.*) received (.*) \((.*)\)/
const statsPointsRegex = {
    selfHeal: /You healed yourself (.*) points/,
    damageInflicted: /You inflicted (.*) points of damage/,
    damageTaken: /You took (.*) points of damage/,
    reducedCritical: /Reduced (.*) points of critical damage/
}
const statsCountRegex = {
    targetEvadedAttack: /The target Evaded your attack/,
    targetDodgedAttack: /The target Dodged your attack/,
    youEvadedAttack: /You Evaded the attack/,
    youDodgedAttack: /You Dodged the attack/,
    attackMissesYou: /The attack missed you/,
    criticalInflicted: /^Critical hit - Additional damage! You inflicted/,
    criticalTaken: /^Critical hit - Additional damage! You took/,
    revived: /You have been revived/,
    killed: /You were killed by/,
}
const hofSufix = ' A record has been added to the Hall of Fame!'
const globalRegex = {
    hunt: /(.*) killed a creature \((.*)\) with a value of (.*)!/,
    craft: /(.*) constructed an item \((.*)\) worth (.*)!/,
    found: /(.*) has found a rare item \((.*)\) with a value of (.*)!/,
    mine: /(.*) found a deposit \((.*)\) with a value of (.*)/,
}
const skillRegex = /You have gained (.*?) (experience in your )?(.*?)( skill)?$/
const attributeRegex = /Your (.*) has improved by (.*)/
const positionRegex = /^(.*), (\d*), (\d*), (\d*), (.*)$/
const braketRegex = /\[(.*?)]/g
const tierRegex = /Your (.*) has reached tier (.*)/
const eventRegex = {
    logout: /(.*) has logged out/,
    login: /(.*) has logged in/,
    effectOverTime: /Received Effect Over Time: (.*)/ , 
    effectEquip: /Equip Effect: (.*)/,
    missionCompleted: /Mission completed \((.*)\)/,
    missionUpdated: /Mission updated \((.*)\)/,
    limitedMinimumCondition: /Your (.*?) is close to reaching minimum condition, note that limited \(L\) items cannot be repaired/,
    killed: /You were killed by the \w+ (.+)/,
    youNoLongerAway: /You are no longer away from keyboard/,
    savedDivine: /You have been saved from certain death by divine intervention/,
    itemEffectsRemoved: /Item Set Effects removed (.+)/,
    itemEffectAdded: /Item Set Effect: (.+)/,
}

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
                const tierMatch = tierRegex.exec(line.message);
                if (tierMatch !== null) {
                    line.data.tier = {
                        name: tierMatch[1],
                        tier: parseFloat(tierMatch[2])
                    }
                }
                Object.entries(statsPointsRegex).forEach(([key, regex]) => {
                    const match = regex.exec(line.message);
                    if (match !== null) {
                        if (!line.data.stats)
                            line.data.stats = {}
                        line.data.stats[key] = parseFloat(match[1])
                    }
                })
                Object.entries(statsCountRegex).forEach(([key, regex]) => {
                    const match = regex.exec(line.message);
                    if (match !== null) {
                        if (!line.data.stats)
                            line.data.stats = {}
                        line.data.stats[key] = 1
                    }
                })
                Object.entries(eventRegex).forEach(([key, regex]) => {
                    const match = regex.exec(line.message);
                    if (match !== null) {
                        line.data.event = {
                            time: line.time,
                            name: match.length > 1 ? match[1] : '',
                            action: key
                        }
                    }
                })
                const skillMatch = skillRegex.exec(line.message);
                if (skillMatch !== null) {
                    line.data.skill = {
                        name: skillMatch[3],
                        value: parseFloat(skillMatch[1])
                    }
                }
                const attributeMatch = attributeRegex.exec(line.message);
                if (attributeMatch !== null) {
                    line.data.skill = {
                        name: attributeMatch[1],
                        value: parseFloat(attributeMatch[2])
                    }
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
                    line.data.team = {
                        player: itemMatch[1],
                        name: itemMatch[2],
                        quantity: 1
                    }
                } else {
                    const sharedMatch = sharedRegex.exec(line.message);
                    if (sharedMatch !== null) {
                        line.data.team = {
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
