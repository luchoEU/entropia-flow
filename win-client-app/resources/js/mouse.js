function setDraggableRegion() {
    // exclude areas in css with --neu-non-draggable-region: true;
    Neutralino.window.setDraggableRegion('entropia-flow-client-hover-area');
}

let screens = undefined;
function screensChanged(_screens) {
    screens = _screens;
};

async function keepWindowOnScreen() {
    if (!screens?.find) {
        console.log('No screens information');
        return;
    }

    const windowSize = await Neutralino.window.getSize();
    const windowPos = await Neutralino.window.getPosition();

    let x = windowPos.x;
    let y = windowPos.y;

    // Clamp the window to the nearest screen where it's partially or mostly visible
    let targetScreen = screens.find(screen => {
        return (
            x + windowSize.width > screen.x &&
            x < screen.x + screen.width &&
            y + windowSize.height > screen.y &&
            y < screen.y + screen.height
        );
    });

    // If not found, fallback to primary screen
    if (!targetScreen) {
        targetScreen = screens[0];
    }

    const maxX = targetScreen.x + targetScreen.width - windowSize.width;
    const maxY = targetScreen.y + targetScreen.height - windowSize.height;

    if (x < targetScreen.x) x = targetScreen.x;
    if (y < targetScreen.y) y = targetScreen.y;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;

    if (x !== windowPos.x || y !== windowPos.y) {
        console.log(`Position corrected, screen (${targetScreen.x}, ${targetScreen.y}, ${targetScreen.width}, ${targetScreen.height}) window (${windowPos.x}, ${windowPos.y}) => (${x}, ${y}, ${windowSize.width}, ${windowSize.height})`)
        setWindowPosition(x, y);
    }
}

setDraggableRegion();

document.addEventListener('mouseup', () => {
    setTimeout(async () => {
        keepWindowOnScreen();
    }, 50); // Wait a bit to allow the move to complete
});

// Disable right-click context menu
document.addEventListener('contextmenu', event => event.preventDefault());
