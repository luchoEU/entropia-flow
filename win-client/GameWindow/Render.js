const PREFIX_LAYOUT_ID = 'entropiaflow.client.';
const WAITING_LAYOUT_ID = PREFIX_LAYOUT_ID + 'waiting';

let _lastData = {
    layouts: {
        [WAITING_LAYOUT_ID]: {
            name: 'Entropia Flow Client Waiting',
            htmlTemplate: `
                <div style="display: flex; align-items: center; margin: 15px;">
                    <img src="{{img.logo}}" alt="Logo" style="width: 50px;">
                    <div style="margin: 10px;">
                        <div style="font-size: 20px; font-weight: bold;">Entropia Flow</div>
                        <div style="font-size: 14px; margin-left: 10px;">Waiting for connection...</div>
                    </div>
                    <span id="copyButton" style="position: relative;">
                        <img src="{{img.copy}}" alt="Logo" style="width: 20px;" title="{{uri}}">
                        <span id="copyPopup" style="display: none; font-size: 12px; position: absolute; top: -8px; right: -8px; z-index: 1; background-color: lavender; padding: 10px; border-radius: 13px;">Copied!</span>
                    </span>
                </div>
            `,
            cssTemplate: `
                .layout-root {
                    background-color: rgba(173, 216, 230, 0.8); /* light blue */
                }
                #entropia-flow-client-menu {
                    display: none !important;
                }
            `,
            action: () => {
                const copyButton = document.getElementById("copyButton");
                copyButton?.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    if (chrome.webview?.hostObjects.clipboard.Copy(_lastData.data.uri)) {
                        const popup = document.getElementById('copyPopup');
                        popup.style.display = 'block'
                        setTimeout(() => { popup.style.display = 'none' }, 1000)
                    }
                });
            }
        }
    }
}

const _emptyLayout = {
    name: 'Entropia Flow Client Empty',
};

function receive(delta) {
    _lastData = entropiaFlowStream.applyDelta(_lastData, delta);
}

let _disableRender = false
function render(s) {
    if (_disableRender) return; // for debugging
    const d = _lastData;

    let layout = d.layouts[s.layoutId] ?? 1;
    let scale = s.scale;
    if (s.minimized) {
        layout = {
            ..._emptyLayout,
            backgroundType: layout.backgroundType
        };
        scale = 1;
    }

    let size = entropiaFlowStream.render({ data: d.data, layout }, scale, s.minimized ? { width: 30, height: 30 } : { width: 80, height: 50 });
    if (size) {
        chrome.webview?.hostObjects.resize.OnRendered(size.width, size.height);

        size = { width: Math.floor(size.width), height: Math.floor(size.height) };
        const style = document.getElementById('entropia-flow-client-nav').style;
        if (scale > 1) {
            style.width = `${size.width / scale}px`;
            style.height = `${size.height / scale}px`;
            style.transform = `scale(${scale})`;
            style.transformOrigin = 'top left';
        } else {
            style.width = `${size.width}px`;
            style.height = `${size.height}px`;
            style.removeProperty('transform');
        }
    }

    document.getElementById('entropia-flow-client-hover-area').className = s.minimized ? 'entropia-flow-client-minimized' : '';
    document.getElementById('entropia-flow-client-layout').innerText = layout.name;

    layout.action?.();
}

function nextLayout(layoutId) {
    const layouts = Object.keys(_lastData.layouts).filter(k => !k.startsWith(PREFIX_LAYOUT_ID)).sort();
    const index = layouts.indexOf(layoutId);
    if (index !== -1) {
        return index + 1 === layouts.length ? layouts[0] : layouts[index + 1];
    }
}

function _setupButtons() {
    const minimize = document.getElementById('entropia-flow-client-minimize');
    minimize.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.webview?.hostObjects.layout.MinimizeCliked();
    });

    const menu = document.getElementById('entropia-flow-client-menu');
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.webview?.hostObjects.layout.MenuClicked();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    _setupButtons();
    chrome.webview?.hostObjects.lifecycle.OnLoaded();
});
