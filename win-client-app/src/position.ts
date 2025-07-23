interface OneScreen {
    x: number
    y: number
    width: number
    height: number
}

let _screens: OneScreen[] = [];
function screensChanged(screens: OneScreen[]) {
    _screens = screens;
};

let _snap = {
    right: false,
    bottom: false,
}
async function keepWindowOnScreen(updateSnap = true) {
    if (!_screens?.find || _screens.length === 0) {
        console.log('No screens information');
        return;
    }

    const windowSize = await Neutralino.window.getSize();
    const windowPos = await Neutralino.window.getPosition();

    let x = windowPos.x;
    let y = windowPos.y;

    // Clamp the window to the nearest screen where it's partially or mostly visible
    let targetScreen = _screens.find(screen => {
        return (
            x + windowSize.width! > screen.x &&
            x < screen.x + screen.width &&
            y + windowSize.height! > screen.y &&
            y < screen.y + screen.height
        );
    });

    // If not found, fallback to primary screen
    if (!targetScreen) {
        targetScreen = _screens[0];
    }

    const maxX = targetScreen.x + targetScreen.width - windowSize.width!;
    const maxY = targetScreen.y + targetScreen.height - windowSize.height!;

    if (x < targetScreen.x) x = targetScreen.x;
    if (y < targetScreen.y) y = targetScreen.y;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;

    if (x !== windowPos.x || y !== windowPos.y) {
        if (updateSnap) {
            _snap.right = x < windowPos.x;
            _snap.bottom = y < windowPos.y;
        }
        console.log(`Position corrected, screen (${targetScreen.x}, ${targetScreen.y}, ${targetScreen.width}, ${targetScreen.height}) window (${windowPos.x}, ${windowPos.y}) => (${x}, ${y}, ${windowSize.width}, ${windowSize.height})`)
        await Neutralino.window.move(x, y);
    } else {
        if (updateSnap) {
            _snap.right = false;
            _snap.bottom = false;
        }
    }
}

let _deltaW = 0
let _deltaH = 0
async function setContentSize(size: { width: number, height: number }, isRetry = false) {
    const deltaX = window.innerWidth - size.width;
    const deltaY = window.innerHeight - size.height;
    if (deltaX === 0 && deltaY === 0) return;

    const guessSize = { width: size.width + _deltaW, height: size.height + _deltaH };
    await Neutralino.window.setSize(guessSize);

    if (_snap.right && deltaX !== 0 || _snap.bottom && deltaY !== 0) {
        const pos = await Neutralino.window.getPosition();
        await Neutralino.window.move(pos.x + (_snap.right ? deltaX : 0), pos.y + (_snap.bottom ? deltaY : 0));
    }

    keepWindowOnScreen(false);

    if (isRetry) return;

    // Wait a moment for the resize to settle
    setTimeout(() => {
        const contentWidth = window.innerWidth;
        const contentHeight = window.innerHeight;

        if (contentWidth === size.width && contentHeight === size.height) return;

        _deltaW = guessSize.width - contentWidth;
        _deltaH = guessSize.height - contentHeight;

        setContentSize(size, true);
    }, 100);
}

export {
    screensChanged,
    setContentSize,
    keepWindowOnScreen
}
