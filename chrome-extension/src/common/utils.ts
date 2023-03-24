function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep(target: any, ...sources: any[]) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
            for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
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