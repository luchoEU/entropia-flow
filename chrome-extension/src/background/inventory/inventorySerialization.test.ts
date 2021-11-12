import { InventoryReader, InventoryWritter } from "./inventorySerialization"

describe('utf8', () => {
    test('one byte write', () => {
        const writter = new InventoryWritter(undefined)
        writter.writeLength(0)
        expect(writter.data()).toEqual([0x00])
    })

    test('two byte write', () => {
        const writter = new InventoryWritter(undefined)
        writter.writeLength(0x80)
        expect(writter.data()).toEqual([0xC2, 0x80])
    })

    test('three byte write', () => {
        const writter = new InventoryWritter(undefined)
        writter.writeLength(0x800)
        expect(writter.data()).toEqual([0xE0, 0xA0, 0x80])
    })

    test('three byte write', () => {
        const writter = new InventoryWritter(undefined)
        writter.writeLength(0x10000)
        expect(writter.data()).toEqual([0xF0, 0x90, 0x80, 0x80])
    })

    test('one byte read', () => {
        const reader = new InventoryReader(undefined, [0x00], 0)
        expect(reader.readLength()).toBe(0)
    })

    test('two byte write', () => {
        const reader = new InventoryReader(undefined, [0xC2, 0x80], 0)
        expect(reader.readLength()).toBe(0x80)
    })

    test('three byte write', () => {
        const reader = new InventoryReader(undefined, [0xE0, 0xA0, 0x80], 0)
        expect(reader.readLength()).toBe(0x800)
    })

    test('three byte write', () => {
        const reader = new InventoryReader(undefined, [0xF0, 0x90, 0x80, 0x80], 0)
        expect(reader.readLength()).toBe(0x10000)
    })

    test('date', () => {
        const d = 1630104885238
        const writter = new InventoryWritter(undefined)
        writter.writeDate(d)
        const reader = new InventoryReader(undefined, writter.data(), 0)
        expect(reader.readDate()).toBe(d)
    })

    test('small quantity', () => {
        const q = '1'
        const writter = new InventoryWritter(undefined)
        writter.writeQuantity(q)
        const reader = new InventoryReader(undefined, writter.data(), 0)
        expect(reader.readQuantity()).toBe(q)
    })

    test('big quantity', () => {
        const q = '1506474'
        const writter = new InventoryWritter(undefined)
        writter.writeQuantity(q)
        const reader = new InventoryReader(undefined, writter.data(), 0)
        expect(reader.readQuantity()).toBe(q)
    })

    test('value', () => {
        const v = '40.80'
        const writter = new InventoryWritter(undefined)
        writter.writeValue(v)
        const reader = new InventoryReader(undefined, writter.data(), 0)
        expect(reader.readValue()).toBe(v)
    })
})