function setDraggableRegion() {
    // exclude areas in css with --neu-non-draggable-region: true;
    Neutralino.window.setDraggableRegion('entropia-flow-client-hover-area');
}

Neutralino.init();
setDraggableRegion();

Neutralino.events.on('windowClose', () => {
    Neutralino.app.exit();
});

// Disable right-click context menu
document.addEventListener('contextmenu', event => event.preventDefault());
