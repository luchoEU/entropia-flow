function isObject(item: any): boolean {
    return item !== undefined && typeof item === 'object' && !Array.isArray(item);
}

function isArray(item: any): boolean {
    return Array.isArray(item) && typeof item !== 'string'
}

function mergeArray(target: any[], source: any[]) {
    for (let i=0; i<target.length && i<source.length; i++) {
        if (isObject(source[i]) !== isObject(target[i]) || isArray(source[i]) !== isArray(target[i])) {
            // structure type changed, don't use saved value
        } else if (isObject(source[i])) {
            mergeDeep(target[i], source[i])
        } else if (isArray(source[i])) {
            mergeArray(target[i], source[i])
        } else {
            target[i] = source[i]
        }
    }
}

function mergeDeep(target: any, ...sources: any[]) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {        
        for (const key in source) {
            if (isObject(source[key]) !== isObject(target[key]) || isArray(source[key]) !== isArray(target[key])) {
                // structure type changed, don't use saved value
            } else if (isObject(source[key])) {
                if (target[key] === undefined) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else if (isArray(source[key])) {
                mergeArray(target[key], source[key])
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

// returns a new object with the values at each key mapped using mapFn(value)
function objectMap(object: object, mapFn: (e: any) => any) {
    return Object.keys(object).reduce(function(result, key) {
      result[key] = mapFn(object[key])
      return result
    }, {})
}

export {
    mergeDeep,
    objectMap,
}