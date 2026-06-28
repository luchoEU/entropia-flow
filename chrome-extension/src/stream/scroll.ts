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
        
        // Add nth-of-type selector to handle duplicate sibling elements
        // This is 100% valid CSS and immune to special characters in classNames (like brackets/colons in Tailwind)
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
    if (saved.length > 0) {
        console.log('[Scroll Preservation] Saved positions:', saved);
    }
    return saved;
};

export const restoreScrollPositions = (container: HTMLElement, saved: SavedScrollPosition[]) => {
    const restore = () => {
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

    console.log('[Scroll Preservation] Restoring positions:', saved);

    // 1. Restore synchronously immediately
    restore();

    // 2. Restore in next animation frames & timeout to handle layout/repaint delays
    requestAnimationFrame(restore);
    setTimeout(restore, 20);
    setTimeout(restore, 100);
};
