import { keepWindowOnScreen } from "./position";

function setDraggableRegion() {
    // exclude areas in css with --neu-non-draggable-region: true;
    Neutralino.window.setDraggableRegion('entropia-flow-client-hover-area');
}

const Mouse = {
    init: () => {
        setDraggableRegion();

        let _dragging = false;

        document.addEventListener('pointerdown', () => { _dragging = true; });
        document.addEventListener('mouseup', () => {
            _dragging = false;
            setTimeout(async () => {
                keepWindowOnScreen();
            }, 50); // Wait a bit to allow the move to complete
        });
        document.addEventListener('pointermove', (e) => {
            if (_dragging && e.buttons === 0) {
                _dragging = false;
                setDraggableRegion();
            }
        });

        // Disable right-click context menu
        document.addEventListener('contextmenu', event => event.preventDefault());
    }
}

export { Mouse }
