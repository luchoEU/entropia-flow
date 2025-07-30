//// GAME LOG PARSER ////
// Receives and processes game chat log messages

import { gameTime } from "../../common/date"
import { GameLogGlobal, GameLogLine, GameLogPosition, GameLogStats } from "./gameLogData"

const lineRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(.*?)\] \[(.*?)\] (.*)/
const youLootRegex = /You received (.+) x \((.+)\) Value: (.+) PED/
const itemLootRegex = /(.+) received a (.+)/
const sharedLootRegex = /(.+) received (.+) \((.+)\)/
const excludeLoot = [
    'Energy Matter Resource Deed',
    'Mineral Resource Deed',
    'Universal Ammo',
]
const statsRegex: GameLogStats<RegExp> = {
    attackMissesYou: /The attack missed you/,
    criticalInflicted: /^Critical hit - Additional damage! You inflicted/,
    criticalTaken: /^Critical hit - Additional damage! You took/,
    damageDeflected: /Damage deflected!/,
    damageInflicted: /You inflicted (.+) points of damage/,
    damageTaken: /You took (.+) points of damage/,
    energyMatterResource: /You received Energy Matter Resource Deed x \(\d+\) Value: (.+) PED/,
    mineralResource: /You received Mineral Resource Deed x \(\d+\) Value: (.+) PED/,
    playerWasKilled: /(.+) was killed/,
    reducedCritical: /Reduced (.+) points of critical damage/,
    reducedPiercingDamage: /Reduced (.+) points of armor piercing damage/,
    selfHeal: /You healed yourself (.+) points/,
    targetDodgedAttack: /The target Dodged your attack/,
    targetEvadedAttack: /The target Evaded your attack/,
    universalAmmo: /You received Universal Ammo x \(\d+\) Value: (.+) PED/,
    vehicleDamage: /Vehicle took (.+) points of damage/,
    vehicleRepaired: /The vehicle's Structural Integrity restored by (.+)/,
    youDodgedAttack: /You Dodged the attack/,
    youEvadedAttack: /You Evaded the attack/,
    youHealed: /You healed .+ with (.+) points/,
    youMissed: /You missed/,
    youRepaired: /You restored the vehicle's Structural Integrity by (.+)/,
    youRevived: /You have been revived/,
    youWereHealed: /You were healed (.+) points by .+/,
    youWereKilled: /You were killed by/,
}
const hofSuffix = ' A record has been added to the Hall of Fame!'
const athSuffix = ' A record has been added to the Hall of Fame ALL TIME HIGH. Congratulations!'
const valueLocationRegex = /(\d+) (PED|PEC)(?: at (.*))?/
const globalRegex = {
    hunt: /(?<player>.+) killed a creature \((?<name>.+)\) with a value of (?<valueLocation>.+)!/,
    craft: /(?<player>.+) constructed an item \((?<name>.+)\) worth (?<valueLocation>.+)!/,
    found: /(?<player>.+) has found a rare item \((?<name>.+)\) with a value of (?<valueLocation>.+)!/,
    mine: /(?<player>.+) found a deposit \((?<name>.+)\) with a value of (?<valueLocation>.+)!/,
    tier: /(?<player>.+) is the first colonist to reach tier (?<value>\d+) for (?<name>.+)!/,
    discover: /(?<player>.+) is the first colonist to discover (?<name>.+)!/,
    defeated: /(?<player>.+) defeated (?<value>\d+) others as a (?<name>.+?)\s*!/,
    examined: /(?<player>.+) examined (?<name>.+?) in (?<location>.+) and found something with a value of (?<value>.+)!/,    
}
const skillRegex = /You have gained (\d+(?:.\d+)) (experience in your )?(.+?)( skill)?$/
const attributeRegex = /Your (.*) has improved by (.*)/
const positionRegex = /^(.*), (\d*), (\d*), (\d*), (.*)$/
const braketRegex = /\[(.+?)]/g
const tierRegex = /Your (.+) has reached tier (.+)/
const eventRegex = {
    auctionCreated: /Auction successfully created/,
    blueprintImproved: /Your blueprint Quality Rating has improved/,
    challenged: /The (.+) has been challenged!/,
    claimedResource: /You have claimed a resource! \((.*)\)/,
    concentrationAffected: /Mindforce concentration was affected due to being hit/,
    creatureCondition: /This creature is in a condition where it cannot be damaged or sweated/,
    destroyed: /(.+) was destroyed by the \w+ (.+)/,
    effectEquip: /Equip Effect: (.+)/,
    effectOverTime: /Received Effect Over Time: (.+)/ , 
    enteredVehicle: /(.+) entered the vehicle/,
    entropiaTime: /Entropia Universe time: (.+)/,
    healingDecreased: /Healing was decreased by (.+) by an Effect Over Time/,
    healingDiminished: /Healing is diminished while moving/,
    itemDamaged: /The item is damaged/,
    itemEffectAdded: /Item Set Effect: (.+)/,
    itemEffectsRemoved: /Item Set Effects removed \((.+)\)/,
    itemRepaired: /Item\(s\) repaired successfully/,
    killed: /You were killed by the \w+ (.+)/,
    limitedMinimumCondition: /Your (.+?) is close to reaching minimum condition, note that limited \(L\) items cannot be repaired/,
    login: /(.+) has logged in/,
    logout: /(.+) has logged out/,
    minimumCondition: /Your (.+) is close to reaching minimum condition, consider repairing it as soon as possible/,
    missionCompleted: /Mission completed \((.+)\)/,
    missionReceived: /New Mission received \((.+)\)/,
    missionUpdated: /Mission updated \((.+)\)/,
    newSkill: /Congratulations, you have acquired a new skill; (.+)/,
    newRank: /You have gained a new rank in (.+)!/,
    personNotWounded: /That person isn't wounded/,
    petReturned: /Your pet has been returned to your inventory/,
    playerDestroyed: /(.+) destroyed (.+)/,
    playerKilled: /(.+) killed (.+) using a (.+)/,
    resourceDepleted: /This resource is depleted/,
    requestSent: /Request sent/,
    retrieved: /(.+) was retrieved successfully from the auctioneer and placed in your carried Inventory/,
    savedByDivine: /You have been saved from certain death by divine intervention/,
    sessionTime: /Session time: (.+)/,
    takenControl: /(.+?) has taken control of the land area (.+?)!/,
    tradedWith: /You have successfully traded with (.+)/,
    transactionCompleted: /The transaction was completed successfully/,
    vehicleRecovered: /The vehicle \((.+)\) is returned to planet storage, where you can recover it/,
    youAreAfk: /You are now away from keyboard/,
    youNoLongerAway: /You are no longer away from keyboard/,
    youNotWounded: /You are not wounded/,
}
const enhancerBroken = /Your enhancer (.+) on your (.*) broke. You have (\d+) enhancers? remaining on the item. You received (.+) PED Shrapnel\./

