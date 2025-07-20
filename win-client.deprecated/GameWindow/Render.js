const PREFIX_LAYOUT_ID = 'entropiaflow.client.';
const WAITING_LAYOUT_ID = PREFIX_LAYOUT_ID + 'waiting';
const MENU_LAYOUT_ID = PREFIX_LAYOUT_ID + 'menu';
const OCR_LAYOUT_ID = PREFIX_LAYOUT_ID + 'ocr';

let _lastData = {
    layouts: {
        [WAITING_LAYOUT_ID]: {
            name: 'Entropia Flow Waiting',
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
                #entropia-flow-client-menu, #entropia-flow-client-next {
                    display: none !important;
                }
            `,
            action: () => {
                const copyButton = document.getElementById("copyButton");
                copyButton?.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    if (await chrome.webview?.hostObjects.clipboard.Copy(_lastData.data.uri)) {
                        const popup = document.getElementById('copyPopup');
                        popup.style.display = 'block'
                        setTimeout(() => { popup.style.display = 'none' }, 1000)
                    }
                });
            }
        },
        [MENU_LAYOUT_ID]: {
            name: 'Entropia Flow Menu',
            htmlTemplate: `
                {{#layouts}}<div title="{{name}}" data-layout="{{id}}"><span>{{name}}</span><span>{{name}}</span></div>{{/layouts}}
            `,
            cssTemplate: `
                .layout-root {
                    background-color: rgba(173, 216, 230, 0.8); /* light blue */
                }
                #entropia-flow-client-minimize,
                #entropia-flow-client-layout,
                #entropia-flow-client-menu,
                #entropia-flow-client-next {
                    display: none !important;
                }
                .layout-root div {
                    max-width: 500px;
                    padding: 2px 20px;
                    position: relative;
                }
                .layout-root div:hover {
                    font-weight: bold;
                    cursor: pointer;
                }
                .layout-root div > span:nth-child(1) {
                    visibility: hidden;
                    font-weight: bold;
                }
                .layout-root div > span:nth-child(2) {
                    position: absolute;
                    left: 0px;
                    width: 100%;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `,
            action: () => {
                const layoutRoot = document.querySelector(".layout-root");
                for (const layoutDiv of layoutRoot.children) {
                    layoutDiv.addEventListener("click", (e) => {
                        e.stopPropagation();
                        chrome.webview?.hostObjects.layout.SelectLayout(e.currentTarget.dataset.layout);
                    });
                }
            }
        },
        [OCR_LAYOUT_ID]: {
            name: 'Entropia Flow Scanner',
            htmlTemplate: `
                <div class='root'>
                   <div></div><div class='title'>Scanner</div><div></div>
                   <div></div><div class='area'></div><div></div>
                   <div></div><div id='text'></div><div></div>
                </div>
            `,
            cssTemplate: `
                .root {
                    display: grid;
                    grid-template-columns: 20px 1fr 20px;
                    grid-template-rows: 1fr 20px 20px;
                }
                .root > div {
                    background-color: rgba(0,0,0,.7);
                }
                .root > div.area {
                    background-color: transparent;
                }
                .title {
                    padding: 0px 15px;
                    margin: 0px;
                    color: white;
                    font-size: 20px;
                }
                .area {
                    border: solid 1px red;
                }
                #text {
                    color: white;
                    font-size: 12px;
                    font-weight: 100;
                    text-align: center;
                }
                #entropia-flow-client-layout,
                #entropia-flow-client-menu,
                #entropia-flow-client-next {
                    display: none !important;
                }
            `,
            action: () => _setScannerTimeout()
        },
    }
}

function _setScannerTimeout() {
    setTimeout(async () => {
        const area = document.querySelector('.area');
        const textDiv = document.getElementById('text');
        const text = await chrome.webview?.hostObjects.ocr.Scan(area.offsetLeft, area.offsetTop, area.offsetWidth, area.offsetHeight);
        textDiv.innerText = text ?? '';
        _setScannerTimeout(); // set 1 second again after it finishes
    }, 1000);
}

const _emptyLayout = {
    name: 'Entropia Flow Client Empty',
};

function receive(delta) {
    _lastData = clientStream.applyDelta(_lastData, delta);
    _lastData.data.layouts = Object.entries(_lastData.layouts)
        .filter(([k,]) => !k.startsWith(PREFIX_LAYOUT_ID) || k === OCR_LAYOUT_ID)
        .map(([id,l]) => ({ id, name: l.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    _lastData.layoutIdList = _lastData.data.layouts.map(l => l.id).filter(k => k !== OCR_LAYOUT_ID);
}

function dispatch(action) {
    chrome.webview?.hostObjects.dispatcher.Send(action);
}

let _disableRender = false
function render(s) {
    if (_disableRender) return; // for debugging
    const d = _lastData;

    let layout = d.layouts[s.layoutId];
    let scale = s.scale ?? 1;
    if (s.minimized) {
        layout = {
            ..._emptyLayout,
            backgroundType: layout.backgroundType
        };
        scale = 1;
    }

    let size = clientStream.render({ data: d.data, layout }, dispatch, scale, s.minimized ? { width: 30, height: 30 } : { width: 100, height: 50 });
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
    document.getElementById('entropia-flow-client-layout').innerText = layout?.name ?? '';

    layout?.action?.();
}

function nextLayout(layoutId) {
    const layouts = _lastData.layoutIdList;
    const index = layouts?.indexOf(layoutId) ?? -1;
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

    const next = document.getElementById('entropia-flow-client-next');
    next.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.webview?.hostObjects.layout.NextClicked();
    });

    const close = document.getElementById('entropia-flow-client-close');
    close.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.webview?.hostObjects.layout.CloseClicked();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    _setupButtons();
    chrome.webview?.hostObjects.lifecycle.OnLoaded();
});
