class StringTable {
    private strings: Array<string>

    constructor(init: Array<string>) {
        this.strings = init
    }

    public size(): number {
        return this.strings.length;
    }

    public add(s: string) {
        const index = this._binarySearch(s)
        if (this.strings[index] != s)
            this._insert(index, s)
    }

    public get(index: number) {
        return this.strings[index]
    }

    public getIndex(s: string): number {
        const index = this._binarySearch(s)
        if (this.strings[index] != s)
            throw new Error(`String not found ${s}`)
        return index
    }

    public getToStore(): Array<string> {
        return this.strings
    }

    private _insert(index: number, item: string) {
        this.strings.splice(index, 0, item);
    }

    private _binarySearch(s: string): number {
        let first = 0
        let last = this.strings.length - 1
        while (first <= last) {
            const middle = Math.floor((first + last) / 2)
            const p = this.strings[middle]
            if (p === s) {
                return middle
            } else if (p < s) {
                first = middle + 1
            } else {
                last = middle - 1
            }
        }
        return first
    }
}

export default StringTable