import { keepWindowOnScreen } from "./position";

// Neutralino's setDraggableRegion rejects if the element is already registered,
// so we must unset first. --neu-non-draggable-region CSS is not implemented in
// this Neutralino version and has no effect.
function setDraggableRegion() {
    Neutralino.window.unsetDraggableRegion('entropia-flow-client-hover-area')
        .catch(() => {}) // ignore if not yet registered
        .finally(() => {
            Neutralino.window.setDraggableRegion('entropia-flow-client-hover-area');
        });
}

function cancelDrag() {
    Neutralino.window.unsetDraggableRegion('entropia-flow-client-hover-area')
        .catch(() => {})
        .finally(() => {
            setTimeout(() => {
                Neutralino.window.setDraggableRegion('entropia-flow-client-hover-area');
            }, 200);
        });
}

const Mouse = {
    init: () => {
        setDraggableRegion();

        document.addEventListener('pointerup', () => {
            setTimeout(async () => {
                keepWindowOnScreen();
            }, 50);
        });
        document.addEventListener('pointermove', (e) => {
            // Fallback: if pointer moves with no button pressed, reset drag state
            if (e.buttons === 0) {
                setDraggableRegion();
            }
        });

        // Cancel sticky drag on double-click or right-click
        document.addEventListener('dblclick', () => {
            cancelDrag();
        });
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            cancelDrag();
        });
    },
    resetDrag: () => {
        setDraggableRegion();
    }
}

export { Mouse }