class GameLogParser {
    private _serial: number = 1
    public onLines: (lines: GameLogLine[]) => void

    public async onMessage(msg: string): Promise<void> {
        const lines = msg.split('\n')
        const parsedLines: GameLogLine[] = []
        for (const line of lines) {
            const parsedLine = this.parseLine(line)
            if (parsedLine)
                parsedLines.push(parsedLine)
        }
        this.onLines?.(parsedLines)
    }

    private parseLine(msg: string): GameLogLine | undefined {
        var match = lineRegex.exec(msg)
        if (match === null)
            return

        const line: GameLogLine = {
            serial: this._serial++,
            time: gameTime(match[1]),
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
                    if (!line.data.stats)
                        line.data.stats = {}
                    line.data.stats["lootStats"] = line.data.loot.value
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
                        line.data.stats[key] = match.length > 1 ? parseFloat(match[1]) : 1;
                    }
                })
                Object.entries(eventRegex).forEach(([key, regex]) => {
                    const match = regex.exec(line.message);
                    if (match !== null && line.data.event === undefined) {
                        line.data.event = {
                            time: line.time,
                            data: match.slice(1),
                            message: line.message,
                            action: key
                        }
                    }
                })
                const skillMatch = skillRegex.exec(line.message);
                if (skillMatch !== null) {
                    const value = parseFloat(skillMatch[1])
                    if (!Number.isNaN(value)) {
                        line.data.skill = {
                            name: skillMatch[3],
                            value
                        }
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
                const isATH = line.message.endsWith(athSuffix);
                const msg = isHoF ? line.message.substring(0, line.message.length - hofSuffix.length) :
                    (isATH ? line.message.substring(0, line.message.length - athSuffix.length) : line.message)
                Object.entries(globalRegex).forEach(([key, regex]) => {
                    const match = regex. exec(msg);
                    if (match !== null) {
                        const { player, name, value, location, valueLocation } = match.groups as any;
                        const global: GameLogGlobal = {
                            time: line.time,
                            player,
                            name,
                            value: undefined!,
                            type: key,
                            isHoF,
                            isATH
                        }
                        if (valueLocation) {
                            const valueLocationMatch = valueLocationRegex.exec(valueLocation);
                            if (valueLocationMatch !== null) {
                                global.value = parseInt(valueLocationMatch[1]) * (valueLocationMatch[2] === 'PEC' ? 0.01 : 1);
                                global.location = valueLocationMatch[3];
                                line.data.global = global
                            }
                        } else {
                            global.value = value && parseInt(value);
                            global.location = location;
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

        const positions: GameLogPosition[] = [];
        const items: string[] = [];
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

        if (line.channel.includes("trade") ||
            line.channel !== 'Globals' && // exclude Globals channels because of [Selling Trucker Hat (M,C)] item
                ["WTS", "WTB", "BUY", "SELL"].some(t => line.message.toUpperCase().includes(t)))
        {
            line.data.trade = {
                serial: line.serial,
                time: line.time,
                channel: line.channel,
                player: line.player,
                message: line.message
            }
        }

        return line
    }
}

export default GameLogParser
