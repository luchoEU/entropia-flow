let _renderEnabled = true
let _lastData = undefined
let _clickDisabled = false
let _scale = undefined;

const PREFIX_LAYOUT_ID = 'entropiaflow.client.';
const WAITING_LAYOUT_ID = PREFIX_LAYOUT_ID + 'waiting';
let _layoutId = WAITING_LAYOUT_ID;

function receive(delta, layoutId) {
    _layoutId = layoutId;
    _lastData = entropiaFlowStream.applyDelta(_lastData, delta);
    _lastData.action = undefined;
    _render();
}

const _emptyLayout = {
    name: 'Entropia Flow Client Empty',
};

function setScale(s) {
    _scale = s;
    _render();
}

function _render() {
    const d = _lastData;

    let layout = d.layouts[_layoutId];
    let scale = _scale;
    if (!_renderEnabled) {
        layout = {
            ..._emptyLayout,
            backgroundType: layout.backgroundType
        };
        sScale = 1;
    }

    const size = entropiaFlowStream.render({ data: d.data, layout }, scale, _renderEnabled ? { width: 80, height: 50 } : { width: 30, height: 30 });

    if (size)
        chrome.webview?.hostObjects.resize.OnRendered(size.width, size.height);
    const layoutElement = document.getElementById('entropia-flow-client-layout');

    if (layoutElement)
        layoutElement.innerText = layout.name;

    d.action?.();
}

function _setupButtons() {
    const minimize = document.getElementById('entropia-flow-client-minimize');
    minimize?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (_clickDisabled)
            return;

        if (_renderEnabled) {
            _renderEnabled = false;
            document.getElementById('entropia-flow-client-hover-area').className = 'entropia-flow-client-minimized';
            if (!_lastData)
                _lastData = empty;
        } else {
            _renderEnabled = true;
            document.getElementById('entropia-flow-client-hover-area').className = '';
        }
        _render();
    });

    const menu = document.getElementById('entropia-flow-client-menu');
    menu?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (_clickDisabled)
            return;

        const layouts = Object.keys(_lastData.layouts).filter(k => !k.startsWith(PREFIX_LAYOUT_ID)).sort();
        const index = layouts.indexOf(_layoutId);
        if (index !== -1) {
            _layoutId = index + 1 === layouts.length ? layouts[0] : layouts[index + 1];
            _render();
        }

        //chrome.webview?.hostObjects.layout.ShowMenu();
    });
}

function renderWaiting(obj) {
    _lastData = {
        data: obj,
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
                    #stream {
                        background-color: rgba(173, 216, 230, 0.8); /* light blue */
                    }
                `
            }
        },
        action: () => {
            const copyButton = document.getElementById("copyButton");
            copyButton?.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (_clickDisabled)
                    return;

                if (await _copyToClipboard(obj.uri)) {
                    const popup = document.getElementById('copyPopup');
                    popup.style.display = 'block'
                    setTimeout(() => { popup.style.display = 'none' }, 1000)
                }
            });
        }
    }
    _layoutId = WAITING_LAYOUT_ID;
    if (!_renderEnabled) {
        _renderEnabled = true;
        document.getElementById("entropia-flow-client-hover-area").className = '';
    }
    _render();
}

document.addEventListener("DOMContentLoaded", function () {
    _setupButtons();
    chrome.webview?.hostObjects.lifecycle.OnLoaded();
});

/// Copy to Clipboard ///
async function _copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error("Error copying text: ", err);
            return false;
        }
    } else {
        // Fallback for older browsers
        return _copyToClipboardFallback(text);
    }
}

function _copyToClipboardFallback(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.position = "fixed"; // Prevent scrolling to bottom
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        console.error("Error copying text: ", err);
        document.body.removeChild(textArea);
        return false;
    }
}

