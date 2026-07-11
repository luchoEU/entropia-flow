function setupWindowHoverControls(
    hoverArea: HTMLElement | null,
    minimizeButton: HTMLElement | null
) {
    const setHoverState = (expanded: boolean) => {
        hoverArea?.classList.toggle('entropia-flow-client-close-visible', expanded);
    };

    minimizeButton?.addEventListener('mouseenter', () => {
        hoverArea?.classList.add('entropia-flow-client-expanded');
    });

    hoverArea?.addEventListener('mouseenter', () => {
        setHoverState(true);
    });

    hoverArea?.addEventListener('mouseleave', () => {
        hoverArea?.classList.remove('entropia-flow-client-expanded');
        setHoverState(false);
    });
}

export {
    setupWindowHoverControls,
};
