import { Inventory, Log, Meta } from "../../common/state"
import { trace } from "../../common/trace"
import StringTable from "./stringTable"

//// Constants ////

const INV_STORAGE_TYPE_EMPTY = 0
const INV_STORAGE_TYPE_LOG = 1
const INV_STORAGE_TYPE_LIST = 2
const INV_STORAGE_TYPE_TAG = 4
const INV_STORAGE_TYPE_LASTDATE = 8

//// Writter ////

class InventoryWritter {
    private strings: StringTable
    private output: Array<number> = []

    constructor(strings: StringTable) {
        this.strings = strings
    }

    public data(): Array<number> {
        return this.output
    }

    public writeType(type: number) {
        this.write(type)
    }

    public writeString(s: string) {
        const n = this.strings.getIndex(s)
        this.write(n)
    }

    public writeLength(length: number) {
        this.write(length)
    }

    public writeQuantity(q: string) {
        this.writeMaybe2(Number(q))
    }

    public writeValue(v: string) {
        this.writeMaybe2(Math.round(Number(v) * 100))
    }

    public writeReference(r: string) {
        this.write(Number(r))
    }

    public writeDate(date: number) {
        const first = Math.floor(date / 0x100000000)
        const second = Math.floor(date / 0x10000) & 0xFFFF
        const third = date & 0xFFFF
        this.write(first)
        this.write(second)
        this.write(third)
    }

    private writeMaybe2(n: number) {
        if (n > 0xFFFF) {
            const first = 0x10000 | (n & 0xFFFF)
            const second = n >> 16
            this.write(first)
            this.write(second)
        } else {
            this.write(n)
        }
    }

    private write(n: number) {
        if (n < 0x80) {
            const first = n
            this.output.push(first)
        }
        else if (n < 0x800) {
            const first = 0xC0 | ((n >> 6) & 0x1F)
            const second = 0x80 | (n & 0x3F)
            this.output.push(first)
            this.output.push(second)
        } else if (n < 0x10000) {
            const first = 0xE0 | ((n >> 12) & 0x0F)
            const second = 0x80 | ((n >> 6) & 0x3F)
            const third = 0x80 | (n & 0x3F)
            this.output.push(first)
            this.output.push(second)
            this.output.push(third)
        } else if (n < 0x110000) {
            const first = 0xF0 | ((n >> 18) & 0x07)
            const second = 0x80 | ((n >> 12) & 0x3F)
            const third = 0x80 | ((n >> 6) & 0x3F)
            const fourth = 0x80 | (n & 0x3F)
            this.output.push(first)
            this.output.push(second)
            this.output.push(third)
            this.output.push(fourth)
        } else {
            throw new Error(`UTF-8 write, out of range 0x${n.toString(16).padStart(8, '0')} ${n}`)
        }
    }
}

function serializeInventory(strings: StringTable, list: Array<Inventory>): Array<number> {
    let data = []
    list.forEach(inv => {
        const writter = new InventoryWritter(strings)
        let type = INV_STORAGE_TYPE_EMPTY
        if (inv.log !== undefined) {
            type += INV_STORAGE_TYPE_LOG
        }
        if (inv.itemlist !== undefined) {
            type += INV_STORAGE_TYPE_LIST
        }
        if (inv.tag !== undefined) {
            type += INV_STORAGE_TYPE_TAG
        }
        if (inv.meta.lastDate !== undefined) {
            type += INV_STORAGE_TYPE_LASTDATE
        }
        writter.writeType(type)

        if (inv.log !== undefined) {
            writter.writeString(inv.log.class)
            writter.writeString(inv.log.message)
        }

        if (inv.itemlist !== undefined) {
            writter.writeLength(inv.itemlist.length)
            inv.itemlist.forEach((d, index) => {
                if (Number(d.id) !== index + 1)
                    throw new Error(`failed assumption that index ${index + 1} equals id ${d.id}`);
                writter.writeString(d.n)
                writter.writeQuantity(d.q)
                writter.writeValue(d.v)
                writter.writeString(d.c)
                writter.writeReference(d.r)
            })
        }

        if (inv.tag !== undefined) {
            const s = JSON.stringify(inv.tag)
            writter.writeString(s)
        }

        writter.writeDate(inv.meta.date)
        if (inv.meta.lastDate !== undefined)
            writter.writeDate(inv.meta.lastDate)

        data = data.concat(writter.data())
    })

    return data
}

//// Reader ////

class InventoryReader {
    private strings: StringTable
    private input: Array<number>
    private position = 0

    constructor(strings: StringTable, invStorage: Array<number>, position: number) {
        this.strings = strings
        this.input = invStorage
        this.position = position
    }

