function setDraggableRegion() {
    // exclude areas in css with --neu-non-draggable-region: true;
    Neutralino.window.setDraggableRegion('entropia-flow-client-hover-area');
}

setDraggableRegion();

document.addEventListener('mouseup', () => {
    setTimeout(async () => {
        keepWindowOnScreen();
    }, 50); // Wait a bit to allow the move to complete
});

// Disable right-click context menu
document.addEventListener('contextmenu', event => event.preventDefault());
