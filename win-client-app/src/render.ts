﻿import { render as clientRender, applyDelta } from "clientStream";
import { StreamRenderSingle } from "../resources/stream/stream/data";
import { SettingsData } from "./data";
import { StreamRenderObject } from "../resources/stream/stream/data";
import { sendMessage } from "./messages";
import { setContentSize } from "./position";
import { copyTextToClipboard } from "./utils";

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
    layoutIdList: string[];
    commonData?: StreamRenderObject;
    layoutData?: Record<string, StreamRenderObject>;
}

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
    },
    layoutIdList: []
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

function receive(delta: any) {
    _lastData = applyDelta(_lastData, delta);
    const layouts = Object.entries(_lastData.layouts)
        .filter(([k,]) => !k.startsWith(PREFIX_LAYOUT_ID) || k === OCR_LAYOUT_ID)
        .map(([id,l]) => ({ id, name: l.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    _lastData.layoutIdList = layouts.map(l => l.id).filter(k => k !== OCR_LAYOUT_ID);
    _lastData.commonData!.layouts = layouts;
}

function dispatch(action: string) {
    sendMessage('dispatch', action);
}

let _disableRender = false
async function render(s: { layoutId: string, scale?: number, minimized?: boolean }) {
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

    layout?.action?.();
}

function _setupButtons() {
    const minimize = document.getElementById('entropia-flow-client-minimize');
    minimize?.addEventListener('click', (e) => {
        e.stopPropagation();
        switchMinimized();
    });

    const menu = document.getElementById('entropia-flow-client-menu');
    menu?.addEventListener('click', (e) => {
        e.stopPropagation();
        sendMessage('menu', '', 'entropia-flow-client');
    });

    const next = document.getElementById('entropia-flow-client-next');
    next?.addEventListener('click', (e) => {
        e.stopPropagation();
        nextLayout();
    });

    const close = document.getElementById('entropia-flow-client-close');
    close?.addEventListener('click', (e) => {
        e.stopPropagation();
        Neutralino.app.exit(); // close only this window
    });
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

function selectLayout(layoutId: string) {
    _layoutId = layoutId;
    render({ layoutId: _layoutId, minimized: _minimized });
}

function switchMinimized() {
    _minimized = !_minimized;
    render({ layoutId: _layoutId, minimized: _minimized });
}

function nextLayout() {
    const layouts = _lastData.layoutIdList;
    const index = layouts?.indexOf(_layoutId) ?? -1;
    if (index !== -1) {
        _layoutId = index + 1 === layouts.length ? layouts[0] : layouts[index + 1];
        render({ layoutId: _layoutId, minimized: _minimized });
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    _setupButtons();
    await renderWaiting();
});

export {
    streamChanged,
    settingsChanged
}
