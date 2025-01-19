//// GAME LOG PARSER ////
// Receives and processes game chat log messages

import { GameLogGlobal, GameLogLine, GameLogStats } from "./gameLogData"

const lineRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(.*?)\] \[(.*?)\] (.*)/
const youLootRegex = /You received (.+) x \((.+)\) Value: (.+) PED/
const itemLootRegex = /(.+) received a (.+)/
const sharedLootRegex = /(.+) received (.+) \((.+)\)/
const excludeLoot = [
    'Universal Ammo',
    'Mineral Resource Deed',
]
const statsRegex: GameLogStats<RegExp> = {
    attackMissesYou: /The attack missed you/,
    criticalInflicted: /^Critical hit - Additional damage! You inflicted/,
    criticalTaken: /^Critical hit - Additional damage! You took/,
    damageDeflected: /Damage deflected!/,
    damageInflicted: /You inflicted (.+) points of damage/,
    damageTaken: /You took (.+) points of damage/,
    reducedCritical: /Reduced (.+) points of critical damage/,
    reducedPiercingDamage: /Reduced (.+) points of armor piercing damage/,
    selfHeal: /You healed yourself (.+) points/,
    targetDodgedAttack: /The target Dodged your attack/,
    targetEvadedAttack: /The target Evaded your attack/,
    universalAmmo: /You received Universal Ammo x \(\d+\) Value: (.+) PED/,
    youDodgedAttack: /You Dodged the attack/,
    youEvadedAttack: /You Evaded the attack/,
    youRevived: /You have been revived/,
    youWereKilled: /You were killed by/,
}
const hofSuffix = ' A record has been added to the Hall of Fame!'
const valueLocationRegex = /(\d+) (PED|PEC)(?: at (.*))?/
const globalRegex = {
    hunt: /(?<player>.+) killed a creature \((?<name>.+)\) with a value of (?<valueLocation>.+)!/,
    craft: /(?<player>.+) constructed an item \((?<name>.+)\) worth (?<valueLocation>.+)!/,
    found: /(?<player>.+) has found a rare item \((?<name>.+)\) with a value of (?<valueLocation>.+)!/,
    mine: /(?<player>.+) found a deposit \((?<name>.+)\) with a value of (?<valueLocation>.+)!/,
    tier: /(?<player>.+) is the first colonist to reach tier (?<value>\d+) for (?<name>.+)!/
}
const skillRegex = /You have gained (.+?) (experience in your )?(.+?)( skill)?$/
const attributeRegex = /Your (.*) has improved by (.*)/
const positionRegex = /^(.*), (\d*), (\d*), (\d*), (.*)$/
const braketRegex = /\[(.+?)]/g
const tierRegex = /Your (.+) has reached tier (.+)/
const eventRegex = {
    logout: /(.+) has logged out/,
    login: /(.+) has logged in/,
    effectOverTime: /Received Effect Over Time: (.+)/ , 
    effectEquip: /Equip Effect: (.+)/,
    missionCompleted: /Mission completed \((.+)\)/,
    missionUpdated: /Mission updated \((.+)\)/,
    limitedMinimumCondition: /Your (.+?) is close to reaching minimum condition, note that limited \(L\) items cannot be repaired/,
    killed: /You were killed by the \w+ (.+)/,
    itemEffectsRemoved: /Item Set Effects removed \((.+)\)/,
    itemEffectAdded: /Item Set Effect: (.+)/,
    missionReceived: /New Mission received \((.+)\)/,
    claimedResource: /You have claimed a resource! \((.*)\)/,
    minimumCondition: /Your (.+) is close to reaching minimum condition, consider repairing it as soon as possible/,
    sessionTime: /Session time: (.+)/,
    entropiaTime: /Entropia Universe time: (.+)/,
    transactionCompleted: /The transaction was completed successfully/,
    youAreAfk: /You are now away from keyboard/,
    youNoLongerAway: /You are no longer away from keyboard/,
    savedByDivine: /You have been saved from certain death by divine intervention/,
    healingDiminished: /Healing is diminished while moving/,
    itemRepaired: /Item\(s\) repaired successfully/,
    petReturned: /Your pet has been returned to your inventory/,
    resourceDepleted: /This resource is depleted/,
    blueprintImproved: /Your blueprint Quality Rating has improved/,
}
const enhancerBroken = /Your enhancer (.+) on your (.*) broke. You have (\d+) enhancers? remaining on the item. You received (.+) PED Shrapnel\./

