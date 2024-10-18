import { getDifference } from "./diff"

describe('difference', () => {
    test('empty', () => {
        expect(getDifference({
            meta: { date: 1 }
        }, {
            meta: { date: 2 }
        })).toEqual(null)
    })

    test('move in', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Daily Token', q: '1297', v: '12.97', c: 'STORAGE (Calypso)' },
                { id: '2', n: 'Daily Token', q: '92', v: '0.92', c: 'STORAGE (Monria)' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Daily Token', q: '10', v: '0.10', c: 'CARRIED' },
                { id: '2', n: 'Daily Token', q: '1287', v: '12.87', c: 'STORAGE (Calypso)' },
                { id: '3', n: 'Daily Token', q: '92', v: '0.92', c: 'STORAGE (Monria)' },
            ], meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Daily Token', q: '10', v: '(0.10)', c: 'CARRIED ⭢ STORAGE (Calypso)' }
        ])
    })

    test('move in with between', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Daily Token', q: '1287', v: '12.87', c: 'STORAGE (Calypso)' },
                { id: '2', n: 'Daily Token', q: '102', v: '1.02', c: 'STORAGE (Monria)' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Daily Token', q: '10', v: '0.10', c: 'CARRIED' },
                { id: '2', n: 'Daily Token', q: '1287', v: '12.87', c: 'STORAGE (Calypso)' },
                { id: '3', n: 'Daily Token', q: '92', v: '0.92', c: 'STORAGE (Monria)' },
            ], meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Daily Token', q: '10', v: '(0.10)', c: 'CARRIED ⭢ STORAGE (Monria)' }
        ])
    })

    test('move out', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Daily Token', q: '10', v: '0.10', c: 'CARRIED' },
                { id: '2', n: 'Daily Token', q: '1287', v: '12.87', c: 'STORAGE (Calypso)' },
                { id: '3', n: 'Daily Token', q: '92', v: '0.92', c: 'STORAGE (Monria)' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Daily Token', q: '1297', v: '12.97', c: 'STORAGE (Calypso)' },
                { id: '2', n: 'Daily Token', q: '92', v: '0.92', c: 'STORAGE (Monria)' },
            ], meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Daily Token', q: '10', v: '(0.10)', c: 'STORAGE (Calypso) ⭢ CARRIED' }
        ])
    })

    test('move out with between', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Daily Token', q: '10', v: '0.10', c: 'CARRIED' },
                { id: '2', n: 'Daily Token', q: '1287', v: '12.87', c: 'STORAGE (Calypso)' },
                { id: '3', n: 'Daily Token', q: '92', v: '0.92', c: 'STORAGE (Monria)' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Daily Token', q: '1287', v: '12.87', c: 'STORAGE (Calypso)' },
                { id: '2', n: 'Daily Token', q: '102', v: '1.02', c: 'STORAGE (Monria)' },
            ], meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Daily Token', q: '10', v: '(0.10)', c: 'STORAGE (Monria) ⭢ CARRIED' }
        ])
    })

    test('move with use', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Vehicle RK-25 (L)', q: '1', v: '11.50', c: 'CARRIED' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Vehicle RK-25 (L)', q: '1', v: '13.50', c: 'Haruspex Anti-Grav Chest' },
            ], meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Vehicle RK-25 (L)', q: '', v: '-2.00', c: 'Haruspex Anti-Grav Chest ⟹ CARRIED' }
        ])
    })

    test('move with use with other item', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Vehicle RK-25 (L)', q: '1', v: '11.50', c: 'CARRIED' },
                { id: '2', n: 'Vehicle RK-25 (L)', q: '1', v: '13.50', c: 'CARRIED' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Vehicle RK-25 (L)', q: '1', v: '13.50', c: 'Haruspex Anti-Grav Chest' },
                { id: '2', n: 'Vehicle RK-25 (L)', q: '1', v: '13.50', c: 'CARRIED' },
            ], meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Vehicle RK-25 (L)', q: '', v: '-2.00', c: 'Haruspex Anti-Grav Chest ⟹ CARRIED' }
        ])
    })

    test('move all out', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Daily Token', q: '10', v: '0.10', c: 'CARRIED' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Daily Token', q: '10', v: '0.10', c: 'STORAGE (Calypso)' },
            ],
            meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Daily Token', q: '10', v: '(0.10)', c: 'STORAGE (Calypso) ⭢ CARRIED' }
        ])
    })

    test('case sensitive', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'EMT kit Ek-2350, Modified', q: '1', v: '195.54', c: 'CARRIED' },
                { id: '2', n: 'Empty Skill Implant (L)', q: '1', v: '84.43', c: 'CARRIED' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'EMT kit Ek-2350, Modified', q: '1', v: '195.56', c: 'CARRIED' },
            ],
            meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Empty Skill Implant (L)', q: '1', v: '84.43', c: 'CARRIED' },
            { key: 1, n: 'EMT kit Ek-2350, Modified', q: '', v: '-0.02', c: 'CARRIED' }
        ])
    })

    test('from auction', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Diluted Sweat', q: '1310', v: '13.10', c: 'CARRIED' },
                { id: '2', n: 'Diluted Sweat', q: '2367', v: '23.67', c: 'STORAGE (Calypso)' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Diluted Sweat', q: '1310', v: '13.10', c: 'AUCTION' },
                { id: '2', n: 'Diluted Sweat', q: '2367', v: '23.67', c: 'STORAGE (Calypso)' },
            ],
            meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Diluted Sweat', q: '1310', v: '(13.10)', c: 'AUCTION ⭢ CARRIED' }
        ])
    })

    test('one sale', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Mind Essence', q: '10000', v: '1.00', c: 'AUCTION' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Mind Essence', q: '7500', v: '0.75', c: 'AUCTION' },
                { id: '2', n: 'Mind Essence', q: '10000', v: '1.00', c: 'AUCTION' },
            ],
            meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Mind Essence', q: '-7500', v: '-0.75', c: 'AUCTION' }
        ])
    })

    test('one sale middle', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Mind Essence', q: '1000041', v: '100.00', c: 'AUCTION' },
                { id: '2', n: 'Mind Essence', q: '699485', v: '69.94', c: 'CARRIED' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Mind Essence', q: '1000041', v: '100.00', c: 'AUCTION' },
                { id: '2', n: 'Mind Essence', q: '705005', v: '70.50', c: 'AUCTION' },
                { id: '3', n: 'Mind Essence', q: '699485', v: '69.94', c: 'CARRIED' },
            ],
            meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Mind Essence', q: '-705005', v: '-70.50', c: 'AUCTION' }
        ])
    })

    test('one auction + refine', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Mind Essence', q: '705005', v: '70.50', c: 'AUCTION' },
                { id: '2', n: 'Mind Essence', q: '1000041', v: '100.00', c: 'AUCTION' },
                { id: '3', n: 'Mind Essence', q: '6025505', v: '602.55', c: 'CARRIED' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Mind Essence', q: '1000041', v: '100.00', c: 'AUCTION' },
                { id: '2', n: 'Mind Essence', q: '699485', v: '69.94', c: 'CARRIED' },
            ],
            meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Mind Essence', q: '705005', v: '70.50', c: 'AUCTION' },
            { key: 1, n: 'Mind Essence', q: '5326020', v: '532.61', c: 'CARRIED' }
        ])
    })

    test('plate damage', () => {
        expect(getDifference({
            itemlist: [
                { id: '1', n: 'Armor Plating Mk. 5D', q: '1', v: '23.13', c: 'Jaguar Harness, SGA Edition (M)' },
                { id: '2', n: 'Armor Plating Mk. 5D', q: '1', v: '23.14', c: 'Jaguar Foot Guards (M,L)' },
                { id: '3', n: 'Armor Plating Mk. 5D', q: '1', v: '23.14', c: 'Jaguar Shin Guards, SGA Edition (M)' },
                { id: '4', n: 'Armor Plating Mk. 5D', q: '1', v: '23.15', c: 'Jaguar Arm Guards (M,L)' },
                { id: '5', n: 'Armor Plating Mk. 5D', q: '1', v: '23.15', c: 'Jaguar Gloves (M,L)' },
                { id: '6', n: 'Armor Plating Mk. 5D', q: '1', v: '23.16', c: 'Jaguar Helmet, SGA Edition (M)' },
                { id: '7', n: 'Armor Plating Mk. 5D', q: '1', v: '23.16', c: 'Jaguar Thigh Guards (M,L)' },
            ],
            meta: { date: 1 }
        }, {
            itemlist: [
                { id: '1', n: 'Armor Plating Mk. 5D', q: '1', v: '23.15', c: 'Jaguar Foot Guards (M,L)' },
                { id: '2', n: 'Armor Plating Mk. 5D', q: '1', v: '23.16', c: 'Jaguar Arm Guards (M,L)' },
                { id: '3', n: 'Armor Plating Mk. 5D', q: '1', v: '23.16', c: 'Jaguar Thigh Guards (M,L)' },
                { id: '4', n: 'Armor Plating Mk. 5D', q: '1', v: '23.17', c: 'Jaguar Gloves (M,L)' },
                { id: '5', n: 'Armor Plating Mk. 5D', q: '1', v: '23.17', c: 'Jaguar Harness, SGA Edition (M)' },
                { id: '6', n: 'Armor Plating Mk. 5D', q: '1', v: '23.17', c: 'Jaguar Helmet, SGA Edition (M)' },
                { id: '7', n: 'Armor Plating Mk. 5D', q: '1', v: '23.17', c: 'Jaguar Shin Guards, SGA Edition (M)' },
            ],
            meta: { date: 2 }
        })).toEqual([
            { key: 0, n: 'Armor Plating Mk. 5D', q: '', v: '-0.04', c: 'Jaguar Harness, SGA Edition (M)' },
            { key: 1, n: 'Armor Plating Mk. 5D', q: '', v: '-0.03', c: 'Jaguar Shin Guards, SGA Edition (M)' },
            { key: 2, n: 'Armor Plating Mk. 5D', q: '', v: '-0.02', c: 'Jaguar Gloves (M,L)' },
            { key: 3, n: 'Armor Plating Mk. 5D', q: '', v: '-0.01', c: 'Jaguar Arm Guards (M,L)' },
            { key: 4, n: 'Armor Plating Mk. 5D', q: '', v: '-0.01', c: 'Jaguar Foot Guards (M,L)' },
            { key: 5, n: 'Armor Plating Mk. 5D', q: '', v: '-0.01', c: 'Jaguar Helmet, SGA Edition (M)' },
        ])
    })
})