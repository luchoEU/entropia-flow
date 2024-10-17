function isObject(item: any): boolean {
    return item !== undefined && typeof item === 'object' && !Array.isArray(item);
}

function isArray(item: any): boolean {
    return Array.isArray(item) && typeof item !== 'string'
}

function _mergeArray(target: any[], source: any[]) {
    for (let i=0; i < source.length; i++) {
        if (i < target.length) {
            if (isObject(source[i]) !== isObject(target[i]) || isArray(source[i]) !== isArray(target[i])) {
                // structure type changed, don't use saved value
            } else if (isObject(source[i])) {
                _mergeOverride(target[i], source[i])
            } else if (isArray(source[i])) {
                _mergeArray(target[i], source[i])
            } else {
                target[i] = source[i]
            }
        } else {
            target.push(source[i])
        }
    }
}

function _mergeOverride(target: any, ...sources: any[]) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (target[key] !== undefined &&
                (isObject(source[key]) !== isObject(target[key])
                || isArray(source[key]) !== isArray(target[key]))) {
                // structure type changed, don't use saved value
            } else if (isObject(source[key])) {
                if (target[key] === undefined) Object.assign(target, { [key]: {} });
                _mergeOverride(target[key], source[key]);
            } else if (isArray(source[key])) {
                if (target[key] === undefined) Object.assign(target, { [key]: [] });
                _mergeArray(target[key], source[key])
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return _mergeOverride(target, ...sources);
}

function mergeDeep(target: any, ...sources: any[]) {
    const targetClone = JSON.parse(JSON.stringify(target))
    return _mergeOverride(targetClone, ...sources)
}

export {
    mergeDeep,
}