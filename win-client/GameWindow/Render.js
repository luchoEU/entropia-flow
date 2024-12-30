let renderEnabled = true
let lastData = undefined
let clickDisabled = false

function receive(delta) {
    delta.action = () => { }
    lastData = entropiaFlowStream.applyDelta(lastData, delta);
    _render(lastData);
}

function _render(data) {
    if (!renderEnabled) {
        empty.def.backgroundType = data.def.backgroundType
        data = empty
    }
    const size = entropiaFlowStream.render(data);
    if (size && size.width > 10)
        chrome.webview?.hostObjects.resize.OnRendered(size.width, size.height);
    data.action?.()
}

const empty = {
    obj: {},
    def: {
        size: { width: 30, height: 30 },
        template: ''
    }
};

function _setupMinimizeButton() {
    const hoverImage = document.getElementById("hoverImage");
    hoverImage.addEventListener("click", (e) => {
        e.stopPropagation();
        if (clickDisabled)
            return;

        if (renderEnabled) {
            renderEnabled = false
            document.getElementById("hoverArea").className = 'minimized'
            if (!lastData)
                lastData = empty
        } else {
            renderEnabled = true
            document.getElementById("hoverArea").className = ''
        }
        _render(lastData)
    })
}

function renderWaiting(obj) {
    lastData = {
        obj,
        def: {
            template: `
            <div style="display: flex; align-items: center; margin: 15px;">
                <img src="{img.logo}" alt="Logo" style="width: 50px;">
                <div style="margin: 10px;">
                    <div style="font-size: 20px; font-weight: bold;">Entropia Flow</div>
                    <div style="font-size: 14px; margin-left: 10px;">Waiting for connection...</div>
                </div>
                <span id="copyButton" style="position: relative;">
                    <img src="{img.copy}" alt="Logo" style="width: 20px;" title="{uri}">
                    <span id="copyPopup" style="display: none; font-size: 12px; position: absolute; top: -8px; right: -8px; z-index: 1; background-color: lavender; padding: 10px; border-radius: 13px;">Copied!</span>
                </span>
            </div>
        `,
            size: { width: 290, height: 90 },
            disableSafeCheck: true
        },
        action: () => {
            const copyButton = document.getElementById("copyButton");
            copyButton.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (clickDisabled)
                    return;

                if (await _copyToClipboard(obj.uri)) {
                    const popup = document.getElementById('copyPopup');
                    popup.style.display = 'block'
                    setTimeout(() => { popup.style.display = 'none' }, 1000)
                }
            });
        }
    }
    if (!renderEnabled) {
        renderEnabled = true
        document.getElementById("hoverArea").className = ''
    }
    _render(lastData)
}

document.addEventListener("DOMContentLoaded", function () {
    _setupMinimizeButton()
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

