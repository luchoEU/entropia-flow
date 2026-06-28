export interface SavedScrollPosition {
    selector: string;
    scrollTop: number;
    scrollLeft: number;
}

export const getStableSelector = (el: HTMLElement, root: HTMLElement): string => {
    const parts: string[] = [];
    let current: HTMLElement | null = el;
    while (current && current !== root) {
        let part = current.tagName.toLowerCase();
        if (current.id) {
            part += `#${current.id}`;
            parts.unshift(part);
            break; // ID is unique, so we can stop here!
        }
        if (current.className) {
            // Filter out snabbdom classes or transition helper classes if any
            const classes = current.className.split(/\s+/).filter(c => c && !c.startsWith('snabbdom')).join('.');
            if (classes) {
                part += `.${classes}`;
            }
        }
        // Add nth-of-type selector to handle duplicate sibling elements
        let index = 1;
        let sibling = current.previousElementSibling;
        while (sibling) {
            if (sibling.tagName === current.tagName) {
                index++;
            }
            sibling = sibling.previousElementSibling;
        }
        part += `:nth-of-type(${index})`;
        
        parts.unshift(part);
        current = current.parentElement;
    }
    return parts.join(' > ');
};

export const saveScrollPositions = (container: HTMLElement): SavedScrollPosition[] => {
    const scrollables = container.querySelectorAll('*');
    const saved: SavedScrollPosition[] = [];
    scrollables.forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.scrollTop > 0 || htmlEl.scrollLeft > 0) {
            const selector = getStableSelector(htmlEl, container);
            saved.push({
                selector,
                scrollTop: htmlEl.scrollTop,
                scrollLeft: htmlEl.scrollLeft
            });
        }
    });
    return saved;
};

export const restoreScrollPositions = (container: HTMLElement, saved: SavedScrollPosition[]) => {
    saved.forEach(pos => {
        try {
            const htmlEl = container.querySelector(pos.selector) as HTMLElement | null;
            if (htmlEl) {
                htmlEl.scrollTop = pos.scrollTop;
                htmlEl.scrollLeft = pos.scrollLeft;
            }
        } catch (e) {
            console.error('Failed to restore scroll position for selector:', pos.selector, e);
        }
    });
};
