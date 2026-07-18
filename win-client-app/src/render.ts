import { render as clientRender, applyDelta } from "clientStream";
import { StreamRenderSingle } from "../resources/stream/stream/data";
import { SettingsData } from "./data";
import { StreamRenderObject } from "../resources/stream/stream/data";
import { sendMessageToMain } from "./messages";
import { setContentSize } from "./position";
import { copyTextToClipboard, interpolate } from "./utils";
import { STORE_INIT, STORE_WINDOW } from "./const";
import { WindowData } from "./windows";
import { MENU_LAYOUT_ID, MENU_HTML_TEMPLATE, MENU_CSS_TEMPLATE, buildMenuData, MenuState } from "./menuLayout";
import { Mouse } from "./mouse";
import { setupWindowHoverControls } from "./windowHoverControls";
import { setupWindowBackgroundControls } from "./windowBackgroundControls";
import { nextBackgroundType, reconcilePendingBackgroundTypes, setPendingBackgroundType } from "./windowBackgroundState";

/// Menu ///

let _menuState: MenuState = { activeRole: 'all', searchQuery: '' }

/// Render ///

const PREFIX_LAYOUT_ID = 'entropiaflow.client.';
const WAITING_LAYOUT_ID = PREFIX_LAYOUT_ID + 'waiting';
const OCR_LAYOUT_ID = PREFIX_LAYOUT_ID + 'ocr';

interface StreamWindowLayout {
    name: string;
    description?: string;
    htmlTemplate?: string;
    cssTemplate?: string;
    action?: () => void;
    backgroundType?: number;
    roles?: string[];
}

interface StreamWindowRenderData {
    layouts: Record<string, StreamWindowLayout>;
    commonData?: StreamRenderObject;
    layoutData?: Record<string, StreamRenderObject>;
    roles?: string[];
    favorites?: Record<string, string[]>;
}

