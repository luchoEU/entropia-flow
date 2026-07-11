function setupWindowBackgroundControls(
    backgroundButton: HTMLElement | null,
    onNextBackground: () => void
) {
    backgroundButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        onNextBackground();
    });
}

export {
    setupWindowBackgroundControls,
};
