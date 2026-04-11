import { keepWindowOnScreen } from "./position";

// The whole hover area is draggable, except for a 5px exclusion margin around
// the window edges. The margin serves two purposes:
//   1. pointerdown in the margin does NOT start a drag
//   2. if the cursor enters the margin while a drag is in progress, the drag
//      is immediately cancelled
// Together these prevent the cursor from ever escaping the window during a
// drag, which is the scenario that causes Neutralino's internal pointerup to
// be lost and leaves the orphaned pointermove handler running (sticky drag).
//
// Cancellation is done by dispatching a synthetic pointercancel event on the
// hover-area — this invokes Neutralino's own cleanup handler `g`, which is
// the only code path that correctly removes the pointermove handler and
// releases the pointer capture. Calling unsetDraggableRegion mid-drag (as
// previous attempts did) leaks the pointermove handler and makes things worse.

const HOVER_AREA_ID = 'entropia-flow-client-hover-area';
const EDGE_MARGIN = 5;

let _isDragging = false;
let _capturedPointerId: number | null = null;
let _resetPending = false;

function isInEdgeMargin(e: PointerEvent): boolean {
    return e.clientX < EDGE_MARGIN
        || e.clientY < EDGE_MARGIN
        || e.clientX > window.innerWidth - EDGE_MARGIN
        || e.clientY > window.innerHeight - EDGE_MARGIN;
}

// Neutralino's setDraggableRegion rejects if the element is already registered,
// so we must unset first. --neu-non-draggable-region CSS is not implemented in
// this Neutralino version and has no effect.
//
// Guarded against running during an active drag: calling unsetDraggableRegion
// mid-drag leaves the pointermove handler orphaned on the element (Neutralino
// bug — unset removes pointerdown/up/cancel but not pointermove).
function setDraggableRegion() {
    if (_isDragging) {
        _resetPending = true;
        return;
    }
    Neutralino.window.unsetDraggableRegion(HOVER_AREA_ID)
        .catch(() => {}) // ignore if not yet registered
        .finally(() => {
            Neutralino.window.setDraggableRegion(HOVER_AREA_ID);
        });
}

function runPendingReset() {
    if (_resetPending) {
        _resetPending = false;
        setDraggableRegion();
    }
}

function cancelActiveDrag() {
    if (!_isDragging || _capturedPointerId === null) return;
    const el = document.getElementById(HOVER_AREA_ID);
    if (el) {
        try {
            el.dispatchEvent(new PointerEvent('pointercancel', {
                pointerId: _capturedPointerId,
                bubbles: false,
                cancelable: false,
            }));
        } catch {
            // ignore — Neutralino's handler is best-effort
        }
    }
    _isDragging = false;
    _capturedPointerId = null;
    runPendingReset();
}

// Manual user-triggered recovery (dblclick / right-click). Kept as a
// defense-in-depth escape hatch; the edge-margin cancellation should make
// this path unreachable in practice.
function cancelDrag() {
    Neutralino.window.unsetDraggableRegion(HOVER_AREA_ID)
        .catch(() => {})
        .finally(() => {
            setTimeout(() => {
                Neutralino.window.setDraggableRegion(HOVER_AREA_ID);
            }, 200);
        });
}

const Mouse = {
    init: () => {
        const hoverArea = document.getElementById(HOVER_AREA_ID);

        // Registered BEFORE setDraggableRegion so this listener is invoked
        // ahead of Neutralino's sibling pointerdown listener on the same
        // element. If the pointerdown is in the edge margin we call
        // stopImmediatePropagation, which prevents Neutralino's handler from
        // starting a drag at all.
        hoverArea?.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            if (isInEdgeMargin(e)) {
                e.stopImmediatePropagation();
                return;
            }
            _isDragging = true;
            _capturedPointerId = e.pointerId;
        });

        setDraggableRegion();

        document.addEventListener('pointermove', (e) => {
            if (!_isDragging) return;
            if (isInEdgeMargin(e)) {
                cancelActiveDrag();
            }
        });

        const endDrag = () => {
            if (!_isDragging) return;
            _isDragging = false;
            _capturedPointerId = null;
            runPendingReset();
        };
        document.addEventListener('pointerup', () => {
            endDrag();
            setTimeout(async () => {
                keepWindowOnScreen();
            }, 50);
        });
        document.addEventListener('pointercancel', endDrag);

        // Defense-in-depth: manual recovery if a drag ever wedges.
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
    },
};

export { Mouse };