    public getPosition(): number {
        return this.position
    }

    public readType(): number {
        return this.read()
    }

    public readString(): string {
        const n = this.read()
        return this.strings.get(n)
    }

    public readLength(): number {
        return this.read()
    }

    public readQuantity(): string {
        return this.readMaybe2().toString()
    }

    public readValue(): string {
        const n = this.readMaybe2() / 100
        return n.toFixed(2).toString()
    }

    public readReference(): string {
        return this.read().toString()
    }

    public readDate(): number {
        const first = this.read()
        const second = this.read()
        const third = this.read()
        const date = first * 0x100000000 + second * 0x10000 + third
        return date
    }

    private readMaybe2(): number {
        const first = this.read()
        if (first > 0xFFFF) {
            const second = this.read()
            const n = (second << 16) | (first & 0xFFFF)
            return n
        } else {
            return first
        }
    }

    private read(): number {
        const first = this.read1()
        if ((first & 0x80) === 0)
            return first

        const second = this.read1()
        if ((second & 0xC0) !== 0x80) {
            trace(`UTF-8 read failure 0x${second.toString(16).padStart(2, '0')}`)
            return 0
        }

        if ((first & 0xE0) === 0xC0)
            return (first & 0x1F) * 0x40 + (second & 0x3F)

        const third = this.read1()
        if ((third & 0xC0) !== 0x80) {
            trace(`UTF-8 read failure 0x${third.toString(16).padStart(2, '0')}`)
            return 0
        }

        if ((first & 0xF0) === 0xE0)
            return (first & 0x0F) * 0x1000 + (second & 0x3F) * 0x40 + (third & 0x3F)

        const forth = this.read1()
        if ((forth & 0xC0) !== 0x80) {
            trace(`UTF-8 read failure 0x${forth.toString(16).padStart(2, '0')}`)
            return 0
        }

        if ((first & 0xF8) === 0xF0)
            return (first & 0x07) * 0x40000 + (second & 0x3F) * 0x1000 + (third & 0x3F) * 0x40 + (forth & 0x3F)

        trace(`UTF-8 read failure 0x${first.toString(16).padStart(2, '0')}`)
        return 0
    }

    private read1(): number {
        if (this.position >= this.input.length)
            return 0
        else
            return this.input[this.position++]
    }
}

function deserializeInventory(strings: StringTable, invStorage: Array<number>): Array<Inventory> {
    let list = []
    let position = 0
    while (position < invStorage.length) {
        const reader = new InventoryReader(strings, invStorage, position)
        const type = reader.readType()

        let log: Log = undefined
        if ((type & INV_STORAGE_TYPE_LOG) !== 0) {
            log = {
                class: reader.readString(),
                message: reader.readString()
            }
        }

        let total = undefined
        let itemlist = undefined
        if ((type & INV_STORAGE_TYPE_LIST) !== 0) {
            total = 0
            itemlist = []
            const len = reader.readLength()
            for (let m = 1; m <= len; m++) {
                const d = {
                    id: m.toString(),
                    n: reader.readString(),
                    q: reader.readQuantity(),
                    v: reader.readValue(),
                    c: reader.readString(),
                    r: reader.readReference()
                }
                total += Number(d.v)
                itemlist.push(d)
            }
        }

        let tag = undefined
        if ((type & INV_STORAGE_TYPE_TAG) !== 0) {
            const s = reader.readString()
            tag = JSON.parse(s)
        }

        const date = reader.readDate()
        const meta: Meta = { date }
        if ((type & INV_STORAGE_TYPE_LASTDATE) !== 0) {
            meta.lastDate = reader.readDate()
        }
        if (total !== undefined)
            meta.total = total.toFixed(2).toString()

        const res: Inventory = { meta }
        if (log)
            res.log = log
        if (itemlist)
            res.itemlist = itemlist
        if (tag)
            res.tag = tag
        list.push(res)

        position = reader.getPosition()
    }
    return list
}

//// Strings ////

function serializeStrings(invList: Array<Inventory>): StringTable {
    const strings = new StringTable([])
    invList.forEach(inv => {
        if (inv.log) {
            strings.add(inv.log.class)
            strings.add(inv.log.message)
        }

        if (inv.itemlist) {
            inv.itemlist.forEach(d => {
                strings.add(d.n)
                strings.add(d.c)
            })
        }

        if (inv.tag) {
            strings.add(JSON.stringify(inv.tag))
        }
    })
    return strings
}



export {
    InventoryWritter,
    InventoryReader,
    serializeInventory,
    deserializeInventory,
    serializeStrings
}