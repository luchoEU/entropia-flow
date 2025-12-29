function filterExact(filter: string): string {
    return `!${filter}`
}

function filterOr(filters: string[]): string {
    return filters.join('|')
}

function multiIncludes(multiSearch: string | undefined, mainStr: string): boolean {
    if (!multiSearch || multiSearch.length == 0)
        return true;

    mainStr = mainStr.replace(/\!/g, ' '); // use ! as word separator

    if (multiSearch[0] === '!') // exact match
    {
        if (multiSearch.includes('|')) // or
            return multiSearch.slice(1).split('|').some(x => x === mainStr);
        else
            return multiSearch.slice(1) === mainStr;
    }

    if (multiSearch[0].includes('|'))
        return multiSearch.split('|').some(x => multiIncludes(x, mainStr));

    function check(multi: string[], main: string[]): boolean {
        if (multi.length == 0)
            return true;

        for (let n = 0; n < main.length; n++) {
            if (main[n].includes(multi[0])) {
                const newMain = main.slice(0, n).concat(main.slice(n + 1));
                if (check(multi.slice(1), newMain))
                return true;
            }  
        }

        return false;
    }

    const multi = multiSearch.toLowerCase().split(' ').filter(x => x.length > 0);
    const main = mainStr.toLowerCase().split(' ').filter(x => x.length > 0);
    return check(multi, main);
}

export {
    multiIncludes,
    filterExact,
    filterOr,
}