class GameLogParser {
    private _serial: number = 1
    public onLine: (s: GameLogLine) => void

    public async onMessage(msg: string): Promise<void> {
        var match = lineRegex.exec(msg)
        if (match === null)
            return

        const line: GameLogLine = {
            serial: this._serial++,
            time: match[1],
            channel: match[2],
            player: match[3],
            message: match[4],
            data: {}
        }

        switch (line.channel) {
            case "System":
                const youLootMatch = youLootRegex.exec(line.message);
                if (youLootMatch !== null && !excludeLoot.includes(youLootMatch[1])) {
                    line.data.loot = {
                        name: youLootMatch[1],
                        quantity: parseInt(youLootMatch[2]),
                        value: parseFloat(youLootMatch[3])
                    }
                }
                const tierMatch = tierRegex.exec(line.message);
                if (tierMatch !== null) {
                    line.data.tier = {
                        name: tierMatch[1],
                        tier: parseFloat(tierMatch[2])
                    }
                }
                Object.entries(statsRegex).forEach(([key, regex]) => {
                    const match = regex.exec(line.message);
                    if (match !== null) {
                        if (!line.data.stats)
                            line.data.stats = {}
                        line.data.stats[key] = match.length > 1 ? parseInt(match[1]) : 1
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
                const enhancerBrokenMatch = enhancerBroken.exec(line.message);
                if (enhancerBrokenMatch !== null) {
                    line.data.enhancerBroken = {
                        time: line.time,
                        enhancer: enhancerBrokenMatch[1],
                        item: enhancerBrokenMatch[2],
                        remaining: parseInt(enhancerBrokenMatch[3]),
                        received: parseFloat(enhancerBrokenMatch[4])
                    }
                }
                break
            case "Globals":
                const isHoF = line.message.endsWith(hofSuffix);
                const msg = isHoF ? line.message.substring(0, line.message.length - hofSuffix.length) : line.message
                Object.entries(globalRegex).forEach(([key, regex]) => {
                    const match = regex.exec(msg);
                    if (match !== null) {
                        const { player, name, value, valueLocation } = match.groups;
                        const global: GameLogGlobal = {
                            time: line.time,
                            player,
                            name,
                            value: undefined,
                            type: key,
                            isHoF
                        }
                        if (valueLocation) {
                            const valueLocationMatch = valueLocationRegex.exec(valueLocation);
                            if (valueLocationMatch !== null) {
                                global.value = parseInt(valueLocationMatch[1]) * (valueLocationMatch[2] === 'PEC' ? 0.01 : 1);
                                global.location = valueLocationMatch[3];
                                line.data.global = global
                            }
                        } else if (value) {
                            global.value = parseInt(value);
                            line.data.global = global
                        }
                    }
                })
                break;
            case "Team":
                const itemLootMatch = itemLootRegex.exec(line.message);
                if (itemLootMatch !== null) {
                    line.data.team = {
                        player: itemLootMatch[1],
                        name: itemLootMatch[2],
                        quantity: 1
                    }
                } else {
                    const sharedLootMatch = sharedLootRegex.exec(line.message);
                    if (sharedLootMatch !== null) {
                        line.data.team = {
                            player: sharedLootMatch[1],
                            name: sharedLootMatch[2],
                            quantity: parseInt(sharedLootMatch[3])
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
