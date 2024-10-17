// returns a new object with the values at each key mapped using mapFn(value, key, index)
const objectMap = (obj: object, mapFn: (v: any, k: string, i: number) => any) =>
    Object.fromEntries(
        Object.entries(obj).map(
            ([k, v], i) => [k, mapFn(v, k, i)]
        )
    )

export {
    objectMap,
}
