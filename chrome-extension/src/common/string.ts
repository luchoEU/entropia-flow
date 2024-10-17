function multiIncludes(multiSearch: string, mainStr: string): boolean {
    if (!multiSearch || multiSearch.length == 0)
        return true;

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
}