let _layoutIdList: string[] = [];
let _lastData: StreamWindowRenderData = {
    layouts: {
        [WAITING_LAYOUT_ID]: {
            name: 'Entropia Flow Waiting',
            htmlTemplate: `
                <div style="display: flex; align-items: center; margin: 15px;">
                    <img src="{{img.logo}}" alt="Logo" style="width: 50px;">
                    <div style="margin: 10px;">
                        <div style="font-size: 20px; font-weight: bold;">Entropia Flow</div>
                        <div style="font-size: 14px; margin-left: 10px;">
                            {{#uri}}Waiting for connection...{{/uri}}
                            {{^uri}}Loading...{{/uri}}
                        </div>
                    </div>
                    {{#uri}}
                        <span id="copyButton" class="clickable">
                            <img src="{{img.copy}}" alt="Copy" style="width: 20px;" title="{{uri}}">
                            <span id="copyPopup">Copied!</span>
                        </span>
                    {{/uri}}
                    {{^uri}}
                        <img id="copyButton" src="{{img.loading}}" alt="Loading" style="width: 20px;">
                    {{/uri}}
                </div>
            `,
            cssTemplate: `
                .layout-root {
                    background-color: rgba(173, 216, 230, 0.8); /* light blue */
                }
                #entropia-flow-client-menu, #entropia-flow-client-next, #entropia-flow-client-background {
                    display: none !important;
                }
                #copyButton {
                    position: relative;
                }
                #copyPopup {
                    display: none;
                    font-size: 12px;
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    z-index: 1;
                    background-color: lavender;
                    padding: 10px;
                    border-radius: 13px;
                }
            `,
            action: () => {
                const stream = document.getElementById("stream");
                stream?.addEventListener("pointerdown", (e) => {
                    if ((e.target as HTMLElement).closest('#copyButton')) {
                        e.stopPropagation();
                    }
                });
                stream?.addEventListener("click", async (e) => {
                    if ((e.target as HTMLElement).closest('#copyButton')) {
                        e.stopPropagation();
                        copyTextToClipboard(_lastData.commonData!.uri as string, 'copyPopup');
                    }
                })
            }
        },
        [MENU_LAYOUT_ID]: {
            name: 'Entropia Flow Menu',
            htmlTemplate: MENU_HTML_TEMPLATE,
            cssTemplate: MENU_CSS_TEMPLATE,
            action: () => {
                const container = document.querySelector('.menu-container') as HTMLElement
                if (!container) return

                // Prevent pointerdown from bubbling to the hover-area drag region.
                // --neu-non-draggable-region CSS is not implemented in this Neutralino
                // version, so we must stop propagation explicitly.
                container.addEventListener('pointerdown', (e) => e.stopPropagation())

                const searchInput = container.querySelector('.menu-search') as HTMLInputElement
                searchInput?.addEventListener('input', () => {
                    _menuState.searchQuery = searchInput.value.toLowerCase()
                    _reRenderMenu()
                })

                container.querySelector('.menu-roles')?.addEventListener('click', (e) => {
                    const btn = (e.target as HTMLElement).closest('[data-role]') as HTMLElement
                    if (!btn) return
                    e.stopPropagation()
                    _menuState.activeRole = btn.dataset.role!
                    _reRenderMenu()
                })

                const grid = container.querySelector('.menu-grid')
                const descEl = container.querySelector('.menu-description') as HTMLElement

                grid?.addEventListener('click', (e) => {
                    const favBtn = (e.target as HTMLElement).closest('[data-fav]') as HTMLElement
                    if (favBtn) {
                        e.stopPropagation()
                        sendMessageToMain('toggle-favorite', { role: _menuState.activeRole, layoutId: favBtn.dataset.fav }, 'chrome-extension')
                        return
                    }
                    const item = (e.target as HTMLElement).closest('[data-layout]') as HTMLElement
                    if (item) { e.stopPropagation(); selectLayout(item.dataset.layout!) }
                })

                grid?.addEventListener('mouseover', (e) => {
                    const item = (e.target as HTMLElement).closest('[data-layout]') as HTMLElement
                    if (item && descEl) descEl.textContent = item.dataset.description || ''
                })
                grid?.addEventListener('mouseleave', () => {
                    if (descEl) descEl.textContent = ''
                })

                // Focus search, cursor at end
                setTimeout(() => {
                    if (searchInput) {
                        searchInput.focus()
                        const v = searchInput.value
                        searchInput.value = ''
                        searchInput.value = v
                    }
                }, 50)
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
                #entropia-flow-client-next,
                #entropia-flow-client-background {
                    display: none !important;
                }
            `,
            action: () => { _scannerAdjust = { x: 0, y: 0 }; _scannerCalibrated = false; _lastOcrText = ''; _startScanner(); }
        },
    }
}

let _scannerTimeoutId: ReturnType<typeof setTimeout> | null = null;
let _scannerAdjust = { x: 0, y: 0 };
let _scannerCalibrated = false;
let _lastOcrText = '';

function _stopScanner() {
    if (_scannerTimeoutId !== null) {
        clearTimeout(_scannerTimeoutId);
        _scannerTimeoutId = null;
    }
}

function _startScanner() {
    _stopScanner();
    _scannerTimeoutId = setTimeout(async () => {
        const area = document.querySelector<HTMLElement>('.area');
        if (area) {
            const rect = area.getBoundingClientRect();
            const pos = await Neutralino.window.getPosition();
            const dpr = window.devicePixelRatio || 1;
            const border = Math.ceil(dpr);
            sendMessageToMain('ocr_request', {
                x: Math.round(pos.x + rect.left * dpr) + border + _scannerAdjust.x,
                y: Math.round(pos.y + rect.top * dpr) + border + _scannerAdjust.y,
                width: Math.round(rect.width * dpr) - 2 * border,
                height: Math.round(rect.height * dpr) - 2 * border
            }, 'ocr');
        }
        _startScanner();
    }, 1000);
}

function _restoreOcrText() {
    const textDiv = document.getElementById('text');
    if (textDiv && _lastOcrText) textDiv.innerText = _lastOcrText;
}

function ocrResult(data: { text?: string, error?: string, adjust?: { left: number, top: number, right: number, bottom: number } }) {
    _lastOcrText = data.error ? `Error: ${data.error}` : (data.text ?? '');
    const textDiv = document.getElementById('text');
    if (textDiv) textDiv.innerText = _lastOcrText;
    if (!_scannerCalibrated && data.adjust) {
        const { left, top } = data.adjust;
        if (left + top > 0) {
            _scannerAdjust.x += left;
            _scannerAdjust.y += top;
            _scannerCalibrated = true;
        }
    }
    if (data.text) sendMessageToMain('ocr_result', { text: data.text }, 'chrome-extension');
}
const _emptyLayout = {
    name: 'Entropia Flow Client Empty',
};

const minimizeButton = document.getElementById('entropia-flow-client-minimize');
const menuButton = document.getElementById('entropia-flow-client-menu');
const menuPopup = document.getElementById('entropia-flow-client-menu-popup');
const nextButton = document.getElementById('entropia-flow-client-next');
const backgroundButton = document.getElementById('entropia-flow-client-background');
const closeButton = document.getElementById('entropia-flow-client-close');

function _setupButtons() {
    const hoverArea = document.getElementById('entropia-flow-client-hover-area');

    minimizeButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        switchMinimized();
    });

    menuButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        sendMessageToMain('menu', '');
        if (menuPopup) {
            menuPopup.style.display = 'block';
            setTimeout(() => { menuPopup.style.display = 'none' }, 3000);
        }
    });

    nextButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        nextLayout();
    });

    setupWindowBackgroundControls(backgroundButton, () => {
        const layout = _lastData.layouts[_layoutId];
        if (layout) {
            layout.backgroundType = nextBackgroundType(layout.backgroundType);
            setPendingBackgroundType(_layoutId, layout.backgroundType);
            render({ layoutId: _layoutId, minimized: _minimized });
        }
        sendMessageToMain('set-background', {
            layoutId: _layoutId,
            backgroundType: _lastData.layouts[_layoutId]?.backgroundType,
        }, 'chrome-extension');
    });

    closeButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        Neutralino.storage.setData(STORE_WINDOW, null!);
        Neutralino.app.exit(); // close only this window
    });

    setupWindowHoverControls(hoverArea, minimizeButton);
}

function _reRenderMenu() {
    _lastActionLayoutId = undefined
    render({ layoutId: MENU_LAYOUT_ID })
}

function receive(delta: any) {
    _lastData = applyDelta(_lastData, delta);
    if (!_lastData.layoutData) _lastData.layoutData = {};
    reconcilePendingBackgroundTypes(_lastData.layouts);
    _layoutIdList = Object.entries(_lastData.layouts)
        .filter(([k,]) => !k.startsWith(PREFIX_LAYOUT_ID) || k === OCR_LAYOUT_ID)
        .map(([id,]) => id)
        .filter(k => k !== OCR_LAYOUT_ID);

    if (_layoutId === MENU_LAYOUT_ID) {
        _lastActionLayoutId = undefined  // allow action to re-run after re-render
    }
}

function nextLayout() {
    const index = _layoutIdList.indexOf(_layoutId);
    if (index === -1) return;
    const nextIndex = (index + 1) % _layoutIdList.length;
    const nextLayoutId = _layoutIdList[nextIndex];
    _layoutId = nextLayoutId;
    render({ layoutId: nextLayoutId });
}

function changeState(keyOrUpdates: string | Record<string, any>, value?: any) {
    const ld = _lastData.layoutData?.[_layoutId];
    if (ld) {
        if (typeof keyOrUpdates === 'object' && keyOrUpdates !== null) {
            Object.assign(ld, keyOrUpdates);
        } else {
            ld[keyOrUpdates] = value;
        }
    }
    _lastActionLayoutId = undefined;
    render({ layoutId: _layoutId });
    sendMessageToMain('change-state', { key: keyOrUpdates, value }, 'chrome-extension');
}

function dispatchOnClick(action: string) {
    if (action.startsWith('set:')) {
        const remainder = action.slice(4);
        const parts = remainder.split(/[;&]/);
        const updates: Record<string, any> = {};
        for (const part of parts) {
            let cleanPart = part.trim();
            if (cleanPart.startsWith('set:')) {
                cleanPart = cleanPart.slice(4);
            }
            const index = cleanPart.indexOf('=');
            if (index !== -1) {
                const k = cleanPart.slice(0, index).trim();
                const v = cleanPart.slice(index + 1).trim();
                updates[k] = v;
            }
        }
        changeState(updates);
        return;
    }
    if (action.startsWith('copy:')) {
        const text = action.slice(5);
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy to clipboard:', err);
        });
        return;
    }
    sendMessageToMain('dispatch', action, 'chrome-extension');
}

let _requestedLayout: string | undefined = undefined;
let _disableRender = false
async function render(s: { layoutId: string, scale?: number, minimized?: boolean }) {
    if (_disableRender) return; // for debugging
    if (_requestedLayout !== s.layoutId) {
        _requestedLayout = s.layoutId;
        sendMessageToMain('layout-changed', { pid: NL_PID, layoutId: s.layoutId });
    }

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

    if (s.layoutId === MENU_LAYOUT_ID) {
        d.layoutData![MENU_LAYOUT_ID] = buildMenuData(_menuState, _lastData) as any;
    }
    const layoutData = d.layoutData?.[s.layoutId];
    const single: StreamRenderSingle = {
        data: layoutData ? {
            ...d.commonData,
            ...layoutData,
            img: {
                ...d.commonData?.img as object,
                ...layoutData.img as object
            }
        } : d.commonData!,
        layout: layout as any
    };
    let size = await clientRender(single, dispatchOnClick, scale, s.minimized ? { width: 30, height: 30 } : { width: 100, height: 50 });
    Mouse.resetDrag();
    if (size) {
        await setContentSize(size);

        size = { width: Math.floor(size.width), height: Math.floor(size.height) };
        const clientNav = document.getElementById('entropia-flow-client-nav')
        if (clientNav) {
            const style = clientNav.style;
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
    }

    const hoverArea = document.getElementById('entropia-flow-client-hover-area');
    if (hoverArea) hoverArea.classList.toggle('entropia-flow-client-minimized', !!s.minimized);

    const layoutDiv = document.getElementById('entropia-flow-client-layout');
    if (layoutDiv) layoutDiv.innerText = layout?.name ?? '';

    if (s.layoutId !== OCR_LAYOUT_ID) {
        _stopScanner();
    } else {
        _restoreOcrText();
    }

    if (layout?.action && s.layoutId !== _lastActionLayoutId) {
        _lastActionLayoutId = s.layoutId;
        layout.action();
    }
}
let _lastActionLayoutId: string | undefined;

/// Controller ///

//const _sLastWindowId;
let _layoutId = MENU_LAYOUT_ID;
//let _scale = 1;
let _minimized = false;
let _waiting = false;
let _settings: SettingsData = {};

function settingsChanged(payload: SettingsData) {
    _settings = payload;
    if (_waiting || _settings.ws?.extensionStatus !== 'Connected') {
        renderWaiting();
    }
}

async function renderWaiting() {
    _waiting = true;
    receive({ commonData: { uri: _settings.ws?.uri, img: { logo: '/img/flow128.png', copy: '/img/copy.png', loading: '/img/loading.gif' } } });
    render({ layoutId: WAITING_LAYOUT_ID });
}

function streamChanged(payload: any) {
    if (payload.kill) {
        Neutralino.app.exit();
    }

    if (typeof payload !== 'object' || Object.keys(payload).length === 0) {
        renderWaiting();
    } else {
        _waiting = false;
        receive(payload);
        render({ layoutId: _layoutId, minimized: _minimized })
    }
}

let _storeIntervalId: number = 0;
async function storeWindowData() {
    async function _storeIt() {
        const pos = await Neutralino.window.getPosition();
        const size = await Neutralino.window.getSize();
        const winData: WindowData = {
            layoutId: _layoutId,
            minimized: _minimized,
            time: Date.now(),
            x: pos.x,
            y: pos.y,
            width: size.width!,
            height: size.height!
        };
        Neutralino.storage.setData(interpolate(STORE_WINDOW, NL_PID), JSON.stringify(winData));
    }

    if (_storeIntervalId) window.clearInterval(_storeIntervalId);
    await _storeIt();
    _storeIntervalId = window.setInterval(_storeIt, 40000); // update every 40 seconds to mark as keep alive
}

async function setInitData(initData: WindowData) {
    _layoutId = initData.layoutId;
    _minimized = initData.minimized;
    await Neutralino.window.move(initData.x, initData.y);
    await Neutralino.window.setSize({ width: initData.width, height: initData.height });
    if (!_waiting) {
        render({ layoutId: _layoutId, minimized: _minimized });
    }
}

function selectLayout(layoutId: string) {
    _layoutId = layoutId;
    storeWindowData();
    render({ layoutId: _layoutId, minimized: _minimized });
}

function switchMinimized() {
    _minimized = !_minimized;
    storeWindowData();
    render({ layoutId: _layoutId, minimized: _minimized });
}

document.addEventListener("DOMContentLoaded", async function () {
    _setupButtons();
    
    // Load initialization data
    const initKey = interpolate(STORE_INIT, NL_PID);
    let initData: WindowData;
    try {
        initData = JSON.parse(await Neutralino.storage.getData(initKey));
    } catch {
        initData = { layoutId: MENU_LAYOUT_ID, minimized: false, x: 0, y: 0, width: 0, height: 0, time: Date.now() };
    }
    const { layoutId, minimized, x, y, width, height } = initData;
    _layoutId = layoutId;
    _minimized = minimized;
    if (x && y && width && height) {
        await Neutralino.window.move(x, y);
        await Neutralino.window.setSize({ width, height });
    }
    await Neutralino.storage.setData(initKey, null!);
    storeWindowData();

    await renderWaiting();
});

export {
    streamChanged,
    settingsChanged,
    setInitData,
    ocrResult
}
