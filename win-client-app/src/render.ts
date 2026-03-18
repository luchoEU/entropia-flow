import { render as clientRender, applyDelta } from "clientStream";
import { StreamRenderSingle } from "../resources/stream/stream/data";
import { SettingsData } from "./data";
import { StreamRenderObject } from "../resources/stream/stream/data";
import { sendMessageToMain } from "./messages";
import { setContentSize } from "./position";
import { copyTextToClipboard, interpolate } from "./utils";
import { STORE_INIT, STORE_WINDOW } from "./const";
import { WindowData } from "./windows";

/// Menu ///

let _menuState = { activeRole: 'all', searchQuery: '' }

/// Render ///

const PREFIX_LAYOUT_ID = 'entropiaflow.client.';
const WAITING_LAYOUT_ID = PREFIX_LAYOUT_ID + 'waiting';
const MENU_LAYOUT_ID = PREFIX_LAYOUT_ID + 'menu';
const OCR_LAYOUT_ID = PREFIX_LAYOUT_ID + 'ocr';

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
            htmlTemplate: `
<div class="menu-container">
  <div class="menu-header">
    <input class="menu-search" type="text" placeholder="Filter layouts..." value="{{searchQuery}}">
  </div>
  <div class="menu-roles">
    {{#roles}}<button class="role-tab{{#isActive}} active{{/isActive}}" data-role="{{id}}">{{label}}</button>{{/roles}}
  </div>
  <div class="menu-body">
    <div class="menu-grid">
      {{#layouts}}
      <div class="menu-item" data-layout="{{id}}">
        <div class="menu-item-info">
          <span class="menu-item-name" title="{{name}}">{{name}}</span>
          {{#showFav}}<button class="menu-item-fav{{#isFav}} is-fav{{/isFav}}" data-fav="{{id}}">{{#isFav}}&#9733;{{/isFav}}{{^isFav}}&#9734;{{/isFav}}</button>{{/showFav}}
        </div>
      </div>
      {{/layouts}}
    </div>
  </div>
</div>
`,
            cssTemplate: `
                #entropia-flow-client-minimize,
                #entropia-flow-client-layout,
                #entropia-flow-client-menu,
                #entropia-flow-client-next {
                    display: none !important;
                }
                .layout-root {
                    --neu-non-draggable-region: true;
                }
                .menu-container {
                    width: 450px;
                    min-height: 250px;
                    max-height: 500px;
                    background-color: rgba(20, 25, 35, 0.95);
                    color: #e0e0e0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: 13px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border-radius: 6px;
                }
                .menu-header {
                    padding: 10px 12px 6px;
                }
                .menu-search {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 6px 10px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 4px;
                    color: #e0e0e0;
                    font-size: 13px;
                    outline: none;
                }
                .menu-search:focus {
                    border-color: rgba(100, 160, 255, 0.5);
                }
                .menu-search::placeholder {
                    color: rgba(255, 255, 255, 0.35);
                }
                .menu-roles {
                    display: flex;
                    gap: 4px;
                    padding: 4px 12px 8px;
                    flex-wrap: wrap;
                }
                .role-tab {
                    padding: 3px 10px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 12px;
                    color: #aaa;
                    font-size: 13px;
                    cursor: pointer;
                }
                .role-tab:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #ddd;
                }
                .role-tab.active {
                    background: rgba(100, 160, 255, 0.2);
                    border-color: rgba(100, 160, 255, 0.4);
                    color: #fff;
                }
                .menu-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 12px 10px;
                }
                .menu-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                    gap: 8px;
                }
                .menu-item {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 4px;
                    cursor: pointer;
                    overflow: hidden;
                    transition: border-color 0.15s;
                }
                .menu-item:hover {
                    border-color: rgba(100, 160, 255, 0.4);
                }
                .menu-item-info {
                    display: flex;
                    align-items: center;
                    padding: 4px 6px;
                    gap: 4px;
                }
                .menu-item-name {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 13px;
                }
                .menu-item-fav {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    font-size: 14px;
                    padding: 0 2px;
                    line-height: 1;
                }
                .menu-item-fav:hover {
                    color: rgba(255, 200, 50, 0.7);
                }
                .menu-item-fav.is-fav {
                    color: rgba(255, 200, 50, 0.9);
                }
                .menu-body::-webkit-scrollbar {
                    width: 6px;
                }
                .menu-body::-webkit-scrollbar-track {
                    background: transparent;
                }
                .menu-body::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 3px;
                }
            `,
            action: () => {
                const container = document.querySelector('.menu-container') as HTMLElement
                if (!container) return

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

                container.querySelector('.menu-grid')?.addEventListener('click', (e) => {
                    const favBtn = (e.target as HTMLElement).closest('[data-fav]') as HTMLElement
                    if (favBtn) {
                        e.stopPropagation()
                        sendMessageToMain('toggle-favorite', { role: _menuState.activeRole, layoutId: favBtn.dataset.fav }, 'chrome-extension')
                        return
                    }
                    const item = (e.target as HTMLElement).closest('[data-layout]') as HTMLElement
                    if (item) { e.stopPropagation(); selectLayout(item.dataset.layout!) }
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

function _buildMenuData() {
    const { activeRole, searchQuery } = _menuState
    const favList = (activeRole !== 'all' && _lastData.favorites?.[activeRole]) || []
    const showFav = activeRole !== 'all'

    const layouts = Object.entries(_lastData.layouts)
        .filter(([k,]) => !k.startsWith(PREFIX_LAYOUT_ID) || k === OCR_LAYOUT_ID)
        .map(([id, l]) => ({ id, name: l.name }))
        .filter(l => !searchQuery || l.name.toLowerCase().includes(searchQuery))
        .sort((a, b) => {
            const aFav = favList.includes(a.id), bFav = favList.includes(b.id)
            if (aFav !== bFav) return aFav ? -1 : 1
            return a.name.localeCompare(b.name)
        })
        .map(l => ({ ...l, isFav: favList.includes(l.id), showFav }))

    const roles = [
        { id: 'all', label: 'All', isActive: activeRole === 'all' },
        ...(_lastData.roles ?? []).map(r => ({
            id: r, label: r.charAt(0).toUpperCase() + r.slice(1), isActive: r === activeRole
        }))
    ]

    return { layouts, roles, searchQuery }
}

function _reRenderMenu() {
    _lastActionLayoutId = undefined
    render({ layoutId: MENU_LAYOUT_ID })
}

function receive(delta: any) {
    _lastData = applyDelta(_lastData, delta);
    if (!_lastData.layoutData) _lastData.layoutData = {};
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

    if (s.layoutId === MENU_LAYOUT_ID) {
        d.layoutData![MENU_LAYOUT_ID] = _buildMenuData() as any;
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
    if (hoverArea) hoverArea.className = s.minimized ? 'entropia-flow-client-minimized' : '';

    const layoutDiv = document.getElementById('entropia-flow-client-layout');
    if (layoutDiv) layoutDiv.innerText = layout?.name ?? '';

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
    setInitData
}
