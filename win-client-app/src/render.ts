import { render as clientRender, applyDelta } from "clientStream";
import { StreamRenderSingle } from "../resources/stream/stream/data";
import { SettingsData } from "./data";
import { StreamRenderObject } from "../resources/stream/stream/data";
import { sendMessageToMain } from "./messages";
import { setContentSize } from "./position";
import { copyTextToClipboard, interpolate } from "./utils";
import { STORE_INIT, STORE_WINDOW } from "./const";
import { WindowData } from "./windows";

const PREFIX_LAYOUT_ID = 'entropiaflow.client.';
const WAITING_LAYOUT_ID = PREFIX_LAYOUT_ID + 'waiting';
const MENU_LAYOUT_ID = PREFIX_LAYOUT_ID + 'menu';
const OCR_LAYOUT_ID = PREFIX_LAYOUT_ID + 'ocr';
const MAP_LAYOUT_ID = PREFIX_LAYOUT_ID + 'map';

interface StreamWindowLayout {
    name: string;
    htmlTemplate?: string;
    cssTemplate?: string;
    action?: () => void;
    backgroundType?: number;
}

interface StreamWindowRenderData {
    layouts: Record<string, StreamWindowLayout>;
    commonData?: StreamRenderObject;
    layoutData?: Record<string, StreamRenderObject>;
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
                     width: 100%;
                     height: 100%;
                 }
                #entropia-flow-client-menu, #entropia-flow-client-next {
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
                const copyButton = document.getElementById("copyButton");
                copyButton?.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    copyTextToClipboard(_lastData.commonData!.uri as string, 'copyPopup');
                })
            }
        },
        [MENU_LAYOUT_ID]: {
            name: 'Entropia Flow Menu',
            htmlTemplate: `
                 {{#layouts}}<div title="{{name}}" data-layout="{{id}}"><span>{{name}}</span><span>{{name}}</span></div>{{/layouts}}
                 {{^layouts}}No layouts found{{/layouts}}
             `,
            cssTemplate: `
                 .layout-root {
                     background-color: rgba(173, 216, 230, 0.8); /* light blue */
                     width: 100%;
                     height: 100%;
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
                    --neu-non-draggable-region: true;
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
                for (const layoutDiv of layoutRoot?.children ?? []) {
                    layoutDiv.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const layout = (e.currentTarget as HTMLElement)?.dataset?.layout;
                        if (layout) selectLayout(layout);
                    });
                }
            }
        },
        [MAP_LAYOUT_ID]: {
            name: 'Calypso Map',
            htmlTemplate: `
                 <div class="map-container">
                     <img src="/img/CalypsoMap.jpg" class="map-image" />
                 </div>
             `,
            cssTemplate: `
                 .layout-root {
                     background-color: #000;
                     overflow: hidden;
                     width: 100% !important;
                     height: 100% !important;
                 }
                 .map-container {
                     position: relative;
                     width: 100%;
                     height: 100%;
                     overflow: hidden;
                     cursor: grab;
                     cursor: -webkit-grab;
                     --neu-non-draggable-region: true;
                 }
                 .map-image {
                     position: absolute;
                     top: 50%;
                     left: 50%;
                     transform-origin: center;
                     user-select: none;
                     -webkit-user-drag: none;
                     pointer-events: none;
                 }
                 #entropia-flow-client-layout,
                 #entropia-flow-client-menu,
                 #entropia-flow-client-next {
                     display: none !important;
                 }
             `,
            action: () => _setupMapInteractions()
        },
        /*[OCR_LAYOUT_ID]: {
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
       },*/
    }
}
/*
function _setScannerTimeout() {
    setTimeout(async () => {
        const area = document.querySelector('.area');
        const textDiv = document.getElementById('text');
        const text = await chrome.webview?.hostObjects.ocr.Scan(area.offsetLeft, area.offsetTop, area.offsetWidth, area.offsetHeight);
        textDiv.innerText = text ?? '';
        _setScannerTimeout(); // set 1 second again after it finishes
    }, 1000);
}
 */

// Map interaction state
interface MapState {
    zoom: number;
    panX: number;
    panY: number;
}

const MAP_STORE_KEY = 'entropiaflow.map.state';
let _currentMapState: MapState = { zoom: 1, panX: 0, panY: 0 };
let _isDragging = false;
let _lastMouseX = 0;
let _lastMouseY = 0;

async function _setupMapInteractions() {
    const container = document.querySelector('.map-container') as HTMLElement;
    const image = document.querySelector('.map-image') as HTMLImageElement;

    if (!container || !image) return;

    // Load saved state
    try {
        const savedState = await Neutralino.storage.getData(MAP_STORE_KEY);
        if (savedState) {
            _currentMapState = JSON.parse(savedState);
        }
    } catch (e) {
        // Use default state if loading fails
        _currentMapState = { zoom: 1, panX: 0, panY: 0 };
    }

    // Apply initial state
    _applyMapTransform();

    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.5, Math.min(4, _currentMapState.zoom * zoomFactor));

        // Zoom towards mouse position
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleChange = newZoom / _currentMapState.zoom;
        _currentMapState.panX = mouseX - (mouseX - _currentMapState.panX) * scaleChange;
        _currentMapState.panY = mouseY - (mouseY - _currentMapState.panY) * scaleChange;
        _currentMapState.zoom = newZoom;

        _applyMapTransform();
        _saveMapState();
    });

    // Mouse drag pan
    container.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left mouse button
            e.preventDefault();
            _isDragging = true;
            _lastMouseX = e.clientX;
            _lastMouseY = e.clientY;
            container.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (_isDragging) {
            const deltaX = e.clientX - _lastMouseX;
            const deltaY = e.clientY - _lastMouseY;

            _currentMapState.panX += deltaX;
            _currentMapState.panY += deltaY;

            _lastMouseX = e.clientX;
            _lastMouseY = e.clientY;

            _applyMapTransform();
        }
    });

    document.addEventListener('mouseup', () => {
        if (_isDragging) {
            _isDragging = false;
            container.style.cursor = 'grab';
            _saveMapState();
        }
    });
}

function _applyMapTransform() {
    const image = document.querySelector('.map-image') as HTMLImageElement;
    if (image) {
        image.style.transform = `translate(-50%, -50%) translate(${_currentMapState.panX}px, ${_currentMapState.panY}px) scale(${_currentMapState.zoom})`;
    }
}

async function _saveMapState() {
    try {
        await Neutralino.storage.setData(MAP_STORE_KEY, JSON.stringify(_currentMapState));
    } catch (e) {
        console.error('Failed to save map state:', e);
    }
}

const _emptyLayout = {
    name: 'Entropia Flow Client Empty',
};

const minimizeButton = document.getElementById('entropia-flow-client-minimize');
const menuButton = document.getElementById('entropia-flow-client-menu');
const menuPopup = document.getElementById('entropia-flow-client-menu-popup');
const nextButton = document.getElementById('entropia-flow-client-next');
const closeButton = document.getElementById('entropia-flow-client-close');

function _setupButtons() {
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

    closeButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        Neutralino.storage.setData(STORE_WINDOW, null!);
        Neutralino.app.exit(); // close only this window
    });
}

function receive(delta: any) {
    _lastData = applyDelta(_lastData, delta);
    const layouts = Object.entries(_lastData.layouts)
        .filter(([k,]) => !k.startsWith(PREFIX_LAYOUT_ID) || k === OCR_LAYOUT_ID || k === MAP_LAYOUT_ID)
        .map(([id, l]) => ({ id, name: l.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    if (!_lastData.layoutData) _lastData.layoutData = {};
    _lastData.layoutData![MENU_LAYOUT_ID] = { layouts };
    _layoutIdList = layouts.map(l => l.id).filter(k => k !== OCR_LAYOUT_ID);
}

function nextLayout() {
    const index = _layoutIdList.indexOf(_layoutId);
    if (index === -1) return;
    const nextIndex = (index + 1) % _layoutIdList.length;
    const nextLayoutId = _layoutIdList[nextIndex];
    _layoutId = nextLayoutId;
    render({ layoutId: nextLayoutId });
}

function dispatch(action: string) {
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
    let size = await clientRender(single, dispatch, scale, s.minimized ? { width: 30, height: 30 } : { width: 100, height: 50 });
    if (size) {
        _baseSize = { width: Math.floor(size.width), height: Math.floor(size.height) };
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

        // Add resize listener if not already added
        if (!_resizeListenerAdded) {
            window.addEventListener('resize', async () => {
                if (_baseSize) {
                    const currentSize = await Neutralino.window.getSize();
                    const scaleX = (currentSize.width || window.innerWidth) / _baseSize.width;
                    const scaleY = (currentSize.height || window.innerHeight) / _baseSize.height;
                    const dynamicScale = Math.min(scaleX, scaleY);

                    const layoutRoot = document.querySelector('.layout-root') as HTMLElement;
                    if (layoutRoot) {
                        layoutRoot.style.transform = `scale(${dynamicScale})`;
                        layoutRoot.style.transformOrigin = 'top left';
                    }

                    if (clientNav) {
                        const navStyle = clientNav.style;
                        navStyle.width = `${_baseSize.width / dynamicScale}px`;
                        navStyle.height = `${_baseSize.height / dynamicScale}px`;
                        navStyle.transform = `scale(${dynamicScale})`;
                        navStyle.transformOrigin = 'top left';
                    }
                }
            });
            _resizeListenerAdded = true;
        }
    }

    const hoverArea = document.getElementById('entropia-flow-client-hover-area');
    if (hoverArea) hoverArea.className = s.minimized ? 'entropia-flow-client-minimized' : '';

    const layoutDiv = document.getElementById('entropia-flow-client-layout');
    if (layoutDiv) layoutDiv.innerText = layout?.name ?? '';

    layout?.action?.();
}

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
let _baseSize: { width: number; height: number } | undefined;
let _resizeListenerAdded = false;

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
        console.log('Stored window data:', winData);
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
    setInitData
}
